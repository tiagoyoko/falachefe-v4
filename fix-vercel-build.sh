#!/usr/bin/env bash
set -euo pipefail

echo "→ Ajustando package.json (engines, packageManager, dependências)…"
if command -v jq >/dev/null 2>&1; then
  tmp=$(mktemp)
  jq '
    .engines = (.engines // {}) |
    .engines.node = "20.x" |
    .packageManager = "pnpm@10.0.0" |
    .dependencies = (.dependencies // {}) |
    .dependencies.aws4 = (.dependencies.aws4 // "latest")
  ' package.json > "$tmp"
  mv "$tmp" package.json
else
  echo "jq não encontrado; aplicando fallback com sed."
  # Fallback simples: garante engines e packageManager; não remove chaves existentes
  if ! grep -q '"engines"' package.json; then
    sed -i.bak '1s|{|{"engines":{"node":"20.x"},|' package.json || true
  else
    sed -i.bak 's/"node":[^,}]\+/"node":"20.x"/' package.json || true
  fi
  if grep -q '"packageManager"' package.json; then
    sed -i.bak 's/"packageManager":[^,}]\+/"packageManager":"pnpm@10.0.0"/' package.json || true
  else
    sed -i.bak '1s|{|{"packageManager":"pnpm@10.0.0",|' package.json || true
  fi
  # Dependência aws4 (inserção simples; se já existir, pnpm corrige)
fi

echo "→ Garantindo dependência aws4…"
pnpm add aws4 -w || pnpm add aws4 || true

echo "→ Criando alias para módulos problemáticos…"
# Cria empty-module.js se não existir
if [ ! -f empty-module.js ]; then
  cat > empty-module.js <<'EOF'
module.exports = {};
EOF
fi

# Ajusta next.config.js (cria se não existir)
if [ ! -f next.config.js ]; then
  cat > next.config.js <<'EOF'
/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  webpack: (config) => {
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      'webworker-threads': path.resolve(__dirname, 'empty-module.js'),
    };
    config.externals = config.externals || [];
    config.externals.push({ 'webworker-threads': 'commonjs webworker-threads' });
    return config;
  },
};

module.exports = nextConfig;
EOF
else
  node - <<'EOF'
const fs = require('fs');
const path = require('path');
const file = 'next.config.js';
let s = fs.readFileSync(file, 'utf8');

// injeta alias se ainda não houver
if (!s.includes("'webworker-threads'")) {
  // tentativa simples de inserir dentro de webpack:(config)=>{...}
  if (s.includes('webpack:')) {
    s = s.replace(/webpack:\s*\(([^)]*)\)\s*=>\s*{/, (m) => {
      return m + `
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      'webworker-threads': require('path').resolve(__dirname, 'empty-module.js'),
    };
    config.externals = config.externals || [];
    config.externals.push({ 'webworker-threads': 'commonjs webworker-threads' });`;
    });
  } else {
    // não tem webpack – cria bloco webpack
    s = s.replace(/module\.exports\s*=\s*([^;]+);?/, (m) => {
      return `
const path = require('path');
const cfg = $1;
cfg.webpack = (config)=> {
  config.resolve = config.resolve || {};
  config.resolve.alias = {
    ...(config.resolve.alias || {}),
    'webworker-threads': path.resolve(__dirname, 'empty-module.js'),
  };
  config.externals = config.externals || [];
  config.externals.push({ 'webworker-threads': 'commonjs webworker-threads' });
  return config;
};
module.exports = cfg;`;
    });
  }
  fs.writeFileSync(file, s);
}
EOF
fi

echo "→ Corrigindo o erro de tipo em src/lib/user-sync.ts…"
if [ -f src/lib/user-sync.ts ]; then
  # Remove anotação rígida (u: DbUser) no map que gera conflito com boolean|null
  sed -i.bak 's/\.map((u: *DbUser) *=> *u\.id)/.map((u) => u.id)/' src/lib/user-sync.ts || true
fi

echo "→ Tornando DbUser.emailVerified compatível com null (se tipo local existir)…"
# Tentativas comuns de localização do tipo
for f in \
  src/types/db.ts \
  src/types/user.ts \
  src/types/index.ts \
  src/lib/types.ts
do
  if [ -f "$f" ]; then
    # Se encontrar linha com emailVerified sem | null, adiciona "| null" e torna opcional
    node - <<EOF
const fs = require('fs');
const file = '$f';
let s = fs.readFileSync(file,'utf8');
const re = /(emailVerified\s*:\s*boolean)(\s*[;|])/;
const re2 = /(emailVerified\??\s*:\s*boolean)(?!\s*\|\s*null)/;
if (re2.test(s)) {
  s = s.replace(/emailVerified\??\s*:\s*boolean/g, 'emailVerified?: boolean | null');
  fs.writeFileSync(file, s);
  console.log('Atualizado tipo em ' + file);
} else {
  console.log('Tipo já compatível ou não encontrado em ' + file);
}
EOF
  fi
done

echo "✓ Done. Agora rode: pnpm install && pnpm build"

import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // Prevenir variáveis não utilizadas (CRÍTICO - causa falha de build)
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
          destructuredArrayIgnorePattern: "^_",
        },
      ],
      // Prevenir declarações duplicadas (CRÍTICO - causa falha de build)
      "no-duplicate-imports": "error",
      // Prevenir variáveis não declaradas (CRÍTICO - causa falha de build)
      "no-undef": "error",
      // Prevenir código morto (CRÍTICO - causa falha de build)
      "no-unreachable": "error",
      // Prevenir uso de var (boa prática)
      "no-var": "error",
      // Forçar uso de const quando possível (boa prática)
      "prefer-const": "error",
      // Console.log - apenas avisar, não bloquear build
      "no-console": "off", // Desabilitado para permitir desenvolvimento
    },
  },
  {
    // Configurações específicas para arquivos de configuração
    files: ["next.config.*", "*.config.*"],
    rules: {
      "no-console": "off",
      "no-undef": "off",
    },
  },
  {
    // Configurações específicas para scripts
    files: ["scripts/**/*"],
    rules: {
      "no-console": "off",
      "no-undef": "off",
    },
  },
  {
    // Configurações específicas para arquivos de API
    files: ["src/app/api/**/*"],
    rules: {
      "no-console": "off", // Permitir console.log em APIs para debugging
    },
  },
  {
    // Configurações específicas para arquivos React/TSX
    files: ["**/*.tsx", "**/*.jsx"],
    rules: {
      "no-undef": "off", // React é injetado automaticamente pelo Next.js
      "no-console": "off", // Permitir console em componentes para debugging
    },
  },
];

export default eslintConfig;

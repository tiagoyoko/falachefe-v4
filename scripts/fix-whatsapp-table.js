require("dotenv").config();
const postgres = require("postgres");

async function fixWhatsAppTable() {
  console.log("🔧 Verificando e corrigindo tabela whatsappMessages...\n");

  const connectionString = process.env.POSTGRES_URL;
  if (!connectionString) {
    console.error("❌ POSTGRES_URL não configurado");
    process.exit(1);
  }

  const client = postgres(connectionString, {
    ssl: {
      rejectUnauthorized: false,
    },
  });

  try {
    // 1. Verificar se a tabela existe
    console.log("1️⃣ Verificando se a tabela existe...");
    const tableExists = await client`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'whatsappMessages'
      );
    `;

    if (!tableExists[0].exists) {
      console.log("❌ Tabela não existe. Criando...");
      
      // Criar a tabela com a estrutura correta
      await client`
        CREATE TABLE public."whatsappMessages" (
          id text NOT NULL,
          direction text NOT NULL,
          "userId" text NULL,
          "instanceId" text NULL,
          "chatId" text NULL,
          sender text NULL,
          receiver text NULL,
          "messageType" text NULL,
          "messageText" text NULL,
          "mediaType" text NULL,
          "mediaUrl" text NULL,
          "providerMessageId" text NULL,
          raw jsonb NULL,
          "createdAt" timestamp without time zone NOT NULL DEFAULT now(),
          CONSTRAINT whatsappMessages_pkey PRIMARY KEY (id)
        ) TABLESPACE pg_default;
      `;

      console.log("✅ Tabela criada com sucesso!");
    } else {
      console.log("✅ Tabela já existe");
    }

    // 2. Verificar estrutura atual
    console.log("\n2️⃣ Verificando estrutura da tabela...");
    const columns = await client`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'whatsappMessages'
      AND table_schema = 'public'
      ORDER BY ordinal_position;
    `;

    console.log("📊 Estrutura atual:");
    columns.forEach(col => {
      console.log(`   - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? '(NOT NULL)' : '(NULL)'} ${col.column_default ? `DEFAULT ${col.column_default}` : ''}`);
    });

    // 3. Verificar e criar índices
    console.log("\n3️⃣ Verificando índices...");
    const indexes = await client`
      SELECT indexname, indexdef
      FROM pg_indexes 
      WHERE tablename = 'whatsappMessages'
      AND schemaname = 'public';
    `;

    console.log("📈 Índices existentes:");
    indexes.forEach(idx => {
      console.log(`   - ${idx.indexname}`);
    });

    // Criar índices se não existirem
    const requiredIndexes = [
      { name: 'whatsappMessages_userId_idx', column: '"userId"' },
      { name: 'whatsappMessages_chatId_idx', column: '"chatId"' },
      { name: 'whatsappMessages_createdAt_idx', column: '"createdAt"' },
      { name: 'whatsappMessages_direction_idx', column: 'direction' }
    ];

    for (const idx of requiredIndexes) {
      const exists = indexes.some(i => i.indexname === idx.name);
      if (!exists) {
        console.log(`   Criando índice ${idx.name}...`);
        await client`CREATE INDEX IF NOT EXISTS "${idx.name}" ON public."whatsappMessages" USING btree (${client.unsafe(idx.column)}) TABLESPACE pg_default;`;
        console.log(`   ✅ Índice ${idx.name} criado`);
      } else {
        console.log(`   ✅ Índice ${idx.name} já existe`);
      }
    }

    // 4. Testar inserção de dados
    console.log("\n4️⃣ Testando inserção de dados...");
    const testId = `test-${Date.now()}`;
    
    try {
      await client`
        INSERT INTO public."whatsappMessages" (
          id, direction, "userId", "instanceId", "chatId", 
          sender, receiver, "messageType", "messageText", 
          "mediaType", "mediaUrl", "providerMessageId", raw
        ) VALUES (
          ${testId}, 'in', null, 'test-instance', 'test@s.whatsapp.net',
          'test-sender', null, 'text', 'Teste de inserção',
          null, null, 'test-msg-id', '{"test": true}'::jsonb
        );
      `;
      console.log("✅ Inserção de teste bem-sucedida!");

      // Limpar dados de teste
      await client`DELETE FROM public."whatsappMessages" WHERE id = ${testId};`;
      console.log("✅ Dados de teste removidos");

    } catch (error) {
      console.log("❌ Erro na inserção de teste:", error.message);
    }

    // 5. Verificar dados existentes
    console.log("\n5️⃣ Verificando dados existentes...");
    const countResult = await client`SELECT COUNT(*) as count FROM public."whatsappMessages"`;
    const totalMessages = parseInt(countResult[0].count);
    
    console.log(`📊 Total de mensagens: ${totalMessages}`);

    if (totalMessages > 0) {
      const recentMessages = await client`
        SELECT id, direction, sender, "messageText", "createdAt"
        FROM public."whatsappMessages" 
        ORDER BY "createdAt" DESC 
        LIMIT 5
      `;

      console.log("\n📱 Últimas mensagens:");
      recentMessages.forEach((msg, index) => {
        const date = new Date(msg.createdAt).toLocaleString("pt-BR");
        const direction = msg.direction === "in" ? "📥" : "📤";
        const text = msg.messageText ? msg.messageText.substring(0, 30) + "..." : "Sem texto";
        console.log(`   ${index + 1}. ${direction} ${date} - ${text}`);
      });
    }

    // 6. Verificar permissões
    console.log("\n6️⃣ Verificando permissões...");
    const permissions = await client`
      SELECT grantee, privilege_type
      FROM information_schema.table_privileges 
      WHERE table_name = 'whatsappMessages'
      AND table_schema = 'public';
    `;

    console.log("🔐 Permissões na tabela:");
    permissions.forEach(perm => {
      console.log(`   - ${perm.grantee}: ${perm.privilege_type}`);
    });

    console.log("\n✅ Verificação e correção concluída!");

  } catch (error) {
    console.error("❌ Erro durante a verificação:", error.message);
    console.error("Detalhes:", error);
  } finally {
    await client.end();
  }
}

fixWhatsAppTable().catch(console.error);




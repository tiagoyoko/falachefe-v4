import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// Usar apenas variáveis padrão para consistência
const connectionString =
  (process.env.POSTGRES_URL as string) ||
  (process.env.POSTGRES_URL_NON_POOLING as string);

if (!connectionString) {
  throw new Error("POSTGRES_URL environment variable is not set");
}

// Configurar cliente postgres com connection pooling otimizado
const client = postgres(
  connectionString.replace("sslmode=require", "sslmode=disable"),
  {
    ssl: false,
    prepare: false,
    // Connection pooling configuration
    max: 20, // Maximum number of connections in the pool
    idle_timeout: 20, // Close idle connections after 20 seconds
    connect_timeout: 10, // Connection timeout in seconds
    // Health monitoring
    onnotice: (notice) => {
      console.log('PostgreSQL Notice:', notice);
    },
    // Connection retry logic
    max_lifetime: 60 * 30, // 30 minutes
  }
);

export const db = drizzle(client, { schema });

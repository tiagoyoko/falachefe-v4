import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString =
  (process.env.falachefe_POSTGRES_URL as string) ||
  (process.env.falachefe_POSTGRES_URL_NON_POOLING as string) ||
  (process.env.POSTGRES_URL as string) ||
  (process.env.POSTGRES_URL_NON_POOLING as string);

if (!connectionString) {
  throw new Error("POSTGRES_URL environment variable is not set");
}

// Configurar cliente postgres com SSL desabilitado para desenvolvimento
const client = postgres(
  connectionString.replace("sslmode=require", "sslmode=disable"),
  {
    ssl: false,
    prepare: false,
  }
);

export const db = drizzle(client, { schema });

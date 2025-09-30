import type { Config } from "drizzle-kit";

export default {
  dialect: "postgresql",
  schema: "./src/lib/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    url: (
      process.env.POSTGRES_URL_NON_POOLING || 
      process.env.POSTGRES_URL || 
      "postgresql://localhost:5432/falachefe"
    ).replace("sslmode=require", "sslmode=disable"),
    ssl: false,
  },
} satisfies Config;

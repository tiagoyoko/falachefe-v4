#!/usr/bin/env ts-node

import "dotenv/config";
import { db } from "@/lib/db";
import { classificationResults, classificationStats } from "@/lib/schema";
import { count } from "drizzle-orm";

async function main() {
  const results = await db.select().from(classificationResults).limit(5);
  const stats = await db.select().from(classificationStats).limit(5);
  const total = await db.select({ total: count() }).from(classificationResults);

  console.log("classificationResults (top 5):", results);
  console.log("classificationStats (top 5):", stats);
  console.log("Total classifications:", total[0]?.total);
}

main()
  .catch((error) => {
    console.error("Erro ao buscar métricas de classificação", error);
  })
  .finally(() => {
    db.$client.end();
  });


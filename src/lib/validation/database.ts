import { z } from 'zod';
import { userSchema } from './cross-layer';

// Exportar validateDatabaseUser localmente
export const validateDatabaseUser = (data: unknown) => {
  return userSchema.parse(data);
};

// Schema para validação de conexão com banco
export const databaseConnectionSchema = z.object({
  host: z.string().min(1, 'Host é obrigatório'),
  port: z.number().int().min(1).max(65535),
  database: z.string().min(1, 'Nome do banco é obrigatório'),
  username: z.string().min(1, 'Username é obrigatório'),
  password: z.string().min(1, 'Password é obrigatório'),
  ssl: z.boolean().optional().default(false),
  maxConnections: z.number().int().min(1).max(100).optional().default(10)
});

export type DatabaseConnection = z.infer<typeof databaseConnectionSchema>;

// Validação de conexão com banco
export const validateDatabaseConnection = (config: unknown): DatabaseConnection => {
  return databaseConnectionSchema.parse(config);
};

// Schema para validação de transação
export const transactionSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  amount: z.number().positive('Valor deve ser positivo'),
  type: z.enum(['credit', 'debit']),
  description: z.string().min(1, 'Descrição é obrigatória'),
  status: z.enum(['pending', 'completed', 'failed', 'cancelled']),
  created_at: z.date(),
  updated_at: z.date()
});

export type Transaction = z.infer<typeof transactionSchema>;

// Validação de transação
export const validateTransaction = (data: unknown): Transaction => {
  return transactionSchema.parse(data);
};

// Schema para validação de migração
export const migrationSchema = z.object({
  version: z.string().regex(/^\d+$/, 'Versão deve ser numérica'),
  name: z.string().min(1, 'Nome da migração é obrigatório'),
  up: z.string().min(1, 'Script UP é obrigatório'),
  down: z.string().min(1, 'Script DOWN é obrigatório'),
  checksum: z.string().optional(),
  executed_at: z.date().optional()
});

export type Migration = z.infer<typeof migrationSchema>;

// Validação de migração
export const validateMigration = (data: unknown): Migration => {
  return migrationSchema.parse(data);
};

// Schema para validação de índice
export const indexSchema = z.object({
  name: z.string().min(1, 'Nome do índice é obrigatório'),
  table: z.string().min(1, 'Nome da tabela é obrigatório'),
  columns: z.array(z.string().min(1)).min(1, 'Pelo menos uma coluna é obrigatória'),
  unique: z.boolean().optional().default(false),
  partial: z.string().optional()
});

export type DatabaseIndex = z.infer<typeof indexSchema>;

// Validação de índice
export const validateIndex = (data: unknown): DatabaseIndex => {
  return indexSchema.parse(data);
};

// Schema para validação de constraint
export const constraintSchema = z.object({
  name: z.string().min(1, 'Nome da constraint é obrigatório'),
  table: z.string().min(1, 'Nome da tabela é obrigatório'),
  type: z.enum(['primary_key', 'foreign_key', 'unique', 'check', 'not_null']),
  columns: z.array(z.string().min(1)).min(1, 'Pelo menos uma coluna é obrigatória'),
  references: z.object({
    table: z.string().min(1),
    columns: z.array(z.string().min(1))
  }).optional(),
  check_condition: z.string().optional()
});

export type DatabaseConstraint = z.infer<typeof constraintSchema>;

// Validação de constraint
export const validateConstraint = (data: unknown): DatabaseConstraint => {
  return constraintSchema.parse(data);
};

// Schema para validação de tabela
export const tableSchema = z.object({
  name: z.string().min(1, 'Nome da tabela é obrigatório'),
  columns: z.array(z.object({
    name: z.string().min(1, 'Nome da coluna é obrigatório'),
    type: z.string().min(1, 'Tipo da coluna é obrigatório'),
    nullable: z.boolean().optional().default(true),
    default: z.any().optional(),
    primary_key: z.boolean().optional().default(false),
    unique: z.boolean().optional().default(false),
    foreign_key: z.object({
      table: z.string().min(1),
      column: z.string().min(1)
    }).optional()
  })).min(1, 'Pelo menos uma coluna é obrigatória'),
  indexes: z.array(indexSchema).optional().default([]),
  constraints: z.array(constraintSchema).optional().default([])
});

export type DatabaseTable = z.infer<typeof tableSchema>;

// Validação de tabela
export const validateTable = (data: unknown): DatabaseTable => {
  return tableSchema.parse(data);
};

// Schema para validação de query
export const querySchema = z.object({
  sql: z.string().min(1, 'SQL é obrigatório'),
  params: z.array(z.any()).optional().default([]),
  timeout: z.number().int().positive().optional().default(30000)
});

export type DatabaseQuery = z.infer<typeof querySchema>;

// Validação de query
export const validateQuery = (data: unknown): DatabaseQuery => {
  return querySchema.parse(data);
};

// Schema para validação de resultado de query
export const queryResultSchema = z.object({
  rows: z.array(z.record(z.string(), z.any())),
  rowCount: z.number().int().min(0),
  duration: z.number().positive(),
  query: z.string()
});

export type QueryResult = z.infer<typeof queryResultSchema>;

// Validação de resultado de query
export const validateQueryResult = (data: unknown): QueryResult => {
  return queryResultSchema.parse(data);
};

// Schema para validação de backup
export const backupSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, 'Nome do backup é obrigatório'),
  database: z.string().min(1, 'Nome do banco é obrigatório'),
  size: z.number().int().positive(),
  created_at: z.date(),
  expires_at: z.date().optional(),
  status: z.enum(['pending', 'completed', 'failed', 'expired'])
});

export type DatabaseBackup = z.infer<typeof backupSchema>;

// Validação de backup
export const validateBackup = (data: unknown): DatabaseBackup => {
  return backupSchema.parse(data);
};

// Schema para validação de restore
export const restoreSchema = z.object({
  backup_id: z.string().uuid(),
  target_database: z.string().min(1, 'Banco de destino é obrigatório'),
  options: z.object({
    drop_existing: z.boolean().optional().default(false),
    create_database: z.boolean().optional().default(false),
    ignore_errors: z.boolean().optional().default(false)
  }).optional().default({
    drop_existing: false,
    create_database: false,
    ignore_errors: false
  })
});

export type DatabaseRestore = z.infer<typeof restoreSchema>;

// Validação de restore
export const validateRestore = (data: unknown): DatabaseRestore => {
  return restoreSchema.parse(data);
};

// Schema para validação de performance
export const performanceSchema = z.object({
  query: z.string().min(1),
  duration: z.number().positive(),
  rows_returned: z.number().int().min(0),
  memory_usage: z.number().int().min(0),
  cpu_usage: z.number().min(0).max(100),
  timestamp: z.date()
});

export type QueryPerformance = z.infer<typeof performanceSchema>;

// Validação de performance
export const validatePerformance = (data: unknown): QueryPerformance => {
  return performanceSchema.parse(data);
};

// Schema para validação de lock
export const lockSchema = z.object({
  id: z.string().uuid(),
  table: z.string().min(1),
  mode: z.enum(['shared', 'exclusive', 'intent_shared', 'intent_exclusive']),
  duration: z.number().positive(),
  created_at: z.date(),
  expires_at: z.date()
});

export type DatabaseLock = z.infer<typeof lockSchema>;

// Validação de lock
export const validateLock = (data: unknown): DatabaseLock => {
  return lockSchema.parse(data);
};

// Função para validação de integridade referencial
export const validateReferentialIntegrity = async (
  parentTable: string,
  parentColumn: string,
  childTable: string,
  childColumn: string,
  db: any
): Promise<boolean> => {
  try {
    const query = `
      SELECT COUNT(*) as count
      FROM ${childTable} c
      LEFT JOIN ${parentTable} p ON c.${childColumn} = p.${parentColumn}
      WHERE c.${childColumn} IS NOT NULL AND p.${parentColumn} IS NULL
    `;
    
    const result = await db.query(query);
    return result.rows[0].count === '0';
  } catch (error) {
    console.error('Erro ao validar integridade referencial:', error);
    return false;
  }
};

// Função para validação de consistência de dados
export const validateDataConsistency = async (
  table: string,
  checksumColumn: string,
  db: any
): Promise<boolean> => {
  try {
    const query = `
      SELECT COUNT(*) as count
      FROM ${table}
      WHERE ${checksumColumn} IS NULL OR ${checksumColumn} = ''
    `;
    
    const result = await db.query(query);
    return result.rows[0].count === '0';
  } catch (error) {
    console.error('Erro ao validar consistência de dados:', error);
    return false;
  }
};

// Função para validação de tamanho de tabela
export const validateTableSize = async (
  table: string,
  maxSize: number,
  db: any
): Promise<boolean> => {
  try {
    const query = `
      SELECT pg_size_pretty(pg_total_relation_size('${table}')) as size,
             pg_total_relation_size('${table}') as bytes
    `;
    
    const result = await db.query(query);
    const sizeInBytes = parseInt(result.rows[0].bytes);
    return sizeInBytes <= maxSize;
  } catch (error) {
    console.error('Erro ao validar tamanho da tabela:', error);
    return false;
  }
};

// Exportar todos os schemas de validação
export const databaseSchemas = {
  connection: databaseConnectionSchema,
  transaction: transactionSchema,
  migration: migrationSchema,
  index: indexSchema,
  constraint: constraintSchema,
  table: tableSchema,
  query: querySchema,
  queryResult: queryResultSchema,
  backup: backupSchema,
  restore: restoreSchema,
  performance: performanceSchema,
  lock: lockSchema
} as const;


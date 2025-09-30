import { z, ZodError } from 'zod';

// --------------------
// Shared Schemas
// --------------------

export const userSchema = z.object({
  id: z.string().uuid().optional(),
  email: z.string().email('Email deve ser válido'),
  name: z.string().min(1, 'Nome é obrigatório').max(100, 'Nome muito longo'),
  phone: z.string().optional(),
  created_at: z.date().optional(),
  updated_at: z.date().optional()
});

export const createUserSchema = userSchema.omit({ id: true, created_at: true, updated_at: true });
export const updateUserSchema = userSchema.partial().omit({ id: true, created_at: true });

export type User = z.infer<typeof userSchema>;
export type CreateUserRequest = z.infer<typeof createUserSchema>;
export type UpdateUserRequest = z.infer<typeof updateUserSchema>;

export const userFormSchema = createUserSchema.extend({
  confirmEmail: z.string().email('Confirmação de email deve ser válida')
}).refine(data => data.email === data.confirmEmail, {
  message: 'Emails não coincidem',
  path: ['confirmEmail']
});

export type UserFormData = z.infer<typeof userFormSchema>;

// --------------------
// Validation Helpers
// --------------------

export type ValidationErrorDetail = {
  field: string;
  message: string;
  code: z.ZodIssue['code'];
};

export const formatValidationErrors = (error: ZodError): ValidationErrorDetail[] =>
  error.issues.map(issue => ({
    field: issue.path.join('.'),
    message: issue.message,
    code: issue.code
  }));

const parseOrThrow = <T>(schema: z.ZodSchema<T>, data: unknown): T => {
  const result = schema.safeParse(data);
  if (result.success) {
    return result.data;
  }
  throw new Error(`Validation failed: ${JSON.stringify(formatValidationErrors(result.error))}`);
};

export const validateUser = (data: unknown): User => parseOrThrow(userSchema, data);
export const validateCreateUser = (data: unknown): CreateUserRequest => parseOrThrow(createUserSchema, data);
export const validateUpdateUser = (data: unknown): UpdateUserRequest => parseOrThrow(updateUserSchema, data);
export const validateDatabaseUser = validateUser;

export const validateApiRequest = <T>(schema: z.ZodSchema<T>) => (data: unknown): T => parseOrThrow(schema, data);

// --------------------
// API Response Schema
// --------------------

export const userResponseSchema = z.object({
  success: z.boolean(),
  data: z.any().optional(),
  error: z.string().optional(),
  message: z.string().optional()
});

export type UserResponse = z.infer<typeof userResponseSchema>;
export const validateApiResponse = (data: unknown): UserResponse => parseOrThrow(userResponseSchema, data);

// --------------------
// Request Params / Query Schemas
// --------------------

export const userParamsSchema = z.object({
  id: z.string().uuid('ID deve ser um UUID válido')
});

export const userQuerySchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).optional().default(1),
  limit: z.string().regex(/^\d+$/).transform(Number).optional().default(10),
  search: z.string().optional(),
  sort: z.enum(['name', 'email', 'created_at']).optional().default('created_at'),
  order: z.enum(['asc', 'desc']).optional().default('desc')
});

export type UserParams = z.infer<typeof userParamsSchema>;
export type UserQuery = z.infer<typeof userQuerySchema>;

// --------------------
// Additional Schemas
// --------------------

export const sessionSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  status: z.enum(['active', 'inactive', 'expired']),
  created_at: z.date(),
  expires_at: z.date()
});

export type Session = z.infer<typeof sessionSchema>;
export const validateSession = (data: unknown): Session => parseOrThrow(sessionSchema, data);

export const messageSchema = z.object({
  id: z.string(),
  session_id: z.string(),
  content: z.string().min(1),
  role: z.enum(['user', 'assistant', 'system']),
  timestamp: z.date(),
  metadata: z.record(z.string(), z.unknown()).optional()
});

export type Message = z.infer<typeof messageSchema>;
export const validateMessage = (data: unknown): Message => parseOrThrow(messageSchema, data);

export const agentSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(['cashflow', 'marketing', 'admin', 'general']),
  is_active: z.boolean(),
  config: z.record(z.string(), z.unknown()).optional(),
  created_at: z.date(),
  updated_at: z.date()
});

export type Agent = z.infer<typeof agentSchema>;
export const validateAgent = (data: unknown): Agent => parseOrThrow(agentSchema, data);

// --------------------
// Utility Exports
// --------------------

export const schemas = {
  user: userSchema,
  createUser: createUserSchema,
  updateUser: updateUserSchema,
  userForm: userFormSchema,
  userResponse: userResponseSchema,
  userParams: userParamsSchema,
  userQuery: userQuerySchema,
  session: sessionSchema,
  message: messageSchema,
  agent: agentSchema
} as const;

export const testCrossLayerConsistency = () => {
  const valid = createUserSchema.safeParse({
    email: 'test@example.com',
    name: 'Test User',
    phone: '+5511999999999'
  });

  const form = userFormSchema.safeParse({
    email: 'test@example.com',
    name: 'Test User',
    phone: '+5511999999999',
    confirmEmail: 'test@example.com'
  });

  const db = userSchema.safeParse({
    id: '123e4567-e89b-12d3-a456-426614174000',
    email: 'test@example.com',
    name: 'Test User',
    phone: '+5511999999999',
    created_at: new Date(),
    updated_at: new Date()
  });

  return {
    frontend: form.success,
    backend: valid.success,
    database: db.success,
    allValid: form.success && valid.success && db.success
  };
};

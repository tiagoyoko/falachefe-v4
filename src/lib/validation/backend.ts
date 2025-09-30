import { z } from 'zod';
// Mock Express types para evitar dependências
interface Request {
  body: any;
  query: any;
  params: any;
  headers: any;
}

interface Response {
  status(code: number): Response;
  json(data: any): Response;
}

type NextFunction = () => void;
import { 
  userSchema, 
  createUserSchema, 
  updateUserSchema, 
  validateApiRequest,
  validateCreateUser,
  validateUpdateUser,
  validateUser,
  UserResponse
} from './cross-layer';

// Middleware para validação de requests
export const validateRequest = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = schema.parse(req.body);
      req.body = validatedData;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const formattedErrors = error.issues.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code
        }));
        
        res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: formattedErrors
        });
      } else {
        res.status(400).json({
          success: false,
          error: 'Invalid request data'
        });
      }
    }
  };
};

// Middleware para validação de query parameters
export const validateQuery = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedQuery = schema.parse(req.query);
      req.query = validatedQuery;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const formattedErrors = error.issues.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code
        }));
        
        res.status(400).json({
          success: false,
          error: 'Invalid query parameters',
          details: formattedErrors
        });
      } else {
        res.status(400).json({
          success: false,
          error: 'Invalid query parameters'
        });
      }
    }
  };
};

// Middleware para validação de parâmetros de rota
export const validateParams = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedParams = schema.parse(req.params);
      req.params = validatedParams;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const formattedErrors = error.issues.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code
        }));
        
        res.status(400).json({
          success: false,
          error: 'Invalid route parameters',
          details: formattedErrors
        });
      } else {
        res.status(400).json({
          success: false,
          error: 'Invalid route parameters'
        });
      }
    }
  };
};

// Schemas específicos para validação de API
export const createUserRequestSchema = createUserSchema;
export const updateUserRequestSchema = updateUserSchema;
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

// Middlewares específicos para usuários
export const validateCreateUserRequest = validateRequest(createUserRequestSchema);
export const validateUpdateUserRequest = validateRequest(updateUserRequestSchema);
export const validateUserParams = validateParams(userParamsSchema);
export const validateUserQuery = validateQuery(userQuerySchema);

// Função para criar resposta de sucesso
export const createSuccessResponse = <T>(data: T, message?: string): UserResponse => {
  return {
    success: true,
    data: data as any,
    message: message || 'Operation completed successfully'
  };
};

// Função para criar resposta de erro
export const createErrorResponse = (error: string, details?: any): UserResponse => {
  return {
    success: false,
    error,
    ...(details && { details })
  };
};

// Validação de autenticação
export const authTokenSchema = z.object({
  authorization: z.string().regex(/^Bearer\s+.+$/, 'Token deve estar no formato Bearer <token>')
});

export const validateAuthToken = (req: Request, res: Response, next: NextFunction) => {
  try {
    const { authorization } = authTokenSchema.parse(req.headers);
    const token = authorization.split(' ')[1];
    req.headers['x-auth-token'] = token;
    next();
  } catch (error) {
    res.status(401).json(createErrorResponse('Token de autenticação inválido'));
  }
};

// Validação de rate limiting
export const rateLimitSchema = z.object({
  'x-forwarded-for': z.string().optional(),
  'x-real-ip': z.string().optional()
});

export const validateRateLimit = (req: Request, res: Response, next: NextFunction) => {
  try {
    rateLimitSchema.parse(req.headers);
    // Aqui você pode implementar lógica de rate limiting
    next();
  } catch (error) {
    res.status(429).json(createErrorResponse('Rate limit exceeded'));
  }
};

// Validação de CORS
export const corsSchema = z.object({
  origin: z.string().url().optional(),
  'access-control-request-method': z.string().optional(),
  'access-control-request-headers': z.string().optional()
});

export const validateCORS = (req: Request, res: Response, next: NextFunction) => {
  try {
    corsSchema.parse(req.headers);
    next();
  } catch (error) {
    res.status(403).json(createErrorResponse('CORS validation failed'));
  }
};

// Validação de conteúdo
export const contentTypeSchema = z.object({
  'content-type': z.enum(['application/json', 'application/x-www-form-urlencoded', 'multipart/form-data'])
});

export const validateContentType = (req: Request, res: Response, next: NextFunction) => {
  try {
    contentTypeSchema.parse(req.headers);
    next();
  } catch (error) {
    res.status(415).json(createErrorResponse('Content-Type não suportado'));
  }
};

// Middleware de validação completa para APIs
export const validateApiEndpoint = (schemas: {
  body?: z.ZodSchema;
  query?: z.ZodSchema;
  params?: z.ZodSchema;
}) => {
  return [
    ...(schemas.body ? [validateRequest(schemas.body)] : []),
    ...(schemas.query ? [validateQuery(schemas.query)] : []),
    ...(schemas.params ? [validateParams(schemas.params)] : [])
  ];
};

// Validação de paginação
export const paginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(10),
  offset: z.number().int().min(0).optional()
});

export type PaginationParams = z.infer<typeof paginationSchema>;

export const validatePagination = (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page, limit } = paginationSchema.parse({
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 10
    });
    
    req.query.page = page.toString();
    req.query.limit = limit.toString();
    req.query.offset = ((page - 1) * limit).toString();
    
    next();
  } catch (error) {
    res.status(400).json(createErrorResponse('Parâmetros de paginação inválidos'));
  }
};

// Validação de filtros
export const filterSchema = z.object({
  search: z.string().optional(),
  sort: z.string().optional(),
  order: z.enum(['asc', 'desc']).optional(),
  filters: z.record(z.string(), z.string()).optional()
});

export type FilterParams = z.infer<typeof filterSchema>;

export const validateFilters = (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedFilters = filterSchema.parse(req.query);
    req.query = { ...req.query, ...validatedFilters };
    next();
  } catch (error) {
    res.status(400).json(createErrorResponse('Filtros inválidos'));
  }
};

// Função utilitária para validação de resposta
export const validateResponse = <T>(data: T, schema: z.ZodSchema): boolean => {
  try {
    schema.parse(data);
    return true;
  } catch {
    return false;
  }
};

// Middleware de tratamento de erros
export const errorHandler = (error: any, req: Request, res: Response, next: NextFunction) => {
  console.error('API Error:', error);
  
  if (error instanceof z.ZodError) {
    const formattedErrors = error.issues.map(err => ({
      field: err.path.join('.'),
      message: err.message,
      code: err.code
    }));
    
    return res.status(400).json(createErrorResponse('Validation failed', formattedErrors));
  }
  
  if (error.name === 'ValidationError') {
    return res.status(400).json(createErrorResponse('Validation error', error.message));
  }
  
  if (error.name === 'CastError') {
    return res.status(400).json(createErrorResponse('Invalid data format'));
  }
  
  return res.status(500).json(createErrorResponse('Internal server error'));
};


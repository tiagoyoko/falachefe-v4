import {
  validateCreateUser as sharedValidateCreateUser,
  validateUpdateUser as sharedValidateUpdateUser,
  validateUser as sharedValidateUser,
  validateApiResponse,
  userParamsSchema,
  userQuerySchema,
  createUserSchema,
  updateUserSchema,
  UserResponse,
  formatValidationErrors
} from './cross-layer';

interface Request {
  body: any;
  query: any;
  params: any;
}

interface Response {
  status(code: number): Response;
  json(data: any): Response;
}

type NextFunction = () => void;

const handleValidationError = (res: Response, error: unknown) => {
  if (error instanceof Error) {
    try {
      const details = JSON.parse(error.message.replace('Validation failed: ', ''));
      res.status(400).json(createErrorResponse('Validation failed', details));
      return;
    } catch {/* ignore */}
  }
  res.status(400).json(createErrorResponse('Invalid request data'));
};

export const validateCreateUserRequest = (req: Request, res: Response, next: NextFunction) => {
  try {
    req.body = createUserSchema.parse(req.body);
    next();
  } catch (error) {
    handleValidationError(res, error);
  }
};

export const validateUpdateUserRequest = (req: Request, res: Response, next: NextFunction) => {
  try {
    req.body = updateUserSchema.parse(req.body);
    next();
  } catch (error) {
    handleValidationError(res, error);
  }
};

export const validateUserParamsMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    req.params = userParamsSchema.parse(req.params);
    next();
  } catch (error) {
    handleValidationError(res, error);
  }
};

export const validateUserQueryMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    req.query = userQuerySchema.parse(req.query);
    next();
  } catch (error) {
    handleValidationError(res, error);
  }
};

export const createSuccessResponse = (data: any, message?: string): UserResponse => ({
  success: true,
  data,
  message: message || 'Operation completed successfully'
});

export const createErrorResponse = (error: string, details?: any): UserResponse => ({
  success: false,
  error,
  ...(details ? { details } : {})
});

export const validateCreateUser = sharedValidateCreateUser;
export const validateUpdateUser = sharedValidateUpdateUser;
export const validateUser = sharedValidateUser;
export const validateUserResponse = validateApiResponse;
export const validateUserParams = (data: unknown) => userParamsSchema.parse(data);
export const validateUserQuery = (data: unknown) => userQuerySchema.parse(data);


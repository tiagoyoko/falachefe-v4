import { describe, it, expect, vi } from 'vitest';
import {
  validateCreateUser,
  validateUpdateUser,
  validateUser,
  validateApiResponse,
  userResponseSchema
} from '../lib/validation/cross-layer';
import {
  validateCreateUserRequest,
  validateUpdateUserRequest,
  validateUserParamsMiddleware,
  validateUserQueryMiddleware,
  createSuccessResponse,
  createErrorResponse,
  validateUserParams,
  validateUserQuery
} from '../lib/validation/backend';

describe('API Validation Tests', () => {
  describe('Request Validation', () => {
    it('validates create user payload', () => {
      const data = { email: 'test@example.com', name: 'Test User', phone: '+5511999999999' };
      expect(validateCreateUser(data)).toEqual(data);
    });

    it('rejects invalid create user payload', () => {
      const invalid = { email: 'invalid', name: '', phone: 'bad' };
      expect(() => validateCreateUser(invalid)).toThrow('Validation failed');
    });

    it('validates user params', () => {
      const params = { id: '123e4567-e89b-12d3-a456-426614174000' };
      expect(validateUserParams(params)).toEqual(params);
    });

    it('validates user query defaults', () => {
      const result = validateUserQuery({}) as any;
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
    });
  });

  describe('Response Validation', () => {
    it('validates success response', () => {
      const response = createSuccessResponse({ id: '1' }, 'ok');
      expect(validateApiResponse(response)).toEqual(response);
    });

    it('validates error response', () => {
      const response = createErrorResponse('error');
      expect(validateApiResponse(response)).toEqual(response);
    });
  });

  describe('Middleware Integration', () => {
    const mockResponse = () => ({ status: vi.fn().mockReturnThis(), json: vi.fn() });

    it('middleware validates request body', () => {
      const req: any = { body: { email: 'test@example.com', name: 'Test', phone: '+5511999999999' } };
      const res = mockResponse();
      const next = vi.fn();
      validateCreateUserRequest(req, res as any, next);
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('middleware rejects invalid body', () => {
      const req: any = { body: { email: 'bad', name: '' } };
      const res = mockResponse();
      const next = vi.fn();
      validateCreateUserRequest(req, res as any, next);
      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
    });

    it('middleware validates params', () => {
      const req: any = { params: { id: '123e4567-e89b-12d3-a456-426614174000' } };
      const res = mockResponse();
      const next = vi.fn();
      validateUserParamsMiddleware(req, res as any, next);
      expect(next).toHaveBeenCalled();
    });

    it('middleware validates query', () => {
      const req: any = { query: { page: '1', limit: '10' } };
      const res = mockResponse();
      const next = vi.fn();
      validateUserQueryMiddleware(req, res as any, next);
      expect(next).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should provide detailed error messages', () => {
      const invalidData = {
        email: 'invalid-email',
        name: '',
        phone: 'invalid-phone'
      };

      try {
        validateCreateUser(invalidData);
        expect.fail('Should have thrown an error');
      } catch (error: any) {
        expect(error.message).toContain('Validation failed');
        const errorDetails = JSON.parse(error.message.replace('Validation failed: ', ''));
        expect(Array.isArray(errorDetails)).toBe(true);
        expect(errorDetails.length).toBeGreaterThan(0);
      }
    });

    it('should handle unexpected errors gracefully', () => {
      try {
        validateCreateUser(null);
        expect.fail('Should have thrown an error');
      } catch (error: any) {
        expect(error.message).toContain('Validation failed');
      }
    });
  });

  describe('Performance Tests', () => {
    it('should validate requests efficiently', () => {
      const requestData = {
        email: 'test@example.com',
        name: 'Test User',
        phone: '+5511999999999'
      };

      const startTime = performance.now();
      
      // Execute 1000 validations
      for (let i = 0; i < 1000; i++) {
        validateCreateUser(requestData);
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Should complete 1000 validations in less than 100ms
      expect(duration).toBeLessThan(100);
    });

    it('should handle large datasets efficiently', () => {
      const largeDataset = Array.from({ length: 100 }, (_, i) => ({
        email: `user${i}@example.com`,
        name: `User ${i}`,
        phone: `+551199999${i.toString().padStart(4, '0')}`
      }));

      const startTime = performance.now();
      
      largeDataset.forEach(data => {
        validateCreateUser(data);
      });
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Should complete 100 validations in less than 50ms
      expect(duration).toBeLessThan(50);
    });
  });

  describe('Integration Tests', () => {
    it('should validate complete API flow', () => {
      // Simulate complete API request/response flow
      const requestData = {
        email: 'test@example.com',
        name: 'Test User',
        phone: '+5511999999999'
      };

      // 1. Validate request
      const validatedRequest = validateCreateUser(requestData);
      
      // 2. Simulate processing
      const processedData = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        ...validatedRequest,
        created_at: new Date(),
        updated_at: new Date()
      };

      // 3. Validate response
      const responseData = {
        success: true,
        data: processedData,
        message: 'User created successfully'
      };

      const validatedResponse = validateApiResponse(responseData);
      
      expect(validatedRequest).toEqual(requestData);
      expect(validatedResponse.success).toBe(true);
      expect(validatedResponse.data).toEqual(processedData);
    });

    it('should handle error flow consistently', () => {
      const invalidRequestData = {
        email: 'invalid-email',
        name: ''
      };

      // 1. Request validation should fail
      expect(() => validateCreateUser(invalidRequestData)).toThrow();

      // 2. Simulate error response
      const errorResponse = {
        success: false,
        error: 'Validation failed',
        details: [
          {
            field: 'email',
            message: 'Invalid email format',
            code: 'invalid_string'
          },
          {
            field: 'name',
            message: 'Name is required',
            code: 'too_small'
          }
        ]
      };

      // 3. Validate error response
      const validatedErrorResponse = validateApiResponse(errorResponse);
      
      expect(validatedErrorResponse.success).toBe(false);
      expect(validatedErrorResponse.error).toBe('Validation failed');
    });
  });
});


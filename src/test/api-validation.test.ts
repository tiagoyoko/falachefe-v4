import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  validateApiRequest,
  validateApiResponse,
  userSchema,
  createUserSchema
} from '../lib/validation/cross-layer';
import {
  validateRequest,
  validateQuery,
  validateParams,
  userParamsSchema,
  userQuerySchema
} from '../lib/validation/backend';

describe('API Validation Tests', () => {
  describe('Request Validation', () => {
    it('should validate create user request', () => {
      const requestData = {
        email: 'test@example.com',
        name: 'Test User',
        phone: '+5511999999999'
      };

      const validateCreateUser = validateApiRequest(createUserSchema);
      const result = validateCreateUser(requestData);
      
      expect(result).toEqual(requestData);
    });

    it('should throw error for invalid create user request', () => {
      const invalidData = {
        email: 'invalid-email',
        name: '',
        phone: 'invalid-phone'
      };

      const validateCreateUser = validateApiRequest(createUserSchema);
      
      expect(() => validateCreateUser(invalidData)).toThrow('Validation failed');
    });

    it('should validate user parameters', () => {
      const paramsData = {
        id: '123e4567-e89b-12d3-a456-426614174000'
      };

      const validateParams = validateApiRequest(userParamsSchema);
      const result = validateParams(paramsData);
      
      expect(result).toEqual(paramsData);
    });

    it('should throw error for invalid user parameters', () => {
      const invalidParams = {
        id: 'invalid-uuid'
      };

      const validateParams = validateApiRequest(userParamsSchema);
      
      expect(() => validateParams(invalidParams)).toThrow('Validation failed');
    });

    it('should validate query parameters', () => {
      const queryData = {
        page: '1',
        limit: '10',
        search: 'test',
        sort: 'name',
        order: 'asc'
      };

      const validateQuery = validateApiRequest(userQuerySchema);
      const result = validateQuery(queryData);
      
      expect((result as any).page).toBe(1);
      expect((result as any).limit).toBe(10);
      expect((result as any).search).toBe('test');
      expect((result as any).sort).toBe('name');
      expect((result as any).order).toBe('asc');
    });

    it('should handle missing query parameters with defaults', () => {
      const queryData = {};

      const validateQuery = validateApiRequest(userQuerySchema);
      const result = validateQuery(queryData);
      
      expect((result as any).page).toBe(1);
      expect((result as any).limit).toBe(10);
      expect((result as any).sort).toBe('created_at');
      expect((result as any).order).toBe('desc');
    });
  });

  describe('Response Validation', () => {
    it('should validate successful API response', () => {
      const responseData = {
        success: true,
        data: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          email: 'test@example.com',
          name: 'Test User',
          phone: '+5511999999999',
          created_at: new Date(),
          updated_at: new Date()
        },
        message: 'User created successfully'
      };

      const result = validateApiResponse(responseData);
      
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.message).toBe('User created successfully');
    });

    it('should validate error API response', () => {
      const responseData = {
        success: false,
        error: 'Validation failed',
        details: [
          {
            field: 'email',
            message: 'Invalid email format',
            code: 'invalid_string'
          }
        ]
      };

      const result = validateApiResponse(responseData);
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Validation failed');
    });

    it('should throw error for invalid response format', () => {
      const invalidResponse = {
        success: 'true', // Should be boolean
        data: 'invalid-data'
      };

      expect(() => validateApiResponse(invalidResponse)).toThrow();
    });
  });

  describe('Middleware Validation', () => {
    it('should validate request body with middleware', () => {
      const mockRequest = {
        body: {
          email: 'test@example.com',
          name: 'Test User',
          phone: '+5511999999999'
        }
      } as any;

      const mockResponse = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn()
      } as any;

      const mockNext = vi.fn();

      const middleware = validateRequest(createUserSchema);
      middleware(mockRequest, mockResponse, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(mockResponse.json).not.toHaveBeenCalled();
    });

    it('should reject invalid request body with middleware', () => {
      const mockRequest = {
        body: {
          email: 'invalid-email',
          name: ''
        }
      } as any;

      const mockResponse = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn()
      } as any;

      const mockNext = vi.fn();

      const middleware = validateRequest(createUserSchema);
      middleware(mockRequest, mockResponse, mockNext);

      expect(mockNext).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'Validation failed',
        details: expect.any(Array)
      });
    });

    it('should validate query parameters with middleware', () => {
      const mockRequest = {
        query: {
          page: '1',
          limit: '10',
          search: 'test'
        }
      } as any;

      const mockResponse = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn()
      } as any;

      const mockNext = vi.fn();

      const middleware = validateQuery(userQuerySchema);
      middleware(mockRequest, mockResponse, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRequest.query.page).toBe(1);
      expect(mockRequest.query.limit).toBe(10);
    });

    it('should validate route parameters with middleware', () => {
      const mockRequest = {
        params: {
          id: '123e4567-e89b-12d3-a456-426614174000'
        }
      } as any;

      const mockResponse = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn()
      } as any;

      const mockNext = vi.fn();

      const middleware = validateParams(userParamsSchema);
      middleware(mockRequest, mockResponse, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should provide detailed error messages', () => {
      const invalidData = {
        email: 'invalid-email',
        name: '',
        phone: 'invalid-phone'
      };

      const validateCreateUser = validateApiRequest(createUserSchema);
      
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
      const validateCreateUser = validateApiRequest(createUserSchema);
      
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

      const validateCreateUser = validateApiRequest(createUserSchema);
      
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

      const validateCreateUser = validateApiRequest(createUserSchema);
      
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
      const validateCreateUser = validateApiRequest(createUserSchema);
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
      const validateCreateUser = validateApiRequest(createUserSchema);
      
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


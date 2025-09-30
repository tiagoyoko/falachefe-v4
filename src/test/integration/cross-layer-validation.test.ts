import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { 
  userSchema, 
  createUserSchema, 
  updateUserSchema, 
  userFormSchema,
  validateCreateUser,
  validateUpdateUser,
  validateUser,
  testCrossLayerConsistency,
  schemas
} from '../../lib/validation/cross-layer';
import { validateDatabaseUser } from '../../lib/validation/database';
import { validateCreateUserRequest } from '../../lib/validation/backend';

describe('Cross-Layer Validation Tests', () => {
  const validUserData = {
    email: 'test@example.com',
    name: 'Test User',
    phone: '+5511999999999'
  };

  const validUserWithId = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    ...validUserData,
    created_at: new Date(),
    updated_at: new Date()
  };

  describe('Schema Consistency', () => {
    it('should have consistent user schemas across layers', () => {
      // Frontend form schema should include all required fields
      const formFields = Object.keys(userFormSchema.shape);
      expect(formFields).toContain('email');
      expect(formFields).toContain('name');
      expect(formFields).toContain('phone');
      expect(formFields).toContain('confirmEmail');

      // Backend create schema should match form schema (minus confirmEmail)
      const createFields = Object.keys(createUserSchema.shape);
      expect(createFields).toContain('email');
      expect(createFields).toContain('name');
      expect(createFields).toContain('phone');

      // Full user schema should include all fields
      const userFields = Object.keys(userSchema.shape);
      expect(userFields).toContain('id');
      expect(userFields).toContain('email');
      expect(userFields).toContain('name');
      expect(userFields).toContain('phone');
      expect(userFields).toContain('created_at');
      expect(userFields).toContain('updated_at');
    });

    it('should validate data consistently across layers', () => {
      // Frontend validation
      const frontendData = {
        ...validUserData,
        confirmEmail: validUserData.email
      };
      const frontendResult = userFormSchema.safeParse(frontendData);
      expect(frontendResult.success).toBe(true);

      // Backend validation
      const backendResult = createUserSchema.safeParse(validUserData);
      expect(backendResult.success).toBe(true);

      // Database validation
      const databaseResult = userSchema.safeParse(validUserWithId);
      expect(databaseResult.success).toBe(true);
    });
  });

  describe('Frontend Validation', () => {
    it('should validate user form data correctly', () => {
      const formData = {
        email: 'test@example.com',
        name: 'Test User',
        phone: '+5511999999999',
        confirmEmail: 'test@example.com'
      };

      const result = userFormSchema.safeParse(formData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.email).toBe(formData.email);
        expect(result.data.name).toBe(formData.name);
      }
    });

    it('should reject form data with mismatched emails', () => {
      const formData = {
        email: 'test@example.com',
        name: 'Test User',
        phone: '+5511999999999',
        confirmEmail: 'different@example.com'
      };

      const result = userFormSchema.safeParse(formData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('confirmEmail');
      }
    });

    it('should reject invalid email format', () => {
      const formData = {
        email: 'invalid-email',
        name: 'Test User',
        phone: '+5511999999999',
        confirmEmail: 'invalid-email'
      };

      const result = userFormSchema.safeParse(formData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('email');
      }
    });

    it('should reject empty name', () => {
      const formData = {
        email: 'test@example.com',
        name: '',
        phone: '+5511999999999',
        confirmEmail: 'test@example.com'
      };

      const result = userFormSchema.safeParse(formData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('name');
      }
    });
  });

  describe('Backend Validation', () => {
    it('should validate create user request', () => {
      const result = validateCreateUser(validUserData);
      expect(result).toEqual(validUserData);
    });

    it('should validate update user request', () => {
      const updateData = {
        name: 'Updated Name',
        phone: '+5511888888888'
      };

      const result = validateUpdateUser(updateData);
      expect(result).toEqual(updateData);
    });

    it('should validate full user object', () => {
      const result = validateUser(validUserWithId);
      expect(result).toEqual(validUserWithId);
    });

    it('should throw error for invalid create user data', () => {
      const invalidData = {
        email: 'invalid-email',
        name: '',
        phone: 'invalid-phone'
      };

      expect(() => validateCreateUser(invalidData)).toThrow();
    });

    it('should throw error for invalid update user data', () => {
      const invalidData = {
        email: 'invalid-email',
        name: ''
      };

      expect(() => validateUpdateUser(invalidData)).toThrow();
    });
  });

  describe('Database Validation', () => {
    it('should validate database user object', () => {
      const result = validateDatabaseUser(validUserWithId);
      expect(result).toEqual(validUserWithId);
    });

    it('should reject user without required database fields', () => {
      const incompleteUser = {
        email: 'test@example.com',
        name: 'Test User'
        // Missing id, created_at, updated_at
      };

      expect(() => validateDatabaseUser(incompleteUser)).toThrow();
    });

    it('should reject user with invalid UUID', () => {
      const invalidUser = {
        ...validUserWithId,
        id: 'invalid-uuid'
      };

      expect(() => validateDatabaseUser(invalidUser)).toThrow();
    });
  });

  describe('Cross-Layer Integration', () => {
    it('should maintain data consistency from frontend to database', async () => {
      // Simular fluxo completo: Frontend -> Backend -> Database
      
      // 1. Frontend validation
      const frontendData = {
        ...validUserData,
        confirmEmail: validUserData.email
      };
      const frontendResult = userFormSchema.safeParse(frontendData);
      expect(frontendResult.success).toBe(true);

      // 2. Backend validation
      const backendData = validateCreateUser(validUserData);
      expect(backendData).toEqual(validUserData);

      // 3. Database validation
      const databaseData = validateDatabaseUser(validUserWithId);
      expect(databaseData.email).toBe(validUserData.email);
      expect(databaseData.name).toBe(validUserData.name);
    });

    it('should handle update flow consistently', () => {
      // Simular fluxo de atualização
      const updateData = {
        name: 'Updated Name',
        phone: '+5511888888888'
      };

      // Backend validation
      const validatedUpdate = validateUpdateUser(updateData);
      expect(validatedUpdate).toEqual(updateData);

      // Database validation (with full object)
      const updatedUser = {
        ...validUserWithId,
        ...validatedUpdate,
        updated_at: new Date()
      };
      const validatedUser = validateUser(updatedUser);
      expect(validatedUser.name).toBe(updateData.name);
      expect(validatedUser.phone).toBe(updateData.phone);
    });

    it('should test cross-layer consistency function', () => {
      const consistency = testCrossLayerConsistency();
      expect(consistency.frontend).toBe(true);
      expect(consistency.backend).toBe(true);
      expect(consistency.database).toBe(true);
      expect(consistency.allValid).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should provide consistent error messages across layers', () => {
      const invalidData = {
        email: 'invalid-email',
        name: '',
        phone: 'invalid-phone'
      };

      // Frontend validation
      const frontendResult = userFormSchema.safeParse({
        ...invalidData,
        confirmEmail: invalidData.email
      });
      expect(frontendResult.success).toBe(false);
      if (!frontendResult.success) {
        const emailError = frontendResult.error.issues.find(e => e.path.includes('email'));
        expect(emailError?.message).toContain('Email');
      }

      // Backend validation
      expect(() => validateCreateUser(invalidData)).toThrow('Validation failed');
    });

    it('should handle missing fields consistently', () => {
      const incompleteData = {
        email: 'test@example.com'
        // Missing name
      };

      // Frontend validation
      const frontendResult = userFormSchema.safeParse({
        ...incompleteData,
        confirmEmail: incompleteData.email
      });
      expect(frontendResult.success).toBe(false);

      // Backend validation
      expect(() => validateCreateUser(incompleteData)).toThrow();
    });
  });

  describe('Schema Export Validation', () => {
    it('should export all required schemas', () => {
      expect(schemas.user).toBeDefined();
      expect(schemas.createUser).toBeDefined();
      expect(schemas.updateUser).toBeDefined();
      expect(schemas.userForm).toBeDefined();
      expect(schemas.userResponse).toBeDefined();
      expect(schemas.session).toBeDefined();
      expect(schemas.message).toBeDefined();
      expect(schemas.agent).toBeDefined();
    });

    it('should have consistent schema types', () => {
      expect(typeof schemas.user).toBe('object');
      expect(typeof schemas.createUser).toBe('object');
      expect(typeof schemas.updateUser).toBe('object');
      expect(typeof schemas.userForm).toBe('object');
    });
  });

  describe('Performance Tests', () => {
    it('should validate data efficiently', () => {
      const startTime = performance.now();
      
      // Execute multiple validations
      for (let i = 0; i < 1000; i++) {
        validateCreateUser(validUserData);
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Should complete 1000 validations in less than 100ms
      expect(duration).toBeLessThan(100);
    });

    it('should handle large datasets efficiently', () => {
      const largeDataset = Array.from({ length: 100 }, (_, i) => ({
        ...validUserData,
        email: `user${i}@example.com`,
        name: `User ${i}`
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
});


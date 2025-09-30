import { describe, it, expect } from 'vitest';
import {
  userFormSchema,
  createUserSchema,
  userSchema,
  validateCreateUser,
  validateUpdateUser,
  validateUser,
  testCrossLayerConsistency
} from '../../lib/validation/cross-layer';
import { validateDatabaseUser } from '../../lib/validation/database';

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

  it('ensures schema consistency across layers', () => {
    expect(Object.keys(userFormSchema.shape)).toEqual(
      expect.arrayContaining(['email', 'name', 'phone', 'confirmEmail'])
    );

    expect(Object.keys(createUserSchema.shape)).toEqual(
      expect.arrayContaining(['email', 'name', 'phone'])
    );

    expect(Object.keys(userSchema.shape)).toEqual(
      expect.arrayContaining(['id', 'email', 'name', 'phone', 'created_at', 'updated_at'])
    );
  });

  it('validates data across layers consistently', () => {
    expect(userFormSchema.safeParse({ ...validUserData, confirmEmail: validUserData.email }).success).toBe(true);
    expect(createUserSchema.safeParse(validUserData).success).toBe(true);
    expect(userSchema.safeParse(validUserWithId).success).toBe(true);
  });

  it('validates database layer objects', () => {
    expect(() => validateDatabaseUser(validUserWithId)).not.toThrow();
    expect(() => validateDatabaseUser({ ...validUserWithId, id: 'invalid' })).toThrow();
  });

  it('tests cross-layer consistency helper', () => {
    const result = testCrossLayerConsistency();
    expect(result.allValid).toBe(true);
  });
});


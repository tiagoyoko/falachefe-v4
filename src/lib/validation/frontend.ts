import { z } from 'zod';
import * as React from 'react';
import { userFormSchema, CreateUserRequest, UpdateUserRequest } from './cross-layer';

// Destructure React hooks for easier usage
const { useState, useCallback, useMemo } = React;

// Simple debounce implementation to avoid lodash dependency
const debounce = <T extends (...args: any[]) => void>(func: T, wait: number): T => {
  let timeout: NodeJS.Timeout;
  return ((...args: any[]) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  }) as T;
};

// Hook para formulário de criação de usuário (simplificado sem react-hook-form)
export const useUserForm = () => {
  const [formData, setFormData] = React.useState<CreateUserRequest & { confirmEmail: string }>({
    email: '',
    name: '',
    phone: '',
    confirmEmail: ''
  });
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  
  const validate = React.useCallback(() => {
    const result = userFormSchema.safeParse(formData);
    if (result.success) {
      setErrors({});
      return true;
    } else {
      const formattedErrors: Record<string, string> = {};
      result.error.issues.forEach(err => {
        const field = err.path.join('.');
        formattedErrors[field] = err.message;
      });
      setErrors(formattedErrors);
      return false;
    }
  }, [formData]);
  
  const updateField = useCallback((field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);
  
  return { formData, errors, validate, updateField, setFormData };
};

// Hook para formulário de atualização de usuário (simplificado)
export const useUpdateUserForm = (defaultValues?: UpdateUserRequest) => {
  const [formData, setFormData] = useState<UpdateUserRequest>(defaultValues || {});
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  
  const validate = React.useCallback(() => {
    const result = userFormSchema.partial().safeParse(formData);
    if (result.success) {
      setErrors({});
      return true;
    } else {
      const formattedErrors: Record<string, string> = {};
      result.error.issues.forEach(err => {
        const field = err.path.join('.');
        formattedErrors[field] = err.message;
      });
      setErrors(formattedErrors);
      return false;
    }
  }, [formData]);
  
  const updateField = useCallback((field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);
  
  return { formData, errors, validate, updateField, setFormData };
};

// Validação em tempo real
export const useRealtimeValidation = <T>(schema: z.ZodSchema<T>) => {
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [isValid, setIsValid] = React.useState(false);
  
  const validate = useCallback((data: unknown) => {
    const result = schema.safeParse(data);
    
    if (result.success) {
      setErrors({});
      setIsValid(true);
    } else {
      const formattedErrors: Record<string, string> = {};
      result.error.issues.forEach(err => {
        const field = err.path.join('.');
        formattedErrors[field] = err.message;
      });
      setErrors(formattedErrors);
      setIsValid(false);
    }
    
    return result.success;
  }, [schema]);
  
  return { validate, errors, isValid };
};

// Validação de campos específicos
export const useFieldValidation = (schema: z.ZodSchema, fieldName: string) => {
  const [error, setError] = useState<string>('');
  const [isValid, setIsValid] = React.useState(false);
  
  const validateField = useCallback((value: unknown) => {
    try {
      schema.parse({ [fieldName]: value });
      setError('');
      setIsValid(true);
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldError = error.issues.find(err => err.path[0] === fieldName);
        if (fieldError) {
          setError(fieldError.message);
          setIsValid(false);
          return false;
        }
      }
      setError('');
      setIsValid(false);
      return false;
    }
  }, [schema, fieldName]);
  
  return { validateField, error, isValid };
};

// Hook para validação de email
export const useEmailValidation = () => {
  const emailSchema = z.object({
    email: z.string().email('Email deve ser válido')
  });
  
  return useFieldValidation(emailSchema, 'email');
};

// Hook para validação de telefone
export const usePhoneValidation = () => {
  const phoneSchema = z.object({
    phone: z.string().regex(
      /^(\+55\s?)?(\(?\d{2}\)?\s?)?\d{4,5}-?\d{4}$/,
      'Telefone deve estar no formato brasileiro'
    ).optional()
  });
  
  return useFieldValidation(phoneSchema, 'phone');
};

// Validação de formulário com debounce
export const useDebouncedValidation = <T>(schema: z.ZodSchema<T>, delay: number = 300) => {
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [isValid, setIsValid] = React.useState(false);
  const [isValidating, setIsValidating] = useState(false);
  
  const debouncedValidate = useMemo(
    () => debounce((data: unknown) => {
      setIsValidating(true);
      
      const result = schema.safeParse(data);
      
      if (result.success) {
        setErrors({});
        setIsValid(true);
      } else {
        const formattedErrors: Record<string, string> = {};
        result.error.issues.forEach(err => {
          const field = err.path.join('.');
          formattedErrors[field] = err.message;
        });
        setErrors(formattedErrors);
        setIsValid(false);
      }
      
      setIsValidating(false);
    }, delay),
    [schema, delay]
  );
  
  return { debouncedValidate, errors, isValid, isValidating };
};

// Função para formatar erros de validação para exibição
export const formatValidationErrors = (errors: z.ZodIssue[]): Record<string, string> => {
  const formattedErrors: Record<string, string> = {};
  
  errors.forEach((error: z.ZodIssue) => {
    const field = error.path.join('.');
    formattedErrors[field] = error.message;
  });
  
  return formattedErrors;
};

// Hook para validação de múltiplos campos
export const useMultiFieldValidation = <T>(schema: z.ZodSchema<T>) => {
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [isValid, setIsValid] = React.useState(false);
  
  const validateFields = useCallback((data: Partial<T>) => {
    const result = schema.safeParse(data);
    
    if (result.success) {
      setErrors({});
      setIsValid(true);
    } else {
      const formattedErrors = formatValidationErrors(result.error.issues);
      setErrors(formattedErrors);
      setIsValid(false);
    }
    
    return result.success;
  }, [schema]);
  
  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);
  
  const getFieldError = useCallback((fieldName: string) => {
    return errors[fieldName] || '';
  }, [errors]);
  
  return {
    validateFields,
    clearErrors,
    getFieldError,
    errors,
    isValid
  };
};

// Validação de upload de arquivo
export const fileUploadSchema = z.object({
  file: z.instanceof(File, { message: 'Arquivo é obrigatório' }),
  maxSize: z.number().optional().default(5 * 1024 * 1024), // 5MB
  allowedTypes: z.array(z.string()).optional().default(['image/jpeg', 'image/png', 'image/gif'])
});

export const validateFileUpload = (file: File, maxSize?: number, allowedTypes?: string[]) => {
  const schema = fileUploadSchema.extend({
    maxSize: z.number().optional().default(maxSize || 5 * 1024 * 1024),
    allowedTypes: z.array(z.string()).optional().default(allowedTypes || ['image/jpeg', 'image/png', 'image/gif'])
  });
  
  return schema.safeParse({ file, maxSize, allowedTypes });
};

// Hook para validação de arquivo
export const useFileValidation = (maxSize?: number, allowedTypes?: string[]) => {
  const [error, setError] = useState<string>('');
  const [isValid, setIsValid] = React.useState(false);
  
  const validateFile = useCallback((file: File) => {
    const result = validateFileUpload(file, maxSize, allowedTypes);
    
    if (result.success) {
      setError('');
      setIsValid(true);
    } else {
      const errorMessage = result.error.issues[0]?.message || 'Arquivo inválido';
      setError(errorMessage);
      setIsValid(false);
    }
    
    return result.success;
  }, [maxSize, allowedTypes]);
  
  return { validateFile, error, isValid };
};

// debounce já implementado localmente acima

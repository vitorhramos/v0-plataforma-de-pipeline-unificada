'use client';

import { useState, useCallback } from 'react';

interface FieldError {
  field: string;
  message: string;
}

export function useFormValidation() {
  const [errors, setErrors] = useState<FieldError[]>([]);

  const validateField = useCallback((field: string, value: any, rules: any) => {
    const fieldErrors: string[] = [];

    // Check required
    if (rules.required && !value) {
      fieldErrors.push(`${field} is required`);
    }

    // Check min length
    if (rules.minLength && value && value.length < rules.minLength) {
      fieldErrors.push(`${field} must be at least ${rules.minLength} characters`);
    }

    // Check max length
    if (rules.maxLength && value && value.length > rules.maxLength) {
      fieldErrors.push(`${field} must not exceed ${rules.maxLength} characters`);
    }

    // Check date is not in past
    if (rules.notInPast && value) {
      const inputDate = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (inputDate < today) {
        fieldErrors.push(`${field} cannot be in the past`);
      }
    }

    // Check min value
    if (rules.min !== undefined && value !== '' && Number(value) < rules.min) {
      fieldErrors.push(`${field} must be at least ${rules.min}`);
    }

    // Check max value
    if (rules.max !== undefined && value !== '' && Number(value) > rules.max) {
      fieldErrors.push(`${field} must not exceed ${rules.max}`);
    }

    // Update errors
    setErrors(prev => {
      const filtered = prev.filter(e => e.field !== field);
      if (fieldErrors.length > 0) {
        return [...filtered, { field, message: fieldErrors[0] }];
      }
      return filtered;
    });

    return fieldErrors.length === 0;
  }, []);

  const getFieldError = useCallback((field: string) => {
    return errors.find(e => e.field === field)?.message;
  }, [errors]);

  const clearErrors = useCallback(() => {
    setErrors([]);
  }, []);

  return {
    errors,
    validateField,
    getFieldError,
    clearErrors,
    isValid: errors.length === 0,
  };
}

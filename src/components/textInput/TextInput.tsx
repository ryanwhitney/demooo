import React, { forwardRef, InputHTMLAttributes, useState, useEffect } from 'react';
import {
  inputStyles,
  inputContainer,
  inputLabel,
  helperText,
  errorText,
  InputVariants
} from './TextInput.css';

export type TextInputProps = InputHTMLAttributes<HTMLInputElement> &
  InputVariants & {
    /** Label text for the input */
    label?: string;
    /** Help text to be displayed below the input */
    helperText?: string;
    /** Error message to be displayed */
    errorMessage?: string;
    /** Optional class name for custom styling */
    className?: string;
    /** Validation function */
    validate?: (value: string) => string;
    /** Debounce time in milliseconds */
    debounceTime?: number;
  }

/**
 * TextInput component for forms with accessible labels and error states
 */
export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  (
    {
      label,
      state,
      helperText: helpText,
      errorMessage: externalErrorMessage,
      className,
      required,
      id,
      onChange,
      validate,
      debounceTime = 500,
      ...props
    },
    ref
  ) => {
    const [internalError, setInternalError] = useState('');
    
    // Use external error message if provided, otherwise use internal error
    const errorMessage = externalErrorMessage || internalError;

    // Handle debounced validation
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      // Call original onChange if provided
      if (onChange) {
        onChange(e);
      }
      
      // Skip  if no validate function
      if (!validate) return;
      
      const value = e.target.value;
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const timeoutId = (e.target as any)._timeoutId;
      if (timeoutId) clearTimeout(timeoutId);
      
      const newTimeoutId = setTimeout(() => {
        const error = validate(value);
        setInternalError(error);
      }, debounceTime);
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (e.target as any)._timeoutId = newTimeoutId;
    };

    useEffect(() => {
      return () => {
        if (ref && 'current' in ref && ref.current) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const timeoutId = (ref.current as any)._timeoutId;
          if (timeoutId) clearTimeout(timeoutId);
        }
      };
    }, []);

    const inputId = id || `input-${Math.random().toString(36).substring(2, 9)}`;
    const inputState = errorMessage ? 'error' : state;
    
    // Combine styles
    const inputClassName = [
      inputStyles({ state: inputState }),
      className
    ].filter(Boolean).join(' ');
    
    return (
      <div className={inputContainer}>
        {label && (
          <label htmlFor={inputId} className={inputLabel}>
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={inputClassName}
          aria-invalid={inputState === 'error'}
          aria-describedby={
            errorMessage
              ? `${inputId}-error`
              : helpText
              ? `${inputId}-helper`
              : undefined
          }
          required={required}
          onChange={handleChange}
          {...props}
        />
        {errorMessage && (
          <div
            id={`${inputId}-error`}
            className={errorText}
            role="alert"
          >
            {errorMessage}
          </div>
        )}
        {!errorMessage && helpText && (
          <div
            id={`${inputId}-helper`}
            className={helperText}
          >
            {helpText}
          </div>
        )}
      </div>
    );
  }
);

TextInput.displayName = 'TextInput';
export default TextInput;
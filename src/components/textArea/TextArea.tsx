import type React from "react";
import {
  type TextareaHTMLAttributes,
  forwardRef,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  type TextAreaVariants,
  errorText,
  helperText,
  textareaContainer,
  textareaLabel,
  textareaStyles,
} from "./TextArea.css";

export type TextAreaProps = TextareaHTMLAttributes<HTMLTextAreaElement> &
  TextAreaVariants & {
    label?: string;
    helperText?: string;
    errorMessage?: string;
    className?: string;
    validate?: (value: string) => string | Promise<string>;
    debounceTime?: number;
    onValidated?: (isValid: boolean) => void;
    rows?: number;
    minHeight?: string;
    maxHeight?: string;
    resizable?: boolean;
  };

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
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
      onValidated,
      rows = 3,
      minHeight,
      maxHeight,
      resizable = true,
      ...props
    },
    ref,
  ) => {
    const [internalError, setInternalError] = useState("");
    const [isValidating, setIsValidating] = useState(false);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Use external error message if provided, otherwise use internal error
    const errorMessage = externalErrorMessage || internalError;

    // Clean up timeout on unmount
    useEffect(() => {
      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      };
    }, []);

    // Handle debounced validation
    const handleChange = async (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      // Call original onChange if provided
      if (onChange) {
        onChange(e);
      }

      // Skip if no validate function
      if (!validate) return;

      const value = e.target.value;

      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

      // Schedule new validation
      timeoutRef.current = setTimeout(async () => {
        setIsValidating(true);
        try {
          const validationResult = validate(value);
          let error = "";
          if (validationResult instanceof Promise) {
            error = await validationResult;
          } else {
            error = validationResult;
          }
          setInternalError(error);
          if (onValidated) {
            onValidated(!error);
          }
        } catch (err) {
          console.error("Validation error:", err);
          setInternalError("Validation failed");
          if (onValidated) {
            onValidated(false);
          }
        } finally {
          setIsValidating(false);
        }
      }, debounceTime);
    };

    const textareaId =
      id || `textarea-${Math.random().toString(36).substring(2, 9)}`;
    const textareaState = errorMessage
      ? "error"
      : isValidating
        ? "pending"
        : state;

    // Combine styles
    const textareaClassName = [
      textareaStyles({ state: textareaState }),
      className,
    ]
      .filter(Boolean)
      .join(" ");

    // Custom inline styles for the textarea
    const textareaStyle: React.CSSProperties = {
      minHeight: minHeight || "auto",
      maxHeight: maxHeight,
      resize: resizable ? "vertical" : "none",
    };

    return (
      <div className={textareaContainer}>
        {label && (
          <label htmlFor={textareaId} className={textareaLabel}>
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          className={textareaClassName}
          aria-invalid={textareaState === "error"}
          aria-busy={isValidating}
          aria-describedby={
            errorMessage
              ? `${textareaId}-error`
              : helpText
                ? `${textareaId}-helper`
                : undefined
          }
          required={required}
          onChange={handleChange}
          rows={rows}
          style={textareaStyle}
          {...props}
        />
        {errorMessage && (
          <div id={`${textareaId}-error`} className={errorText} role="alert">
            {errorMessage}
          </div>
        )}
        {!errorMessage && helpText && (
          <div id={`${textareaId}-helper`} className={helperText}>
            {helpText}
          </div>
        )}
      </div>
    );
  },
);

export default TextArea;

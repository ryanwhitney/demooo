import type React from "react";
import {
	type InputHTMLAttributes,
	forwardRef,
	useEffect,
	useRef,
	useState,
} from "react";
import {
	type InputVariants,
	errorText,
	helperText,
	inputContainer,
	inputLabel,
	inputStyles,
} from "./TextInput.css";

export type TextInputProps = InputHTMLAttributes<HTMLInputElement> &
	InputVariants & {
		label?: string;
		helperText?: string;
		errorMessage?: string;
		className?: string;
		validate?: (value: string) => string | Promise<string>;
		debounceTime?: number;
		onValidated?: (isValid: boolean) => void;
	};

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
			onValidated,
			...props
		},
		ref,
	) => {
		const [internalError, setInternalError] = useState("");
		const [isValidating, setIsValidating] = useState(false);
		const timeoutRef = useRef<NodeJS.Timeout | null>(null);

		// Use external error message if provided, otherwise use internal error
		const errorMessage = externalErrorMessage || internalError;

		// Cancel any pending validation on unmount
		useEffect(() => {
			return () => {
				if (timeoutRef.current) {
					clearTimeout(timeoutRef.current);
				}
			};
		}, []);

		// Handle debounced validation
		const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

		const inputId = id || `input-${Math.random().toString(36).substring(2, 9)}`;
		const inputState = errorMessage
			? "error"
			: isValidating
				? "pending"
				: state;

		// Combine styles
		const inputClassName = [inputStyles({ state: inputState }), className]
			.filter(Boolean)
			.join(" ");

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
					aria-invalid={inputState === "error"}
					aria-busy={isValidating}
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
					<div id={`${inputId}-error`} className={errorText} role="alert">
						{errorMessage}
					</div>
				)}
				{!errorMessage && helpText && (
					<div id={`${inputId}-helper`} className={helperText}>
						{helpText}
					</div>
				)}
			</div>
		);
	},
);

export default TextInput;

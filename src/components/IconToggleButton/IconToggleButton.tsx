import { forwardRef, useState, useEffect } from "react";
import { assignInlineVars } from "@vanilla-extract/dynamic";
import {
	buttonBase,
	srOnly,
	iconOneContainer,
	iconTwoContainer,
	placeholder,
	transitionDurationVar,
} from "./IconToggleButton.css";

interface IconToggleButtonProps {
	iconOne?: React.ReactNode;
	iconTwo?: React.ReactNode;
	iconOneStyleOverrides?: React.CSSProperties;
	iconTwoStyleOverrides?: React.CSSProperties;
	iconOneTitle: string;
	iconTwoTitle: string;
	defaultToggled?: boolean;
	onToggle?: (isToggled: boolean) => void;
	ariaLabel?: string;
	className?: string;
	transitionDuration?: number;
	id?: string;
	style?: React.CSSProperties;
}

const IconToggleButton = forwardRef<HTMLButtonElement, IconToggleButtonProps>(
	(
		{
			iconOne,
			iconTwo,
			iconOneStyleOverrides,
			iconTwoStyleOverrides,
			iconOneTitle,
			iconTwoTitle,
			defaultToggled = false,
			onToggle,
			ariaLabel,
			className,
			transitionDuration = 150,
			id,
			style,
			...props
		},
		ref,
	) => {
		// State for managing toggle
		const [isToggled, setIsToggled] = useState(defaultToggled);

		// Effect for when parent components need to control the toggle state externally
		useEffect(() => {
			setIsToggled(defaultToggled);
		}, [defaultToggled]);

		// Handle the toggle action
		const handleToggle = () => {
			const newToggleState = !isToggled;
			setIsToggled(newToggleState);

			// Call the onToggle callback if provided
			if (onToggle) {
				onToggle(newToggleState);
			}
		};

		// Combine classes
		const buttonClassName =
			`${buttonBase} ${className || ""} ${isToggled ? "toggled" : ""}`.trim();

		return (
			<button
				type="button"
				ref={ref}
				onClick={handleToggle}
				aria-label={ariaLabel}
				aria-pressed={isToggled}
				id={id}
				className={buttonClassName}
				style={{
					...assignInlineVars({
						[transitionDurationVar]: `${transitionDuration}ms`,
					}),
					...style,
				}}
				{...props}
			>
				{/* Visually hidden text for screen readers */}
				<span className={srOnly}>
					{isToggled ? iconTwoTitle : iconOneTitle}
				</span>
				<div
					aria-hidden
					className={iconOneContainer}
					style={iconOneStyleOverrides}
				>
					{iconOne}
				</div>
				<div
					aria-hidden
					className={iconTwoContainer}
					style={iconTwoStyleOverrides}
				>
					{iconTwo}
				</div>
				{/* Placeholder to ensure button has proper dimensions */}
				<div aria-hidden className={placeholder}>
					{isToggled ? iconTwo : iconOne}
				</div>
			</button>
		);
	},
);

export default IconToggleButton;

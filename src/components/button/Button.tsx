import { type ButtonHTMLAttributes, forwardRef } from "react";
import { type ButtonVariants, buttonStyles } from "./Button.css";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  ButtonVariants & {
    className?: string;
  };

/**
 * A styled button component that preserves all native button functionality and accessibility.
 */
const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, variant, className, ...props }, ref) => {
    // Combine recipe styles with any classes passed in
    const buttonClassName = [buttonStyles({ variant }), className]
      .filter(Boolean)
      .join(" ");

    return (
      <button ref={ref} className={buttonClassName} {...props}>
        {children}
      </button>
    );
  },
);

export default Button;

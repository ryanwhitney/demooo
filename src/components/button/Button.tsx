import { forwardRef, ButtonHTMLAttributes } from 'react';
import { buttonStyles, ButtonVariants } from './Button.css';


export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & 
  ButtonVariants & {
    className?: string;
  };

/**
 * A styled button component that preserves all native button functionality and accessibility.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant,
      size,
      className,
      ...props
    },
    ref
  ) => {
    // Combine recipe styles with any additional className
    const buttonClassName = [
      buttonStyles({ variant, size }),
      className
    ].filter(Boolean).join(' ');

    return (
      <button
        ref={ref}
        className={buttonClassName}
        {...props}
      >
        {children}
      </button>
    );
  }
);

// Set display name for better debugging
Button.displayName = 'Button';

export default Button;
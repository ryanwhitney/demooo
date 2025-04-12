import { recipe, RecipeVariants } from '@vanilla-extract/recipes';
import { tokens } from '../../styles/tokens';

export const buttonStyles = recipe({
  base: {
    fontFamily: tokens.fonts.monospace,
    fontSize: tokens.fontSizes.sm,
    borderRadius: tokens.radii.md,
    border: '1px solid transparent',
    cursor: 'pointer',
    transition: 'border-color 250ms ease-in-out',
    color: tokens.colors.primary,
    backgroundColor: tokens.colors.background,
    
    ':disabled': {
      opacity: 0.6,
      cursor: 'not-allowed',
    },
    ':focus-visible': {
      outline: `2px solid ${tokens.colors.focusRing}`,
      outlineOffset: '2px',
    },
  },
  
  variants: {
    variant: {
      // base variants
      primary: {
        ':hover': {
          borderColor: tokens.colors.focusRing,
        },
        ':active': {
          borderColor: tokens.colors.focusRing,
        },
      },
      icon: {
        backgroundColor: 'transparent',
        color: 'inherit',
        border: 'none',
        ':hover': {
          opacity: 0.8,
          border: 'none'
        },
        ':active': {
          opacity: 0.8,
          border: 'none'
        },
      },
    },
    
    // size variants
    size: {
      small: {
        padding: `${tokens.space.xs} ${tokens.space.sm}`,
        fontSize: tokens.fontSizes.sm,
      },
      medium: {
        padding: `${tokens.space.sm} ${tokens.space.md}`,
        fontSize: tokens.fontSizes.base,
      },
      large: {
        padding: `${tokens.space.md} ${tokens.space.lg}`,
        fontSize: tokens.fontSizes.lg,
      },
    },
  },
  
  defaultVariants: {
    variant: 'primary',
    size: 'medium',
  },
});

export type ButtonVariants = RecipeVariants<typeof buttonStyles>;
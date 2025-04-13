import { recipe, RecipeVariants } from '@vanilla-extract/recipes';
import { tokens } from '@/styles/tokens';

export const buttonStyles = recipe({
  base: {
    fontFamily: tokens.fonts.monospace,
    borderRadius: tokens.radii.md,
    border: '1px solid transparent',
    cursor: 'pointer',
    transition: 'all 250ms ease-in-out',
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
        display: 'block',
        backgroundColor: tokens.colors.background,
        borderRadius: tokens.radii.full,
        color: tokens.colors.secondary,
        lineHeight: 0,
        padding: '8px !important',
        aspectRatio: '1/1',
        border: 'none',
        ':hover': {
          color: tokens.colors.primary,
          border: 'none',
          borderWidth:0,
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
        fontSize: tokens.fontSizes.xs,
      },
      medium: {
        padding: `${tokens.space.sm} ${tokens.space.md}`,
        fontSize: tokens.fontSizes.sm,
      },
      large: {
        padding: `${tokens.space.md} ${tokens.space.lg}`,
        fontSize: tokens.fontSizes.md,
      },
    },
  },
  
  defaultVariants: {
    variant: 'primary',
    size: 'medium',
  },
});

export type ButtonVariants = RecipeVariants<typeof buttonStyles>;
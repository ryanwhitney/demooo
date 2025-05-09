import { style } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';
import { tokens } from "@/styles/tokens";

// Base container style
export const container = style({
  position: "fixed",
  bottom: -100,
  transition: "bottom 300ms ease-in-out, opacity 200ms ease-in-out, visibility 200ms ease-in-out",
  borderRadius: 0,
  backgroundColor: "rgba(60, 60, 69, 0.3)",
  backdropFilter: "blur(10px)",
  WebkitBackdropFilter: "blur(10px)",
  border: `.33px solid ${tokens.colors.secondaryDark}`,
  zIndex: 100,
  display: 'flex',
  right: 0,
  left: 0,
  paddingTop: 10,
  justifyContent: 'center',
  overflow: "hidden",
  '@media': {
    'screen and (min-width: 480px)': {
      right: 8,
      bottom: -30,
      borderRadius: 23,
      paddingTop: 0,
      left: 'unset',
    },
  },
});

// Convert to recipe for variants
export const playerContainer = recipe({
  base: {},
  variants: {
    visible: {
      true: {
        bottom: "0",
        '@media': {
          'screen and (min-width: 480px)': {
            bottom: 8,
          },
        },
      },
      false: {}
    },
    passive: {
      true: {
        opacity: 0,
        pointerEvents: 'none',
        visibility: 'hidden',
        bottom: -100,
        '@media': {
          'screen and (min-width: 480px)': {
            bottom: -30,
          },
        },
      },
      false: {}
    }
  },
  defaultVariants: {
    visible: false,
    passive: false
  }
});

export const playerWrapper = style({
  '@media': {
   'screen and (min-width: 480px)': {
    scale: 0.5,
    marginLeft: -56,
    marginRight: -56,
    marginBottom: -22,
    marginTop: -12,
   },
  },
});
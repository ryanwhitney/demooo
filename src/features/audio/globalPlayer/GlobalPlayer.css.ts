import { style } from '@vanilla-extract/css';
import { tokens } from "@/styles/tokens";

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
  selectors: {
    '&[data-is-passive="true"]': {
      opacity: 0,
      pointerEvents: 'none',
      visibility: 'hidden',
      bottom: -100,
    },
  },
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

export const containerVisible = style({
  bottom: "0",
  '@media': {
   'screen and (min-width: 480px)': {
    bottom: 8,
   },
  },
  selectors: {
    '&[data-is-passive="true"]': {
      opacity: 0,
      visibility: 'hidden',
      pointerEvents: 'none',
      bottom: -100,
      '@media': {
        'screen and (min-width: 480px)': {
          bottom: -30,
        },
      },
    },
  },
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
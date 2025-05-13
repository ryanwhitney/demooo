import { tokens } from "@/styles/tokens";
import { createVar, style } from "@vanilla-extract/css";
import { recipe } from "@vanilla-extract/recipes";

export const transitionDurationVar = createVar();
export const minWidthVar = createVar();

// Modal styles
export const modalBackdropContainer = recipe({
  base: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    background: "rgba(0, 0, 0, 0.35)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    opacity: 0,
    backdropFilter: "blur(0)",
    transition: `all ${transitionDurationVar} ease-in-out`,
  },
  variants: {
    isActive: {
      true: {
        opacity: 1,
        backdropFilter: "blur(2px)",
      },
    },
  },
});

export const modalCard = recipe({
  base: {
    position: "relative",
    background: tokens.colors.backgroundSecondary,
    padding: tokens.space.xl,
    margin: tokens.space.xl,
    borderRadius: tokens.radii.lg,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    transform: "translateY(100px)",
    transition: `all ${transitionDurationVar} ease-in-out`,
    opacity: 1,
    boxShadow:
      "rgba(50, 50, 93, 0.25) 0px 50px 100px -20px, rgba(0, 0, 0, 0.3) 0px 30px 60px -30px",
    "@media": {
      "(min-width: 480px)": {
        minWidth: minWidthVar,
      },
      "(prefers-reduced-motion)": {
        transition: "all 0ms !important",
      },
    },
  },

  variants: {
    isActive: {
      true: {
        transform: "translateY(0)",
        opacity: 1,
      },
    },
  },
});

export const modalButtonClose = style({
  float: "right",
  position: "absolute",
  width: 24,
  height: 24,
  top: tokens.space.lg,
  right: tokens.space.lg,
});

export const modalTitle = style({
  fontSize: tokens.fontSizes.xl,
  fontWeight: tokens.fontWeights.bold,
});

export const modalDescription = style({
  fontSize: tokens.fontSizes.md,
  color: tokens.colors.secondary,
  marginTop: tokens.space.sm,
  marginBottom: tokens.space.lg,
});

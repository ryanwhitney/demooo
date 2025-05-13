// src/styles/tokens/spacing.css.ts
import { createGlobalTheme } from "@vanilla-extract/css";

const root = ":root";

// Create spacing tokens as CSS variables
export const space = createGlobalTheme(root, {
  px: "1px",
  xs: "2px",
  sm: "4px",
  md: "8px",
  lg: "16px",
  xl: "32px",
  xxl: "64px",
});

export const radii = createGlobalTheme(root, {
  none: "0",
  sm: "4px",
  md: "8px",
  lg: "12px",
  xl: "16px",
  xxl: "24px",
  full: "9999px",
});

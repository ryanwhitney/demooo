// src/styles/tokens/typography.css.ts
import { createGlobalTheme } from "@vanilla-extract/css";

const root = ":root";

// Create typography tokens as CSS variables
export const fonts = createGlobalTheme(root, {
  monospace: "JetBrains Mono, Monaco, monospace",
  system: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
});

export const fontSizes = createGlobalTheme(root, {
  xs: "10px",
  sm: "11px",
  md: "13px",
  lg: "17px",
  xl: "21px",
  xxl: "40px",
});

export const fontWeights = createGlobalTheme(root, {
  thin: "100",
  extraLight: "200",
  light: "300",
  normal: "400",
  medium: "500",
  semibold: "600",
  bold: "700",
  extrabold: "800",
  black: "900",
});

export const lineHeights = createGlobalTheme(root, {
  none: "1",
  normal: "1.5",
});

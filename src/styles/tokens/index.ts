// src/styles/tokens/index.ts
import { colorTokens } from "./colors.css";
import { radii, space } from "./spacing.css";
import { fontSizes, fontWeights, fonts, lineHeights } from "./typography.css";

// Export the combined tokens
export const tokens = {
  colors: colorTokens,
  fonts,
  fontSizes,
  fontWeights,
  lineHeights,
  space,
  radii,
};

// Also export individual token categories for convenience
export {
  colorTokens,
  fonts,
  fontSizes,
  fontWeights,
  lineHeights,
  space,
  radii,
};

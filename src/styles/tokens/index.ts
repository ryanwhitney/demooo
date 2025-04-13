// src/styles/tokens/index.ts
import { colorTokens } from "./colors.css";
import { fonts, fontSizes, fontWeights, lineHeights } from "./typography.css";
import { space, radii } from "./spacing.css";

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

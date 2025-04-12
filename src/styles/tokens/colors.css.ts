import { createGlobalTheme } from '@vanilla-extract/css';

// Define the root element to attach variables to
const root = ':root'

// Create color tokens as CSS variables
export const colors = createGlobalTheme(root, {
  white: '#FFFFFF',
  black: '#000000',
  gray50: 'rgba(235, 235, 247, 0.60)',
  gray50P3: 'color(display-p3 0.9216 0.9216 0.9608 / 0.60)',
  blue500: '#3B82F6',
  blue700: '#1D4ED8',
  indigo500: '#636CFF',
  blackTransparent50: 'rgba(0, 0, 0, 0.5)',
})
// Create semantic color tokens as CSS variables
export const colorTokens = createGlobalTheme(root, {
  primary: colors.white,
  secondary: `${colors.gray50, colors.gray50P3}`,
  background: colors.black,
  backdrop: colors.blackTransparent50,
  focusRing: colors.indigo500
})

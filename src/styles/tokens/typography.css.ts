// src/styles/tokens/typography.css.ts
import { createGlobalTheme } from '@vanilla-extract/css';

const root = ':root';

// Create typography tokens as CSS variables
export const fonts = createGlobalTheme(root, {
  monospace: 'Monaco, monospace',
  system: 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
});

export const fontSizes = createGlobalTheme(root, {
  xs: '10px',
  sm: '11px',
  base: '14px',
  lg: '17px',
  xl: '21px',
  xxl: '40px'
});

export const fontWeights = createGlobalTheme(root, {
  normal: '400',
  medium: '500',
  bold: '700'
});

export const lineHeights = createGlobalTheme(root, {
  none: '1',
  normal: '1.5',
});
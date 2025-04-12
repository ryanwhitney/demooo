import { globalStyle } from '@vanilla-extract/css';
import { tokens } from './tokens';

globalStyle('html, body', {
  fontFamily: tokens.fonts.monospace,
  fontSize: tokens.fontSizes.base,
  lineHeight: tokens.lineHeights.normal,
  color: tokens.colors.primary,
  backgroundColor: tokens.colors.background,
  WebkitFontSmoothing: 'antialiased',
  MozOsxFontSmoothing: 'grayscale',
  minHeight: '100vh',
});

import { style, createVar, globalStyle } from '@vanilla-extract/css';

// Create CSS variables for customization
export const transitionDurationVar = createVar();

// Base button styles
export const buttonBase = style({
  border: 'none',
  background: 'none',
  color: 'currentColor',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  position: 'relative',
  cursor: 'pointer',
  padding: 0,
	width: 'fit-content',
	overflow: 'visible'
});

// Visually hidden class for screen readers
export const srOnly = style({
  position: 'absolute',
  width: '1px',
  height: '1px',
  padding: 0,
  margin: '-1px',
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap',
  borderWidth: 0,
});

// First icon container (visible when not toggled)
export const iconOneContainer = style({
  position: 'absolute',
  opacity: 1,
  transform: 'scale(1)',
  transition: `all ${transitionDurationVar} ease-in-out`,
	overflow: 'visible',
  selectors: {
    '.toggled &': {
      opacity: 0,
      transform: 'scale(0)',
    }
  },
	'@media': {
    '(prefers-reduced-motion)': {      
			transition: 'all 0ms !important',
    }
  }
});

// Second icon container (visible when toggled)
export const iconTwoContainer = style({
  position: 'absolute',
  opacity: 0,
  transform: 'scale(0)',
  transition: `all ${transitionDurationVar} ease-in-out`,
  overflow: 'visible',

  selectors: {
    '.toggled &': {
      opacity: 1,
      transform: 'scale(1)',
    }
  },
	'@media': {
    '(prefers-reduced-motion)': {
			transition: 'all 0ms !important',
    }
  }
});

// Hidden placeholder to maintain button dimensions
export const placeholder = style({
  visibility: 'hidden',
  display: 'inline-block',
});

// Media query for users who prefer reduced motion
globalStyle('@media (prefers-reduced-motion: reduce)', {
  vars: {
    [transitionDurationVar]: '0ms',
  }
});

import { style, createVar, globalStyle } from '@vanilla-extract/css';

// Passes down transition duration var 
export const transitionDurationVar = createVar();

// Screen reader class
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

globalStyle('@media (prefers-reduced-motion: reduce)', {
  vars: {
    [transitionDurationVar]: '0ms',
  }
});

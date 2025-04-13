import { style } from '@vanilla-extract/css';
import { tokens } from '@/styles/tokens'

// Modal styles
export const modalBackdropContainer = style({
  position: 'absolute',
  top: 0,
  bottom: 0,
  left: 0,
  right: 0,
  background: tokens.colors.backdrop,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center'
});

export const modalCard = style({
  position: 'relative',
  background: tokens.colors.backgroundSecondary,
  padding: tokens.space.xl,
  margin: tokens.space.xl,
  borderRadius: tokens.radii.lg,
  width: '300px',
  display:' grid',
  gridTemplateColumns: 'minmax(min-content, max-content)',
  boxShadow: 'rgba(50, 50, 93, 0.25) 0px 50px 100px -20px, rgba(0, 0, 0, 0.3) 0px 30px 60px -30px'
});

export const modalButtonClose = style({
  float: 'right',
  position: 'absolute',
  top: tokens.space.lg,
  right: tokens.space.lg
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

import { style } from '@vanilla-extract/css';
import { tokens } from '../../styles/tokens'

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
  background: tokens.colors.secondary,
  padding: tokens.space.md,
  margin: '32px',
  borderRadius: '12px',
  minWidth: '300px',
  paddingTop: '48px',
  boxShadow: 'rgba(50, 50, 93, 0.25) 0px 50px 100px -20px, rgba(0, 0, 0, 0.3) 0px 30px 60px -30px'
});

export const modalButtonClose = style({
  float: 'right',
  position: 'absolute',
  top: '8px',
  right: '8px'
});

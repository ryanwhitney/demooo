import { style  } from '@vanilla-extract/css';
import { tokens } from '@/styles/tokens';

export const trackChipWrapper = style({
  width: 110,
  padding: tokens.space.md,
  border: `1px solid transparent`,
  borderRadius: tokens.radii.lg,
  transition: 'border-color 0.2s ease-in-out',
  ':hover': {
    borderColor: tokens.colors.tertiaryDark,
  }
});

export const waveformWrapper = style({
  backgroundColor: tokens.colors.quaternaryDark,
  borderRadius: tokens.radii.lg,
  display: 'flex',
  justifyContent: 'center',
  padding: '16px 8px',
});

export const trackText = style({
  fontSize: tokens.fontSizes.sm,
  display: 'flex',
  flexDirection: 'column',
  gap: tokens.space.xs,
  paddingTop: tokens.space.md,
  marginLeft: tokens.space.px,
});

export const trackTitle = style({
  cursor: 'pointer',
  color: tokens.colors.primary,
  textDecoration: 'none',
});
export const trackArtist = style({
  cursor: 'pointer',
  color: tokens.colors.secondary,
  textDecoration: 'none',
});
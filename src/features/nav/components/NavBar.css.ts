import { style } from '@vanilla-extract/css';
import { tokens } from '@/styles/tokens'

export const navBar = style({
  padding: tokens.space.lg,
  paddingLeft: tokens.space.xl,
  paddingRight: tokens.space.xl,
  backgroundColor: tokens.colors.background,
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
});

export const logo = style({
  cursor: 'pointer',
  transition: 'all 250ms ease-in-out',
  padding: `${tokens.space.lg} ${tokens.space.lg}`,
  ':hover': {
    opacity: 0.95,
    scale: 1.1,
  },
});

export const navList = style({
  display: 'flex',
  listStyle: 'none',
  gap: tokens.space.md,
  padding: 0,
  margin: 0,
  alignItems: 'center',
});


export const navBarUser = style({
  color: tokens.colors.tertiary,
  padding: tokens.space.lg,
});


export const navButton = style({
  fontWeight: 500
});

export const navItemsList = style({
  display: 'flex',
  alignItems: 'center',
  listStyle: 'none',
  gap: tokens.space.md,
  padding: 0,
});
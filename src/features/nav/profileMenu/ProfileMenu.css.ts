import { tokens } from '@/styles/tokens'
import { style, createVar } from '@vanilla-extract/css'

export const transitionSpeedVar = createVar();

export const profilePhoto = style({
  borderRadius: tokens.radii.full,
})

export const profileMenuButton = style({
  borderRadius: '50%',
})

export const popover = style({
  backgroundColor: tokens.colors.backgroundSecondary,
  borderRadius: tokens.radii.lg,
  gap: tokens.space.lg,
  boxShadow: 'rgba(0, 0, 0, 0.28) 0px 2px 16px 0px',
  transition: `opacity ${transitionSpeedVar} cubic-bezier(.05, .69, .14, 1)`,
})

export const profileContainer = style({
  width: 200,
  display: 'flex',
  padding: tokens.space.md,
  gap: tokens.space.md,
  alignItems: 'center',
})

export const profileInfoContainer = style({
  display: 'flex',
  flexDirection: 'column',
})

export const profileName = style({
  color: tokens.colors.primary,
  fontSize: 14,
  fontWeight: 600,
})

export const profileUsername = style({
  color: tokens.colors.secondary,
  fontSize: 12,
})

export const separator = style({
  border: 'none',
  height: 1,
  backgroundColor: tokens.colors.quaternaryDark,
})

export const menuContainer = style({
  padding: tokens.space.md,
  display: 'flex',
  flexDirection: 'column',
  gap: 2,
})

export const menuItem = style({
  background: tokens.colors.quaternaryDark,
  width: '100%',
  padding: '10px 16px',
  fontSize: 12,
  borderRadius: tokens.radii.md,
  textDecoration: 'none',
  textAlign: 'left',
  color: tokens.colors.primary,
  display: 'block',
  ':hover': {
    background: tokens.colors.tintColor,
    transition: 'background 100ms ease-in-out',
  },
  ':active': {
    background: tokens.colors.tintColorHover,
    transition: 'background 200ms ease-in-out',
  },
})

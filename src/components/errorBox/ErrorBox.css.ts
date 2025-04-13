import { style } from '@vanilla-extract/css';
import { tokens } from '@/styles/tokens'

export const errorBoxContainer = style({
  padding: `${tokens.space.md} ${tokens.space.lg}`,
  backgroundColor: tokens.colors.errorBackground,
  fontSize: tokens.fontSizes.md,
  color: tokens.colors.error,
  marginBottom: tokens.space.lg,
  borderRadius: tokens.radii.md,
  width: 'fit-content',
})
import { tokens } from "@/styles/tokens";
import { style } from "@vanilla-extract/css";

export const trackViewWrapper = style({
  display: "flex",
  width: "100%",
  justifyContent: "space-around",
  gap: tokens.space.xl,
  paddingTop: tokens.space.xl,
});

export const trackViewInfo = style({
  display: "flex",
  flexDirection: "column",
  gap: tokens.space.lg,
  fontSize: tokens.fontSizes.md,
  fontWeight: tokens.fontWeights.normal,
  color: tokens.colors.secondary,
});

export const trackViewArtist = style({
  cursor: "pointer",
  color: tokens.colors.secondary,
});

export const trackViewTitle = style({
  border: "1px solid transparent",
  borderRadius: tokens.radii.lg,
  transition: "border-color 0.2s ease-in-out",
  color: tokens.colors.primary,
  ":hover": {
    borderColor: tokens.colors.tertiaryDark,
  },
});

export const trackViewDetails = style({
  fontSize: tokens.fontSizes.md,
  color: tokens.colors.secondary,
  display: "flex",
  flexDirection: "column",
  gap: tokens.space.xs,
});

export const trackViewTagsWrapper = style({
  display: "flex",
  gap: tokens.space.sm,
  flexWrap: "wrap",
  marginTop: tokens.space.sm,
});

export const audioPlayerContainer = style({
  display: "flex",
  width: "100%",
  marginTop: tokens.space.md,
  marginBottom: tokens.space.md,
});

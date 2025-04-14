import { tokens } from "@/styles/tokens";
import { style } from "@vanilla-extract/css";

export const audioPlayerWrapper = style({
  width: "fit-content",
  display: "flex",
  flexDirection: "column",
});

export const controlsWrapper = style({
  display: "flex",
  gap: tokens.space.md,
  alignItems: "center",
});

export const playButtonWrapper = style({
  width: 44,
  height: 44,
  padding: 12,
});

export const waveformContainer = style({
  background: tokens.colors.backgroundSecondary,
  padding: "6px 14px",
  borderRadius: tokens.radii.lg,
});

export const timeDisplay = style({
  color: tokens.colors.secondary,
  fontSize: tokens.fontSizes.xs,
  alignSelf: "flex-end",
  paddingTop: tokens.space.sm,
});

export const waveformProgressIndicator = style({
  width: 2.5,
  position: "absolute",
  left: "0%", // Will be controlled dynamically
  top: -4,
  bottom: -4,
  transition: "opacity 3.5s ease-in",
  background: tokens.colors.focusRing,
  borderRadius: 2,
  zIndex: 2,
});

export const waveformProgress = style({
  position: "absolute",
  left: 0,
  top: 0,
  bottom: 0,
  background: `linear-gradient(90deg, ${tokens.colors.backgroundSecondary}, rgba(0,0,0,0.2))`,
  color: "white",
});

export const waveformSlider = style({
  position: "relative",
  height: 30,
  width: 240,
  cursor: "pointer",
  touchAction: "none",
});

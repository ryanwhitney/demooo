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
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
});

export const playButton = style({
  width: 44,
  height: 44,
  padding: 0,
  background: tokens.colors.backgroundSecondary,
  borderRadius: tokens.radii.full,
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  cursor: "pointer",
  color: tokens.colors.primary,
});

export const waveformContainer = style({
  background: tokens.colors.backgroundSecondary,
  padding: "6px 14px",
  borderRadius: tokens.radii.lg,
  position: "relative",
  overflow: "hidden",
  width: 240,
  height: 30,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
});

export const waveformVisualization = style({
  position: "relative",
  width: "100%",
  height: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
});

export const timeDisplay = style({
  color: tokens.colors.secondary,
  fontSize: tokens.fontSizes.xs,
  alignSelf: "flex-end",
  paddingTop: tokens.space.sm,
});

export const waveformProgressIndicator = style({
  display: 'none',
});

export const waveformProgress = style({
  position: "absolute",
  left: 0,
  top: 0,
  bottom: 0,
  background: `linear-gradient(90deg, 'red', 'blue')`,
  pointerEvents: "none",
  zIndex: 1,
});

export const waveformSlider = style({
  position: "relative",
  height: 30,
  width: 240,
  cursor: "pointer",
  touchAction: "none",
});

export const timelineSlider = style({
  position: "relative",
  width: "100%",
  height: "100%",
  cursor: "pointer",
  touchAction: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
});

export const audioElement = style({
  display: "none",
});

export const timelineWrapper = style({
  display: "flex",
  flexDirection: "column",
  flex: 1,
  width: "100%",
});

export const progressIndicator = style({
  position: "absolute",
  width: 2,
  top: -2,
  bottom: -2,
  background: tokens.colors.primary,
  borderRadius: 2,
  zIndex: 3,
  pointerEvents: "none",
});

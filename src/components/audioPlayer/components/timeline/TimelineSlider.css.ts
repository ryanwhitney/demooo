import { tokens } from "@/styles/tokens";
import { createVar, style } from "@vanilla-extract/css";

export const progressVar = createVar();
export const leftPositionVar = createVar();

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

export const timelineFocused = style({
  boxShadow: `0 0 0 2px ${tokens.colors.primary}`,
  outline: "none",
});

export const playheadIndicator = style({
  position: "absolute",
  width: 2,
  top: -3,
  bottom: -3,
  background: tokens.colors.tintColor,
  borderRadius: 2,
  zIndex: 3,
  pointerEvents: "none",
  left: leftPositionVar,
});

export const progressContainer = style({
  position: "relative",
  width: "100%",
  height: "100%",
});

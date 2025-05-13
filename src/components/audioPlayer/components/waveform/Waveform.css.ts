import { style } from "@vanilla-extract/css";

export const waveformVisualization = style({
  position: "relative",
  width: "100%",
  height: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
});

export const waveformProgress = style({
  position: "absolute",
  left: 0,
  top: 0,
  bottom: 0,
  backgroundImage: 'linear-gradient(90deg, #131313 50%, #131313cc)',
  pointerEvents: "none",
  opacity: 0.7,
  zIndex: 10,
});

export const waveformSvg = style({
  display: "block",
  position: "relative",
  zIndex: 1,
});

export const waveformBar = style({
  borderRadius: 20,
}); 
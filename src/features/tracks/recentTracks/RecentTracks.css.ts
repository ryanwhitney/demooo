import { tokens } from "@/styles/tokens";
import { style } from "@vanilla-extract/css";

export const recentTracksContainer = style({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
});

export const recentTracksHeader = style({
  padding: 20,
  textTransform: "uppercase",
  fontSize: 11,
  letterSpacing: 8,
  color: tokens.colors.secondary,
});

export const recentTracksGridContainer = style({
  display: "flex",
  gap: 16,
  justifyContent: "center",
  padding: 0,
  flexWrap: "wrap",
  listStyle: "none",
  margin: 0,
  maxWidth: 768,
});

export const recentTracksGridListItem = style({
  borderRadius: tokens.radii.md,
});

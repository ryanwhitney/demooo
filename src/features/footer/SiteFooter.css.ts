import { tokens } from "@/styles/tokens";
import { style } from "@vanilla-extract/css";

export const siteFooterContainer = style({
  display: "flex",
  justifyContent: "center",
  padding: tokens.space.xl,
  paddingTop: tokens.space.xxl,
  alignItems: "center",
  lineHeight: 1,
  color: tokens.colors.secondary,
});

export const siteFooterCopyright = style({
  fontSize: 12,
  position: "relative",
  bottom: -2,
});

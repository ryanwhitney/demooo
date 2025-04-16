import { tokens } from "@/styles/tokens";
import { style } from "@vanilla-extract/css";

export const artistViewWrapper = style({
	display: "flex",
  flexDirection: 'column',
	justifyContent: "space-around",
  alignItems: 'center',
	gap: tokens.space.xl,
	paddingTop: tokens.space.xl,
	paddingBottom: tokens.space.xl,
});

export const artistTrackViewInfo = style({
	display: "flex",
	flexDirection: "column",
	gap: tokens.space.lg,
	fontSize: tokens.fontSizes.md,
	fontWeight: tokens.fontWeights.normal,
	color: tokens.colors.secondary,
});

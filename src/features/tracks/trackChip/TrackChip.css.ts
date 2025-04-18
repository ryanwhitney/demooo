import { tokens } from "@/styles/tokens";
import { globalStyle, style } from "@vanilla-extract/css";

export const trackChipWrapper = style({
	width: 110,
	padding: tokens.space.md,
	border: '1px solid transparent',
	borderRadius: tokens.radii.lg,
	transition: "all 0.2s ease-in-out",
	textDecoration: "none",
	":hover": {
		borderColor: tokens.colors.tertiaryDark,
	},
});

export const waveformWrapper = style({
	backgroundColor: tokens.colors.quaternaryDark,
	borderRadius: tokens.radii.lg,
	display: "flex",
	justifyContent: "center",
	padding: "16px 8px",
	position: "relative",
});

export const trackChipPlayButton = style({
	width: 24,
	height: 24,
	padding: 8,
	opacity: 0,
	position: 'absolute',
	alignSelf: 'center',
	justifySelf: 'center',
	transition: 'opacity 200ms ease', 
	
})

export const waveformElement = style({
	opacity: 1,
	transition: 'opacity 200ms ease', 
});

// Add this globalStyle definition to create the group hover effect
globalStyle(`${waveformWrapper}:hover ${trackChipPlayButton}`, {
  opacity: 1
});
globalStyle(`${waveformWrapper}:hover ${waveformElement}`, {
  opacity: 0.2
});

export const trackText = style({
	fontSize: tokens.fontSizes.sm,
	display: "flex",
	flexDirection: "column",
	gap: tokens.space.xs,
	paddingTop: tokens.space.md,
	marginLeft: tokens.space.px,
});

export const trackTitle = style({
	cursor: "pointer",
	color: tokens.colors.primary,
	textDecoration: "none",
});
export const trackArtist = style({
	cursor: "pointer",
	color: tokens.colors.secondary,
	textDecoration: "none",
	display: 'flex',
	gap: 5,
	width: 'fit-content',
	transition: "color 0.1s ease-in-out",
	':hover':{
		color: tokens.colors.primary,
	}
});

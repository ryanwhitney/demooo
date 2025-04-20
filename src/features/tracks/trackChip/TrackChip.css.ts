import { tokens } from "@/styles/tokens";
import { globalStyle, style } from "@vanilla-extract/css";

export const trackChipWrapper = style({
	width: 148,
	padding: tokens.space.sm,
	border: '1px solid transparent',
	borderRadius: tokens.radii.lg,
	transition: "all 0.2s ease-in-out",
	textDecoration: "none",
	display:'flex',
	flexDirection: 'column-reverse',
	backgroundColor: tokens.colors.quaternaryDark,
	borderColor: tokens.colors.quaternaryDark,

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
	position: 'relative',
});

export const trackChipPlayButton = style({
	width: 24,
	height: 24,
	padding: 8,
	alignSelf: 'center',
	justifySelf: 'center',
	transition: 'opacity 150ms ease', 
	zIndex: 4,
	opacity: 0,
	':focus':{
		opacity: 1
	},
	'::before':{
		content: '\ ',
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		inset: 0,
		zIndex: 5,
	},
})

export const waveformElement = style({
	opacity: 1,
	position: 'absolute',
	transition: 'opacity 200ms ease', 
	transform: 'translate3d(0, 0, 0)', // fix safari jitter
});

// Add this globalStyle definition to create the group hover effect
globalStyle(`${waveformWrapper}:hover ${trackChipPlayButton}`, {
  opacity: 1,
});

// Add this globalStyle definition to create the group hover effect
globalStyle(`${trackChipWrapper}:focus ${trackChipPlayButton}`, {
  opacity: 1,
});

globalStyle(`${waveformWrapper}:hover ${waveformElement}`, {
  opacity: 0.2
});

globalStyle(`${trackChipWrapper}:focus ${waveformElement}`, {
  opacity: 0.2
});

export const trackText = style({
	fontSize: tokens.fontSizes.sm,
	display: "flex",
	flexDirection: "column",
	// gap: tokens.space.xs,
	paddingTop: tokens.space.md,
});

export const trackTitle = style({
	cursor: "pointer",
	color: tokens.colors.primary,
	textDecoration: "none",
	zIndex: 2,
	// background: 'red',
	padding: tokens.space.sm,
	position: 'relative',
	fontWeight: 400,
	// transition: 'font-weight 200ms ease',
	// account for line 2 somehow showing below
	lineHeight: 1.8,
	marginBottom: -2,
	// padding applies to linebreaks
	WebkitBoxDecorationBreak: 'clone',
	boxDecorationBreak: 'clone',
	// line clmp
	WebkitLineClamp: 1,
	display: '-webkit-box',
  WebkitBoxOrient: 'vertical',
	textOverflow: 'ellipsis',
	lineBreak: 'anywhere',
	overflow: 'hidden',
	':hover':{
		fontWeight: 600,
	}
});

export const trackArtistContainer = style({
	cursor: "pointer",
	color: tokens.colors.secondary,
	textDecoration: "none",
	display: 'flex',
	lineHeight: 1,
	// background: 'blue',
	alignItems: 'center',
	gap: 5,
	// width: 'fit-content',
	padding: tokens.space.sm,
	position: 'relative',
	// transition: "color 0.1s ease-in-out",
	zIndex: 2,
	':hover':{
		color: tokens.colors.primary,
	}
})

export const trackArtist = style({
	// padding applies to linebreaks
	WebkitBoxDecorationBreak: 'clone',
	boxDecorationBreak: 'clone',
	// line clmp
	WebkitLineClamp: 1,
	display: '-webkit-box',
  WebkitBoxOrient: 'vertical',
	textOverflow: 'ellipsis',
	lineBreak: 'anywhere',
	overflow: 'hidden',
});

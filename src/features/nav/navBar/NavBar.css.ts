import { tokens } from "@/styles/tokens";
import { style } from "@vanilla-extract/css";

export const navBar = style({
	padding: tokens.space.lg,
	display: "flex",
	paddingLeft: tokens.space.md,
	paddingRight: tokens.space.md,
	justifyContent: "space-between",
	alignItems: "center",
	width: '100vw',
	maxWidth: 1200,
	'@media': {
    'screen and (min-width: 480px)': {
			paddingLeft: tokens.space.xl,
			paddingRight: tokens.space.xl,
    }
  },
});

export const logo = style({
	cursor: "pointer",
	transition: "all 250ms ease-in-out",
	borderRadius: tokens.radii.md,
	padding: tokens.space.sm,
	marginLeft: -tokens.space.sm, //
	":hover": {
		opacity: 0.95,
	},
});

export const navList = style({
	display: "flex",
	listStyle: "none",
	gap: tokens.space.md,
	padding: 0,
	margin: 0,
	alignItems: "center",
});

export const navBarUser = style({
	color: tokens.colors.tertiary,
	padding: tokens.space.lg,
});

export const navButton = style({
	fontWeight: 500,
});

export const navItemsList = style({
	display: "flex",
	alignItems: "center",
	listStyle: "none",
	gap: tokens.space.md,
	padding: 0,
});

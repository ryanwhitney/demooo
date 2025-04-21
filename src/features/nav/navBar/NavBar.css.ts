import { tokens } from "@/styles/tokens";
import { style } from "@vanilla-extract/css";

export const navBar = style({
	padding: tokens.space.lg,
	paddingLeft: tokens.space.xl,
	paddingRight: tokens.space.xl,
	display: "flex",
	justifyContent: "space-between",
	alignItems: "center",
	width: '100vw',
	maxWidth: 1200,
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

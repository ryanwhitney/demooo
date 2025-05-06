import { tokens } from "@/styles/tokens";
import { style, globalStyle, keyframes } from "@vanilla-extract/css";

export const toastsContainer = style({
	position: "absolute",
	top: 0,
	left: 0,
	right: 0,
	display: "flex",
	flexDirection: "column",
	alignItems: "center",
	pointerEvents: "none",
	zIndex: 100,
});

export const toast = style({
	position: "relative",
	minHeight: 50,
	width: 400,
	backgroundColor: tokens.colors.backgroundSecondary,
	display: "flex",
	alignItems: "center",
	justifyContent: "space-between",
	padding: tokens.space.lg,
	borderRadius: tokens.radii.md,
	pointerEvents: "all",
	marginTop: tokens.space.md,
	border: "2px solid black",
	boxShadow:
		"rgba(50, 50, 93, 0.25) 0px 50px 100px -20px, rgba(0, 0, 0, 0.3) 0px 30px 60px -30px",
	transition: "all 1000ms ease-out",
	zIndex: 100,
});

export const toastCloseButton = style({
	backgroundColor: "transparent",
	border: "1px solid",
	borderColor: tokens.colors.primary,
	color: tokens.colors.primary,
	cursor: "pointer",
	padding: 6,
	borderRadius: tokens.radii.full,
	fontSize: "1.5rem",
	pointerEvents: "all",
	display: "flex",
	alignItems: "center",
	justifyContent: "center",
	height: 20,
	width: 20,
	transition: "all 100ms ease-in-out",
	userSelect: "none",
	WebkitUserSelect: "none",
	MozUserSelect: "none",
	":hover": {
		color: tokens.colors.secondary,
		borderColor: tokens.colors.secondary,
	},
});

const slideInFromTop = keyframes({
	from: {
		transform: "translateY(-200%)",
		opacity: 0,
	},
	to: {
		transform: "translateY(0)",
		opacity: 1,
	},
});

const slideOutToTop = keyframes({
	from: {
		transform: "translateY(0)",
		opacity: 1,
	},
	to: {
		transform: "translateY(-200%)",
		opacity: 0,
	},
});

globalStyle("::view-transition-new(.toast):only-child", {
	animation: `${slideInFromTop} 250ms ease-out`,
});

globalStyle("::view-transition-old(.toast):only-child", {
	animation: `${slideOutToTop} 250ms ease-out`,
});

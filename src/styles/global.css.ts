import { globalStyle } from "@vanilla-extract/css";
import { tokens } from "./tokens";

globalStyle("html, body", {
	fontFamily: tokens.fonts.monospace,
	fontSize: tokens.fontSizes.md,
	lineHeight: tokens.lineHeights.normal,
	color: tokens.colors.primary,
	backgroundColor: tokens.colors.background,
	WebkitFontSmoothing: "antialiased",
	MozOsxFontSmoothing: "grayscale",
	minHeight: "100vh",
	display: "flex",
	flexDirection: "column",
	alignItems: "stretch",
});

globalStyle("main", {
	maxWidth: 960,
	margin: "0 auto",
});

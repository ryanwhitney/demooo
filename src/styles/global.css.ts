import { globalStyle } from "@vanilla-extract/css";
import { tokens } from "./tokens";

globalStyle("html, body", {
	fontFamily: tokens.fonts.monospace,
	fontSize: tokens.fontSizes.md,
  fontOpticalSizing: 'auto',
  fontWeight: 400,
  fontStyle: 'normal',
	lineHeight: tokens.lineHeights.normal,
	color: tokens.colors.primary,
	backgroundColor: tokens.colors.background,
	WebkitFontSmoothing: "antialiased",
	MozOsxFontSmoothing: "grayscale",
	minHeight: "100vh",
	display: "flex",
	flexDirection: "column",
	alignItems: "stretch",
	width: "100vw",
	overflowX: "hidden",
});

globalStyle("main", {
	maxWidth: 960,
	margin: "0 auto",
	padding: "0 32px",
});

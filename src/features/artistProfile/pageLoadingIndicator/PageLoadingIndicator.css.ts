import { style } from "@vanilla-extract/css";

export const pageLoadingIndicatorContainer = style({
	width: "100%",
	height: "90vh",
	display: "flex",
	alignItems: "center",
	justifyContent: "center",
	transition: "opacity 0.3s ease-in",
});

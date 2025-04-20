import { tokens } from '@/styles/tokens'
import { style } from '@vanilla-extract/css';

export const notFoundHeader =  style({
	fontSize: 64,
	fontWeight: tokens.fontWeights.normal,
	textTransform: "uppercase",
	display: "flex",
	justifyContent: "space-around",
	alignItems: "center",
	textAlign: "center",
	paddingTop: 100,
	paddingBottom: 20,
})

export const notFoundDescription =  style({
	fontSize: tokens.fontSizes.xl,
	paddingBottom: 60,
})
import { tokens } from "@/styles/tokens";
import { colors } from "@/styles/tokens/colors.css";
import { style } from "@vanilla-extract/css";
import { type RecipeVariants, recipe } from "@vanilla-extract/recipes";

const baseInput = style({
	display: "block",
	width: "100%",
	fontFamily: tokens.fonts.monospace,
	fontSize: tokens.fontSizes.lg, // prevent zoom on mobile
	lineHeight: tokens.lineHeights.normal,
	color: tokens.colors.primary,
	backgroundColor: colors.black,
	border: `1px solid ${tokens.colors.quaternary}`,
	borderRadius: tokens.radii.lg,
	padding: `${tokens.space.md} ${tokens.space.lg}`,
	transition: "border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
	'@media': {
		'screen and (min-width: 480px)': {
			fontSize: tokens.fontSizes.md,

		}
	},
	"::placeholder": {
		color: tokens.colors.tertiary,
	},

	":focus": {
		outline: "none",
		borderColor: tokens.colors.focusRing,
		boxShadow: `0 0 0 1px ${tokens.colors.focusRing}`,
	},

	":disabled": {
		opacity: 0.6,
		cursor: "not-allowed",
		backgroundColor: tokens.colors.backgroundSecondary,
	},
});

export const inputStyles = recipe({
	base: baseInput,

	variants: {
		state: {
			default: {},
			pending: {},
			error: {
				borderColor: tokens.colors.error,
				":focus": {
					boxShadow: `0 0 0 1px ${tokens.colors.error}`,
					borderColor: tokens.colors.error,
				},
			},
			success: {
				borderColor: tokens.colors.success,
				":focus": {
					boxShadow: `0 0 0 1px ${tokens.colors.success}`,
					borderColor: tokens.colors.error,
				},
			},
		},
	},

	defaultVariants: {
		state: "default",
	},
});

// NOTE: This is overriden in UploadTracks.css.ts
export const inputContainer = style({
	display: "flex",
	flexDirection: "column",
	gap: tokens.space.xs,
	marginBottom: tokens.space.md,
});

export const inputLabel = style({
	display: "block",
	fontSize: tokens.fontSizes.sm,
	fontWeight: "500",
	marginBottom: tokens.space.xs,
	color: tokens.colors.secondary,
});

export const helperText = style({
	fontSize: tokens.fontSizes.xs,
	color: tokens.colors.tertiary,
	marginTop: tokens.space.xs,
});

export const errorText = style({
	fontSize: tokens.fontSizes.xs,
	color: tokens.colors.error,
	marginTop: tokens.space.xs,
});

export type InputVariants = RecipeVariants<typeof inputStyles>;

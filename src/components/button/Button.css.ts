import { tokens } from "@/styles/tokens";
import { type RecipeVariants, recipe } from "@vanilla-extract/recipes";

export const buttonStyles = recipe({
	base: {
		width: "100%",
		fontFamily: tokens.fonts.monospace,
		color: tokens.colors.primary,
		cursor: "pointer",
		fontSize: tokens.fontSizes.md,
		fontWeight: tokens.fontWeights.semibold,
		padding: "12px 16px",
		borderRadius: tokens.radii.md,
		textDecoration: "none",
		display: "block",
		textAlign: "center",
		transition: "all 200ms ease",
		transform: "translate3d(0,0,0)", 
		border: `2px solid ${tokens.colors.backgroundSecondary}`,
		":disabled": {
			opacity: 0.6,
			cursor: "not-allowed",
		},
		":focus-visible": {
			outline: `2px solid ${tokens.colors.focusRing}`,
			outlineOffset: "2px",
		},
	},

	variants: {
		variant: {
			primary: {
				background: tokens.colors.tintColor,
				':hover': {
					filter: "brightness(1.15)",
				},
				':disabled': {
					color: 'rgba(255,255,255,0.3s)',
					background: tokens.colors.background,
					':hover': {
					filter: "brightness(1)",
				},
				},
			},
			secondary: {
				background: tokens.colors.backgroundSecondary,
				borderRadius: "8px",
				':hover': {
					filter: "brightness(1.4)",
				},
				":active": {
					borderColor: tokens.colors.focusRing,
				},
			},
			nav: {
				border: "1px solid transparent",
				backgroundColor: tokens.colors.background,
				fontSize: tokens.fontSizes.sm,
				padding: `${tokens.space.sm} ${tokens.space.md}`,
				":hover": {
					borderColor: tokens.colors.focusRing,
				},
			},
			icon: {
				display: "block",
				backgroundColor: tokens.colors.background,
				borderRadius: tokens.radii.full,
				color: tokens.colors.secondary,
				lineHeight: 0,
				padding: "8px !important",
				aspectRatio: "1/1",
				border: "none",
				":hover": {
					color: tokens.colors.primary,
					border: "none",
					borderWidth: 0,
				},
				":active": {
					opacity: 0.8,
					border: "none",
				},
			},
		},

	},

	defaultVariants: {
		variant: "primary",
	},
});

export type ButtonVariants = RecipeVariants<typeof buttonStyles>;

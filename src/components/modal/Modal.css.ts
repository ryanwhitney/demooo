import { tokens } from "@/styles/tokens";
import { style } from "@vanilla-extract/css";
import { recipe } from "@vanilla-extract/recipes"

// Modal styles
export const modalBackdropContainer = recipe({
	base: {
	position: "absolute",
	top: 0,
	bottom: 0,
	left: 0,
	right: 0,
	background: 'rgba(0, 0, 0, 0.35)',
	display: "flex",
	justifyContent: "center",
	alignItems: "center",
	opacity: 0,
	backdropFilter: "blur(0)",

	},
	variants: {
		isActive: {
			true: {
				opacity: 1,
				backdropFilter: "blur(2px)",
			},
		},
	}
})


export const trackRowTitle = recipe({
  base:{
    color: tokens.colors.primary,
    transition: "font 150ms ease-in-out",
    textDecoration: "none",
    fontWeight: tokens.fontWeights.light,
  },
  variants: {
    isActive: {
      true:{
        fontWeight: 600,
      }
    }
  }
})

export const modalCard = recipe({
	base:{
		position: "relative",
		background: tokens.colors.backgroundSecondary,
		padding: tokens.space.xl,
		margin: tokens.space.xl,
		borderRadius: tokens.radii.lg,
		width: "300px",
		display: "grid",
		gridTemplateColumns: "minmax(min-content, max-content)",
		// scale: 0,
		transform: "translateY(100px)",
		boxShadow:
			"rgba(50, 50, 93, 0.25) 0px 50px 100px -20px, rgba(0, 0, 0, 0.3) 0px 30px 60px -30px",
		},
		variants: {
			isActive: {
				true:{
					opacity: 1,
					transform: "translateY(0)",
					// scale: 1,
			},
		},
	},
})

export const modalButtonClose = style({
	float: "right",
	position: "absolute",
	top: tokens.space.lg,
	right: tokens.space.lg,
});

export const modalTitle = style({
	fontSize: tokens.fontSizes.xl,
	fontWeight: tokens.fontWeights.bold,
});

export const modalDescription = style({
	fontSize: tokens.fontSizes.md,
	color: tokens.colors.secondary,
	marginTop: tokens.space.sm,
	marginBottom: tokens.space.lg,
});

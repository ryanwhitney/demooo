import { tokens } from "@/styles/tokens";
import { style } from "@vanilla-extract/css";
import { recipe} from "@vanilla-extract/recipes"

// Container styles
export const uploadPageContainer = style({
  maxWidth: "600px",
  width: "100%",
  padding: "20px",
  minHeight: "70vh",
});

export const uploadPageTitle = style({
  fontSize: tokens.fontSizes.xl,
  fontWeight: 500,
  textAlign: "center",
  marginBottom: 2
});

export const uploadHeaderDescription = style({
  fontSize: tokens.fontSizes.md,
  fontWeight: 300,
  color: tokens.colors.secondary,
  textAlign: "center",
  marginBottom: 20,
});

export const errorText = style({
  color: tokens.colors.error,
});

// File list styles
export const fileList = recipe({
  base: {
    display: 'flex',
    flexDirection: 'column',
    height: 0,
    opacity: 0,
    transition: "all 300ms ease-in",
    color: tokens.colors.secondary,
  },
  variants: {
    isShown: {
      true: {
        height: "auto",
        opacity: 1,
      },
    },
  },
});

export const removeButton = style({
  background: tokens.colors.secondaryDark,
  border: "none",
  width: "20px",
  height: "20px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  fontSize: "16px",
  borderRadius: tokens.radii.full,
  color: tokens.colors.secondary,
  transition: "all 250ms ease",
  ':hover': {
    filter: "brightness(1.2)",
    color: tokens.colors.primary,
  }
});

export const uploadCtaButton = style({
  marginTop: "12px",
});

export const statusIndicator = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "20px",
  height: "20px",
});

export const successStatus = style({
  color: tokens.colors.success,
  fontSize: "16px",
});

export const errorStatus = style({
  color: tokens.colors.error,
  fontSize: "16px",
});

export const trackError = style({
  color: tokens.colors.error,
  fontSize: "11px",
  marginTop: "4px",
});

export const demoLetterO1 = style({
  fontSize: 17
});

export const demoLetterO2 = style({
  fontSize: 15
});

export const demoLetterO3 = style({
  fontSize: 12
});

export const demoLetterO4 = style({
  fontSize: 9
});

export const demoLetterS = style({
  fontSize: 6
});

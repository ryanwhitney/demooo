import { tokens } from "@/styles/tokens";
import { colors } from "@/styles/tokens/colors.css";
import { style } from "@vanilla-extract/css";
import { type RecipeVariants, recipe } from "@vanilla-extract/recipes";

const baseTextarea = style({
  display: "block",
  width: "100%",
  fontFamily: tokens.fonts.monospace,
  fontSize: tokens.fontSizes.md,
  lineHeight: tokens.lineHeights.normal,
  color: tokens.colors.primary,
  backgroundColor: colors.black,
  border: `1px solid ${tokens.colors.quaternary}`,
  borderRadius: tokens.radii.lg,
  padding: `${tokens.space.md} ${tokens.space.lg}`,
  transition: "border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
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

export const textareaStyles = recipe({
  base: baseTextarea,
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
          borderColor: tokens.colors.success,
        },
      },
    },
  },
  defaultVariants: {
    state: "default",
  },
});

export const textareaContainer = style({
  display: "flex",
  flexDirection: "column",
  gap: tokens.space.xs,
  marginBottom: tokens.space.md,
});

export const textareaLabel = style({
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

export const autoResizeTextarea = style({
  overflow: "hidden",
  resize: "none",
  transition: "height 0.2s ease",
});

export type TextAreaVariants = RecipeVariants<typeof textareaStyles>;
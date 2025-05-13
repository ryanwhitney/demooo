import { tokens } from "@/styles/tokens";
import { style } from "@vanilla-extract/css";
import { recipe } from "@vanilla-extract/recipes";

export const allYearsWrapper = style({
  display: "flex",
  flexDirection: "column",
  gap: tokens.space.xl,
});

export const yearHeading = style({
  fontSize: 12,
  color: tokens.colors.tertiary,
  fontWeight: tokens.fontWeights.light,
  width: "fit-content",
  paddingLeft: 16,
});

export const yearWrapper = style({
  paddingBottom: tokens.space.md,
  "@media": {
    "screen and (min-width: 768px)": {
      width: 0,
      paddingLeft: 0,
      overflow: "visible",
      float: "left",
      position: "relative",
      left: "-50px",
    },
  },
});

export const allMonthsWrapper = style({
  display: "flex",
  gap: tokens.space.lg,
  flexDirection: "column",
  listStyle: "none",
  padding: 0, // remove ul padding
});

export const monthHeading = style({
  fontSize: 12,
  color: tokens.colors.secondary,
  fontWeight: tokens.fontWeights.light,
  paddingLeft: tokens.space.lg,
  paddingBottom: tokens.space.md,
});

export const monthWrapper = style({
  background: tokens.colors.tertiaryDark,
  borderRadius: tokens.radii.lg,
  width: "100%",
  padding: "2px 0",
  listStyle: "none",
});

export const trackDivider = style({
  height: 1,
  border: "none",
  background: tokens.colors.quaternaryDark,
  marginLeft: 16,
  ":last-child": {
    display: "none",
  },
});

export const trackRowWrapper = style({
  display: "flex",
  justifyContent: "space-between",
  fontSize: 12,
  alignItems: "center",
});

export const trackLeftContent = style({
  display: "flex",
  gap: 8,
  paddingLeft: 16,
});

export const trackRightContent = style({
  display: "flex",
  justifyContent: "center",
  gap: 16,
  paddingRight: 16,
});

export const trackRowTitleLinkWrapper = style({
  textDecoration: "none",
});

export const trackRowTitle = recipe({
  base: {
    color: tokens.colors.primary,
    transition: "font 150ms ease-in-out",
    textDecoration: "none",
    fontWeight: tokens.fontWeights.light,
  },
  variants: {
    isActive: {
      true: {
        fontWeight: 600,
      },
    },
  },
});

export const favoriteIconToggle = recipe({
  base: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    color: tokens.colors.quaternary,
    padding: 10,
    width: 16,
    transition: "filter 400ms cubic-bezier(.05, .69, .14, 1)",
    ":hover": {
      cursor: "pointer",
      color: tokens.colors.tertiary,
    },
  },
  variants: {
    isActive: {
      true: {
        color: tokens.colors.heartRed,
        filter: `drop-shadow(0px 0px 4px ${tokens.colors.heartRed})`,
        ":hover": {
          cursor: "pointer",
          color: tokens.colors.heartRed,
        },
      },
    },
  },
});

export const playIconToggle = recipe({
  base: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    color: tokens.colors.secondary,
    padding: 10,
    width: 10,
    ":hover": {
      cursor: "pointer",
      color: tokens.colors.primary,
    },
  },

  variants: {
    isActive: {
      true: {
        color: tokens.colors.primary,
      },
    },
  },
});

export const favoriteCountWrapper = style({
  display: "flex",
  alignItems: "center",
  gap: 4,
  fontSize: 11,
  color: tokens.colors.quaternary,
  transition: "color 150ms cubic-bezier(.05, .69, .14, 1)",
  ":hover": {
    color: tokens.colors.tertiary,
  },
});

export const favoriteCount = recipe({
  base: {
    width: 16,
    transition: "color 150ms cubic-bezier(.05, .69, .14, 1)",
  },
  variants: {
    isActive: {
      true: {
        color: tokens.colors.heartRed,
      },
      false: {
        color: "inherit",
      },
    },
  },
  defaultVariants: {
    isActive: false,
  },
});

export const monthListItem = style({
  width: "100%",
});

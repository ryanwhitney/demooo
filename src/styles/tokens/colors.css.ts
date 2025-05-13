import { createGlobalTheme } from "@vanilla-extract/css";

// Define the root element to attach variables to
const root = ":root";

// Create color tokens as CSS variables
export const colors = createGlobalTheme(root, {
  white: "#FFFFFF",
  black: "#000000",
  gray900: "#131313",

  indigo500: "#636CFF",
  indigo550: "#5951E6",
  indigo600: "#4f46e5",
  blackOpacity50: "rgba(0, 0, 0, 0.5)",
  red500: "#FF3B30",
  redOpacity10: "rgba(255,59,48,.1)",
  green500: "#34c759",

  // transparency-based one-offs, ripping from apple
  secondary: "rgba(235, 235, 247, 0.60)",
  secondaryP3: "color(display-p3 0.9216 0.9216 0.9608 / 0.60)",
  tertiary: "rgba(235, 235, 247, 0.30)",
  tertiaryP3: "color(display-p3 0.9216 0.9216 0.9608 / 0.30)",
  quaternary: "rgba(235, 235, 247, 0.16)",
  quaternaryP3: "color(display-p3 0.9216 0.9216 0.9608 / 0.16)",
  secondaryDark: "rgba(60, 60, 69, 0.60)",
  secondaryDarkP3: "color(display-p3 0.2353 0.2353 0.2627 / 0.60)",
  tertiaryDark: "rgba(60, 60, 69, 0.30)",
  tertiaryDarkP3: "color(display-p3 0.2353 0.2353 0.2627 / 0.30)",
  quaternaryDark: "rgba(60, 60, 69, 0.18)",
  quaternaryDarkP3: "color(display-p3 0.2353 0.2353 0.2627 / 0.18)",
});
// Create semantic color tokens as CSS variables
export const colorTokens = createGlobalTheme(root, {
  primary: colors.white,
  // biome-ignore lint/style/noCommaOperator: vanilla-extract/biome conflict
  secondary: `${(colors.secondary, colors.secondaryP3)}`,
  // biome-ignore lint/style/noCommaOperator: vanilla-extract/biome conflict
  tertiary: `${(colors.tertiary, colors.tertiaryP3)}`,
  // biome-ignore lint/style/noCommaOperator: vanilla-extract/biome conflict
  quaternary: `${(colors.quaternary, colors.quaternaryP3)}`,
  // biome-ignore lint/style/noCommaOperator: vanilla-extract/biome conflict
  secondaryDark: `${(colors.secondaryDark, colors.secondaryDarkP3)}`,
  // biome-ignore lint/style/noCommaOperator: vanilla-extract/biome conflict
  tertiaryDark: `${(colors.tertiaryDark, colors.tertiaryDarkP3)}`,
  // biome-ignore lint/style/noCommaOperator: vanilla-extract/biome conflict
  quaternaryDark: `${(colors.quaternaryDark, colors.quaternaryDarkP3)}`,
  background: colors.black,
  backgroundSecondary: colors.gray900,
  backdrop: colors.blackOpacity50,
  focusRing: colors.indigo500,
  tintColor: colors.indigo600,
  tintColorHover: colors.indigo550,
  error: colors.red500,
  heartRed: colors.red500,
  errorBackground: colors.redOpacity10,
  success: colors.green500,
});

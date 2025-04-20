import { tokens } from "@/styles/tokens";
import { style } from "@vanilla-extract/css";

// Modal styles
export const dropping = style({
  filter: 'brightness(1.5)',
  background: tokens.colors.backgroundSecondary,
});


export const notDropping = style({
  background: tokens.colors.backgroundSecondary,
});
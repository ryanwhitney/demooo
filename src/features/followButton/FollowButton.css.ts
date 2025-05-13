import { style } from "@vanilla-extract/css";
import { tokens } from "@/styles/tokens";

export const followButtonBase = style({
  minWidth: 120,
  borderRadius: 40,
  fontSize: 11,
  padding: "6px 10px",
  border: `2px solid ${tokens.colors.backgroundSecondary}`,
});

export const followButtonToggle = style({
  transition: "background-color 0s",
}); 
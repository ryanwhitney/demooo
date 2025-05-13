import { createVar, keyframes, style } from "@vanilla-extract/css";

// Variables
export const sizeVar = createVar();
export const durationVar = createVar();
export const primaryColorVar = createVar();

const spin = keyframes({
  "0%": { transform: "rotate(0deg)" },
  "100%": { transform: "rotate(720deg)" },
});

export const spinner = style({
  width: sizeVar,
  height: sizeVar,
  borderRadius: "50%",
  position: "relative",
  animation: `${spin} ${durationVar} ease-in-out infinite`,
  background: "transparent",
  border: `calc(${sizeVar} * 0.1) solid transparent`,
  borderTopColor: primaryColorVar,
  borderLeftColor: "rgba(0,0,0,0.05)",
  borderRightColor: "rgba(0,0,0,0.05)",
  borderBottomColor: "rgba(0,0,0,0.05)",
  boxSizing: "border-box",
  vars: {
    [sizeVar]: "40px",
    [durationVar]: ".5s",
    [primaryColorVar]: "#007AFF",
  },
});

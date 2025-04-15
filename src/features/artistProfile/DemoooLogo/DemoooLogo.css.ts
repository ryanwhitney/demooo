// AnimatedText.css.ts
import { style, keyframes, createVar } from "@vanilla-extract/css";

// Variables
export const baseSize = createVar();

// Common styles
export const mainContainer = style({
  display: "inline-block",
  // padding: "20px",
  height: "50px",
  cursor: "pointer",
  position: "relative",
  width: "200px",
});

export const holder = style({
  // position: "absolute",
  // bottom: 0,
});

export const characterSpan = style({
  fontFamily: "JetBrains Mono",
  lineHeight: 0,
  height: "50px",
  letterSpacing: "0",
  color: "white",
  transition: "font-size 0.3s ease-in-out",
  display: "inline-block",
  verticalAlign: "baseline",
  transformOrigin: "bottom center",
  vars: {
    [baseSize]: "inherit",
  },
});

// Animation specific keyframes
const waveKeyframes = keyframes({
  "0%": { transform: "translateY(0)" },
  "50%": { transform: "translateY(-5px)" },
  "100%": { transform: "translateY(0)" },
});

const shakeKeyframes = keyframes({
  "0%": { transform: "translateX(0)" },
  "25%": { transform: "translateX(-2px)" },
  "50%": { transform: "translateX(0)" },
  "75%": { transform: "translateX(2px)" },
  "100%": { transform: "translateX(0)" },
});

// Animation classes
export const waveAnimation = style({
  animation: `${waveKeyframes} 0.3s ease-in-out infinite`,
});

export const shakeAnimation = style({
  animation: `${shakeKeyframes} 0.3s ease-in-out infinite`,
});

// Size classes (similar to the original)
export const sizes = {
  a: style({ fontSize: "18px" }),
  b: style({ fontSize: "18px" }),
  c: style({ fontSize: "18px" }),
  d: style({ fontSize: "16px" }),
  e: style({ fontSize: "15px" }),
  f: style({ fontSize: "14px" }),
  g: style({ fontSize: "10px" }),
  h: style({ fontSize: "8px" }),
  i: style({ fontSize: "3px" }),
  j: style({ fontSize: "2px" }),
  k: style({ fontSize: "1px" }),
};

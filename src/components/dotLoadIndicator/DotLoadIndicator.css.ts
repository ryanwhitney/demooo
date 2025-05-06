import { tokens } from "@/styles/tokens"
import { style, keyframes } from "@vanilla-extract/css";

// Define the dots animation keyframes
const dotsAnimation = keyframes({
  "0%, 20%": { content: ".", },
  "40%": { content: ". .", },
  "60%": { content: ". . .", },
  "80%": { content: " . . . .", },
  "100%": { content: ". . . . .", },
});

// Create the animated dots style
export const dotLoadIndicatorDots = style({
  position: "relative",
  fontFamily: tokens.fonts.monospace,
  selectors: {
    "&::after": {
      content: "",
      letterSpacing: '-4px',
      animation: `${dotsAnimation} 1.5s infinite`,
      fontFamily: tokens.fonts.monospace,
    }
  }
});
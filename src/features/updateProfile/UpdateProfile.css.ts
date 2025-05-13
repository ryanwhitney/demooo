import { tokens } from "@/styles/tokens";
import { globalStyle, keyframes, style } from "@vanilla-extract/css";

// Main container
export const updateProfileContainer = style({
  maxWidth: 400,
  margin: "0 auto",
  width: "100%",
});

// Profile image container
export const imageContainer = style({
  width: 140,
  height: 140,
  margin: "0 auto 40px auto",
  marginBottom: "15px",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  position: "relative",
  cursor: "pointer",
  transition: "filter 250ms ease",
  transform: "translate3d(0, 0, 0)", // fix safari jitter
});

// Image wrapper for border radius
export const imageWrapper = style({
  width: 140,
  height: 140,
  overflow: "hidden",
  borderRadius: 999,
  transform: "translate3d(0, 0, 0)", // fix safari jitter
});

// Upload button
export const uploadButtonContainer = style({
  color: "white",
  border: `3px solid ${tokens.colors.background}`,
  backgroundColor: tokens.colors.tintColor,
  height: 40,
  width: 40,
  borderRadius: tokens.radii.full,
  position: "absolute",
  bottom: 0,
  right: 0,
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  overflow: "hidden",
  transition: "background 250ms ease-in-out",
  zIndex: 1,
});
export const uploadButton = style({
  color: "white",
  zIndex: 1,
  position: "relative",
  top: 0,
});

const paddingBounce = keyframes({
  "0%": {
    top: 0,
  },
  "50%": {
    top: -20,
  },

  "51%": {
    top: 50,
  },
  "100%": {
    top: 0,
  },
});

globalStyle(`${imageContainer}:hover ${uploadButtonContainer}`, {
  backgroundColor: tokens.colors.tintColorHover,
});

globalStyle(`${imageContainer}:focus ${uploadButtonContainer}`, {
  backgroundColor: tokens.colors.tintColorHover,
});

globalStyle(`${imageContainer}:hover ${uploadButton}`, {
  animation: `${paddingBounce} 400ms 1 ease`,
});

globalStyle(`${imageContainer}:focus ${uploadButton}`, {
  animation: `${paddingBounce} 400ms 1 ease`,
});

// Image styles
export const profileImage = style({
  width: 140,
  height: 140,
  borderRadius: 999,
  marginBottom: "15px",
});

export const previewImage = style({
  width: "100%",
  objectFit: "cover",
});

// Form group
export const formGroup = style({
  marginBottom: "15px",
});

// Visually hidden (for accessibility)
export const visuallyHidden = style({
  border: 0,
  clip: "rect(0px, 0px, 0px, 0px)",
  clipPath: "inset(50%)",
  height: 1,
  margin: "0 -1px -1px 0",
  overflow: "hidden",
  padding: 0,
  position: "absolute",
  width: 1,
  whiteSpace: "nowrap",
});

// Submit button
export const submitButton = style({
  marginTop: "15px",
  padding: "8px 16px",
  backgroundColor: tokens.colors.tintColor,
  color: "white",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
  transition: "filter 250ms ease",
  ":hover": {
    filter: "brightness(1.1)",
  },
  ":disabled": {
    cursor: "not-allowed",
    opacity: 0.7,
  },
});

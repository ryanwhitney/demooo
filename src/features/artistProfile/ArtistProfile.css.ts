import { tokens } from "@/styles/tokens";
import { style } from "@vanilla-extract/css";

export const artistViewWrapper = style({
  display: "flex",
  flexDirection: 'column',
  justifyContent: "space-around",
  alignItems: 'center',
  gap: tokens.space.xl,
  paddingTop: tokens.space.xl,
  paddingBottom: tokens.space.xl,
  paddingLeft: tokens.space.lg,
  paddingRight: tokens.space.lg,
});

export const artistTrackViewInfo = style({
  display: "flex",
  flexDirection: "column",
  gap: tokens.space.lg,
  fontSize: tokens.fontSizes.md,
  fontWeight: tokens.fontWeights.normal,
  color: tokens.colors.secondary,
  width: '100%',
  maxWidth: '400px',
});

// Background blur effect for artist header
export const artistHeaderBackground = style({
  width: "100%",
  height: "200px",
  position: "absolute",
  top: 0,
  zIndex: -1,
  filter: "blur(50px) saturate(1.1) brightness(0.7)",
});

// Container for profile image and play button
export const profileImageContainer = style({
  position: "relative"
});

// Play button styles
export const artistPlayButton = style({
  width: 44,
  height: 44,
  padding: 0,
  paddingLeft: 2,
  border: "1px solid black",
  background: tokens.colors.tintColor,
  borderRadius: tokens.radii.full,
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  cursor: "pointer",
  color: tokens.colors.primary,
  position: "absolute",
  bottom: -14,
  right: -14,
  transition: "background 250ms ease-in-out",
  ':hover': {
    background: tokens.colors.tintColorHover,
  },
  
});

// Profile image styles
export const profileImage = style({
  borderRadius: tokens.radii.md
});

// Artist info container
export const artistInfoContainer = style({
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
});

// Artist location text
export const artistLocation = style({
  color: tokens.colors.secondary,
  fontSize: tokens.fontSizes.sm,
  marginBottom: tokens.space.md,
});

// Artist bio text
export const artistBio = style({
  color: tokens.colors.primary,
  fontSize: tokens.fontSizes.sm,
});
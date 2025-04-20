import { tokens } from "@/styles/tokens";
import { style } from "@vanilla-extract/css";

export const artistViewWrapper = style({
  display: "flex",
  flexDirection: 'column',
  justifyContent: "space-around",
  alignItems: 'center',
  gap: tokens.space.xxl,
  paddingTop: tokens.space.xl,
  paddingBottom: tokens.space.xl,
  paddingLeft: tokens.space.lg,
  paddingRight: tokens.space.lg,
  maxWidth: "100%",

  width: "100%",
  margin: "0 auto",
  '@media': {
    'screen and (min-width: 480px)': {
      maxWidth: "80%",
    },
  },
});

export const artistHeaderBackgroundGrain = style({
  width: "100%",
  height: "300px",
  position: "absolute",
  top: 0,
  zIndex: -1,
  overflow: "hidden",
});

// Background blur effect for artist header
export const artistHeaderBackground = style({
  width: "100%",
  height: "200px",
  position: "absolute",
  top: 0,
  zIndex: -2,
  filter: "blur(50px) saturate(1) ",
});

export const artistHeaderContainer = style({
  display: "flex",
  flexDirection: "column",
  justifyContent: "flex-start",
  alignItems: "center",
  width: "100%",
  '@media': {
    'screen and (min-width: 480px)': {
      flexDirection: "row",
      gap: tokens.space.xl,
    },
  },
});

export const artistInfoContainer = style({
  display: "flex",
  flexDirection: "column",
});

// Container for profile image and play button
export const profileImageContainer = style({
  position: "relative",
  flexShrink: 0,
});

// Play button styles
export const artistPlayButton = style({
  width: 44,
  height: 44,
  padding: 0,
  paddingLeft: 2,
  border: "2px solid black",
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


export const artistTitle = style({
  color: tokens.colors.primary,
  fontSize: 60,
  fontWeight: tokens.fontWeights.bold,
  lineHeight: 1,
  marginBottom: 8,
});

export const artistLocation = style({
  color: tokens.colors.secondary,
  fontSize: tokens.fontSizes.md,
  marginBottom: 24,
});

export const artistBio = style({
  color: tokens.colors.primary,
  fontSize: tokens.fontSizes.md,
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


export const artistContentWrapper = style({
  display: "flex",
  justifyContent: "flex-start",
  width: "100%",
});
import { tokens } from "@/styles/tokens";
import { style } from "@vanilla-extract/css";
import { recipe } from "@vanilla-extract/recipes";

export const trackChipWrapper = style({
  width: 148,
  padding: tokens.space.sm,
  border: "1px solid transparent",
  borderRadius: tokens.radii.lg,
  transition: "all 0.2s ease-in-out",
  textDecoration: "none",
  display: "flex",
  flexDirection: "column-reverse",
  backgroundColor: tokens.colors.quaternaryDark,
  borderColor: tokens.colors.quaternaryDark,

  ":hover": {
    borderColor: tokens.colors.tertiaryDark,
  },
});

export const waveformWrapper = style({
  backgroundColor: tokens.colors.quaternaryDark,
  borderRadius: tokens.radii.lg,
  display: "flex",
  justifyContent: "center",
  padding: "16px 8px",
  position: "relative",
});

export const trackChipPlayButton = recipe({
  base: {
    width: 24,
    height: 24,
    padding: 8,
    alignSelf: "center",
    justifySelf: "center",
    transition: "opacity 150ms ease",
    zIndex: 4,
    opacity: 0,
    borderRadius: tokens.radii.full,
    ":focus": {
      opacity: 1,
    },
    ":focus-visible": {
      backgroundColor: tokens.colors.tintColor, // more obvious as the waveform doesn't dim like hover
    },
    "::before": {
      content: " ",
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      inset: 0,
      zIndex: 5,
    },
    selectors: {
      [`${waveformWrapper}:hover &`]: {
        opacity: 1,
      },
      [`${trackChipWrapper}:focus &`]: {
        opacity: 1,
      },
      [`${trackChipWrapper}:focus-visible &`]: {
        opacity: 1,
      },
    },
  },
  variants: {
    isPlaying: {
      true: {
        opacity: 1,
      },
    },
  },
});

export const waveformElement = recipe({
  base: {
    opacity: 1,
    position: "absolute",
    transition: "opacity 200ms ease",
    transform: "translate3d(0, 0, 0)", // fix safari jitter
    selectors: {
      [`${waveformWrapper}:hover &`]: {
        opacity: 0.2,
      },
      [`${trackChipWrapper}:focus &`]: {
        opacity: 0.2,
      },
    },
  },
  variants: {
    isPlaying: {
      true: {
        opacity: 0.2,
      },
    },
  },
});

export const trackText = style({
  fontSize: tokens.fontSizes.sm,
  display: "flex",
  flexDirection: "column",
  paddingTop: tokens.space.md,
});

export const trackTitle = style({
  cursor: "pointer",
  color: tokens.colors.primary,
  textDecoration: "none",
  zIndex: 2,
  padding: tokens.space.sm,
  position: "relative",
  fontWeight: 400,
  // account for line 2 somehow showing below
  lineHeight: 1.8,
  marginBottom: -2,
  // make padding apply to linebreaks
  WebkitBoxDecorationBreak: "clone",
  boxDecorationBreak: "clone",
  // all required for line clamp
  WebkitLineClamp: 1,
  display: "-webkit-box",
  WebkitBoxOrient: "vertical",
  textOverflow: "ellipsis",
  lineBreak: "anywhere",
  borderRadius: tokens.radii.sm,
  overflow: "hidden",
  ":hover": {
    fontWeight: 600,
  },
});

export const trackArtistContainer = style({
  cursor: "pointer",
  color: tokens.colors.secondary,
  textDecoration: "none",
  display: "flex",
  lineHeight: 1,
  borderRadius: tokens.radii.sm,
  alignItems: "center",
  gap: 5,
  padding: tokens.space.sm,
  position: "relative",
  zIndex: 2,
  ":hover": {
    color: tokens.colors.primary,
  },
});

export const trackArtist = style({});

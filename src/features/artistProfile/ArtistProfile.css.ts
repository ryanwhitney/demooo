import { tokens } from '@/styles/tokens'
import { style } from '@vanilla-extract/css'

export const artistViewWrapper = style({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-around',
  alignItems: 'center',
  gap: tokens.space.xl,
  paddingTop: tokens.space.xl,
  paddingBottom: tokens.space.xl,
  maxWidth: '100%',
  width: '100%',
  margin: '0 auto',
  '@media': {
    'screen and (min-width: 480px)': {
      maxWidth: 768,
      gap: tokens.space.xxl,
    },
  },
})
export const artistHeaderBackgroundGrain = style({
  width: '100%',
  height: '360px',
  position: 'absolute',
  top: 0,
  zIndex: -1,
  overflow: 'hidden',
  userSelect: 'none',
  transform: 'translate3d(0, 0, 0)',
  WebkitBackdropFilter: 'blur(50px)',
  backdropFilter: 'blur(50px)',
})

export const artistHeaderBackground = style({
  width: '100%',
  height: '200px',
  position: 'absolute',
  top: 0,
  zIndex: -2,
  userSelect: 'none',
})

export const artistHeaderContainer = style({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-start',
  alignItems: 'center',
  width: '100%',
  flexWrap: 'wrap',
  '@media': {
    'screen and (min-width: 480px)': {
      flexDirection: 'row',
      gap: tokens.space.xl,
    },
  },
})
export const artistInfoAndPhoto = style({
  display: 'flex',
  flexDirection: 'column-reverse',
  gap: tokens.space.xl,
  alignItems: 'center',
  textAlign: 'center',
  '@media': {
    'screen and (min-width: 480px)': {
      flexDirection: 'row-reverse',
      textAlign: 'left',
      flexGrow: 1,
    },
  },
})
// Container for profile image and play button
export const profileImageContainer = style({
  position: 'relative',
  flexShrink: 0,
})

// Play button styles
export const artistPlayButton = style({
  width: 44,
  height: 44,
  padding: 0,
  paddingLeft: 2,
  border: '2px solid black',
  background: tokens.colors.tintColor,
  borderRadius: tokens.radii.full,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  cursor: 'pointer',
  color: tokens.colors.primary,
  position: 'absolute',
  bottom: -14,
  right: -14,
  transition: 'background 250ms ease-in-out',
  ':hover': {
    background: tokens.colors.tintColorHover,
  },
})

export const artistInfoContainer = style({
  display: 'grid',
  width: '100%',
  gridTemplateColumns: '1fr auto',
  gridTemplateAreas: `
    "title buttons"
    "content ."
  `,
  gap: '16px',
  '@media': {
    'screen and (max-width: 479px)': {
      gridTemplateColumns: '1fr',
      gridTemplateAreas: `
        "title"
        "content"
        "buttons"
      `,
    },
    'screen and (max-width: 640px)': {
      gridTemplateColumns: '1fr',
      gridTemplateAreas: `
        "title"
        "buttons"
        "content"
      `,
    },
  },
})

export const artistTitle = style({
  gridArea: 'title',
  color: tokens.colors.primary,
  fontSize: 'clamp(16px, 5vw, 60px)',
  fontWeight: tokens.fontWeights.bold,
  lineHeight: 1,
  marginBottom: 16,
  '@media': {
    'screen and (min-width: 480px)': {
      // fontSize: 'clamp(16px, 5vw, 42px)',
    },
  },
})

export const artistDetails = style({
  gridArea: 'content',
  display: 'grid',
  gap: '8px',
})

export const artistLocation = style({
  color: tokens.colors.secondary,
  fontSize: tokens.fontSizes.md,
  marginBottom: 8,
  '@media': {
    'screen and (min-width: 480px)': {
      // marginBottom: 24,
    },
  },
})

export const artistBio = style({
  color: tokens.colors.primary,
  fontSize: tokens.fontSizes.md,
  marginBottom: 16,
})

export const artistButtons = style({
  gridArea: 'buttons',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  gap: '10px',
  '@media': {
    'screen and (min-width: 480px)': {
      width: 'fit-content',
      justifyContent: 'flex-end',
      alignSelf: 'flex-start',
    },
    'screen and (max-width: 479px)': {
      width: '100%',
    },
  },
})

export const artistTrackViewInfo = style({
  display: 'flex',
  flexDirection: 'column',
  gap: tokens.space.lg,
  fontSize: tokens.fontSizes.md,
  fontWeight: tokens.fontWeights.normal,
  color: tokens.colors.secondary,
  width: '100%',
  maxWidth: '400px',
})

export const artistContentWrapper = style({
  display: 'flex',
  justifyContent: 'center',
  width: '100%',
})

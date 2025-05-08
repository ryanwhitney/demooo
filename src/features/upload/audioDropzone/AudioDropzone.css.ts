import { tokens } from '@/styles/tokens'
import { style } from '@vanilla-extract/css'
import { recipe } from '@vanilla-extract/recipes'

export const dropZone = recipe({
  base: {
    width: '100%',
    borderRadius: tokens.radii.xl,
    padding: 20,
    border: '.5px dashed rgba(130,130,139,0.5)',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    transition: 'all 300ms ease-out',
    background: tokens.colors.backgroundSecondary,
    height: 180,
    marginBottom: 30,
    opacity: 1,
    ':hover': {
      opacity: 1,
      border: '.5px dashed rgba(130,130,139,0.8)',
    },
  },
  variants: {
    isMinimized: {
      true: {
        opacity: 0.8,
        height: 60,
        marginBottom: 10,
      },
    },
    isDisabled: {
      true: {
        opacity: 0.5,
        pointerEvents: 'none',
      },
    },
    isDropTarget: {
      true: {
        background: tokens.colors.quaternary,
        opacity: 1,
        border: '.5px dashed rgba(130,130,139,1)',
      },
    },
  },
})

export const addFilesButton = recipe({
  base: {
    color: tokens.colors.secondary,
    border: 'none',
    padding: '10px 16px',
    borderRadius: 10,
    cursor: 'pointer',
    fontWeight: 'bold',
    transition: 'color 150ms ease',
    textDecoration: 'underline',
    ':hover': {
      color: tokens.colors.primary,
    },
    ':after': {
      position: 'absolute',
      top: 0,
      left: 0,
      bottom: 0,
      right: 0,
      content: '""',
    },
  },
  variants: {
    isMinimized: {
      true: {
        textDecoration: 'none',
        fontWeight: 400,
      },
    },
  },
})

import { inputContainer } from "@/components/textInput/TextInput.css"
import { tokens } from "@/styles/tokens";
import { globalStyle, style } from "@vanilla-extract/css";
import { recipe } from "@vanilla-extract/recipes"



// Container styles
export const uploadPageContainer = style({
  maxWidth: "600px",
  width: "100%",
  padding: "20px",
  minHeight: "70vh",
});

export const uploadPageTitle = style({
  fontSize: tokens.fontSizes.xl,
  fontWeight: 500,
  textAlign: "center",
  marginBottom: 2
});
export const uploadHeaderDescription = style({
  fontSize: tokens.fontSizes.md,
  fontWeight: 300,
  color: tokens.colors.secondary,
  textAlign: "center",
  marginBottom: 20,
});

// Dropzone styles
export const dropZone = style({
  width: "100%",
  borderRadius: tokens.radii.xl,
  padding: 20,
  border: ".5px dashed rgba(130,130,139,0.5)",
  textAlign: "center",
  display: "flex",
  flexDirection: "column",
  position: "relative",
  justifyContent: "center",
  alignItems: "center",
  transition: "all 300ms ease-out",
  background: tokens.colors.backgroundSecondary,
  height: 180,
  marginBottom: 30,
  ':hover': {
    opacity: 1,
  }
});

export const dropZoneDropping = style({
  background: tokens.colors.quaternary,
  opacity: 1,
});

export const dropZoneWithFiles = style({
  opacity: 0.5,
  height: 40
});

export const addFilesButton = style({
  color: tokens.colors.secondary,
  padding: "10px 16px",
  border: "none",
  borderRadius: 10,
  cursor: "pointer",
  fontWeight: "bold",
  transition: "color 150ms ease",
  ':hover':{
    color: tokens.colors.primary,
  },
  // ':after':{
  //   position: "absolute",
  //   top: 0,
  //   left: 0,
  //   bottom: 0,
  //   right: 0,
  //   content: '""',

  // }
});

// File list styles
export const fileList = recipe({
  base: {
    gap: 8,
    display: 'flex',
    flexDirection: 'column',
    height: 0,
    opacity: 0,
    transition: "all 300ms ease-in",
  },
  variants: {
    isShown: {
      true: {
        height: "auto",
        opacity: 1,
      },
    },
  },
});

export const fileItem = style({
  display: "flex",
  alignItems: "center",
  padding: '8px 16px',
  backgroundColor: tokens.colors.backgroundSecondary,
  borderRadius: "8px",
  gap: 10,
});

export const fileItemError = style({
  border: `1px dotted ${tokens.colors.error}`
});

export const titleContainer  = style({
  
});

// NOTE: this overrides a style imported from TextInput.css.ts
globalStyle(`${titleContainer} ${inputContainer}`, {
  display: "flex",
  flexDirection: "row",
  gap: 10,
  alignItems: "center",
  alignContent: "center",
  margin: 0,
});

export const editHeader = style({
  fontSize: tokens.fontSizes.md,
  paddingLeft: tokens.space.lg,
  textAlign: "center",
  fontWeight: 500,
  marginBottom: -6,
});
export const editHeaderDescription = style({
  fontSize: tokens.fontSizes.md,
  paddingLeft: tokens.space.lg,
  fontWeight: 300,
  color: tokens.colors.secondary,
  textAlign: "center",
  marginBottom: 4,
});
export const uploadRowTitleText = style({
  fontSize: "11px"
});

export const uploadRowTitleInput = style({
});

export const titleInputError = style({
  // borderColor: tokens.colors.error,
});

export const fileInfoContainer = style({
  flex: "1",
  fontSize: 12,
  display: "flex",
  flexDirection: "column",
});

export const fileName = style({
  color: tokens.colors.secondary,
  fontSize: 11,
});

export const removeButton = style({
  background: tokens.colors.secondaryDark,
  border: "none",
  width: "20px",
  height: "20px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  fontSize: "16px",
  borderRadius: tokens.radii.full,
  color: tokens.colors.primary,
});

export const actionButton = style({
  marginTop: "20px",
  padding: "10px 16px",
  background: tokens.colors.backgroundSecondary,
  color: "white",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
  fontSize: "12x",
  fontWeight: "bold",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "100%"
});

export const statusIndicator = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "20px",
  height: "20px",
});

export const successStatus = style({
  color: "#4CAF50",
  fontSize: "16px",
});
export const errorText = style({
  color: tokens.colors.error,
  textAlign: "center",
});
export const errorStatus = style({
  color: tokens.colors.error,
  fontSize: "16px",
});

export const trackError = style({
  // color: tokens.colors.error,
  fontSize: "11px",
  marginTop: "4px",
});
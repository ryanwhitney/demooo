import { inputContainer } from "@/components/textInput/TextInput.css"
import { tokens } from "@/styles/tokens";
import { globalStyle, style } from "@vanilla-extract/css";



// Container styles
export const container = style({
  maxWidth: "520px",
  width: "100%",
  margin: "0 auto",
  padding: "20px",
  display: "flex",
  flexDirection: "column",
});

export const pageTitle = style({
  marginBottom: 16
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
  justifyContent: "center",
  alignItems: "center",
  transition: "all 250ms ease-in-out",
  background: tokens.colors.backgroundSecondary,
  height: 180,
});

export const dropZoneDropping = style({
  background: tokens.colors.quaternary,
});

export const dropZoneWithFiles = style({
  height: 40
});

export const addFilesButton = style({
  color: "white",
  border: "none",
  textDecoration: "underline",
  borderRadius: 4,
  cursor: "pointer",
  fontWeight: "bold"
});

// File list styles
export const fileList = style({
  marginTop: 20,
  gap: 8,
  display: 'flex',
  flexDirection: 'column',
  height: "auto",
  transition: "height 0.5s ease-in-out",
});

export const fileItem = style({
  display: "flex",
  alignItems: "center",
  padding: '8px 16px',
  backgroundColor: tokens.colors.backgroundSecondary,
  borderRadius: "8px",
  gap: 10,
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
  textAlign: "center",
  color: tokens.colors.secondary,
});
export const titleText = style({
  // padding: "4px 8px", 
  fontSize: "11px"
});

export const titleInput = style({
  // padding: "4px 16px", 
  fontSize: 12, 
  borderRadius: tokens.radii.md,
  borderColor: tokens.colors.tertiaryDark,
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
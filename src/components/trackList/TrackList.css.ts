import { inputContainer } from "@/components/textInput/TextInput.css"
import { tokens } from "@/styles/tokens";
import { globalStyle, style } from "@vanilla-extract/css";

export const fileList = style({
  display: 'flex',
  flexDirection: 'column',
  color: tokens.colors.secondary,
});

export const fileListRows = style({
  display: "flex",
  flexDirection: "column",
  gap: 8,
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

export const titleContainer = style({
  
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
  color: tokens.colors.primary,
  textAlign: "center",
  fontWeight: 500,
  marginBottom: 10,
  marginTop: 16,
});

export const editHeaderDescription = style({
  fontSize: tokens.fontSizes.md,
  paddingLeft: tokens.space.lg,
  fontWeight: 300,
  textAlign: "center",
  marginTop: -6,
  marginBottom: 8,
});

export const errorText = style({
  color: tokens.colors.error,
});

export const uploadRowTitleInput = style({});

export const titleInputError = style({
  borderColor: tokens.colors.error,
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
  color: tokens.colors.secondary,
  transition: "all 250ms ease",
  ':hover': {
    filter: "brightness(1.2)",
    color: tokens.colors.primary,
  }
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

export const errorStatus = style({
  color: tokens.colors.error,
  fontSize: "16px",
}); 
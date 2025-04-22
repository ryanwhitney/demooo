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

export const errorText = style({
  color: tokens.colors.error,
});

// Dropzone styles
const dropZone = style({
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
  opacity: 1,
  ':hover': {
    opacity: 1,
    border: ".5px dashed rgba(130,130,139,0.8)",
  }
});

const dropZoneDropping = style({
  background: tokens.colors.quaternary,
  opacity: 1,
  border: "1px dashed rgba(130,130,139,1)",
});

const dropZoneWithFiles = style({
  opacity: 0.8,
  height: 60,
  marginBottom: 10
});

const addFilesButton = style({
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
  ':after':{
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    content: '""',
  }
});

// File list styles
export const fileList = recipe({
  base: {
    display: 'flex',
    flexDirection: 'column',
    height: 0,
    opacity: 0,
    transition: "all 300ms ease-in",
    color: tokens.colors.secondary,
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

const fileListRows = style({
  display: "flex",
  flexDirection: "column",
  gap: 8,
});

const fileItem = style({
  display: "flex",
  alignItems: "center",
  padding: '8px 16px',
  backgroundColor: tokens.colors.backgroundSecondary,
  borderRadius: "8px",
  gap: 10,
});

const fileItemError = style({
  border: `1px dotted ${tokens.colors.error}`
});

const titleContainer = style({
  
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

const editHeader = style({
  fontSize: tokens.fontSizes.md,
  paddingLeft: tokens.space.lg,
  color: tokens.colors.primary,
  textAlign: "center",
  fontWeight: 500,
  marginBottom: 10,
  marginTop: 16,
});

const editHeaderDescription = style({
  fontSize: tokens.fontSizes.md,
  paddingLeft: tokens.space.lg,
  fontWeight: 300,
  textAlign: "center",
  marginTop: -6,
  marginBottom: 8,
});

const uploadRowTitleText = style({
  fontSize: "11px"
});

const uploadRowTitleInput = style({});

const titleInputError = style({
  borderColor: tokens.colors.error,
});

const fileInfoContainer = style({
  flex: "1",
  fontSize: 12,
  display: "flex",
  flexDirection: "column",
});

const fileName = style({
  color: tokens.colors.secondary,
  fontSize: 11,
});

const removeButton = style({
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

export const actionButton = style({
  marginTop: "12px",
  padding: "12px 16px",
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
  width: "100%",
  transition: "filter 250ms ease",
  ':hover': {
    filter: "brightness(1.2)",
  }
});

export const primaryActionButton = style([
  actionButton,
  {
    background: tokens.colors.tintColor,
    textDecoration: "none",
  }
]);

const statusIndicator = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "20px",
  height: "20px",
});

const successStatus = style({
  color: "#4CAF50",
  fontSize: "16px",
});

const errorStatus = style({
  color: tokens.colors.error,
  fontSize: "16px",
});

const trackError = style({
  color: tokens.colors.error,
  fontSize: "11px",
  marginTop: "4px",
});

export default {
  uploadPageContainer,
  uploadPageTitle,
  uploadHeaderDescription,
  errorText,
  dropZone,
  dropZoneDropping,
  dropZoneWithFiles,
  addFilesButton,
  fileList,
  fileListRows,
  fileItem,
  fileItemError,
  titleContainer,
  editHeader,
  editHeaderDescription,
  uploadRowTitleText,
  uploadRowTitleInput,
  titleInputError,
  fileInfoContainer,
  fileName,
  removeButton,
  actionButton,
  primaryActionButton,
  statusIndicator,
  successStatus,
  errorStatus,
  trackError
};
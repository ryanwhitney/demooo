import { inputContainer } from "@/components/textInput/TextInput.css"
import { tokens } from "@/styles/tokens";
import { globalStyle, style } from "@vanilla-extract/css";

export const uploadTrackListContainer = style({
  display: 'flex',
  flexDirection: 'column',
  color: tokens.colors.secondary,
});

export const uploadTrackListHeader = style({
  fontSize: tokens.fontSizes.md,
  paddingLeft: tokens.space.lg,
  color: tokens.colors.primary,
  textAlign: "center",
  fontWeight: 500,
  marginBottom: 10,
  marginTop: 16,
});

export const uploadTrackListDescription = style({
  fontSize: tokens.fontSizes.md,
  paddingLeft: tokens.space.lg,
  fontWeight: 300,
  textAlign: "center",
  marginTop: -6,
  marginBottom: 8,
});



export const uploadTrackListRowWrapper = style({
  display: "flex",
  flexDirection: "column",
  gap: 8,
});

export const uploadTrackListRow = style({
  display: "flex",
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: "center",
  padding: '8px 16px',
  backgroundColor: tokens.colors.backgroundSecondary,
  borderRadius: "8px",
  gap: 10,
});

export const fileItemError = style({
  border: `1px dotted ${tokens.colors.error}`
});

export const uploadTrackListTrackContainer = style({
width:'100%'
});


// NOTE: this overrides a style imported from TextInput.css.ts
globalStyle(`${uploadTrackListTrackContainer} ${inputContainer}`, {
  display: "flex",
  flexDirection: 'column',
  alignItems: 'flex-start',
  gap: 2,
  textIndent: 16,
  margin: 0,
  '@media': {
		'screen and (min-width: 480px)': {
      flexDirection: "row-reverse",
      gap: 10,
      textIndent: 0,
      alignItems: "center",
		}
	},
});
globalStyle(`${uploadTrackListTrackContainer} ${inputContainer} input`, {
  flex: 0.5
});
globalStyle(`${uploadTrackListTrackContainer} ${inputContainer} label`, {
  flex: 0.5,
  fontWeight: 400,
});


export const errorText = style({
  color: tokens.colors.error,
});

export const uploadRowTitleInput = style({
  
});



export const fileName = style({
  color: tokens.colors.secondary,
  fontSize: 11,
  paddingLeft: 40,
});

export const removeButton = style({
  background: tokens.colors.secondaryDark,
  border: "none",
  flexShrink: 0,
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
  color: tokens.colors.success,
  fontSize: "16px",
});

export const errorStatus = style({
  color: tokens.colors.error,
  fontSize: "16px",
}); 
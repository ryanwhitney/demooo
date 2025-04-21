import { style } from "@vanilla-extract/css";
import { tokens } from "@/styles/tokens";

export const visuallyHidden = style({
  position: 'absolute',
  top: 'auto',
  overflow: 'hidden',
  clip: 'rect(1px, 1px, 1px, 1px)',
  width: '1',
  height: '1',
  whiteSpace: 'nowrap',
});


export const container = style({});

export const pageHeading = style({});

export const emptyStateContainer = style({
  display: "flex",
  flexDirection: "column",
  gap: "16px",
  marginTop: "16px"
});

export const uploadLink = style({
  textDecoration: "underline",
  color: tokens.colors.secondary
});

export const tracksList = style({});

export const trackItem = style({
  display: "grid",
  background: tokens.colors.quaternaryDark,
  gridTemplateColumns: "2fr 0.5fr 1fr 1fr 0.5fr",
  gap: "16px",
  marginBottom: "4px",
  alignItems: "center",
  padding: "8px 16px",
  borderRadius: "12px"
});

export const trackTitle = style({});

export const trackDuration = style({
  color: tokens.colors.secondary,
  fontSize: "12px"
});

export const trackDate = style({
  color: tokens.colors.secondary,
  fontSize: "12px"
});

export const selectsContainer = style({
  display: "flex",
  gap: "16px"
});

export const selectWrapper = style({
  display: "flex",
  flexDirection: "column",
  flex: "1"
});

export const selectField = style({
  padding: "4px",
  borderRadius: "4px",
  color: tokens.colors.primary,
  border: `1px solid ${tokens.colors.secondaryDark}`,
  background: "transparent",
  outline: "none",
  fontSize: "12px"
});

import { tokens } from "@/styles/tokens";
import { style } from "@vanilla-extract/css";

export const homeBanner = style({
  fontSize: tokens.space.xxl,
  fontWeight: tokens.fontWeights.normal,
  textTransform: "uppercase",
  display: "flex",
  justifyContent: "space-around",
  alignItems: "center",
  textAlign: "center",
  paddingTop: 100,
  paddingBottom: 60,
});
export const homeBannerText = style({
  fontSize: tokens.fontSizes.xxl,
  fontWeight: tokens.fontWeights.normal,
  // textTransform: 'uppercase',
  // display: 'flex',
  // justifyContent: 'space-between',
  // alignItems: 'center',
});

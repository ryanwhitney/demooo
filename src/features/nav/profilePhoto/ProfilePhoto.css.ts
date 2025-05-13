import { createVar, style } from "@vanilla-extract/css";

export const borderRadiusVar = createVar();
export const widthVar = createVar();
export const heightVar = createVar();
export const backgroundVar = createVar();

export const profilePhotoContainer = style({
  width: widthVar,
  height: heightVar,
  borderRadius: borderRadiusVar,
  background: backgroundVar,
  flexShrink: 0,
});

export const profilePhotoImage = style({
  width: widthVar,
  height: heightVar,
  borderRadius: borderRadiusVar,
  flexShrink: 0,
  objectFit: "cover",
});

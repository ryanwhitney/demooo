import { style } from "@vanilla-extract/css";

export const visuallyHidden = style({
  position: 'absolute',
  top: 'auto',
  overflow: 'hidden',
  clip: 'rect(1px, 1px, 1px, 1px)',
  width: '1',
  height: '1',
  whiteSpace: 'nowrap',
});

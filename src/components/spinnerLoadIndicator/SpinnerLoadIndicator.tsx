import { tokens } from "@/styles/tokens";
import { assignInlineVars } from "@vanilla-extract/dynamic";
import {
  durationVar,
  primaryColorVar,
  sizeVar,
  spinner,
} from "./SpinnerLoadIndicator.css";

const SpinnerLoadIndicator = ({
  size = 40,
  color = tokens.colors.secondary,
  duration = 1000,
}: {
  size?: number;
  color?: string;
  duration?: number;
}) => {
  return (
    <div
      className={spinner}
      style={assignInlineVars({
        [sizeVar]: `${size}px`,
        [durationVar]: `${duration / 1000}s`,
        [primaryColorVar]: color,
      })}
    />
  );
};

export default SpinnerLoadIndicator;

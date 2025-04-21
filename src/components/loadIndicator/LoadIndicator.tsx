import { tokens } from "@/styles/tokens";
import {
	spinner,
	sizeVar,
	durationVar,
	primaryColorVar,
} from "./LoadIndicator.css";
import { assignInlineVars } from "@vanilla-extract/dynamic";

type SpinnerProps = {
	size?: number;
	color?: string;
	duration?: number;
};

const LoadIndicator = ({
	size = 40,
	color = tokens.colors.secondary,
	duration = 1000,
}: SpinnerProps) => {
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

export default LoadIndicator;

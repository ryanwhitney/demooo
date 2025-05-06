import { tokens } from "@/styles/tokens";
import {
	spinner,
	sizeVar,
	durationVar,
	primaryColorVar,
} from "./SpinnerLoadIndicator.css";
import { assignInlineVars } from "@vanilla-extract/dynamic";

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

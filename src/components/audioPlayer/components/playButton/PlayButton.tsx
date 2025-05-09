import IconToggleButton from "@/components/IconToggleButton/IconToggleButton";
import PauseSVG from "@/components/svg/PauseSVG";
import PlaySVG from "@/components/svg/PlaySVG";
import type { HTMLAttributes } from "react";

export type PlayButtonProps = HTMLAttributes<HTMLButtonElement> & {
	isPlaying: boolean;
	onToggle?: (isToggled: boolean) => void;
	className?: string;
	trackTitle?: string;
};

const PlayButton = ({
	isPlaying,
	onToggle,
	className,
	trackTitle,
	...rest
}: PlayButtonProps) => {
	// Simple label based on state
	const playLabel = trackTitle ? `Play ${trackTitle}` : "Play";
	const pauseLabel = trackTitle ? `Pause ${trackTitle}` : "Pause";

	// Current accessible label based on state
	const ariaLabel = isPlaying ? pauseLabel : playLabel;

	return (
		<IconToggleButton
			iconOne={<PlaySVG />}
			iconTwo={<PauseSVG />}
			className={className}
			defaultToggled={isPlaying}
			onToggle={onToggle}
			iconOneTitle={playLabel}
			iconTwoTitle={pauseLabel}
			ariaLabel={ariaLabel}
			{...rest}
		/>
	);
};

export default PlayButton;

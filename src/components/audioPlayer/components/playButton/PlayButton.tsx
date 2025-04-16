import IconToggleButton from "@/components/IconToggleButton/IconToggleButton";
import PauseSVG from "@/components/svg/PauseSVG";
import PlaySVG from "@/components/svg/PlaySVG";
import type { HTMLAttributes } from "react";

export type PlayButtonProps = HTMLAttributes<HTMLButtonElement> & {
	isPlaying: boolean;
	onToggle?: (isToggled: boolean) => void;
	className?: string;
};

const PlayButton = ({
	isPlaying,
	onToggle,
	className,
	...rest
}: PlayButtonProps) => (
	<IconToggleButton
		iconOne={<PlaySVG />}
		iconTwo={<PauseSVG />}
		className={className}
		defaultToggled={isPlaying}
		onToggle={onToggle} // Fixed: Properly pass the function reference
		iconOneTitle="Play"
		iconTwoTitle="Pause"
		{...rest} // Simplified spread
	/>
);

export default PlayButton;

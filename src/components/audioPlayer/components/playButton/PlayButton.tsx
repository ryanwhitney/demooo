import IconToggleButton from "@/components/IconToggleButton/IconToggleButton";
import PauseSVG from "@/components/svg/PauseSVG";
import PlaySVG from "@/components/svg/PlaySVG";
import type { HTMLAttributes } from "react";

export type PlayButtonProps = HTMLAttributes<HTMLButtonElement> & {
	isPlaying: boolean;
	onToggle?: (isToggled: boolean) => void;
};

const PlayButton = ({ isPlaying, onToggle, ...rest }: PlayButtonProps) => (
	<IconToggleButton
		iconOne={<PlaySVG />}
		iconTwo={<PauseSVG />}
		defaultToggled={isPlaying}
		onToggle={() => onToggle}
		iconOneTitle="Play"
		iconTwoTitle="Pause"
		{...{ ...rest }}
	/>
);

export default PlayButton;

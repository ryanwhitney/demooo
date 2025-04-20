import IconToggleButton from "@/components/IconToggleButton/IconToggleButton";
import PauseSVG from "@/components/svg/PauseSVG";
import PlaySVG from "@/components/svg/PlaySVG";
import type { HTMLAttributes } from "react";

export type PlayButtonProps = HTMLAttributes<HTMLButtonElement> & {
	isPlaying: boolean;
	onToggle?: (isToggled: boolean) => void;
	className?: string;
	iconOneTitle?: string;
	iconTwoTitle?: string;
};

const PlayButton = ({
	isPlaying,
	onToggle,
	className,
	iconOneTitle = "play",
	iconTwoTitle = "pause",
	...rest
}: PlayButtonProps) => (
	<IconToggleButton
		iconOne={<PlaySVG />}
		iconTwo={<PauseSVG />}
		className={className}
		defaultToggled={isPlaying}
		onToggle={onToggle}
		iconOneTitle={iconOneTitle}
		iconTwoTitle={iconTwoTitle}
		{...rest}
	/>
);

export default PlayButton;

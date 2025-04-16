import AudioPlayer from "@/components/audioPlayer/components/AudioPlayer";
import { useAudio } from "@/providers/AudioProvider";
import { tokens } from "@/styles/tokens";
import type { Track } from "@/types/track";
import { useEffect, useState } from "react";

const GlobalPlayer = () => {
	const [isVisible, setIsVisible] = useState(false);
	const audio = useAudio();
	const shouldShow =
		audio.currentTrack !== null && audio.activeSource === "global";
	const isPlaying = shouldShow && audio.isPlaying;

	useEffect(() => {
		setTimeout(() => {
			setIsVisible(shouldShow);
		}, 50);
	}, [shouldShow]);

	return (
		<div
			style={{
				position: "fixed",
				bottom: `${isVisible ? "8px" : "-30px"}`,
				transition: "bottom 300ms ease-in-out",
				right: 8,
				borderRadius: 23,
				backgroundColor: "rgba(60, 60, 69, 0.3)",
				backdropFilter: "blur(10px)",
				border: `.33px solid ${tokens.colors.secondaryDark}`,
				WebkitBackdropFilter: "blur(10px)",
				zIndex: 100,
				overflow: "hidden",
			}}
		>
			<div
				style={{
					scale: 0.5,
					marginLeft: -56,
					marginRight: -56,
					marginBottom: -22,
					marginTop: -12,
				}}
			>
				{shouldShow && (
					<AudioPlayer
						track={audio.currentTrack as Track}
						isPlaying={isPlaying}
						onPlayPause={audio.setIsPlaying}
						onTimeUpdate={audio.setCurrentTime}
						onDurationChange={audio.setDuration}
					/>
				)}
			</div>
		</div>
	);
};

export default GlobalPlayer;

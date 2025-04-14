import AudioPlayer from "@/components/audioPlayer/components/AudioPlayer";
import { useAudio } from "@/providers/AudioProvider";
import { tokens } from "@/styles/tokens";
import type { Track } from "@/types/track";

const GlobalPlayer = () => {
	const audio = useAudio();
	const shouldShow =
		audio.currentTrack !== null && audio.activeSource === "global";
	const isPlaying = shouldShow && audio.isPlaying;

	if (!shouldShow) {
		return null;
	}

	return (
		<div
			style={{
				position: "fixed",
				bottom: 8,
				transition: "bottom 0.3s ease-in-out",
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
				<AudioPlayer
					track={audio.currentTrack as Track}
					isPlaying={isPlaying}
					onPlayPause={audio.setIsPlaying}
					onTimeUpdate={audio.setCurrentTime}
					onDurationChange={audio.setDuration}
				/>
			</div>
		</div>
	);
};

export default GlobalPlayer;

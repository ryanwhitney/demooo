import AudioPlayer from "@/components/audioPlayer/components/AudioPlayer";
import { useAudio } from "@/providers/AudioProvider";
import { tokens } from "@/styles/tokens";

const GlobalPlayer = () => {
	const track = useAudio();
	const hasTrack = track.currentTrack !== null;

	return (
		<div
			style={{
				position: "fixed",
				bottom: `${hasTrack ? 8 : -50}`,
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
				{hasTrack && <AudioPlayer track={track.currentTrack} />}
			</div>
		</div>
	);
};

export default GlobalPlayer;

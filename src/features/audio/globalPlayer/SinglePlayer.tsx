import AudioPlayer from "@/components/audioPlayer/components/AudioPlayer";
import { useAudio } from "@/providers/AudioProvider";
import type { Track } from "@/types/track";

const SinglePlayer = ({ track }: { track: Track }) => {
	const audio = useAudio();
	const isActiveTrack =
		audio.currentTrack?.id === track.id && audio.activeSource === "track-view";
	const isPlaying = isActiveTrack && audio.isPlaying;

	const handlePlayPause = (playing: boolean) => {
		if (playing) {
			audio.playTrack(track, "track-view");
		} else {
			audio.pauseTrack();
		}
	};

	return (
		<AudioPlayer
			track={track}
			isPlaying={isPlaying}
			onPlayPause={handlePlayPause}
		/>
	);
};

export default SinglePlayer;

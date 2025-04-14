import AudioPlayer from "@/components/audioPlayer/components/AudioPlayer";
import { useAudio } from "@/providers/AudioProvider";
import type { Track } from "@/types/track";
import { useEffect } from "react";

const SinglePlayer = ({ track }: { track: Track }) => {
	const audio = useAudio();
	const isActiveTrack =
		audio.currentTrack?.id === track.id && audio.activeSource === "track-view";
	const isPlaying = isActiveTrack && audio.isPlaying;

	// When mounts, take control of playback if we're the current track
	useEffect(() => {
		if (audio.currentTrack?.id === track.id && audio.isPlaying) {
			audio.playTrack(track, "track-view");
		}
	}, [audio, track]);

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

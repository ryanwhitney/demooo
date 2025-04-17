import AudioPlayer from "@/components/audioPlayer/components/AudioPlayer";
import { useAudio } from "@/providers/AudioProvider";
import type { Track } from "@/types/track";
import { useCallback } from "react";

const SinglePlayer = ({ track, relatedTracks = [] }: { track: Track; relatedTracks?: Track[] }) => {
	const audio = useAudio();
	const isActiveTrack =
		audio.currentTrack?.id === track.id && audio.activeSource === "track-view";
	const isPlaying = isActiveTrack && audio.isPlaying;

	const handlePlayPause = useCallback((playing: boolean) => {
		if (playing) {
			// If we have related tracks, create a queue starting with the current track 
			// followed by the related tracks
			if (relatedTracks.length > 0) {
				const tracksForQueue = [track, ...relatedTracks.filter(t => t.id !== track.id)];
				audio.playTrackInQueue(track, tracksForQueue, "track-view");
			} else {
				audio.playTrack(track, "track-view");
			}
		} else {
			audio.pauseTrack();
		}
	}, [audio, track, relatedTracks]);

	// Handle track ending - play the next track from queue
	const handleTrackEnded = useCallback(() => {
		if (audio.activeSource === "track-view") {
			audio.nextTrack();
		}
	}, [audio]);

	return (
		<AudioPlayer
			track={track}
			isPlaying={isPlaying}
			onPlayPause={handlePlayPause}
			onEnded={handleTrackEnded}
		/>
	);
};

export default SinglePlayer;

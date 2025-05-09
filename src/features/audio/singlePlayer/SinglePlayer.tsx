import { lazy, Suspense, useCallback, useEffect, useRef } from "react";
import type { Track } from "@/types/track";
import { useAudio } from "@/providers/AudioProvider";

// Use lazy loading for the player component
const AudioPlayer = lazy(
	() => import("@/components/audioPlayer/components/AudioPlayer"),
);

/**
 * SinglePlayer - A simplified track player for the track view
 * Built to work in harmony with GlobalPlayer by using similar patterns
 */
const SinglePlayer = ({
	track,
	relatedTracks = [],
}: {
	track: Track;
	relatedTracks?: Track[];
}) => {
	// Get audio context
	const audio = useAudio();

	// Track interaction and initialization state
	const playerRef = useRef<HTMLDivElement>(null);
	const hasInitializedRef = useRef(false);

	// Check if this is the current track
	const isCurrentTrack = audio.currentTrack?.id === track.id;

	// Take control on mount if needed
	useEffect(() => {
		if (!hasInitializedRef.current) {
			console.log("[SinglePlayer] Initializing");

			// If we're already playing this track, take control
			if (isCurrentTrack && audio.activeSource !== "track-view") {
				console.log("[SinglePlayer] Taking control of current track");
				audio.transferControlTo("track-view");
			}

			hasInitializedRef.current = true;
		}
	}, [audio, isCurrentTrack]);

	// Clean up on unmount - transfer control to global player
	useEffect(() => {
		return () => {
			// Only transfer if this is still the current track and we have control
			if (isCurrentTrack && audio.activeSource === "track-view") {
				console.log("[SinglePlayer] Unmounting, transferring to global");
				audio.transferControlTo("global");
			}
		};
	}, [audio, isCurrentTrack]);

	// Very simple play/pause handler that matches GlobalPlayer's approach
	const handlePlayPause = useCallback(
		(playing: boolean) => {
			// Take control first - this is critical
			if (audio.activeSource !== "track-view") {
				audio.transferControlTo("track-view");
			}

			// Wait a moment to ensure control transfer is complete
			setTimeout(() => {
				if (playing) {
					// PLAY
					if (isCurrentTrack) {
						// Already the current track, just resume
						audio.resumeTrack();
					} else {
						// Play a new track, with queue if available
						if (relatedTracks.length > 0) {
							const queue = [
								track,
								...relatedTracks.filter((t) => t.id !== track.id),
							];
							audio.playTrackInQueue(track, queue, "track-view");
						} else {
							audio.playTrack(track, "track-view");
						}
					}
				} else {
					// PAUSE - only if it's our track
					if (isCurrentTrack) {
						audio.pauseTrack();
					}
				}
			}, 10);
		},
		[audio, isCurrentTrack, track, relatedTracks],
	);

	// Handle track ending
	const handleTrackEnded = useCallback(() => {
		console.log("[SinglePlayer] Track ended, playing next track");
		audio.nextTrack();
	}, [audio]);

	// Render a simplified player component that's consistent with GlobalPlayer
	return (
		<div ref={playerRef}>
			<Suspense fallback={<div>Loading...</div>}>
				<AudioPlayer
					track={
						isCurrentTrack && audio.currentTrack ? audio.currentTrack : track
					}
					onPlayPause={handlePlayPause}
					onEnded={handleTrackEnded}
					source="track-view"
				/>
			</Suspense>
		</div>
	);
};

export default SinglePlayer;

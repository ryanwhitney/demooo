import { Suspense, lazy, useCallback, useEffect, useRef } from "react";
import type { Track } from "@/types/track";
import { useAudio } from "@/providers/AudioProvider";

// Import the PlayerSource type
type PlayerSource = "global" | "track-view" | "artist-view";

// Use lazy loading for AudioPlayer
const AudioPlayer = lazy(
	() => import("@/components/audioPlayer/components/AudioPlayer"),
);

/**
 * SinglePlayer - A simplified track player component that can be used across the app
 * Manages audio control transfer between different parts of the application
 */
function SinglePlayer({
	track,
	source = "track-view",
}: {
	track: Track;
	source?: PlayerSource;
}) {
	const audio = useAudio();
	const hasInitializedRef = useRef(false);
	const isMountedRef = useRef(false);

	// Determine if this track is already playing
	const isCurrentTrack = audio.currentTrack?.id === track.id;

	// Is this player in passive mode?
	const isPassive = audio.activeSource !== source || audio.isScrubbing;

	// Track component lifecycle
	useEffect(() => {
		isMountedRef.current = true;

		return () => {
			isMountedRef.current = false;
		};
	}, []);

	// Manage control transfer on mount/unmount
	useEffect(() => {
		// Skip if not mounted or during scrubbing
		if (!isMountedRef.current) return;

		// Take control when component mounts and track is current or changes
		if (
			isCurrentTrack &&
			audio.activeSource !== source &&
			!audio.isScrubbing &&
			!hasInitializedRef.current
		) {
			console.log(`[SinglePlayer] Taking control on mount (${source})`);
			audio.transferControlTo(source);
			hasInitializedRef.current = true;
		}

		return () => {
			// Only perform cleanup on actual unmount, not re-renders
			if (
				!isMountedRef.current &&
				isCurrentTrack &&
				audio.activeSource === source
			) {
				console.log(
					`[SinglePlayer] Unmounting, transferring to global (${source})`,
				);
				audio.transferControlTo("global");
				hasInitializedRef.current = false;
			}
		};
	}, [
		isCurrentTrack,
		audio.activeSource,
		audio.isScrubbing,
		audio.transferControlTo,
		source,
	]);

	// Handle play/pause
	const handlePlayPause = useCallback(
		(playing: boolean) => {
			// Take control if needed
			if (audio.activeSource !== source) {
				audio.transferControlTo(source);
				hasInitializedRef.current = true;

				// Allow transfer to complete before changing playback
				setTimeout(() => {
					if (playing) {
						isCurrentTrack
							? audio.resumeTrack()
							: audio.playTrack(track, source);
					} else {
						audio.pauseTrack();
					}
				}, 10);
			} else {
				// Already have control, just update playback state
				if (playing) {
					isCurrentTrack ? audio.resumeTrack() : audio.playTrack(track, source);
				} else {
					audio.pauseTrack();
				}
			}
		},
		[
			audio.activeSource,
			audio.pauseTrack,
			audio.playTrack,
			audio.resumeTrack,
			audio.transferControlTo,
			isCurrentTrack,
			track,
			source,
		],
	);

	// Handle track ended
	const handleTrackEnded = useCallback(() => {
		// Only handle if we're the active source
		if (audio.activeSource === source) {
			console.log(`[SinglePlayer] Track ended (${source})`);
			audio.nextTrack();
		}
	}, [audio, audio.activeSource, source]);

	return (
		<Suspense fallback={<div>Loading player...</div>}>
			<AudioPlayer
				track={
					isCurrentTrack && audio.currentTrack ? audio.currentTrack : track
				}
				onPlayPause={handlePlayPause}
				onEnded={handleTrackEnded}
				source={source}
			/>
		</Suspense>
	);
}

export default SinglePlayer;

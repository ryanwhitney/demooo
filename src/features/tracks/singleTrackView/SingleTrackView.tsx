import {
	Suspense,
	lazy,
	useCallback,
	useEffect,
	useRef,
	useState,
} from "react";
import type { Track } from "@/types/track";
import { Link } from "react-router";
import * as style from "./SingleTrackView.css";
import { useAudio } from "@/providers/AudioProvider";

// Use lazy loading for AudioPlayer
const AudioPlayer = lazy(
	() => import("@/components/audioPlayer/components/AudioPlayer"),
);

/**
 * SingleTrackView - Displays a single track with an embedded audio player
 * Takes control of audio playback when mounted
 */
function SingleTrackView({ track }: { track: Track }) {
	const audio = useAudio();
	const audioContainerRef = useRef<HTMLDivElement>(null);
	const hasInitializedRef = useRef(false);
	const isMountedRef = useRef(false);

	// Determine if this track is already playing
	const isCurrentTrack = audio.currentTrack?.id === track.id;

	// Is this player in passive mode?
	const isPassive = audio.activeSource !== "track-view" || audio.isScrubbing;

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
			audio.activeSource !== "track-view" &&
			!audio.isScrubbing &&
			!hasInitializedRef.current
		) {
			console.log("[SingleTrackView] Taking control on mount");
			audio.transferControlTo("track-view");
			hasInitializedRef.current = true;
		}

		return () => {
			// Only perform cleanup on actual unmount, not re-renders
			if (
				!isMountedRef.current &&
				isCurrentTrack &&
				audio.activeSource === "track-view"
			) {
				console.log("[SingleTrackView] Unmounting, transferring to global");
				audio.transferControlTo("global");
				hasInitializedRef.current = false;
			}
		};
	}, [
		isCurrentTrack,
		audio.activeSource,
		audio.isScrubbing,
		audio.transferControlTo,
	]);

	// Handle play/pause
	const handlePlayPause = useCallback(
		(playing: boolean) => {
			// Take control if needed
			if (audio.activeSource !== "track-view") {
				audio.transferControlTo("track-view");
				hasInitializedRef.current = true;

				// Allow transfer to complete before changing playback
				setTimeout(() => {
					if (playing) {
						isCurrentTrack
							? audio.resumeTrack()
							: audio.playTrack(track, "track-view");
					} else {
						audio.pauseTrack();
					}
				}, 10);
			} else {
				// Already have control, just update playback state
				if (playing) {
					isCurrentTrack
						? audio.resumeTrack()
						: audio.playTrack(track, "track-view");
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
		],
	);

	// Handle track ended
	const handleTrackEnded = useCallback(() => {
		// Only handle if we're the active source
		if (audio.activeSource === "track-view") {
			console.log("[SingleTrackView] Track ended");
		}
	}, [audio.activeSource]);

	return (
		<main>
			<title>Music | {track.artist.username}</title>
			<div className={style.trackViewWrapper}>
				<div className={style.trackViewInfo}>
					<div>
						<h1 className={style.trackViewTitle}>{track.title}</h1>
						<p>
							by{" "}
							<Link
								to={`/${track.artist.username}`}
								className={style.trackViewArtist}
							>
								{track.artist.username}
							</Link>
						</p>
					</div>

					{/* Audio Player Container */}
					<div className={style.audioPlayerContainer} ref={audioContainerRef}>
						<Suspense fallback={<div>Loading player...</div>}>
							<AudioPlayer
								track={
									isCurrentTrack && audio.currentTrack
										? audio.currentTrack
										: track
								}
								onPlayPause={handlePlayPause}
								onEnded={handleTrackEnded}
								source="track-view"
							/>
						</Suspense>
					</div>

					<div className={style.trackViewDetails}>
						<p>{track.description || "no notes"}</p>
					</div>
					<div className={style.trackViewTagsWrapper} />
				</div>
			</div>
		</main>
	);
}

export default SingleTrackView;

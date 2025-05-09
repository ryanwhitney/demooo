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

// Use lazy loading like GlobalPlayer
const AudioPlayer = lazy(
	() => import("@/components/audioPlayer/components/AudioPlayer"),
);

/**
 * SingleTrackView - Component for displaying a single track with an embedded audio player
 * Follows the same pattern as GlobalPlayer which works well
 */
function SingleTrackView({ track }: { track: Track }) {
	const audio = useAudio();
	const audioContainerRef = useRef<HTMLDivElement>(null);

	// Determine if this track is already playing
	const isCurrentTrack = audio.currentTrack?.id === track.id;

	// Is this player in passive mode? (shouldn't handle direct user interactions)
	// We're passive when we're not the active source or during scrubbing
	const isPassive = audio.activeSource !== "track-view" || audio.isScrubbing;

	// Take control when first displaying this track, but only if needed
	useEffect(() => {
		// Only transfer control if:
		// 1. This is the current track
		// 2. We're not already the active source
		// 3. Not during scrubbing operations
		if (
			isCurrentTrack &&
			audio.activeSource !== "track-view" &&
			!audio.isScrubbing
		) {
			console.log("[SingleTrackView] Taking control on mount");
			audio.transferControlTo("track-view");
		}
	}, [isCurrentTrack, audio]);

	// Clean up on unmount - transfer to global player
	useEffect(() => {
		return () => {
			if (isCurrentTrack && audio.activeSource === "track-view") {
				console.log("[SingleTrackView] Unmounting, transferring to global");
				audio.transferControlTo("global");
			}
		};
	}, [audio, isCurrentTrack]);

	// Handle play/pause - following GlobalPlayer's pattern exactly
	const handlePlayPause = useCallback(
		(playing: boolean) => {
			// Take control first if needed
			if (audio.activeSource !== "track-view") {
				audio.transferControlTo("track-view");
			}

			// Wait a moment to ensure control transfer is complete
			setTimeout(() => {
				if (playing) {
					// PLAY
					if (isCurrentTrack) {
						audio.resumeTrack();
					} else {
						audio.playTrack(track, "track-view");
					}
				} else {
					// PAUSE
					audio.pauseTrack();
				}
			}, 10);
		},
		[audio, isCurrentTrack, track],
	);

	// Handle track ended
	const handleTrackEnded = useCallback(() => {
		// Only handle if we're the active source
		if (audio.activeSource === "track-view") {
			console.log("[SingleTrackView] Track ended");
		}
	}, [audio]);

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

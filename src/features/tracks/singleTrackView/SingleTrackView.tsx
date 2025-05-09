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
 */
function SingleTrackView({ track }: { track: Track }) {
	const audio = useAudio();
	const audioContainerRef = useRef<HTMLDivElement>(null);
	const [isScrubbingLocally, setIsScrubbingLocally] = useState(false);

	// Determine if this track is already playing
	const isCurrentTrack = audio.currentTrack?.id === track.id;
	const isOurSource = audio.activeSource === "track-view";

	// Take control when viewing this track
	useEffect(() => {
		// Only take control if this is the current track but not our source yet,
		// and not during scrubbing operations
		if (isCurrentTrack && !isOurSource && !audio.isScrubbing) {
			console.log("[SingleTrackView] Initial mount - taking control");
			audio.transferControlTo("track-view");
		}
	}, [isCurrentTrack, isOurSource, audio]);

	// Clean up on unmount - transfer to global player
	useEffect(() => {
		return () => {
			if (isCurrentTrack && isOurSource) {
				console.log("[SingleTrackView] Unmounting - transferring to global");
				audio.transferControlTo("global");
			}
		};
	}, [audio, isCurrentTrack, isOurSource]);

	// Monitor scrubbing state
	useEffect(() => {
		if (isCurrentTrack) {
			// When scrubbing starts, we update our local scrubbing state
			setIsScrubbingLocally(audio.isScrubbing);

			// When scrubbing ends, wait a bit before clearing local state
			if (!audio.isScrubbing && isScrubbingLocally) {
				const timer = setTimeout(() => {
					setIsScrubbingLocally(false);
				}, 300);
				return () => clearTimeout(timer);
			}
		}
	}, [audio.isScrubbing, isCurrentTrack, isScrubbingLocally]);

	// Play/pause handler - simplified and improved
	const handlePlayPause = useCallback(
		(playing: boolean) => {
			// Always force control to this view during play/pause actions
			if (!isOurSource) {
				console.log("[SingleTrackView] Taking control during play/pause");
				audio.transferControlTo("track-view");
			}

			// Wait a moment for control transfer
			setTimeout(() => {
				if (playing) {
					// Resume or start playing
					if (isCurrentTrack) {
						console.log("[SingleTrackView] Resuming track");
						audio.resumeTrack();
					} else {
						console.log("[SingleTrackView] Playing new track");
						audio.playTrack(track, "track-view");
					}
				} else {
					// Pause if it's our track
					if (isCurrentTrack) {
						console.log("[SingleTrackView] Pausing track");
						audio.pauseTrack();
					}
				}
			}, 50);
		},
		[audio, isCurrentTrack, isOurSource, track],
	);

	// Handle track ended
	const handleTrackEnded = useCallback(() => {
		console.log("[SingleTrackView] Track ended");
	}, []);

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
					<div
						className={style.audioPlayerContainer}
						ref={audioContainerRef}
						data-is-active={isCurrentTrack && isOurSource ? "true" : "false"}
						data-is-scrubbing={
							isScrubbingLocally || audio.isScrubbing ? "true" : "false"
						}
					>
						<Suspense fallback={<div>Loading...</div>}>
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

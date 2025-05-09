import {
	Suspense,
	lazy,
	useCallback,
	useEffect,
	useRef,
	useState,
} from "react";
import type { Track } from "@/types/track";
import { useAudio } from "@/providers/AudioProvider";
import * as style from "./GlobalPlayer.css";
import { useLocation } from "react-router";

const AudioPlayer = lazy(
	() => import("@/components/audioPlayer/components/AudioPlayer"),
);

const GlobalPlayer = () => {
	const [isVisible, setIsVisible] = useState(false);
	const audio = useAudio();
	const previousSourceRef = useRef<string | null>(null);
	const previousTrackIdRef = useRef<string | null>(null);
	const location = useLocation();

	// Check if we're on a track page - they have paths like "/username/track/title"
	const isSingleTrackView = location.pathname.includes("/track/");

	// Determine if the GlobalPlayer should be shown
	// - Has a track
	// - Is global/artist source OR we're NOT in SingleTrackView
	// - Do not hide during scrubbing - fixes the hide/show flicker
	const shouldShow =
		audio.currentTrack !== null &&
		(!isSingleTrackView ||
			audio.activeSource === "global" ||
			audio.activeSource === "artist-view");

	// Is this GlobalPlayer passive (shouldn't handle interactions)?
	const isPassive =
		isSingleTrackView &&
		(audio.activeSource === "track-view" || audio.isScrubbing);

	// Track source changes to detect when we need to show the GlobalPlayer
	useEffect(() => {
		// If we have a track but we were previously on track-view, we need to show the player
		// But ONLY if we're not in SingleTrackView and not scrubbing
		const transitioningFromSinglePlayerToGlobal =
			audio.currentTrack !== null &&
			previousSourceRef.current === "track-view" &&
			(audio.activeSource === "global" ||
				audio.activeSource === "artist-view") &&
			previousTrackIdRef.current === audio.currentTrack.id &&
			!isSingleTrackView &&
			!audio.isScrubbing;

		// Update refs for next comparison
		previousSourceRef.current = audio.activeSource || null;
		previousTrackIdRef.current = audio.currentTrack?.id || null;

		// If transitioning from single player, show immediately
		if (transitioningFromSinglePlayerToGlobal) {
			console.log(
				"[GlobalPlayer] Transitioning from single player to global, showing player immediately",
			);
			setIsVisible(true);
		}
	}, [
		audio.activeSource,
		audio.currentTrack,
		audio.isScrubbing,
		isSingleTrackView,
	]);

	// Regular visibility handling
	useEffect(() => {
		// Only hide when in SingleTrackView and explicitly using track-view source
		// BUT do NOT hide during scrubbing - this avoids the show/hide flicker
		if (isSingleTrackView && audio.activeSource === "track-view" && isVisible) {
			setIsVisible(false);
			return;
		}

		// Use a small delay to prevent flickering during fast transitions
		const timer = setTimeout(() => {
			setIsVisible(shouldShow);
		}, 100); // Increase delay slightly for better stability

		return () => clearTimeout(timer);
	}, [shouldShow, isSingleTrackView, audio.activeSource, isVisible]);

	// Only handle track end if this is the active source
	const handleTrackEnded = useCallback(() => {
		if (
			audio.activeSource === "global" ||
			audio.activeSource === "artist-view"
		) {
			audio.nextTrack();
		}
	}, [audio]);

	// Handle play/pause - but don't compete with SinglePlayer
	const handlePlayPause = useCallback(
		(playing: boolean) => {
			// Don't handle events if we're passive
			if (isPassive) {
				console.log("[GlobalPlayer] Passive mode, ignoring play/pause");
				return;
			}

			// Don't respond during scrubbing
			if (audio.isScrubbing) {
				console.log("[GlobalPlayer] Ignoring during scrubbing");
				return;
			}

			console.log("[GlobalPlayer] PlayPause:", playing);

			// Take control first if needed
			if (audio.activeSource !== "global" && audio.currentTrack) {
				audio.transferControlTo("global");
			}

			// Wait a moment to ensure control transfer is complete
			setTimeout(() => {
				if (playing) {
					// PLAY
					audio.resumeTrack();
				} else {
					// PAUSE
					audio.pauseTrack();
				}
			}, 10);
		},
		[audio, isPassive],
	);

	// Exit early if there's no track to play
	if (!audio.currentTrack) {
		return null;
	}

	return (
		<div
			className={`${style.container} ${style.playerContainer({
				visible: isVisible,
				passive: isPassive,
			})}`}
		>
			<div className={style.playerWrapper}>
				<Suspense fallback={<div>Loading...</div>}>
					<AudioPlayer
						track={audio.currentTrack}
						onPlayPause={handlePlayPause}
						onEnded={handleTrackEnded}
						source="global"
					/>
				</Suspense>
			</div>
		</div>
	);
};

export default GlobalPlayer;

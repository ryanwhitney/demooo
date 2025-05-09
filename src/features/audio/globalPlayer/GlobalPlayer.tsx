import {
	Suspense,
	lazy,
	useCallback,
	useEffect,
	useRef,
	useState,
	useMemo,
} from "react";
import { useAudio } from "@/providers/AudioProvider";
import * as style from "./GlobalPlayer.css";
import { useLocation } from "react-router";
import type { PlayerSource } from "@/types/audio";

const AudioPlayer = lazy(
	() => import("@/components/audioPlayer/components/AudioPlayer"),
);

/**
 * GlobalPlayer - Persistent audio player that appears at the bottom of the screen
 * Shows when playing content not on a single track page or when explicitly using the global source
 */
const GlobalPlayer = () => {
	const [isVisible, setIsVisible] = useState(false);
	const audio = useAudio();
	const previousSourceRef = useRef<PlayerSource | null>(null);
	const previousTrackIdRef = useRef<string | null>(null);
	const previousPathRef = useRef<string | null>(null);
	const location = useLocation();
	const loggedPlayPauseRef = useRef(false);

	// Check if we're on a track page - they have paths like "/username/track/title"
	const isSingleTrackView = useMemo(() => {
		return location.pathname.includes("/track/");
	}, [location.pathname]);

	// Determine if the GlobalPlayer should be shown
	// - Has a track
	// - Is global/artist source OR we're NOT in SingleTrackView
	const shouldShow = useMemo(() => {
		return (
			audio.currentTrack !== null &&
			(!isSingleTrackView ||
				audio.activeSource === "global" ||
				audio.activeSource === "artist-view")
		);
	}, [audio.currentTrack, audio.activeSource, isSingleTrackView]);

	// Is this GlobalPlayer passive (shouldn't handle interactions)?
	const isPassive = useMemo(() => {
		return (
			isSingleTrackView &&
			(audio.activeSource === "track-view" || audio.isScrubbing)
		);
	}, [isSingleTrackView, audio.activeSource, audio.isScrubbing]);

	// Track location and source changes to manage visibility
	useEffect(() => {
		// Detect transitions from SingleTrackView to other pages
		const leavingSingleTrackView =
			previousPathRef.current?.includes("/track/") &&
			!location.pathname.includes("/track/") &&
			audio.currentTrack !== null;

		// Detect transitions from track-view source to global source
		const transitioningToGlobalSource =
			audio.currentTrack !== null &&
			previousSourceRef.current === "track-view" &&
			(audio.activeSource === "global" ||
				audio.activeSource === "artist-view") &&
			previousTrackIdRef.current === audio.currentTrack.id &&
			!isSingleTrackView;

		// Update refs for next comparison
		previousSourceRef.current = audio.activeSource || null;
		previousTrackIdRef.current = audio.currentTrack?.id || null;
		previousPathRef.current = location.pathname;

		// Show player on transitions or when playing content on non-track pages
		if (
			leavingSingleTrackView ||
			transitioningToGlobalSource ||
			(audio.currentTrack && !isSingleTrackView && audio.isPlaying)
		) {
			setIsVisible(true);
		}
	}, [
		audio.activeSource,
		audio.currentTrack,
		audio.isPlaying,
		isSingleTrackView,
		location.pathname,
	]);

	// Handle visibility toggling based on current state
	useEffect(() => {
		// Hide when on SingleTrackView with track-view source active
		if (isSingleTrackView && audio.activeSource === "track-view" && isVisible) {
			setIsVisible(false);
			return;
		}

		// Show when we should be visible based on conditions
		if (shouldShow && !isVisible) {
			// Small delay to prevent flickering during transitions
			const timer = setTimeout(() => {
				setIsVisible(true);
			}, 250);
			return () => clearTimeout(timer);
		}
	}, [shouldShow, isSingleTrackView, audio.activeSource, isVisible]);

	// Handle track end - load next track if we're the active source
	const handleTrackEnded = useCallback(() => {
		if (
			audio.activeSource === "global" ||
			audio.activeSource === "artist-view"
		) {
			audio.nextTrack();
		}
	}, [audio.activeSource, audio.nextTrack]);

	// Handle play/pause - with debounced logging
	const handlePlayPause = useCallback(
		(playing: boolean) => {
			// Don't handle events in passive mode or during scrubbing
			if (isPassive || audio.isScrubbing) {
				return;
			}

			// Prevent excessive logging - only log when state changes
			if (!loggedPlayPauseRef.current) {
				console.log("[GlobalPlayer] PlayPause:", playing);
				loggedPlayPauseRef.current = true;
				// Reset log flag after a delay
				setTimeout(() => {
					loggedPlayPauseRef.current = false;
				}, 1000);
			}

			// Take control first if needed
			if (audio.activeSource !== "global" && audio.currentTrack) {
				audio.transferControlTo("global");
				// Allow transfer to complete before changing playback
				setTimeout(() => {
					playing ? audio.resumeTrack() : audio.pauseTrack();
				}, 10);
			} else {
				// Already have control, update playback directly
				playing ? audio.resumeTrack() : audio.pauseTrack();
			}
		},
		[
			isPassive,
			audio.isScrubbing,
			audio.activeSource,
			audio.currentTrack,
			audio.transferControlTo,
			audio.resumeTrack,
			audio.pauseTrack,
		],
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

import type { Track } from "@/types/track";
import { formatTime } from "@/utils/timeAndDate";
import PlayButton from "./playButton/PlayButton";
import * as style from "./AudioPlayer.css";
import Waveform from "./waveform/Waveform";
import TimelineSlider from "./timeline/TimelineSlider";
import { useCallback, useEffect, useRef, useState, memo } from "react";
import { useAudio } from "@/providers/AudioProvider";
import { VisuallyHidden } from "react-aria";
import type { PlayerSource } from "@/types/audio";

// Fixed constants for keyboard navigation
const KEYBOARD_SEEK_STEP = 5; // seconds
const DEBOUNCE_ANNOUNCEMENT_MS = 500;

interface AudioPlayerProps {
	track: Track;
	onPlayPause?: (isPlaying: boolean) => void;
	onTimeUpdate?: (time: number) => void;
	onDurationChange?: (duration: number) => void;
	onEnded?: () => void;
	source?: PlayerSource;
}

/**
 * Core audio playback UI component that connects to the global audio context
 * and manages user interactions with the current track
 */
const AudioPlayer = memo(function AudioPlayer({
	track,
	onPlayPause,
	onTimeUpdate,
	onDurationChange,
	onEnded,
	source = "global",
}: AudioPlayerProps) {
	const audio = useAudio();
	const [localCurrentTime, setLocalCurrentTime] = useState(0);
	const [localDuration, setLocalDuration] = useState(0);
	const previousSourceRef = useRef<string | null>(null);
	const playerRef = useRef<HTMLElement>(null);
	const [announcement, setAnnouncement] = useState("");
	const announcementTimerRef = useRef<number | null>(null);

	// Check if this track is active
	const isCurrentTrack = audio.currentTrack?.id === track.id;
	const isPlaying = isCurrentTrack && audio.isPlaying;
	const isActiveSource = isCurrentTrack && audio.activeSource === source;

	// Calculate time values
	const currentTime = isCurrentTrack ? audio.currentTime : localCurrentTime;
	const duration = isCurrentTrack
		? audio.duration > 0
			? audio.duration
			: track.audioLength || 0
		: localDuration;
	const normalizedProgress = duration > 0 ? currentTime / duration : 0;

	// Debounced announcement helper
	const updateAnnouncement = useCallback((message: string) => {
		// Clear any pending announcement
		if (announcementTimerRef.current !== null) {
			window.clearTimeout(announcementTimerRef.current);
		}

		setAnnouncement(message);

		// Clear announcement after delay
		announcementTimerRef.current = window.setTimeout(() => {
			setAnnouncement("");
			announcementTimerRef.current = null;
		}, DEBOUNCE_ANNOUNCEMENT_MS);
	}, []);

	// Track source changes to debug issues
	useEffect(() => {
		if (isCurrentTrack && previousSourceRef.current !== audio.activeSource) {
			previousSourceRef.current = audio.activeSource;
		}
	}, [isCurrentTrack, audio.activeSource]);

	// Clean up any timers on unmount
	useEffect(() => {
		return () => {
			if (announcementTimerRef.current !== null) {
				window.clearTimeout(announcementTimerRef.current);
			}
		};
	}, []);

	// Keep local state in sync with provider state
	useEffect(() => {
		if (isCurrentTrack) {
			setLocalCurrentTime(audio.currentTime);
			setLocalDuration(
				audio.duration > 0 ? audio.duration : track.audioLength || 0,
			);
		} else {
			setLocalCurrentTime(0);
			setLocalDuration(track.audioLength || 0);
		}
	}, [isCurrentTrack, audio.currentTime, audio.duration, track.audioLength]);

	// Forward events to parent components if needed
	useEffect(() => {
		if (isCurrentTrack && isActiveSource) {
			onTimeUpdate?.(audio.currentTime);
			onDurationChange?.(audio.duration);
			onPlayPause?.(audio.isPlaying);
		}
	}, [
		isCurrentTrack,
		isActiveSource,
		audio.currentTime,
		audio.duration,
		audio.isPlaying,
		onTimeUpdate,
		onDurationChange,
		onPlayPause,
	]);

	// Announce significant state changes for screen readers
	useEffect(() => {
		if (isCurrentTrack && isActiveSource) {
			if (isPlaying) {
				updateAnnouncement(`Playing ${track.title}`);
			} else {
				updateAnnouncement(`Paused ${track.title}`);
			}
		}
	}, [
		isCurrentTrack,
		isActiveSource,
		isPlaying,
		track.title,
		updateAnnouncement,
	]);

	// Check for track ended
	useEffect(() => {
		if (
			isCurrentTrack &&
			isActiveSource &&
			audio.currentTime >= audio.duration &&
			audio.duration > 0
		) {
			updateAnnouncement(`Finished playing ${track.title}`);
			onEnded?.();
		}
	}, [
		isCurrentTrack,
		isActiveSource,
		audio.currentTime,
		audio.duration,
		onEnded,
		track.title,
		updateAnnouncement,
	]);

	// Handle scrubbing (including drag operations)
	const handleScrubbing = useCallback(
		(scrubbing: boolean, previewTime: number) => {
			setLocalCurrentTime(previewTime);

			if (scrubbing) {
				updateAnnouncement(`Scrubbing to ${formatTime(previewTime)}`);
			} else {
				updateAnnouncement(
					`Set playback position to ${formatTime(previewTime)}`,
				);
			}

			if (!isCurrentTrack) return;

			if (scrubbing) {
				if (!isActiveSource) {
					audio.transferControlTo(source);
				}

				audio.startScrubbing(previewTime);
			} else {
				audio.endScrubbing(previewTime);
			}
		},
		[
			audio.endScrubbing,
			audio.startScrubbing,
			audio.transferControlTo,
			isActiveSource,
			isCurrentTrack,
			source,
			updateAnnouncement,
		],
	);

	// Toggle play/pause
	const togglePlayPause = useCallback(() => {
		// Don't toggle during scrubbing to avoid visual inconsistency
		if (audio.isScrubbing) {
			return;
		}

		if (isCurrentTrack) {
			// Current track - handle based on source
			if (!isActiveSource) {
				const wasPlaying = audio.isPlaying;

				// Transfer control to this source
				audio.transferControlTo(source);

				// If it was paused and we're clicking play, resume
				if (!wasPlaying) {
					setTimeout(() => {
						audio.resumeTrack();
					}, 10); // Small delay to ensure transfer completes
				}
			} else {
				// We're already the active source, just toggle play state
				audio.togglePlayPause();
			}
		} else {
			// Not the current track - start fresh
			audio.playTrack(track, source);
		}
	}, [audio, isCurrentTrack, isActiveSource, track, source]);

	// Handle seeking through timeline
	const handleSeek = useCallback(
		(time: number) => {
			setLocalCurrentTime(time);

			if (isCurrentTrack) {
				// Skip if already scrubbing to avoid state conflicts
				if (audio.isScrubbing) {
					return;
				}

				// Transfer control only if needed
				if (!isActiveSource) {
					// Need to take control first
					audio.transferControlTo(source);

					// Wait for transfer to complete before seeking
					setTimeout(() => {
						audio.seekTo(time);
						updateAnnouncement(`Seeked to ${formatTime(time)}`);
					}, 50);
				} else {
					// Already have control, seek directly
					audio.seekTo(time);
					updateAnnouncement(`Seeked to ${formatTime(time)}`);
				}
			} else {
				// New track - start playing and seek
				audio.playTrack(track, source);

				// Wait for track to load before seeking
				setTimeout(() => {
					audio.seekTo(time);
					updateAnnouncement(`Playing ${track.title} from ${formatTime(time)}`);
				}, 50);
			}
		},
		[
			audio.isScrubbing,
			audio.playTrack,
			audio.seekTo,
			audio.transferControlTo,
			isActiveSource,
			isCurrentTrack,
			source,
			track,
			updateAnnouncement,
		],
	);

	// Direct manipulation of audio element for keyboard navigation
	const directAudioTimeAdjust = useCallback(
		(newTime: number) => {
			// Get direct access to the audio element
			const audioEl = audio.getAudioElement();
			if (audioEl && isCurrentTrack) {
				// Bound the time to valid range
				const boundedTime = Math.max(0, Math.min(newTime, duration));

				// Update UI immediately
				setLocalCurrentTime(boundedTime);

				// Update audio element directly - avoid triggering play/pause
				audioEl.currentTime = boundedTime;

				// Announce for screen readers
				updateAnnouncement(`Moved to ${formatTime(boundedTime)}`);

				return boundedTime;
			}
			return null;
		},
		[audio, isCurrentTrack, duration, updateAnnouncement],
	);

	// Handle keyboard navigation for the entire player
	const handleKeyDown = useCallback(
		(e: React.KeyboardEvent) => {
			// Check if focus is inside the timeline slider
			const isSliderFocused = (e.target as Element).closest('[role="slider"]');

			if (isSliderFocused) {
				// When slider is focused, only handle space and enter for play/pause
				// Let the slider component handle arrow keys for seeking
				if (e.key === " " || e.key === "Enter") {
					e.preventDefault();
					togglePlayPause();
				}
				// Allow all other keys to be handled by the slider component
				return;
			}

			// Handle keyboard events when slider is not focused
			switch (e.key) {
				case " ": // Space - toggle play/pause
					e.preventDefault();
					togglePlayPause();
					break;
				case "ArrowRight": {
					// Right arrow - seek forward
					e.preventDefault();
					directAudioTimeAdjust(currentTime + KEYBOARD_SEEK_STEP);
					break;
				}
				case "ArrowLeft": {
					// Left arrow - seek backward
					e.preventDefault();
					directAudioTimeAdjust(Math.max(currentTime - KEYBOARD_SEEK_STEP, 0));
					break;
				}
				case "Home": {
					// Home - seek to start
					e.preventDefault();
					directAudioTimeAdjust(0);
					break;
				}
				case "End": {
					// End - seek to end
					e.preventDefault();
					directAudioTimeAdjust(duration);
					break;
				}
			}
		},
		[togglePlayPause, currentTime, duration, directAudioTimeAdjust],
	);

	// Listen for custom timeline keyboard navigation events
	useEffect(() => {
		// Skip if we're not the current track
		if (!playerRef.current || !isCurrentTrack) return;

		const handleTimelineKeyNav = (e: Event) => {
			const customEvent = e as CustomEvent;
			const { time } = customEvent.detail;

			// Use our direct time adjustment function
			const adjustedTime = directAudioTimeAdjust(time);

			if (adjustedTime !== null) {
				e.stopPropagation();
			}
		};

		// Add listener
		playerRef.current.addEventListener("timelineKeyNav", handleTimelineKeyNav);

		return () => {
			// Clean up listener
			playerRef.current?.removeEventListener(
				"timelineKeyNav",
				handleTimelineKeyNav,
			);
		};
	}, [isCurrentTrack, directAudioTimeAdjust]);

	return (
		<section
			ref={playerRef}
			className={style.audioPlayerWrapper}
			aria-label={`Audio player for ${track.title || "track"}`}
			onKeyDown={handleKeyDown}
		>
			{/* Screen reader announcements */}
			{announcement && (
				<VisuallyHidden aria-live="polite">{announcement}</VisuallyHidden>
			)}

			{/* Hidden instructions for screen reader users */}
			<VisuallyHidden>
				Press Space to play or pause. Use arrow keys to seek forward or backward
				by 5 seconds. Home key seeks to the beginning and End key seeks to the
				end of the track.
			</VisuallyHidden>

			<div className={style.controlsWrapper}>
				<div className={style.playButtonWrapper}>
					<PlayButton
						className={style.playButton}
						isPlaying={audio.isScrubbing ? audio.isPlaying : isPlaying}
						onToggle={togglePlayPause}
						trackTitle={track.title}
					/>
				</div>

				<div className={style.waveformContainer}>
					<TimelineSlider
						currentTime={currentTime}
						duration={duration}
						isPlaying={isPlaying}
						isScrubbing={isCurrentTrack ? audio.isScrubbing : false}
						onTimeChange={handleSeek}
						onScrubbing={handleScrubbing}
						className={style.timelineSlider}
						aria-label="Audio timeline"
					>
						<Waveform
							data={track.audioWaveformData}
							progress={normalizedProgress}
							isInteractive={false}
							aria-hidden="true"
						/>
					</TimelineSlider>
				</div>
			</div>
			<span
				className={style.timeDisplay}
				aria-live="polite"
				aria-atomic="true"
				aria-label="Current playback time"
			>
				{formatTime(currentTime)} / {formatTime(duration || 0)}
			</span>
		</section>
	);
});

export default AudioPlayer;

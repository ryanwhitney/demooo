import type { Track } from "@/types/track";
import { formatTime } from "@/utils/timeAndDate";
import PlayButton from "./playButton/PlayButton";
import * as style from "./AudioPlayer.css";
import Waveform from "./waveform/Waveform";
import TimelineSlider from "./timeline/TimelineSlider";
import { useCallback, useEffect, useRef, useState } from "react";
import { useAudio } from "@/providers/AudioProvider";
import { VisuallyHidden } from "react-aria";

interface AudioPlayerProps {
	track: Track;
	onPlayPause?: (isPlaying: boolean) => void;
	onTimeUpdate?: (time: number) => void;
	onDurationChange?: (duration: number) => void;
	onEnded?: () => void;
	source?: "global" | "track-view" | "artist-view";
}

const AudioPlayer = ({
	track,
	onPlayPause,
	onTimeUpdate,
	onDurationChange,
	onEnded,
	source = "global",
}: AudioPlayerProps) => {
	const audio = useAudio();
	const [localCurrentTime, setLocalCurrentTime] = useState(0);
	const [localDuration, setLocalDuration] = useState(0);
	const previousSourceRef = useRef<string | null>(null);
	const playerRef = useRef<HTMLElement>(null);
	const [announcement, setAnnouncement] = useState("");

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

	// Track source changes to debug issues
	useEffect(() => {
		if (isCurrentTrack && previousSourceRef.current !== audio.activeSource) {
			console.log(
				`AudioPlayer: Source changed from ${previousSourceRef.current} to ${audio.activeSource} for ${track.title}`,
			);
			previousSourceRef.current = audio.activeSource;
		}
	}, [isCurrentTrack, audio.activeSource, track.title]);

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
				setAnnouncement(`Playing ${track.title}`);
			} else {
				setAnnouncement(`Paused ${track.title}`);
			}
		}
	}, [isCurrentTrack, isActiveSource, isPlaying, track.title]);

	// Check for track ended
	useEffect(() => {
		if (
			isCurrentTrack &&
			isActiveSource &&
			audio.currentTime >= audio.duration &&
			audio.duration > 0
		) {
			setAnnouncement(`Finished playing ${track.title}`);
			onEnded?.();
		}
	}, [
		isCurrentTrack,
		isActiveSource,
		audio.currentTime,
		audio.duration,
		onEnded,
		track.title,
	]);

	// Handle scrubbing (including drag operations)
	const handleScrubbing = useCallback(
		(scrubbing: boolean, previewTime: number) => {
			if (scrubbing) {
				// Just started scrubbing
				console.log(`Scrubbing started at ${previewTime.toFixed(2)}`);
			} else {
				// Finished scrubbing
				console.log(`Scrubbing ended at ${previewTime.toFixed(2)}`);
			}

			// Always update local state for immediate visual feedback
			setLocalCurrentTime(previewTime);

			// Update screen reader announcements
			if (scrubbing) {
				setAnnouncement(`Scrubbing to ${formatTime(previewTime)}`);
			} else {
				setAnnouncement(`Set playback position to ${formatTime(previewTime)}`);
			}

			// Skip audio operations if not current track
			if (!isCurrentTrack) return;

			// Handle scrubbing state changes
			if (scrubbing) {
				// Starting to scrub - take control once if needed
				if (!isActiveSource) {
					audio.transferControlTo(source);
				}

				// Start scrubbing mode - we don't pause audio as it causes flickering in Chrome
				audio.startScrubbing(previewTime);
			} else {
				// End scrubbing and apply final position - again, don't pause/play to avoid flicker
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
		],
	);

	// Toggle play/pause
	const togglePlayPause = useCallback(() => {
		// Don't toggle during scrubbing to avoid visual inconsistency
		if (audio.isScrubbing) {
			console.log("Ignoring play/pause toggle during scrubbing");
			return;
		}

		console.log(
			`AudioPlayer togglePlayPause: isCurrentTrack=${isCurrentTrack}, isActiveSource=${isActiveSource}, currentState=${audio.isPlaying ? "playing" : "paused"}`,
		);

		if (isCurrentTrack) {
			// Current track - handle based on source
			if (!isActiveSource) {
				console.log(
					`Not active source. Transferring control from ${audio.activeSource} to ${source}`,
				);

				// Remember current playback state and position
				const wasPlaying = audio.isPlaying;

				// Transfer control to this source
				audio.transferControlTo(source);

				// If it was paused and we're clicking play, resume
				if (!wasPlaying) {
					console.log("Was paused, now resuming");
					setTimeout(() => {
						audio.resumeTrack();
					}, 10); // Small delay to ensure transfer completes
				}
			} else {
				// We're already the active source, just toggle play state
				console.log(`Already active source ${source}, toggling playback`);
				audio.togglePlayPause();
			}
		} else {
			// Not the current track - start fresh
			console.log(
				`New track: ${track.title}, starting playback with source=${source}`,
			);
			audio.playTrack(track, source);
		}
	}, [audio, isCurrentTrack, isActiveSource, track, source]);

	// Handle seeking through timeline
	const handleSeek = useCallback(
		(time: number) => {
			console.log(`AudioPlayer handleSeek: time=${time.toFixed(2)}`);

			// Immediately update local state for responsive UI
			setLocalCurrentTime(time);

			// Only handle actual audio operations for the current track
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
						setAnnouncement(`Seeked to ${formatTime(time)}`);
					}, 50);
				} else {
					// Already have control, seek directly
					audio.seekTo(time);
					setAnnouncement(`Seeked to ${formatTime(time)}`);
				}
			} else {
				// New track - start playing and seek
				audio.playTrack(track, source);

				// Wait for track to load before seeking
				setTimeout(() => {
					audio.seekTo(time);
					setAnnouncement(`Playing ${track.title} from ${formatTime(time)}`);
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
		],
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
					// Direct manipulation without triggering play/pause
					const audioEl = audio.getAudioElement();
					if (audioEl && isCurrentTrack) {
						// Store current time and calculate new time
						const newTime = Math.min(currentTime + 5, duration);
						// Update UI immediately
						setLocalCurrentTime(newTime);
						// Update audio element directly
						if (audioEl instanceof HTMLAudioElement) {
							audioEl.currentTime = newTime;
						}
						// Announce for screen readers
						setAnnouncement(`Moved to ${formatTime(newTime)}`);
					}
					break;
				}
				case "ArrowLeft": {
					// Left arrow - seek backward
					e.preventDefault();
					// Direct manipulation without triggering play/pause
					const audioElBack = audio.getAudioElement();
					if (audioElBack && isCurrentTrack) {
						// Store current time and calculate new time
						const newTime = Math.max(currentTime - 5, 0);
						// Update UI immediately
						setLocalCurrentTime(newTime);
						// Update audio element directly
						if (audioElBack instanceof HTMLAudioElement) {
							audioElBack.currentTime = newTime;
						}
						// Announce for screen readers
						setAnnouncement(`Moved to ${formatTime(newTime)}`);
					}
					break;
				}
				case "Home": {
					// Home - seek to start
					e.preventDefault();
					// Direct manipulation to start
					const audioElHome = audio.getAudioElement();
					if (audioElHome && isCurrentTrack) {
						// Update UI immediately
						setLocalCurrentTime(0);
						// Update audio element directly
						if (audioElHome instanceof HTMLAudioElement) {
							audioElHome.currentTime = 0;
						}
						// Announce for screen readers
						setAnnouncement("Moved to the beginning");
					}
					break;
				}
				case "End": {
					// End - seek to end
					e.preventDefault();
					// Direct manipulation to end
					const audioElEnd = audio.getAudioElement();
					if (audioElEnd && isCurrentTrack) {
						// Update UI immediately
						setLocalCurrentTime(duration);
						// Update audio element directly
						if (audioElEnd instanceof HTMLAudioElement) {
							audioElEnd.currentTime = duration;
						}
						// Announce for screen readers
						setAnnouncement("Moved to the end");
					}
					break;
				}
			}
		},
		[togglePlayPause, currentTime, duration, audio, isCurrentTrack],
	);

	// Listen for custom timeline keyboard navigation events
	useEffect(() => {
		// Skip if we're not the current track
		if (!playerRef.current || !isCurrentTrack) return;

		const handleTimelineKeyNav = (e: Event) => {
			const customEvent = e as CustomEvent;
			const { action, time } = customEvent.detail;

			// Get direct access to the audio element
			const audioElement = audio.getAudioElement();
			if (audioElement instanceof HTMLAudioElement) {
				console.log(`Timeline key nav: ${action}, time: ${time}`);

				// Update local UI state
				setLocalCurrentTime(time);

				// Directly update audio element time without triggering play/pause
				audioElement.currentTime = time;

				// Prevent event from propagating further
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
	}, [isCurrentTrack, audio]);

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
};

export default AudioPlayer;

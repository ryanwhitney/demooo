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

	// Toggle play/pause
	const togglePlayPause = useCallback(() => {
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

	// Special seek function for keyboard navigation that's less disruptive to playback
	const handleKeyboardSeek = useCallback(
		(time: number) => {
			console.log(`AudioPlayer keyboard seek: time=${time.toFixed(2)}`);

			// Immediately update local state for visual feedback
			setLocalCurrentTime(time);

			// Only handle actual audio operations for the current track
			if (isCurrentTrack) {
				// Always ensure we have control before seeking
				if (!isActiveSource) {
					audio.transferControlTo(source);
				}

				// Get direct access to the audio element for smoother keyboard navigation
				const audioElement = audio.getAudioElement();
				if (audioElement) {
					try {
						// Store the current playing state
						const wasPlaying = !audioElement.paused;

						// Update the time directly without pause/play cycling
						audioElement.currentTime = time;

						// Update announcement for screen readers
						setAnnouncement(`Moved to ${formatTime(time)}`);

						// Force sync the provider state without triggering pause/play
						// This ensures the UI updates properly
						setTimeout(() => {
							// Check if we need to update the provider's time state manually
							if (Math.abs(audio.currentTime - time) > 0.5) {
								// Update state in provider manually if direct update didn't propagate
								audio.seekTo(time);
							}
						}, 50);
					} catch (error) {
						console.error("Error during keyboard seek:", error);
						// Fall back to regular seeking if direct manipulation fails
						audio.seekTo(time);
					}
				} else {
					// Fall back to regular seeking if we can't access element directly
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
		[audio, isCurrentTrack, isActiveSource, track, source],
	);

	// Handle seeking through timeline
	const handleSeek = useCallback(
		(time: number) => {
			console.log(`AudioPlayer handleSeek: time=${time.toFixed(2)}`);

			// Immediately update local state for visual feedback
			setLocalCurrentTime(time);

			// Only handle actual audio operations for the current track
			if (isCurrentTrack) {
				// Always ensure we have control before seeking
				if (!isActiveSource) {
					audio.transferControlTo(source);

					// Allow a moment for control transfer before seeking
					setTimeout(() => {
						// Seek without affecting play state
						audio.seekTo(time);
						setAnnouncement(`Seeked to ${formatTime(time)}`);
					}, 20);
				} else {
					// Already have control, seek directly without affecting play state
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
		[audio, isCurrentTrack, isActiveSource, track, source],
	);

	// Handle scrubbing
	const handleScrubbing = useCallback(
		(scrubbing: boolean, previewTime: number) => {
			console.log(
				`AudioPlayer handleScrubbing: scrubbing=${scrubbing}, time=${previewTime.toFixed(2)}`,
			);

			// Always update local state for responsive UI feedback
			setLocalCurrentTime(previewTime);

			// Announce scrubbing status to screen readers
			if (scrubbing) {
				setAnnouncement(`Scrubbing to ${formatTime(previewTime)}`);
			}

			// Only interact with actual audio for current track
			if (!isCurrentTrack) return;

			// Take control if needed - always do this before scrubbing operations
			if (!isActiveSource) {
				audio.transferControlTo(source);

				// Short delay to ensure transfer completes
				setTimeout(() => {
					if (scrubbing) {
						audio.startScrubbing(previewTime);
					} else {
						audio.endScrubbing(previewTime);
						setAnnouncement(
							`Set playback position to ${formatTime(previewTime)}`,
						);
					}
				}, 30);
			} else {
				// Already have control, just update scrubbing state
				if (scrubbing) {
					audio.startScrubbing(previewTime);
				} else {
					audio.endScrubbing(previewTime);
					setAnnouncement(
						`Set playback position to ${formatTime(previewTime)}`,
					);
				}
			}
		},
		[audio, isCurrentTrack, isActiveSource, source],
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
				case "ArrowRight": // Right arrow - seek forward
					e.preventDefault();
					handleKeyboardSeek(Math.min(currentTime + 5, duration));
					break;
				case "ArrowLeft": // Left arrow - seek backward
					e.preventDefault();
					handleKeyboardSeek(Math.max(currentTime - 5, 0));
					break;
				case "Home": // Home - seek to start
					e.preventDefault();
					handleKeyboardSeek(0);
					break;
				case "End": // End - seek to end
					e.preventDefault();
					handleKeyboardSeek(duration);
					break;
			}
		},
		[togglePlayPause, handleKeyboardSeek, currentTime, duration],
	);

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
						isPlaying={isPlaying}
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

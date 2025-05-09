import type { Track } from "@/types/track";
import { formatTime } from "@/utils/timeAndDate";
import PlayButton from "./playButton/PlayButton";
import * as style from "./AudioPlayer.css";
import Waveform from "./waveform/Waveform";
import TimelineSlider from "./timeline/TimelineSlider";
import { useCallback, useEffect, useRef, useState } from "react";
import { useAudio } from "@/providers/AudioProvider";

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

	// Check if this track is active
	const isCurrentTrack = audio.currentTrack?.id === track.id;
	const isPlaying = isCurrentTrack && audio.isPlaying;
	const isActiveSource = isCurrentTrack && audio.activeSource === source;

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

	// Check for track ended
	useEffect(() => {
		if (
			isCurrentTrack &&
			isActiveSource &&
			audio.currentTime >= audio.duration &&
			audio.duration > 0
		) {
			onEnded?.();
		}
	}, [
		isCurrentTrack,
		isActiveSource,
		audio.currentTime,
		audio.duration,
		onEnded,
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

	// Handle seeking through timeline
	const handleSeek = useCallback(
		(time: number) => {
			console.log(`AudioPlayer handleSeek: time=${time.toFixed(2)}`);

			// Immediately update local state for visual feedback (before any async operations)
			setLocalCurrentTime(time);

			if (isCurrentTrack) {
				// If not our source, take control first
				if (!isActiveSource) {
					console.log(
						`Taking control for seeking from ${audio.activeSource} to ${source}`,
					);

					// First update local time, then transfer control, then seek
					audio.transferControlTo(source);

					// Wait for control transfer to complete before seeking
					setTimeout(() => {
						// Direct seek after control transfer
						audio.seekTo(time);
					}, 20); // Increase timeout to ensure control transfer completes
				} else {
					// Already our source, just seek directly
					audio.seekTo(time);
				}
			} else {
				// New track - start playing and seek
				audio.playTrack(track, source);

				// Wait for track to load before seeking
				setTimeout(() => {
					audio.seekTo(time);
				}, 80);
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

			// Always update local time for responsive UI feedback
			setLocalCurrentTime(previewTime);

			if (scrubbing) {
				// Starting to scrub - IMPORTANT: This should pause actual playback without changing UI state
				if (isCurrentTrack) {
					// Make sure we have control of the audio
					if (!isActiveSource) {
						console.log(
							`Taking control for scrubbing from ${audio.activeSource} to ${source}`,
						);

						// First transfer control - this could take time
						audio.transferControlTo(source);

						// Then once we have control, start scrubbing
						setTimeout(() => {
							// Scrubbing will pause playback internally without changing UI state
							audio.startScrubbing(previewTime);
						}, 20);
					} else {
						// Already our source, just start scrubbing
						// startScrubbing will pause playback internally without changing UI state
						audio.startScrubbing(previewTime);
					}
				}
				// For non-current track, we just update the local time which was done above
			} else {
				// Ending scrub - this should resume playback if needed, based on previous state
				if (isCurrentTrack) {
					// Make sure we have control
					if (!isActiveSource) {
						console.log(
							`Regaining control at end of scrub from ${audio.activeSource} to ${source}`,
						);

						// Transfer control first
						audio.transferControlTo(source);

						// Then end scrubbing, which will handle resuming playback if needed
						setTimeout(() => {
							audio.endScrubbing(previewTime);
						}, 30);
					} else {
						// Already have control, just end scrubbing
						// endScrubbing will resume playback if it was playing before
						audio.endScrubbing(previewTime);
					}
				} else {
					// New track - loading a different track than currently playing
					console.log(`New track after scrub: ${track.title}`);

					// Load the track through the provider
					audio.playTrack(track, source);

					// Then seek to the position after track is loaded
					setTimeout(() => {
						audio.seekTo(previewTime);
					}, 80);
				}
			}
		},
		[audio, isCurrentTrack, isActiveSource, track, source],
	);

	// Calculate progress for waveform
	const currentTime = isCurrentTrack ? audio.currentTime : localCurrentTime;
	const duration = isCurrentTrack
		? audio.duration > 0
			? audio.duration
			: track.audioLength || 0
		: localDuration;
	const normalizedProgress = duration > 0 ? currentTime / duration : 0;

	return (
		<section
			className={style.audioPlayerWrapper}
			aria-label={`Audio player for ${track.title || "track"}`}
			data-active-source={isActiveSource ? "true" : "false"}
			data-is-current-track={isCurrentTrack ? "true" : "false"}
			onKeyDown={(e) => {
				// Add global keyboard shortcut for play/pause
				if (
					e.key === " " &&
					!(e.target as Element).closest('[role="slider"]')
				) {
					e.preventDefault();
					togglePlayPause();
				}
			}}
		>
			<div
				className={style.controlsWrapper}
				tabIndex={-1} // Make focusable but not in tab order
				aria-roledescription="Audio player controls"
			>
				<div className={style.playButtonWrapper}>
					<PlayButton
						className={style.playButton}
						isPlaying={isPlaying}
						onToggle={togglePlayPause}
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
					>
						<Waveform
							data={track.audioWaveformData}
							progress={normalizedProgress}
							isInteractive={false}
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

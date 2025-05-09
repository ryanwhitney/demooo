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

			// Immediately update local state for visual feedback
			setLocalCurrentTime(time);

			// Only handle actual audio operations for the current track
			if (isCurrentTrack) {
				// Always ensure we have control before seeking
				if (!isActiveSource) {
					audio.transferControlTo(source);
				}
				// Perform the seek after a very brief delay to ensure control transfer
				setTimeout(() => {
					audio.seekTo(time);
				}, 10);
			} else {
				// New track - start playing and seek
				audio.playTrack(track, source);
				setTimeout(() => {
					audio.seekTo(time);
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

			// Always update local time for responsive UI feedback
			setLocalCurrentTime(previewTime);

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
					}
				}, 20);
			} else {
				// Already have control, just update scrubbing state
				if (scrubbing) {
					audio.startScrubbing(previewTime);
				} else {
					audio.endScrubbing(previewTime);
				}
			}
		},
		[audio, isCurrentTrack, isActiveSource, source],
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

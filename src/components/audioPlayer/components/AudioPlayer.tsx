import type { Track } from "@/types/track";
import { formatTime } from "@/utils/formatTime";
import { useCallback, useEffect, useRef, useState } from "react";
import PlayButton from "./playButton/PlayButton";
import { parseWaveformData } from "./utilities/parseWaveformData";
import { calculateProgressFromPointer } from "./utilities/calculateProgressFromPointer";
import { arraySample } from "@/utils/arraySample";
import {
	audioPlayerWrapper,
	controlsWrapper,
	playButtonWrapper,
	timeDisplay,
	waveformContainer,
	waveformProgress,
	waveformProgressIndicator,
	waveformSlider,
} from "./AudioPlayer.css";

const Waveform = ({
	currentTime,
	data,
	duration,
	onTimeChange,
	onScrubbing,
}: {
	currentTime: number;
	data: number[];
	duration: number;
	onTimeChange: (newTime: number) => void;
	onScrubbing?: (isScrubbing: boolean, previewTime: number) => void;
}) => {
	const containerRef = useRef<HTMLDivElement>(null);
	const [isDragging, setIsDragging] = useState(false);
	const [displayProgress, setDisplayProgress] = useState(0);

	// Calculate current progress and update display when component props change
	useEffect(() => {
		if (!isDragging && duration > 0) {
			setDisplayProgress(currentTime / duration);
		}
	}, [currentTime, duration, isDragging]);

	// Calculate and set time based on progress value
	const updateTimeFromProgress = useCallback(
		(progress: number) => {
			if (duration <= 0) return;
			const newTime = progress * duration;
			onTimeChange(newTime);
		},
		[duration, onTimeChange],
	);

	// Direct click handler
	const handleClick = useCallback(
		(e: React.PointerEvent<HTMLDivElement>) => {
			// Skip if this was part of a drag operation that's already handled by pointerDown
			if (isDragging) return;

			const element = containerRef.current;
			if (!element) return;

			const progress = calculateProgressFromPointer(e, element);
			const newTime = progress * duration;

			// If we have a scrubbing callback, handle playback properly
			if (onScrubbing) {
				// Tell parent component we're starting a scrub operation
				onScrubbing(true, newTime);

				// Update display immediately for responsive feedback
				setDisplayProgress(progress);

				// Update the audio position
				onTimeChange(newTime);

				// Immediately end the scrub operation, which will trigger playback resume if needed
				onScrubbing(false, newTime);
			} else {
				// Simple mode - just update time
				setDisplayProgress(progress);
				onTimeChange(newTime);
			}
		},
		[duration, isDragging, onScrubbing, onTimeChange],
	);

	// Set up pointer down handler - this handles both clicks and the start of drags
	const handlePointerDown = useCallback(
		(e: React.PointerEvent<HTMLDivElement>) => {
			const element = containerRef.current;
			if (!element) return;

			// Prevent default to avoid text selection and other browser behaviors
			e.preventDefault();
			e.stopPropagation();

			// Get initial position and update time immediately for responsive feedback
			const initialProgress = calculateProgressFromPointer(e, element);
			const initialTime = initialProgress * duration;

			// Update display immediately
			setDisplayProgress(initialProgress);

			// Start the drag operation first before changing time
			setIsDragging(true);

			// Notify scrubbing start first, which will handle pausing playback if needed
			if (onScrubbing) {
				onScrubbing(true, initialTime);
			}

			// Now update the time position after scrubbing state is set
			onTimeChange(initialTime);

			// Set up document-level handlers
			const handleDocMove = (e: PointerEvent) => {
				e.preventDefault();
				if (!element) return;

				const progress = calculateProgressFromPointer(e, element);

				// Always update display immediately
				setDisplayProgress(progress);

				const newTime = progress * duration;

				// Notify of scrubbing update first, which keeps the scrubbing state active
				if (onScrubbing) {
					onScrubbing(true, newTime);
				}

				// Then update the actual audio position
				onTimeChange(newTime);
			};

			const handleDocUp = (e: PointerEvent) => {
				e.preventDefault();
				if (!element) return;

				const finalProgress = calculateProgressFromPointer(e, element);
				const finalTime = finalProgress * duration;

				// Update the display position
				setDisplayProgress(finalProgress);

				// Actually change the audio position
				onTimeChange(finalTime);

				// End dragging mode
				setIsDragging(false);

				// Finally notify scrubbing ended, which will resume playback if it was playing before
				if (onScrubbing) {
					// Small delay to make sure everything else is processed first
					setTimeout(() => {
						onScrubbing(false, finalTime);
					}, 0);
				}

				// Clean up event listeners
				document.removeEventListener("pointermove", handleDocMove);
				document.removeEventListener("pointerup", handleDocUp);
				document.removeEventListener("pointercancel", handleDocUp);
			};

			// Add document-level event listeners with passive: false to allow preventDefault
			document.addEventListener("pointermove", handleDocMove, {
				passive: false,
			});
			document.addEventListener("pointerup", handleDocUp, { passive: false });
			document.addEventListener("pointercancel", handleDocUp, {
				passive: false,
			});
		},
		[duration, onScrubbing, onTimeChange],
	);

	const progressWidth = displayProgress * 100;
	const height = 30;
	const width = 240;

	const barWidth = 1.2;
	const spacing = 3;
	let xPosition = (barWidth + spacing) * -1;

	const bars = 240 / (spacing + barWidth);
	const sampledWavelengthData = arraySample({
		array: data,
		sampleCount: Math.floor(bars),
	});

	return (
		<div
			ref={containerRef}
			onPointerDown={handlePointerDown}
			onClick={handleClick}
			onKeyDown={(e) => {
				// Handle space or enter key as a click at current position
				if (e.key === "Enter" || e.key === " ") {
					e.preventDefault();
					if (containerRef.current) {
						const centerProgress = 0.5; // Default to middle if using keyboard
						updateTimeFromProgress(centerProgress);
						setDisplayProgress(centerProgress);
					}
				}
			}}
			tabIndex={0}
			role="slider"
			aria-label="Audio timeline"
			aria-valuemin={0}
			aria-valuemax={100}
			aria-valuenow={Math.round(displayProgress * 100)}
			className={waveformSlider}
			style={{
				cursor: isDragging ? "grabbing" : "pointer",
			}}
		>
			<div
				className={waveformProgressIndicator}
				style={{
					left: `${progressWidth}%`,
					opacity: currentTime === 0 ? 0 : 100,
				}}
			/>
			<div
				className={waveformProgress}
				style={{
					width: `${progressWidth}%`,
					transition: `width ${isDragging ? "0ms" : "200ms"} ease-out`,
					opacity: progressWidth,
				}}
			/>
			<svg
				width={width}
				height={height}
				aria-hidden="true"
				viewBox={`0 0 ${width} ${height}`}
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
			>
				{sampledWavelengthData.map((amplitude, index) => {
					const barHeight = height * amplitude;

					const yPosition = (height - barHeight) / 2;
					xPosition = xPosition + barWidth + spacing;
					const uniqueKey = crypto.randomUUID();
					return (
						<rect
							key={`${index}=${amplitude}-${uniqueKey}`}
							x={xPosition}
							y={yPosition}
							width={barWidth}
							height={barHeight}
							style={{ borderRadius: 20 }}
							fill="currentColor"
							rx="0.5"
						/>
					);
				})}
			</svg>
		</div>
	);
};

interface AudioPlayerProps {
	track: Track;
	isPlaying?: boolean;
	onPlayPause?: (isPlaying: boolean) => void;
	onTimeUpdate?: (time: number) => void;
	onDurationChange?: (duration: number) => void;
	onEnded?: () => void;
}

const AudioPlayer = ({
	track,
	isPlaying: externalIsPlaying,
	onPlayPause,
	onTimeUpdate,
	onDurationChange,
	onEnded,
}: AudioPlayerProps) => {
	const [isPlaying, setIsPlaying] = useState(false);
	const [currentTime, setCurrentTime] = useState(0);
	const [duration, setDuration] = useState(0);
	const [isScrubbing, setIsScrubbing] = useState(false);
	const audioRef = useRef<HTMLAudioElement>(null);
	const wasPlayingRef = useRef(false);
	const previousTrackId = useRef<string | null>(null);

	// Reset state when track changes
	useEffect(() => {
		if (previousTrackId.current !== track.id) {
			setCurrentTime(0);
			setDuration(0);
			if (audioRef.current) {
				audioRef.current.currentTime = 0;
				if (externalIsPlaying) {
					audioRef.current.play().catch(console.error);
				}
			}
			previousTrackId.current = track.id;
		}
	}, [track.id, externalIsPlaying]);

	// Sync with external play state if provided
	useEffect(() => {
		if (externalIsPlaying !== undefined && externalIsPlaying !== isPlaying) {
			if (externalIsPlaying) {
				audioRef.current?.play().catch((error: Error) => {
					console.error("Error playing audio:", error);
					setIsPlaying(false);
					onPlayPause?.(false);
				});
			} else {
				audioRef.current?.pause();
			}
			setIsPlaying(externalIsPlaying);
		}
	}, [externalIsPlaying, isPlaying, onPlayPause]);

	// Toggle play/pause state
	const togglePlayPause = useCallback(() => {
		if (audioRef.current) {
			const newPlayingState = !isPlaying;
			if (newPlayingState) {
				audioRef.current.play().catch((error: Error) => {
					console.error("Error playing audio:", error);
					setIsPlaying(false);
					onPlayPause?.(false);
				});
			} else {
				audioRef.current.pause();
			}
			setIsPlaying(newPlayingState);
			onPlayPause?.(newPlayingState);
		}
	}, [isPlaying, onPlayPause]);

	const handleAudioEnded = useCallback(() => {
		setIsPlaying(false);
		onPlayPause?.(false);
		onEnded?.();
	}, [onPlayPause, onEnded]);

	const handleTimeUpdate = useCallback(() => {
		if (audioRef.current && !isScrubbing) {
			const newTime = audioRef.current.currentTime;
			setCurrentTime(newTime);
			onTimeUpdate?.(newTime);
		}
	}, [isScrubbing, onTimeUpdate]);

	const handleLoadedMetadata = useCallback(() => {
		if (audioRef.current) {
			const newDuration = audioRef.current.duration;
			setDuration(newDuration);
			onDurationChange?.(newDuration);
		}
	}, [onDurationChange]);

	const jumpToPosition = useCallback(
		(time: number) => {
			if (audioRef.current) {
				const boundedTime = Math.max(
					0,
					Math.min(time, audioRef.current.duration || 0),
				);
				audioRef.current.currentTime = boundedTime;
				setCurrentTime(boundedTime);
				onTimeUpdate?.(boundedTime);
			}
		},
		[onTimeUpdate],
	);

	const handleScrubbing = useCallback(
		(scrubbing: boolean, previewTime: number) => {
			if (scrubbing && !isScrubbing) {
				wasPlayingRef.current = isPlaying;
				if (isPlaying && audioRef.current) {
					audioRef.current.pause();
				}
			} else if (!scrubbing && isScrubbing) {
				if (wasPlayingRef.current && audioRef.current) {
					setIsPlaying(true);
					onPlayPause?.(true);
					audioRef.current.play().catch((err) => {
						console.error("Error resuming playback:", err);
						setIsPlaying(false);
						onPlayPause?.(false);
					});
				}
			}
			setIsScrubbing(scrubbing);
			if (scrubbing) {
				setCurrentTime(previewTime);
				onTimeUpdate?.(previewTime);
			}
		},
		[isPlaying, isScrubbing, onPlayPause, onTimeUpdate],
	);

	const audioFileUrl = track.audioFile?.startsWith("http")
		? track.audioFile
		: `http://localhost:8000/media/${track.audioFile}`;
	const waveformData = parseWaveformData(track.audioWaveformData);

	return (
		<div className={audioPlayerWrapper}>
			<div className={controlsWrapper}>
				{/* biome-ignore lint/a11y/useMediaCaption: Audio captions not required for music player */}
				<audio
					ref={audioRef}
					onTimeUpdate={handleTimeUpdate}
					onLoadedMetadata={handleLoadedMetadata}
					onEnded={handleAudioEnded}
					onPlay={() => {
						setIsPlaying(true);
						onPlayPause?.(true);
					}}
					onPause={() => {
						if (!isScrubbing) {
							setIsPlaying(false);
							onPlayPause?.(false);
						}
					}}
					src={audioFileUrl}
				/>
				<div>
					<PlayButton
						className={playButtonWrapper}
						isPlaying={isPlaying}
						onClick={togglePlayPause}
					/>
				</div>
				<div className={waveformContainer}>
					<Waveform
						currentTime={currentTime}
						data={waveformData}
						duration={duration}
						onTimeChange={jumpToPosition}
						onScrubbing={handleScrubbing}
					/>
				</div>
			</div>
			<span className={timeDisplay}>
				{formatTime(currentTime)} / {formatTime(duration)}
			</span>
		</div>
	);
};

export default AudioPlayer;

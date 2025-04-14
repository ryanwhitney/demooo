import { tokens } from "@/styles/tokens";
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
	console.log("BARSLENGTH", sampledWavelengthData.length);

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
					return (
						<rect
							key={index * amplitude}
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

const AudioPlayer = ({ track }: { track: Track }) => {
	const [isPlaying, setIsPlaying] = useState(false);
	const [currentTime, setCurrentTime] = useState(0);
	const [duration, setDuration] = useState(0);
	const [isScrubbing, setIsScrubbing] = useState(false);
	const audioRef = useRef<HTMLAudioElement>(null);
	const wasPlayingRef = useRef(false);

	// Toggle play/pause state
	const togglePlayPause = useCallback(() => {
		if (audioRef.current) {
			if (isPlaying) {
				audioRef.current.pause();
			} else {
				audioRef.current.play().catch((error: Error) => {
					console.error("Error playing audio:", error);
				});
			}
			setIsPlaying(!isPlaying);
		}
	}, [isPlaying]);

	// Update button state when audio naturally ends
	const handleAudioEnded = useCallback(() => {
		setIsPlaying(false);
	}, []);

	// Handle time updates from the audio element
	const handleTimeUpdate = useCallback(() => {
		if (audioRef.current && !isScrubbing) {
			setCurrentTime(audioRef.current.currentTime);
		}
	}, [isScrubbing]);

	// Set duration when metadata is loaded
	const handleLoadedMetadata = useCallback(() => {
		if (audioRef.current) {
			setDuration(audioRef.current.duration);
		}
	}, []);

	// Jump to a specific time position
	const jumpToPosition = useCallback((time: number) => {
		if (audioRef.current) {
			// Ensure time is within bounds
			const boundedTime = Math.max(
				0,
				Math.min(time, audioRef.current.duration || 0),
			);

			// Set the audio element's current time directly
			audioRef.current.currentTime = boundedTime;

			// Also update the state for the UI
			setCurrentTime(boundedTime);
		}
	}, []);

	// Handle scrubbing state to prevent time updates during scrubbing
	const handleScrubbing = useCallback(
		(scrubbing: boolean, previewTime: number) => {
			if (scrubbing && !isScrubbing) {
				// Remember if we were playing before scrubbing started
				wasPlayingRef.current = isPlaying;

				// Quietly pause audio during scrubbing (no icon update)
				if (isPlaying && audioRef.current) {
					audioRef.current.pause();
				}
			}
			// If ending scrub and was playing, resume playback
			else if (!scrubbing && isScrubbing) {
				if (wasPlayingRef.current && audioRef.current) {
					// Need to directly update the isPlaying state BEFORE calling play()
					// to prevent race conditions with the onPause handler
					setIsPlaying(true);

					audioRef.current.play().catch((err) => {
						console.error("Error resuming playback:", err);
						// Reset the playing state if play fails
						setIsPlaying(false);
					});
				}
			}

			setIsScrubbing(scrubbing);

			// Update visual time during scrubbing
			if (scrubbing) {
				setCurrentTime(previewTime);
			}
		},
		[isPlaying, isScrubbing],
	);

	const audioFileUrl = track.audioFile?.startsWith("http")
		? track.audioFile
		: `http://localhost:8000/media/${track.audioFile}`;
	const waveformData = parseWaveformData(track.audioWaveformData);

	return (
		<div className={audioPlayerWrapper}>
			<div className={controlsWrapper}>
				<audio
					ref={audioRef}
					onTimeUpdate={handleTimeUpdate}
					onLoadedMetadata={handleLoadedMetadata}
					onEnded={handleAudioEnded}
					onPlay={() => setIsPlaying(true)}
					onPause={() => {
						// Only update the playing state if we're not in a scrubbing operation
						// This prevents the onPause event from changing the play button state during scrubbing
						if (!isScrubbing) {
							setIsPlaying(false);
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

import type { Track } from "@/types/track";
import { formatTime } from "@/utils/timeAndDate";
import { useCallback, useEffect, useRef, useState } from "react";
import PlayButton from "./playButton/PlayButton";
import { parseWaveformData } from "./utilities/parseWaveformData";
import { calculateProgressFromPointer } from "./utilities/calculateProgressFromPointer";
import { arraySample } from "@/utils/arraySample";
import * as style from "./AudioPlayer.css";

const Waveform = ({
	currentTime,
	data,
	duration,
	onTimeChange,
	onScrubbing,
	isPlaying,
}: {
	currentTime: number;
	data: number[];
	duration: number;
	onTimeChange: (newTime: number) => void;
	onScrubbing?: (isScrubbing: boolean, previewTime: number) => void;
	isPlaying: boolean;
}) => {
	const containerRef = useRef<HTMLDivElement>(null);
	const [isDragging, setIsDragging] = useState(false);
	const [displayProgress, setDisplayProgress] = useState(0);
	const [isInteracting, setIsInteracting] = useState(false);

	// Animation frame implementation details
	const rafRef = useRef<number | null>(null);
	const lastFrameTimeRef = useRef<number>(0);
	const audioTimeRef = useRef<number>(currentTime);

	// Always keep audioTimeRef updated with latest currentTime
	useEffect(() => {
		audioTimeRef.current = currentTime;
	}, [currentTime]);

	// Simpler animation approach:
	// 1. We use a single effect to manage animation
	// 2. Animation is based on the real time elapsed since last frame
	// 3. We always show the most accurate position possible

	useEffect(() => {
		// Function to update display based on current state
		const updateDisplay = () => {
			// If dragging or interacting, don't update from animation
			if (isDragging || isInteracting) return;

			if (duration <= 0) {
				setDisplayProgress(0);
				return;
			}

			// Calculate progress (0-1)
			const progress = Math.min(
				Math.max(audioTimeRef.current / duration, 0),
				1,
			);
			setDisplayProgress(progress);
		};

		// Call once immediately to update display
		updateDisplay();

		// Set up animation loop if playing
		if (isPlaying && !isDragging && !isInteracting && duration > 0) {
			const animate = (timestamp: number) => {
				// First frame or after pause, initialize lastFrameTime
				if (lastFrameTimeRef.current === 0) {
					lastFrameTimeRef.current = timestamp;
				}

				// Calculate time elapsed since last frame in seconds
				const elapsed = (timestamp - lastFrameTimeRef.current) / 1000;
				lastFrameTimeRef.current = timestamp;

				// Add elapsed time to our internal audio position counter
				// This gives us a smooth position between real audio updates
				if (elapsed > 0 && elapsed < 0.1) {
					// Ignore large jumps (tab switches, etc)
					audioTimeRef.current = Math.min(
						audioTimeRef.current + elapsed,
						duration,
					);
				}

				// Update display based on calculated position
				updateDisplay();

				// Continue animation loop
				rafRef.current = requestAnimationFrame(animate);
			};

			// Start animation
			rafRef.current = requestAnimationFrame(animate);
		} else {
			// If not playing, reset animation state
			lastFrameTimeRef.current = 0;
		}

		// Cleanup function
		return () => {
			if (rafRef.current !== null) {
				cancelAnimationFrame(rafRef.current);
				rafRef.current = null;
			}
		};
	}, [isPlaying, isDragging, isInteracting, duration]);

	// Calculate and set time based on progress value
	const updateTimeFromProgress = useCallback(
		(progress: number) => {
			if (duration <= 0) return;

			// Clamp progress between 0 and 1
			const clampedProgress = Math.max(0, Math.min(1, progress));
			const newTime = clampedProgress * duration;

			// Set interacting flag to prevent visual flickering during interaction
			setIsInteracting(true);

			// Update audio position
			onTimeChange(newTime);

			// Clear interacting flag after a short delay
			setTimeout(() => {
				setIsInteracting(false);
			}, 50);
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
				// Set interacting flag to prevent visual flickering
				setIsInteracting(true);

				// Tell parent component we're starting a scrub operation
				onScrubbing(true, newTime);

				// Update display immediately for responsive feedback
				setDisplayProgress(progress);

				// Update the audio position
				onTimeChange(newTime);

				// Immediately end the scrub operation, which will trigger playback resume if needed
				setTimeout(() => {
					onScrubbing(false, newTime);

					// Clear interacting flag after a short delay
					setTimeout(() => {
						setIsInteracting(false);
					}, 50);
				}, 10);
			} else {
				// Simple mode - just update time
				setDisplayProgress(progress);
				updateTimeFromProgress(progress);
			}
		},
		[duration, isDragging, onScrubbing, onTimeChange, updateTimeFromProgress],
	);

	// Set up pointer down handler - this handles both clicks and the start of drags
	const handlePointerDown = useCallback(
		(e: React.PointerEvent<HTMLDivElement>) => {
			const element = containerRef.current;
			if (!element) return;

			// Prevent default to avoid text selection and other browser behaviors
			e.preventDefault();
			e.stopPropagation();

			// Set interacting flag to prevent visual flickering
			setIsInteracting(true);

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
				e.stopPropagation();

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
				e.stopPropagation();

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
					}, 50);
				}

				// Clear interacting flag after a short delay
				setTimeout(() => {
					setIsInteracting(false);
				}, 200);

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
			className={style.waveformSlider}
			style={{
				cursor: isDragging ? "grabbing" : "pointer",
			}}
		>
			<div
				className={style.waveformProgressIndicator}
				style={{
					left: `${progressWidth}%`,
					opacity: currentTime === 0 ? 0 : 1,
					transition: "opacity 0ms linear",
				}}
			/>
			<div
				className={style.waveformProgress}
				style={{
					width: `${progressWidth}%`,
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
	const [isLoaded, setIsLoaded] = useState(false);
	const audioRef = useRef<HTMLAudioElement>(null);
	const wasPlayingRef = useRef(false);
	const previousTrackId = useRef<string | null>(null);
	const pendingSeekTimeRef = useRef<number | null>(null);

	// Reset state when track changes
	useEffect(() => {
		if (previousTrackId.current !== track.id) {
			setCurrentTime(0);
			setDuration(0);
			setIsLoaded(false);

			// Reset all internal state on track change
			pendingSeekTimeRef.current = null;
			setIsScrubbing(false);
			wasPlayingRef.current = false;

			if (audioRef.current) {
				// Ensure we reset the audio element completely
				audioRef.current.pause();
				audioRef.current.currentTime = 0;

				// Chrome sometimes needs a small delay before trying to play a new track
				setTimeout(() => {
					if (externalIsPlaying && audioRef.current) {
						audioRef.current.play().catch((error) => {
							console.error("Error playing new track:", error);
							setIsPlaying(false);
							onPlayPause?.(false);
						});
					}
				}, 50);
			}
			previousTrackId.current = track.id;
		}
	}, [track.id, externalIsPlaying, onPlayPause]);

	// Sync with external play state if provided
	useEffect(() => {
		if (externalIsPlaying !== undefined && externalIsPlaying !== isPlaying) {
			if (externalIsPlaying) {
				if (audioRef.current && isLoaded) {
					audioRef.current.play().catch((error: Error) => {
						console.error("Error playing audio:", error);
						setIsPlaying(false);
						onPlayPause?.(false);
					});
				}
			} else {
				if (audioRef.current) {
					audioRef.current.pause();
				}
			}
			setIsPlaying(externalIsPlaying);
		}
	}, [externalIsPlaying, isPlaying, onPlayPause, isLoaded]);

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
		// Update time from audio element
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
			setIsLoaded(true);
			onDurationChange?.(newDuration);

			// If there's a pending seek time from before metadata was loaded, apply it now
			if (pendingSeekTimeRef.current !== null) {
				const pendingTime = pendingSeekTimeRef.current;
				pendingSeekTimeRef.current = null;

				const boundedTime = Math.max(
					0,
					Math.min(pendingTime, audioRef.current.duration || 0),
				);
				audioRef.current.currentTime = boundedTime;
				setCurrentTime(boundedTime);
				onTimeUpdate?.(boundedTime);
			}
		}
	}, [onDurationChange, onTimeUpdate]);

	const jumpToPosition = useCallback(
		(time: number) => {
			if (!audioRef.current) return;

			// Check if the audio element is ready for seeking
			if (!isLoaded || audioRef.current.readyState < 1) {
				// Save the requested time to apply once loaded
				pendingSeekTimeRef.current = time;
				return;
			}

			// Proceed with seeking now that we know the audio is ready
			const boundedTime = Math.max(
				0,
				Math.min(time, audioRef.current.duration || 0),
			);

			try {
				// Set the audio element time
				audioRef.current.currentTime = boundedTime;

				// Update state
				setCurrentTime(boundedTime);
				onTimeUpdate?.(boundedTime);
			} catch (error) {
				console.error("Error seeking audio:", error);
				// Store for later if seeking fails
				pendingSeekTimeRef.current = time;
			}
		},
		[isLoaded, onTimeUpdate],
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
		<div className={style.audioPlayerWrapper}>
			<div className={style.controlsWrapper}>
				{/* biome-ignore lint/a11y/useMediaCaption: Audio captions not required for music player */}
				<audio
					ref={audioRef}
					onTimeUpdate={handleTimeUpdate}
					onLoadedMetadata={handleLoadedMetadata}
					onLoadedData={() => setIsLoaded(true)}
					onCanPlay={() => setIsLoaded(true)}
					onEnded={handleAudioEnded}
					onError={(e) => {
						console.error("Audio error:", e);
						setIsPlaying(false);
						onPlayPause?.(false);
					}}
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
					preload="auto"
					src={audioFileUrl}
				/>
				<div className={style.playButtonWrapper}>
					<PlayButton
						className={style.playButton}
						isPlaying={isPlaying}
						onToggle={togglePlayPause}
					/>
				</div>
				<div className={style.waveformContainer}>
					<Waveform
						currentTime={currentTime}
						data={waveformData}
						duration={duration}
						onTimeChange={jumpToPosition}
						onScrubbing={handleScrubbing}
						isPlaying={isPlaying}
					/>
				</div>
			</div>
			<span className={style.timeDisplay}>
				{formatTime(currentTime)} / {formatTime(duration)}
			</span>
		</div>
	);
};

export default AudioPlayer;

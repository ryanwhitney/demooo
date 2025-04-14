import { tokens } from "@/styles/tokens";
import type { Track } from "@/types/track";
import { formatTime } from "@/utils/formatTime";
import { useCallback, useEffect, useRef, useState } from "react";
import PlayButton from "./playButton/PlayButton";
import { parseWaveformData } from "./utilities/parseWaveformData";
import { calculateProgressFromPointer } from "./utilities/calculateProgressFromPointer";

const Waveform = ({
	data,
	currentTime,
	duration,
	onTimeChange,
	onScrubbing,
}: {
	data: number[];
	currentTime: number;
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
			const element = containerRef.current;
			if (!element) return;

			const progress = calculateProgressFromPointer(e, element);

			// Update time directly - this is important for click behavior
			updateTimeFromProgress(progress);
			setDisplayProgress(progress);

			console.log("Click - progress:", progress, "time:", progress * duration);
		},
		[duration, updateTimeFromProgress],
	);

	// Start drag operation
	const startDrag = useCallback(
		(e: React.PointerEvent | PointerEvent) => {
			e.preventDefault();
			e.stopPropagation();

			const element = containerRef.current;
			if (!element) return;

			setIsDragging(true);
			if (onScrubbing) onScrubbing(true, currentTime);

			// For initial drag, we also want to instantly update the time
			const progress = calculateProgressFromPointer(e, element);
			setDisplayProgress(progress);
			updateTimeFromProgress(progress);
		},
		[currentTime, onScrubbing, updateTimeFromProgress],
	);

	// Continue drag operation
	const continueDrag = useCallback(
		(e: PointerEvent) => {
			e.preventDefault();

			if (!isDragging || !containerRef.current) return;

			const progress = calculateProgressFromPointer(e, containerRef.current);
			setDisplayProgress(progress);

			// Preview time during drag
			if (onScrubbing) {
				const previewTime = progress * duration;
				onScrubbing(true, previewTime);
			}
		},
		[duration, isDragging, onScrubbing],
	);

	// End drag operation
	const endDrag = useCallback(
		(e: PointerEvent) => {
			e.preventDefault();

			if (!isDragging || !containerRef.current) return;

			const progress = calculateProgressFromPointer(e, containerRef.current);
			setDisplayProgress(progress);
			updateTimeFromProgress(progress);
			setIsDragging(false);

			if (onScrubbing) onScrubbing(false, progress * duration);

			console.log(
				"Drag end - progress:",
				progress,
				"time:",
				progress * duration,
			);
		},
		[duration, isDragging, onScrubbing, updateTimeFromProgress],
	);

	// Set up pointer down handler
	const handlePointerDown = useCallback(
		(e: React.PointerEvent<HTMLDivElement>) => {
			// If it's a simple click (not a drag), handle it directly
			const element = containerRef.current;
			if (!element) return;

			// Start drag operation
			startDrag(e);

			// Set up document-level handlers
			const handleDocMove = (e: PointerEvent) => continueDrag(e);
			const handleDocUp = (e: PointerEvent) => {
				endDrag(e);
				// Clean up event listeners
				document.removeEventListener("pointermove", handleDocMove);
				document.removeEventListener("pointerup", handleDocUp);
				document.removeEventListener("pointercancel", handleDocUp);
			};

			// Add temporary document-level event listeners
			document.addEventListener("pointermove", handleDocMove, {
				passive: false,
			});
			document.addEventListener("pointerup", handleDocUp, { passive: false });
			document.addEventListener("pointercancel", handleDocUp, {
				passive: false,
			});
		},
		[continueDrag, endDrag, startDrag],
	);

	const progressWidth = displayProgress * 100;
	const height = 30;
	const width = 240;

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
			style={{
				position: "relative",
				height: height,
				width: width,
				cursor: isDragging ? "grabbing" : "pointer",
				touchAction: "none", // Prevent browser handling of touch events
			}}
		>
			<div
				style={{
					width: 2.5,
					position: "absolute",
					left: `${progressWidth}%`,
					top: -4,
					bottom: -4,
					transition: `width ${isDragging ? "0ms" : "200ms"} ease-out`,
					background: tokens.colors.focusRing,
					borderRadius: 2,
					opacity: `${progressWidth * 0.05}`,
				}}
			/>
			<div
				style={{
					width: `${progressWidth}%`,
					position: "absolute",
					left: 0,
					top: 0,
					bottom: 0,
					transition: `width ${isDragging ? "0ms" : "200ms"} ease-out`,
					background: `linear-gradient(90deg, ${tokens.colors.backgroundSecondary}, rgba(0,0,0,0.2))`,
					color: "white",
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
				{data.map((amplitude, index) => {
					const barHeight = height * amplitude;
					const spacing = 3;
					const yPosition = (height - barHeight) / 2;
					const xPosition = index * spacing;
					return (
						<rect
							key={index * amplitude}
							x={xPosition}
							y={yPosition}
							width={1.2}
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
			setIsScrubbing(scrubbing);
			if (scrubbing) {
				// Update UI time without changing audio position during scrubbing
				setCurrentTime(previewTime);
			}
		},
		[],
	);

	const audioFileUrl = track.audioFile?.startsWith("http")
		? track.audioFile
		: `http://localhost:8000/media/${track.audioFile}`;
	const waveformData = parseWaveformData(track.audioWaveformData);

	return (
		<div
			style={{
				width: "fit-content",
				display: "flex",
				flexDirection: "column",
			}}
		>
			<div
				style={{
					display: "flex",
					gap: tokens.space.md,
					alignItems: "center",
				}}
			>
				{/* biome-ignore lint/a11y/useMediaCaption: <explanation> */}
				<audio
					ref={audioRef}
					onTimeUpdate={handleTimeUpdate}
					onLoadedMetadata={handleLoadedMetadata}
					onEnded={handleAudioEnded}
					onPlay={() => setIsPlaying(true)}
					onPause={() => setIsPlaying(false)}
					src={audioFileUrl}
				/>
				<PlayButton isPlaying={isPlaying} onClick={togglePlayPause} />
				<div
					style={{
						background: tokens.colors.backgroundSecondary,
						padding: "6px 14px",
						borderRadius: tokens.radii.lg,
					}}
				>
					<Waveform
						data={waveformData}
						currentTime={currentTime}
						duration={duration}
						onTimeChange={jumpToPosition}
						onScrubbing={handleScrubbing}
					/>
				</div>
			</div>
			<span
				style={{
					color: tokens.colors.secondary,
					fontSize: tokens.fontSizes.xs,
					alignSelf: "flex-end",
					paddingTop: tokens.space.sm,
				}}
			>
				{formatTime(currentTime)} / {formatTime(duration)}
			</span>
		</div>
	);
};

export default AudioPlayer;

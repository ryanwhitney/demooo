import { tokens } from "@/styles/tokens";
import type { Track } from "@/types/track";
import { formatTime } from "@/utils/formatTime";
import { useCallback, useEffect, useRef, useState } from "react";
import PlayButton from "./playButton/PlayButton";
import { parseWaveformData } from "./parseWaveformData";

// Generic utilities for drag interactions
type PointerPosition = { clientX: number; clientY: number };

// Utility to calculate progress from pointer position
const calculateProgressFromPointer = (
	pointerEvent: PointerPosition,
	containerElement: HTMLElement,
): number => {
	const rect = containerElement.getBoundingClientRect();
	let positionX = pointerEvent.clientX - rect.left;

	// Constrain to bounds (0-100%)
	positionX = Math.max(0, Math.min(positionX, rect.width));

	// Calculate percentage
	return positionX / rect.width;
};

// Hook for managing drag interactions
const useDragProgress = (
	initialProgress: number,
	onProgressChange: (progress: number) => void,
	onProgressCommit: (progress: number) => void,
) => {
	const [isDragging, setIsDragging] = useState(false);
	const [progress, setProgress] = useState(initialProgress);

	// Update internal progress when external value changes (if not dragging)
	useEffect(() => {
		if (!isDragging) {
			setProgress(initialProgress);
		}
	}, [initialProgress, isDragging]);

	const handleDragStart = useCallback(
		(pointerEvent: PointerPosition, element: HTMLElement) => {
			setIsDragging(true);
			const newProgress = calculateProgressFromPointer(pointerEvent, element);
			setProgress(newProgress);
			onProgressChange(newProgress);
		},
		[onProgressChange],
	);

	const handleDragMove = useCallback(
		(pointerEvent: PointerPosition, element: HTMLElement) => {
			if (isDragging) {
				const newProgress = calculateProgressFromPointer(pointerEvent, element);
				setProgress(newProgress);
				onProgressChange(newProgress);
			}
		},
		[isDragging, onProgressChange],
	);

	const handleDragEnd = useCallback(() => {
		if (isDragging) {
			setIsDragging(false);
			onProgressCommit(progress);
		}
	}, [isDragging, onProgressCommit, progress]);

	return {
		isDragging,
		progress,
		handleDragStart,
		handleDragMove,
		handleDragEnd,
	};
};

// The enhanced Waveform component with both mouse and touch support
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
	const currentProgress = currentTime / duration;

	const height = 30;
	const width = 200;

	// Handler for progress changes during drag
	const handleProgressChange = useCallback(
		(newProgress: number) => {
			const previewTime = newProgress * duration;
			onScrubbing?.(true, previewTime);
		},
		[duration, onScrubbing],
	);

	// Handler for final progress commit
	const handleProgressCommit = useCallback(
		(finalProgress: number) => {
			const newTime = finalProgress * duration;
			onTimeChange(newTime);
			onScrubbing?.(false, newTime);
		},
		[duration, onTimeChange, onScrubbing],
	);

	// Use our custom hook for drag state management
	const {
		isDragging,
		progress: displayProgress,
		handleDragStart,
		handleDragMove,
		handleDragEnd,
	} = useDragProgress(
		currentProgress,
		handleProgressChange,
		handleProgressCommit,
	);

	const progressWidth = displayProgress * 100;

	// Setup event handlers for both mouse and touch
	useEffect(() => {
		const element = containerRef.current;
		if (!element) return;

		const handlePointerDown = (e: PointerEvent) => {
			e.preventDefault();

			// Capture the pointer to ensure all events go to this element
			element.setPointerCapture(e.pointerId);

			handleDragStart(e, element);
		};

		const handlePointerMove = (e: PointerEvent) => {
			handleDragMove(e, element);
		};

		const handlePointerUp = (e: PointerEvent) => {
			// Release the pointer capture
			if (element.hasPointerCapture(e.pointerId)) {
				element.releasePointerCapture(e.pointerId);
			}

			handleDragEnd();
		};

		const handlePointerCancel = (e: PointerEvent) => {
			// Handle cases where interaction is cancelled (e.g. user switches apps)
			if (element.hasPointerCapture(e.pointerId)) {
				element.releasePointerCapture(e.pointerId);
			}

			handleDragEnd();
		};

		// Add event listeners
		element.addEventListener("pointerdown", handlePointerDown);
		element.addEventListener("pointermove", handlePointerMove);
		element.addEventListener("pointerup", handlePointerUp);
		element.addEventListener("pointercancel", handlePointerCancel);
		// Adding pointer leave/out to handle edge cases
		element.addEventListener("pointerleave", handlePointerCancel);

		// Clean up
		return () => {
			element.removeEventListener("pointerdown", handlePointerDown);
			element.removeEventListener("pointermove", handlePointerMove);
			element.removeEventListener("pointerup", handlePointerUp);
			element.removeEventListener("pointercancel", handlePointerCancel);
			element.removeEventListener("pointerleave", handlePointerCancel);
		};
	}, [handleDragStart, handleDragMove, handleDragEnd]);

	console.log(data);
	return (
		<div
			ref={containerRef}
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
					position: "absolute",
					left: 0,
					top: 0,
					bottom: 0,
					right: 0,
				}}
			/>
			<div
				style={{
					width: `${progressWidth}%`,
					position: "absolute",
					left: 0,
					top: 0,
					bottom: 0,
					backgroundColor: tokens.colors.backgroundSecondary,
					opacity: 0.7,
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
							key={index}
							x={xPosition}
							y={yPosition}
							width={1.2}
							height={barHeight}
							style={{ borderRadius: 20 }}
							fill="#D9D9D9"
						/>
					);
				})}
			</svg>
		</div>
	);
};

const AudioPlayer = ({ track }: { track: Track }) => {
	console.log(track);
	const [isPlaying, setIsPlaying] = useState(false);
	const [currentTime, setCurrentTime] = useState(0);
	const [duration, setDuration] = useState(0);
	const audioRef = useRef(null);

	const togglePlayPause = () => {
		if (audioRef.current) {
			if (isPlaying) {
				audioRef.current.pause();
			} else {
				audioRef.current.play().catch((error) => {
					console.error("Error playing audio:", error);
				});
			}
			setIsPlaying(!isPlaying);
		}
	};

	// Update button state when audio naturally ends
	const handleAudioEnded = () => {
		setIsPlaying(false);
	};

	const handleTimeUpdate = () => {
		if (audioRef.current) {
			setCurrentTime(audioRef.current.currentTime);
		}
	};

	const handleLoadedMetadata = () => {
		if (audioRef.current) {
			setDuration(audioRef.current.duration);
		}
	};

	const jumpToPosition = (time: number) => {
		console.log("waveclick");
		if (audioRef.current) {
			console.log("we have it");
			audioRef.current.currentTime = time; // Set to your fixed time
			setCurrentTime(time); // Also update the state
		}
	};
	console.log("audio file", track.audioFile);
	const audioFileUrl = track.audioFile?.startsWith("http")
		? track.audioFile
		: `http://localhost:8000/media/${track.audioFile}`;

	console.log(track.audioWaveformData);
	console.log(JSON.stringify(track.audioWaveformData));
	const waveformData = parseWaveformData(track.audioWaveformData);
	console.log("parsed:", waveformData);
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
						onTimeChange={(time) => jumpToPosition(time)}
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

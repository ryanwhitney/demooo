import { useCallback, useEffect, useRef, useState } from "react";
import * as style from "../AudioPlayer.css";
import { formatTime } from "@/utils/timeAndDate";

interface TimelineSliderProps {
	children: React.ReactNode;
	currentTime: number;
	duration: number;
	isPlaying: boolean;
	isScrubbing?: boolean;
	onTimeChange: (newTime: number) => void;
	onScrubbing?: (isScrubbing: boolean, previewTime: number) => void;
	className?: string;
}

/**
 * Simplified timeline slider with clean user interaction pattern
 */
const TimelineSlider = ({
	children,
	currentTime,
	duration,
	isPlaying,
	isScrubbing = false,
	onTimeChange,
	onScrubbing,
	className = "",
}: TimelineSliderProps) => {
	const containerRef = useRef<HTMLDivElement>(null);
	const [userProgress, setUserProgress] = useState<number | null>(null);
	const interactionTimeoutRef = useRef<number | null>(null);
	const isUserInteractingRef = useRef(false);
	const lastUserInteractionTimeRef = useRef(0);

	// Set the minimum time between system updates after user interaction (ms)
	const USER_INTERACTION_COOLDOWN = 350;

	// Calculate progress (0-1) from time
	const calculateProgress = (time: number): number => {
		if (duration <= 0) return 0;
		return Math.min(Math.max(time / duration, 0), 1);
	};

	// Get the effective progress to display
	const getDisplayProgress = () => {
		// User interaction or scrubbing takes precedence over system time
		if (userProgress !== null || isScrubbing) {
			return userProgress !== null
				? userProgress
				: calculateProgress(currentTime);
		}

		// If we had a recent user interaction, don't let system updates change position too quickly
		if (
			Date.now() - lastUserInteractionTimeRef.current <
			USER_INTERACTION_COOLDOWN
		) {
			// Use previous render value (userProgress) if available, otherwise system time
			return userProgress !== null
				? userProgress
				: calculateProgress(currentTime);
		}

		// Fall back to system time if no user interaction
		return calculateProgress(currentTime);
	};

	// Clear user interaction state after a delay
	const clearUserInteraction = useCallback(() => {
		if (interactionTimeoutRef.current) {
			clearTimeout(interactionTimeoutRef.current);
			interactionTimeoutRef.current = null;
		}

		setUserProgress(null);
		isUserInteractingRef.current = false;
		// Don't reset lastUserInteractionTime here - that needs to persist longer
	}, []);

	// Set a temporary user interaction state
	const setTemporaryUserProgress = useCallback(
		(progress: number) => {
			// Set user progress and mark as interacting
			setUserProgress(progress);
			isUserInteractingRef.current = true;
			lastUserInteractionTimeRef.current = Date.now();

			// Clear after a delay to allow the system to catch up
			if (interactionTimeoutRef.current) {
				clearTimeout(interactionTimeoutRef.current);
			}

			interactionTimeoutRef.current = window.setTimeout(() => {
				clearUserInteraction();
			}, 500);
		},
		[clearUserInteraction],
	);

	// Clean up on unmount
	useEffect(() => {
		return () => {
			if (interactionTimeoutRef.current) {
				clearTimeout(interactionTimeoutRef.current);
			}
		};
	}, []);

	// Click handler for direct seeking
	const handleClick = useCallback(
		(e: React.MouseEvent<HTMLDivElement>) => {
			const element = containerRef.current;
			if (!element || duration <= 0) return;

			// Prevent default browser actions
			e.preventDefault();
			e.stopPropagation();

			// Calculate position as 0-1 progress
			const rect = element.getBoundingClientRect();
			const relativeX = Math.max(
				0,
				Math.min(e.clientX - rect.left, rect.width),
			);
			const progress = relativeX / rect.width;
			const newTime = progress * duration;

			// Update UI immediately and mark user interaction time
			setTemporaryUserProgress(progress);
			lastUserInteractionTimeRef.current = Date.now();

			// Use scrub pattern for clicks to ensure consistent behavior
			if (onScrubbing) {
				// Pause playback through scrub start
				onScrubbing(true, newTime);

				// Then immediately end scrub to set the position
				setTimeout(() => {
					onScrubbing(false, newTime);
				}, 50);
			} else {
				// Direct time change if no scrubbing support
				onTimeChange(newTime);
			}
		},
		[duration, onTimeChange, onScrubbing, setTemporaryUserProgress],
	);

	// Handle pointer-based scrubbing
	const handlePointerDown = useCallback(
		(e: React.PointerEvent<HTMLDivElement>) => {
			// Only handle left-clicks
			if (e.button !== 0) return;

			const element = containerRef.current;
			if (!element || duration <= 0) return;

			// Prevent text selection
			e.preventDefault();
			e.stopPropagation();

			// Calculate initial position
			const rect = element.getBoundingClientRect();
			const relativeX = Math.max(
				0,
				Math.min(e.clientX - rect.left, rect.width),
			);
			const initialProgress = relativeX / rect.width;
			const initialTime = initialProgress * duration;

			// Show user interaction immediately and update interaction time
			setUserProgress(initialProgress);
			isUserInteractingRef.current = true;
			lastUserInteractionTimeRef.current = Date.now();

			// Start scrubbing
			if (onScrubbing) {
				onScrubbing(true, initialTime);
			}

			// Handle pointer movements
			const handlePointerMove = (e: PointerEvent) => {
				e.preventDefault();
				e.stopPropagation();

				const rect = element.getBoundingClientRect();
				const relativeX = Math.max(
					0,
					Math.min(e.clientX - rect.left, rect.width),
				);
				const progress = relativeX / rect.width;
				const time = progress * duration;

				// Update UI immediately and update interaction time
				setUserProgress(progress);
				lastUserInteractionTimeRef.current = Date.now();

				// Send event to update audio time for preview
				if (onScrubbing) {
					onScrubbing(true, time);
				}
			};

			// Handle the end of scrubbing
			const handlePointerUp = (e: PointerEvent) => {
				e.preventDefault();
				e.stopPropagation();

				// Calculate final position
				const rect = element.getBoundingClientRect();
				const relativeX = Math.max(
					0,
					Math.min(e.clientX - rect.left, rect.width),
				);
				const finalProgress = relativeX / rect.width;
				const finalTime = finalProgress * duration;

				// Update interaction time
				lastUserInteractionTimeRef.current = Date.now();

				// End scrubbing
				if (onScrubbing) {
					onScrubbing(false, finalTime);
				} else {
					onTimeChange(finalTime);
				}

				// Keep showing user's selection briefly
				setTemporaryUserProgress(finalProgress);

				// Clean up event listeners
				document.removeEventListener("pointermove", handlePointerMove);
				document.removeEventListener("pointerup", handlePointerUp);
				document.removeEventListener("pointercancel", handlePointerUp);
			};

			// Add document-level listeners for drag operations
			document.addEventListener("pointermove", handlePointerMove);
			document.addEventListener("pointerup", handlePointerUp);
			document.addEventListener("pointercancel", handlePointerUp);
		},
		[duration, onScrubbing, onTimeChange, setTemporaryUserProgress],
	);

	// Get the current display progress
	const displayProgress = getDisplayProgress();
	const displayTime = displayProgress * duration;

	return (
		<div
			ref={containerRef}
			className={`${style.timelineSlider} ${className}`}
			onClick={handleClick}
			onPointerDown={handlePointerDown}
			onKeyDown={(e) => {
				if (e.key === " " || e.key === "Enter") {
					e.preventDefault();
					// Space or Enter to seek to clicked position
					if (containerRef.current && duration > 0) {
						const width = containerRef.current.clientWidth;
						const seekPos = width / 2; // Seek to middle when using keyboard
						const progress = seekPos / width;
						const newTime = progress * duration;
						onTimeChange(newTime);
					}
				} else if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
					e.preventDefault();
					// Arrow keys for 5 second jumps
					const jumpAmount = e.key === "ArrowLeft" ? -5 : 5;
					const newTime = Math.max(
						0,
						Math.min(duration, currentTime + jumpAmount),
					);
					onTimeChange(newTime);
				}
			}}
			role="slider"
			aria-valuemin={0}
			aria-valuemax={duration || 100}
			aria-valuenow={displayTime}
			aria-valuetext={formatTime(displayTime)}
			aria-label="Audio timeline"
			tabIndex={0}
			style={{ position: "relative" }}
		>
			{/* Playhead indicator */}
			{displayProgress > 0 && (
				<div
					className={style.playheadIndicator}
					style={{ left: `${displayProgress * 100}%` }}
				/>
			)}

			{/* Progress for child waveform */}
			<div
				style={
					{
						"--progress": displayProgress,
						position: "relative",
						width: "100%",
						height: "100%",
					} as React.CSSProperties
				}
			>
				{children}
			</div>
		</div>
	);
};

export default TimelineSlider;

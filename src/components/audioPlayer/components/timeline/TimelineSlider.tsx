import { useCallback, useEffect, useRef, useState } from "react";
import * as style from "../AudioPlayer.css";
import { formatTime } from "@/utils/timeAndDate";

interface TimelineSliderProps {
	children: React.ReactNode;
	currentTime: number;
	duration: number;
	isPlaying: boolean;
	onTimeChange: (newTime: number) => void;
	onScrubbing?: (isScrubbing: boolean, previewTime: number) => void;
	className?: string;
}

/**
 * Wrapper component that adds scrubbing and interaction behavior to any child element
 */
const TimelineSlider = ({
	children,
	currentTime,
	duration,
	isPlaying,
	onTimeChange,
	onScrubbing,
	className = "",
}: TimelineSliderProps) => {
	const containerRef = useRef<HTMLDivElement>(null);
	const [isDragging, setIsDragging] = useState(false);
	const [isInteracting, setIsInteracting] = useState(false);
	const [displayProgress, setDisplayProgress] = useState(0);
	const wasPlayingRef = useRef(false);

	// Animation state
	const rafIdRef = useRef<number | null>(null);
	const isAnimatingRef = useRef(false);
	const lastFrameTimeRef = useRef(0);
	const animationTimeRef = useRef(currentTime);

	// Update display progress from normalized time
	useEffect(() => {
		if (duration <= 0) {
			setDisplayProgress(0);
			return;
		}

		// Don't update display during interaction to prevent flickering
		if (!isDragging && !isInteracting) {
			const progress = Math.min(Math.max(currentTime / duration, 0), 1);
			setDisplayProgress(progress);
		}
	}, [currentTime, duration, isDragging, isInteracting]);

	// Animation loop - smoothly animates the playhead
	const animate = useCallback(() => {
		if (!isAnimatingRef.current) return;

		const now = performance.now();
		const elapsed = (now - lastFrameTimeRef.current) / 1000;

		if (elapsed > 0 && elapsed < 0.1) {
			// Advance animation time and update display
			animationTimeRef.current = Math.min(
				animationTimeRef.current + elapsed,
				duration,
			);

			// Update display progress if not interacting
			if (!isDragging && !isInteracting && duration > 0) {
				const progress = Math.min(
					Math.max(animationTimeRef.current / duration, 0),
					1,
				);
				setDisplayProgress(progress);
			}
		}

		lastFrameTimeRef.current = now;
		rafIdRef.current = requestAnimationFrame(animate);
	}, [duration, isDragging, isInteracting]);

	// Manage animation state
	useEffect(() => {
		// Start animation if playing and not interacting
		if (isPlaying && !isDragging && !isInteracting && duration > 0) {
			// Initialize animation state
			lastFrameTimeRef.current = performance.now();
			animationTimeRef.current = currentTime;
			isAnimatingRef.current = true;

			// Start animation loop
			rafIdRef.current = requestAnimationFrame(animate);
		} else {
			// Stop animation
			if (rafIdRef.current !== null) {
				cancelAnimationFrame(rafIdRef.current);
				rafIdRef.current = null;
			}
			isAnimatingRef.current = false;

			// Ensure current time is synced
			animationTimeRef.current = currentTime;
		}

		// Clean up on unmount
		return () => {
			if (rafIdRef.current !== null) {
				cancelAnimationFrame(rafIdRef.current);
				rafIdRef.current = null;
			}
			return undefined;
		};
	}, [animate, currentTime, duration, isDragging, isInteracting, isPlaying]);

	// Click handler for seeking
	const handleClick = useCallback(
		(e: React.PointerEvent<HTMLDivElement>) => {
			// Skip if this was part of a drag operation
			if (isDragging) return;

			const element = containerRef.current;
			if (!element || duration <= 0) return;

			// Remember if we were playing
			wasPlayingRef.current = isPlaying;

			// Calculate progression based on pointer position
			const rect = element.getBoundingClientRect();
			const relativeX = Math.max(
				0,
				Math.min(e.clientX - rect.left, rect.width),
			);
			const progress = relativeX / rect.width;
			const newTime = progress * duration;

			// Flag to prevent flickering
			setIsInteracting(true);

			// Update display immediately
			setDisplayProgress(progress);

			// Notify of scrubbing if callback provided
			if (onScrubbing) {
				onScrubbing(true, newTime);

				// Update audio position
				onTimeChange(newTime);

				// End scrubbing operation with a small delay to ensure seeking completes
				setTimeout(() => {
					onScrubbing(false, newTime);

					// Clear interaction flag with additional delay
					setTimeout(() => {
						setIsInteracting(false);
					}, 50);
				}, 100);
			} else {
				// Simple mode - just update time
				onTimeChange(newTime);

				// Clear interaction flag after a longer delay
				setTimeout(() => {
					setIsInteracting(false);
				}, 150);
			}
		},
		[duration, isDragging, onScrubbing, onTimeChange, isPlaying],
	);

	// Pointer down handler for drag operations
	const handlePointerDown = useCallback(
		(e: React.PointerEvent<HTMLDivElement>) => {
			const element = containerRef.current;
			if (!element || duration <= 0) return;

			// Prevent text selection and other browser behaviors
			e.preventDefault();
			e.stopPropagation();

			// Remember if we were playing
			wasPlayingRef.current = isPlaying;

			// Set interaction flags
			setIsInteracting(true);
			setIsDragging(true);

			// Calculate initial position
			const rect = element.getBoundingClientRect();
			const relativeX = Math.max(
				0,
				Math.min(e.clientX - rect.left, rect.width),
			);
			const initialProgress = relativeX / rect.width;
			const initialTime = initialProgress * duration;

			// Update display immediately
			setDisplayProgress(initialProgress);

			// Start scrubbing first
			if (onScrubbing) {
				onScrubbing(true, initialTime);
			}

			// Set up document-level handlers for drag operation
			const handleDocMove = (e: PointerEvent) => {
				e.preventDefault();
				e.stopPropagation();

				if (!element) return;

				const rect = element.getBoundingClientRect();
				const relativeX = Math.max(
					0,
					Math.min(e.clientX - rect.left, rect.width),
				);
				const progress = relativeX / rect.width;
				const newTime = progress * duration;

				// Update display
				setDisplayProgress(progress);

				// Keep scrubbing active (for visual preview)
				if (onScrubbing) {
					onScrubbing(true, newTime);
				}
			};

			const handleDocUp = (e: PointerEvent) => {
				e.preventDefault();
				e.stopPropagation();

				if (!element) return;

				const rect = element.getBoundingClientRect();
				const relativeX = Math.max(
					0,
					Math.min(e.clientX - rect.left, rect.width),
				);
				const finalProgress = relativeX / rect.width;
				const finalTime = finalProgress * duration;

				// Update final visual position
				setDisplayProgress(finalProgress);
				// Apply the final time change
				onTimeChange(finalTime);

				// End drag operation
				setIsDragging(false);

				// End scrubbing, which will resume playback if needed
				if (onScrubbing) {
					// Small delay to ensure the time has updated before we end scrubbing
					setTimeout(() => {
						onScrubbing(false, finalTime);

						// Clear interaction flag with additional delay
						setTimeout(() => {
							setIsInteracting(false);
						}, 50);
					}, 50);
				} else {
					// Clear interaction flag after delay
					setTimeout(() => {
						setIsInteracting(false);
					}, 50);
				}

				// Clean up event listeners
				document.removeEventListener("pointermove", handleDocMove);
				document.removeEventListener("pointerup", handleDocUp);
				document.removeEventListener("pointercancel", handleDocUp);
			};

			// Add document-level event listeners
			document.addEventListener("pointermove", handleDocMove, {
				passive: false,
			});
			document.addEventListener("pointerup", handleDocUp, { passive: false });
			document.addEventListener("pointercancel", handleDocUp, {
				passive: false,
			});
		},
		[duration, isPlaying, onScrubbing, onTimeChange],
	);

	// Handle keyboard controls for accessibility
	const handleKeyDown = useCallback(
		(e: React.KeyboardEvent) => {
			if (e.key === "Enter" || e.key === " ") {
				e.preventDefault();

				if (e.key === " ") {
					// Space now toggles play/pause
					// We don't actually change playback state here, we just notify the parent component
					// which will handle toggling play/pause
					onTimeChange(currentTime);
				} else if (e.key === "Enter") {
					// Default to center on Enter key interaction
					const centerProgress = 0.5;
					const newTime = centerProgress * duration;

					setDisplayProgress(centerProgress);

					if (onScrubbing) {
						onScrubbing(true, newTime);
						onTimeChange(newTime);

						setTimeout(() => {
							onScrubbing(false, newTime);
						}, 50);
					} else {
						onTimeChange(newTime);
					}
				}
			} else if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
				e.preventDefault();

				// Calculate jump amount (5% of duration or 5 seconds, whichever is less)
				const jumpAmount = Math.min(duration * 0.05, 5);
				const adjustment = e.key === "ArrowLeft" ? -jumpAmount : jumpAmount;
				const newPosition = Math.max(
					0,
					Math.min(1, (currentTime + adjustment) / duration),
				);
				const newTime = newPosition * duration;

				setDisplayProgress(newPosition);
				onTimeChange(newTime);
			} else if (e.key === "Home") {
				e.preventDefault();
				setDisplayProgress(0);
				onTimeChange(0);
			} else if (e.key === "End") {
				e.preventDefault();
				setDisplayProgress(1);
				onTimeChange(duration);
			}
		},
		[duration, currentTime, onScrubbing, onTimeChange],
	);

	// Calculate progress indicator position
	const progressWidth = displayProgress * 100;

	return (
		<div
			ref={containerRef}
			className={`${style.timelineSlider} ${className}`}
			onPointerDown={handlePointerDown}
			onClick={handleClick}
			onKeyDown={handleKeyDown}
			tabIndex={0}
			role="slider"
			aria-label="Audio timeline"
			aria-valuemin={0}
			aria-valuemax={100}
			aria-valuenow={Math.round(displayProgress * 100)}
			aria-valuetext={`${formatTime(currentTime)} of ${formatTime(duration)}`}
			aria-describedby="timeline-instructions"
			style={{
				cursor: isDragging ? "grabbing" : "pointer",
				position: "relative",
				width: "100%",
				height: "100%",
			}}
		>
			{/* Visually hidden instructions for screen reader users */}
			<div
				id="timeline-instructions"
				style={{
					position: "absolute",
					width: "1px",
					height: "1px",
					padding: "0",
					margin: "-1px",
					overflow: "hidden",
					clip: "rect(0, 0, 0, 0)",
					whiteSpace: "nowrap",
					borderWidth: "0",
				}}
			>
				Press Space to play or pause. Use Left and Right arrows to skip backward
				or forward by 5 seconds. Home and End keys jump to the beginning or end
				of the track.
			</div>

			{/* Progress indicator line */}
			<div
				className={style.playheadIndicator}
				style={{
					left: `${progressWidth}%`,
					display: currentTime > 0 ? "block" : "none",
				}}
			/>

			{/* Render children with updated progress */}
			{children}
		</div>
	);
};

export default TimelineSlider;

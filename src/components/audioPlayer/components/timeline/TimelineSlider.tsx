import { useCallback, useEffect, useRef, useState } from "react";
import { calculateProgressFromPointer } from "../utilities/calculateProgressFromPointer";
import * as style from "../AudioPlayer.css";

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

				// End scrubbing operation with a small delay
				setTimeout(() => {
					onScrubbing(false, newTime);

					// Clear interaction flag
					setTimeout(() => {
						setIsInteracting(false);
					}, 10);
				}, 50);
			} else {
				// Simple mode - just update time
				onTimeChange(newTime);

				// Clear interaction flag after a delay
				setTimeout(() => {
					setIsInteracting(false);
				}, 50);
			}

			console.log(`Timeline clicked: progress=${progress}, newTime=${newTime}`);
		},
		[duration, isDragging, onScrubbing, onTimeChange],
	);

	// Pointer down handler for drag operations
	const handlePointerDown = useCallback(
		(e: React.PointerEvent<HTMLDivElement>) => {
			const element = containerRef.current;
			if (!element || duration <= 0) return;

			console.log("Pointer down on timeline");

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

			// Update time position
			onTimeChange(initialTime);

			console.log(
				`Drag start: progress=${initialProgress}, initialTime=${initialTime}`,
			);

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

				// Keep scrubbing active
				if (onScrubbing) {
					onScrubbing(true, newTime);
				}

				// Update time
				onTimeChange(newTime);

				console.log(`Dragging: progress=${progress}, newTime=${newTime}`);
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

				// Update final position
				setDisplayProgress(finalProgress);
				onTimeChange(finalTime);

				// End drag operation
				setIsDragging(false);

				console.log(
					`Drag end: progress=${finalProgress}, finalTime=${finalTime}`,
				);

				// End scrubbing, which will resume playback if needed
				if (onScrubbing) {
					setTimeout(() => {
						onScrubbing(false, finalTime);
					}, 50);
				}

				// Clear interaction flag after delay
				setTimeout(() => {
					setIsInteracting(false);
				}, 50);

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
			if ((e.key === "Enter" || e.key === " ") && containerRef.current) {
				e.preventDefault();

				// Default to center on keyboard interaction
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
		},
		[duration, onScrubbing, onTimeChange],
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
			style={{
				cursor: isDragging ? "grabbing" : "pointer",
				position: "relative",
				width: "100%",
				height: "100%",
			}}
		>
			{/* Progress indicator line */}
			<div
				className={style.progressIndicator}
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

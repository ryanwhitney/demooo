import { useCallback, useEffect, useRef, useState } from "react";
import * as style from "../AudioPlayer.css";
import { formatTime } from "@/utils/timeAndDate";
import { VisuallyHidden } from "react-aria";

interface TimelineSliderProps {
	children: React.ReactNode;
	currentTime: number;
	duration: number;
	isPlaying: boolean;
	isScrubbing?: boolean;
	onTimeChange: (newTime: number) => void;
	onScrubbing?: (isScrubbing: boolean, previewTime: number) => void;
	className?: string;
	"aria-label"?: string;
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
	"aria-label": ariaLabel = "Audio timeline",
}: TimelineSliderProps) => {
	const containerRef = useRef<HTMLDivElement>(null);
	const [userProgress, setUserProgress] = useState<number | null>(null);
	const interactionTimeoutRef = useRef<number | null>(null);
	const isUserInteractingRef = useRef(false);
	const lastUserInteractionTimeRef = useRef(0);
	const [sliderFocused, setSliderFocused] = useState(false);
	// For screen reader announcements
	const [announcement, setAnnouncement] = useState("");

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

			// Always prevent default and stop propagation
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
				// Start scrubbing
				onScrubbing(true, newTime);

				// End scrub after a small delay
				setTimeout(() => {
					onScrubbing(false, newTime);
				}, 50);
			} else {
				// Direct time change
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

			// Start scrubbing - only call once
			if (onScrubbing) {
				onScrubbing(true, initialTime);
			}

			// Track the last position to avoid sending duplicate move events
			let lastProgress = initialProgress;
			const scrubThreshold = 0.005; // Minimum movement before sending an update (0.5%)

			// Handle pointer movements with throttling
			const handlePointerMove = (e: PointerEvent) => {
				e.preventDefault();
				e.stopPropagation();

				const rect = element.getBoundingClientRect();
				const relativeX = Math.max(
					0,
					Math.min(e.clientX - rect.left, rect.width),
				);
				const progress = relativeX / rect.width;

				// Only update if there's a meaningful change in position
				if (Math.abs(progress - lastProgress) > scrubThreshold) {
					lastProgress = progress;
					const time = progress * duration;

					// Update UI immediately
					setUserProgress(progress);
					lastUserInteractionTimeRef.current = Date.now();

					// Send event to update audio time for preview - throttled
					if (onScrubbing) {
						onScrubbing(true, time);
					}
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

				// End scrubbing - call only once at the end
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

	// Handle keyboard navigation with improved focus management
	const handleKeyDown = useCallback(
		(e: React.KeyboardEvent) => {
			// Standard time step (seconds)
			const smallStep = 5; // 5 seconds jump - simple and predictable

			switch (e.key) {
				case "ArrowRight": {
					e.preventDefault();
					e.stopPropagation(); // Stop propagation to parent handlers
					// Simple right arrow - move 5 seconds forward
					const newTimeRight = Math.min(currentTime + smallStep, duration);

					// Update UI but don't call onTimeChange directly
					setTemporaryUserProgress(newTimeRight / duration);
					setAnnouncement(`Moved to ${formatTime(newTimeRight)}`);

					// Create and dispatch custom event with the forward action
					const forwardEvent = new CustomEvent("timelineKeyNav", {
						bubbles: true,
						detail: { action: "forward", time: newTimeRight },
					});
					e.currentTarget.dispatchEvent(forwardEvent);
					break;
				}
				case "ArrowLeft": {
					e.preventDefault();
					e.stopPropagation(); // Stop propagation to parent handlers
					// Simple left arrow - move 5 seconds backward
					const newTimeLeft = Math.max(0, currentTime - smallStep);

					// Update UI but don't call onTimeChange directly
					setTemporaryUserProgress(newTimeLeft / duration);
					setAnnouncement(`Moved to ${formatTime(newTimeLeft)}`);

					// Create and dispatch custom event with the backward action
					const backwardEvent = new CustomEvent("timelineKeyNav", {
						bubbles: true,
						detail: { action: "backward", time: newTimeLeft },
					});
					e.currentTarget.dispatchEvent(backwardEvent);
					break;
				}
				case "Home": {
					e.preventDefault();
					e.stopPropagation(); // Stop propagation to parent handlers
					// Seek to start
					setTemporaryUserProgress(0);
					setAnnouncement("Moved to beginning");

					// Create and dispatch custom event with the home action
					const homeEvent = new CustomEvent("timelineKeyNav", {
						bubbles: true,
						detail: { action: "home", time: 0 },
					});
					e.currentTarget.dispatchEvent(homeEvent);
					break;
				}
				case "End": {
					e.preventDefault();
					e.stopPropagation(); // Stop propagation to parent handlers
					// Seek to end
					setTemporaryUserProgress(1);
					setAnnouncement("Moved to end");

					// Create and dispatch custom event with the end action
					const endEvent = new CustomEvent("timelineKeyNav", {
						bubbles: true,
						detail: { action: "end", time: duration },
					});
					e.currentTarget.dispatchEvent(endEvent);
					break;
				}
				case "Tab":
					// Let default Tab behavior work for moving focus
					return;
				case " ":
				case "Enter":
					// Let space/enter bubble up to parent for play/pause
					// Don't call preventDefault here to allow parent handlers to work
					return;
				default:
					// Don't handle other keys
					return;
			}
		},
		[currentTime, duration, setTemporaryUserProgress],
	);

	// Get the current display progress
	const displayProgress = getDisplayProgress();
	const displayTime = displayProgress * duration;

	// Create class names array
	const classNames = [style.timelineSlider];

	if (sliderFocused) {
		classNames.push(style.timelineFocused);
	}

	if (className) {
		classNames.push(className);
	}

	return (
		<div
			ref={containerRef}
			className={classNames.join(" ")}
			onClick={handleClick}
			onPointerDown={handlePointerDown}
			onKeyDown={handleKeyDown}
			onFocus={() => setSliderFocused(true)}
			onBlur={() => setSliderFocused(false)}
			role="slider"
			aria-valuemin={0}
			aria-valuemax={duration || 100}
			aria-valuenow={displayTime}
			aria-valuetext={formatTime(displayTime)}
			aria-label={ariaLabel}
			aria-orientation="horizontal"
			tabIndex={0}
		>
			{/* Screen reader announcements */}
			{announcement && (
				<VisuallyHidden aria-live="polite">{announcement}</VisuallyHidden>
			)}

			{/* Playhead indicator */}
			{displayProgress > 0 && (
				<div
					className={style.playheadIndicator}
					style={{ left: `${displayProgress * 100}%` }}
					aria-hidden="true"
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

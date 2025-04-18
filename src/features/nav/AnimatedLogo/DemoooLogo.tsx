import { useEffect, useRef } from "react";
import { characterSpan, mainContainer, sizes } from "./DemoooLogo.css";

const DemoooLogo = ({ text }: { text: string }) => {
	// Reference to all character spans
	const spansRef = useRef<(HTMLSpanElement | null)[]>([]);
	// Store original sizes
	const originalSizesRef = useRef<number[]>([]);
	// Animation frame ID for cleanup
	const animationFrameIdRef = useRef<number | null>(null);
	// Animation timeout ID for cleanup
	const timeoutIdRef = useRef<NodeJS.Timeout | null>(null);

	// Setup reference arrays when component mounts
	useEffect(() => {
		spansRef.current = spansRef.current.slice(0, text.length);
		originalSizesRef.current = new Array(text.length).fill(0);

		// Store original font sizes
		spansRef.current.forEach((span, index) => {
			if (span) {
				const computedStyle = window.getComputedStyle(span);
				originalSizesRef.current[index] = Number.parseFloat(
					computedStyle.fontSize,
				);
			}
			return () => {};
		});
	}, [text]);

	// Create ref callback function
	const setSpanRef = (index: number) => (el: HTMLSpanElement | null) => {
		if (spansRef.current) {
			spansRef.current[index] = el;
		}
	};

	// Equalizer animation
	const equalizerText = () => {
		spansRef.current.forEach((span, index) => {
			if (span) {
				const originalSize = originalSizesRef.current[index];
				// Randomize heights like an equalizer
				const minFactor = 0.8;
				const maxFactor = 1.5;
				const randomFactor =
					minFactor + Math.random() * (maxFactor - minFactor);
				const newSize = originalSize * randomFactor;

				span.style.fontSize = `${newSize}px`;
			}
		});

		timeoutIdRef.current = setTimeout(() => {
			animationFrameIdRef.current = requestAnimationFrame(equalizerText);
		}, 300); // Faster updates for equalizer effect
	};

	// Handle mouse enter
	const handleMouseEnter = () => {
		equalizerText();
	};

	// Handle mouse leave
	const handleMouseLeave = () => {
		// Clear any running animations
		if (animationFrameIdRef.current) {
			cancelAnimationFrame(animationFrameIdRef.current);
			animationFrameIdRef.current = null;
		}

		if (timeoutIdRef.current) {
			clearTimeout(timeoutIdRef.current);
			timeoutIdRef.current = null;
		}

		// Reset to original sizes
		spansRef.current.forEach((span, index) => {
			if (span) {
				span.style.fontSize = `${originalSizesRef.current[index]}px`;
			}
		});
	};

	// Get character size class
	const getCharacterSizeClass = (index: number): string => {
		const sizeKeys = Object.keys(sizes) as Array<keyof typeof sizes>;
		if (index < sizeKeys.length) {
			return sizes[sizeKeys[index]];
		}
		// Default to first size if out of range
		return sizes.a;
	};

	return (
		<div
			className={mainContainer}
			title="Demooo Logo"
			onMouseEnter={handleMouseEnter}
			onMouseLeave={handleMouseLeave}
		>
			<div>
				{text.split("").map((char, index) => (
					<span
						key={`${char}-${
							// biome-ignore lint/suspicious/noArrayIndexKey:
							index
						}`}
						ref={setSpanRef(index)}
						className={`${characterSpan} ${getCharacterSizeClass(index)}`}
					>
						{char}
					</span>
				))}
			</div>
		</div>
	);
};

export default DemoooLogo;

import { useState, useEffect, useRef } from "react";
import {
	characterSpan,
	holder,
	mainContainer,
	shakeAnimation,
	sizes,
	waveAnimation,
} from "./DemoooLogo.css";

// Define animation types
enum AnimationType {
	// JIGGLE = "jiggle",
	// WAVE = "wave",
	EQUALIZER = "equalizer",
	// SHAKE = "shake",
}

const DemoooLogo = ({ text }: { text: string }) => {
	// Reference to all character spans
	const spansRef = useRef<(HTMLSpanElement | null)[]>([]);
	// Store original sizes
	const originalSizesRef = useRef<number[]>([]);
	// Animation frame ID for cleanup
	const animationFrameIdRef = useRef<number | null>(null);
	// Animation timeout ID for cleanup
	const timeoutIdRef = useRef<NodeJS.Timeout | null>(null);
	// Current animation type
	const [animationType, setAnimationType] = useState<AnimationType | null>(
		null,
	);

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
		});
	}, [text]);

	const chooseRandomAnimation = () => {
		const animations = Object.values(AnimationType);
		const randomIndex = Math.floor(Math.random() * animations.length);
		return animations[randomIndex];
	};

	const jiggleText = () => {
		spansRef.current.forEach((span, index) => {
			if (span) {
				const originalSize = originalSizesRef.current[index];
				// Random size between 40% and 100% of original
				const randomFactor = 0.4 + (Math.random() * (0.6 - 0.4) + 0.4);
				const newSize = originalSize * randomFactor;
				span.style.fontSize = `${newSize}px`;
			}
		});

		timeoutIdRef.current = setTimeout(() => {
			animationFrameIdRef.current = requestAnimationFrame(jiggleText);
		}, 300);
	};

	// Wave animation - grows and shrinks font sizes in a wave pattern
	const waveText = () => {
		const time = Date.now() / 1000;

		spansRef.current.forEach((span, index) => {
			if (span) {
				const originalSize = originalSizesRef.current[index];
				// Create a wave pattern
				const phase = index / 2; // Controls wave spacing
				const amplitude = 1; // Controls size variation
				const frequency = 5; // Controls wave speed

				const factor = 1 + amplitude * Math.sin(frequency * time + phase);
				const newSize = originalSize * factor;

				span.style.fontSize = `${newSize}px`;
			}
		});

		animationFrameIdRef.current = requestAnimationFrame(waveText);
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
		const animation = chooseRandomAnimation();
		setAnimationType(animation);

		// Start the appropriate animation
		switch (animation) {
			case AnimationType.JIGGLE:
				jiggleText();
				break;
			case AnimationType.WAVE:
				waveText();
				break;
			case AnimationType.EQUALIZER:
				equalizerText();
				break;
			case AnimationType.SHAKE:
				// For shake, we'll use CSS animation class
				break;
		}
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

		// Reset animation type
		setAnimationType(null);

		// Reset to original sizes
		spansRef.current.forEach((span, index) => {
			if (span) {
				span.style.fontSize = `${originalSizesRef.current[index]}px`;
			}
		});
	};

	// Clean up animations on unmount
	useEffect(() => {
		return () => {
			if (animationFrameIdRef.current) {
				cancelAnimationFrame(animationFrameIdRef.current);
			}

			if (timeoutIdRef.current) {
				clearTimeout(timeoutIdRef.current);
			}
		};
	}, []);

	// Get character size class
	const getCharacterSizeClass = (index: number): string => {
		const sizeKeys = Object.keys(sizes) as Array<keyof typeof sizes>;
		if (index < sizeKeys.length) {
			return sizes[sizeKeys[index]];
		}
		// Default to first size if out of range
		return sizes.a;
	};

	// Get animation class if needed
	const getAnimationClass = (): string => {
		if (animationType === AnimationType.SHAKE) {
			return shakeAnimation;
		}
		if (animationType === AnimationType.WAVE) {
			return waveAnimation;
		}
		return "";
	};

	return (
		<div
			className={mainContainer}
			title="Demooo Logo"
			onMouseEnter={handleMouseEnter}
			onMouseLeave={handleMouseLeave}
		>
			<div className={holder}>
				{text.split("").map((char, index) => (
					<span
						key={index}
						ref={(el) => (spansRef.current[index] = el)}
						className={`${characterSpan} ${getCharacterSizeClass(index)} ${getAnimationClass()}`}
					>
						{char}
					</span>
				))}
			</div>
		</div>
	);
};

export default DemoooLogo;

// Usage example:
// import AnimatedText from './AnimatedText';
//
// function App() {
//   return (
//     <div style={{ background: 'black', padding: '20px' }}>
//       <AnimatedText text="demoooooooo" />
//     </div>
//   );
// }

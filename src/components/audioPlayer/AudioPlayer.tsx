import type { Track } from "@/types/track";
import { formatTime } from "@/utils/formatTime";
import { useRef, useState } from "react";
const PlayButton = ({
	isPlaying,
	onClick,
}: { isPlaying: boolean; onClick: () => void }) => (
	<button
		type="button"
		onClick={onClick}
		aria-label={isPlaying ? "Pause" : "Play"}
		style={{ background: "transparent", color: "white", border: "none" }}
	>
		{isPlaying ? (
			// Pause icon
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="23"
				height="28"
				fill="none"
				viewBox="0 0 23 28"
			>
				<title>pause</title>
				<rect x="6" y="4" width="4" height="16" fill="currentColor" />
				<rect x="14" y="4" width="4" height="16" fill="currentColor" />
			</svg>
		) : (
			// Play icon
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="23"
				height="28"
				fill="none"
				viewBox="0 0 23 28"
			>
				<title>play</title>
				<path
					fill="currentColor"
					d="M22.5 13.134a1 1 0 0 1 0 1.732L1.5 26.99a1 1 0 0 1-1.5-.866V1.876a1 1 0 0 1 1.5-.866l21 12.124Z"
				/>
			</svg>
		)}
	</button>
);

const Waveform = ({
	data,
	currentTime,
	duration,
	updateTime,
}: {
	data: number[];
	currentTime: number;
	duration: number;
	updateTime: (time: number) => void; // Update the type to accept a new time
}) => {
	const progress = currentTime / duration;
	const height = 30;
	const width = 200;
	const progressWidth = progress * 100;

	const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
		// Get the bounding rectangle of the clicked element
		const rect = e.currentTarget.getBoundingClientRect();
		// Calculate the click position relative to the element's left edge
		const clickPositionX = e.clientX - rect.left;
		// Calculate the percentage of the width that was clicked
		const clickPercentage = clickPositionX / rect.width;
		const newTime = clickPercentage * duration;
		updateTime(newTime);
	};

	return (
		// biome-ignore lint/a11y/useKeyWithClickEvents: As the click is location-based, we should instead direct keyboard users to hit left right to skip or provide other means
		<div
			style={{ position: "relative", background: "black", height: height }}
			onClick={handleClick}
		>
			<div
				style={{
					width: `${progressWidth}%`,
					position: "absolute",
					left: 0,
					top: 0,
					bottom: 0,
					backgroundColor: "rgba(0,0,0,0.5)",
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
					const yPosition = (height - barHeight) / 2; // offset to center vertically
					const xPosition = index * spacing;
					return (
						// biome-ignore lint/correctness/useJsxKeyInIterable: <explanation>
						<rect
							x={xPosition} // Space by 5
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

const AudioPlayer = (track: Track) => {
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

	return (
		<div>
			<div style={{ display: "flex" }}>
				{/* biome-ignore lint/a11y/useMediaCaption: <explanation> */}
				<audio
					ref={audioRef}
					onTimeUpdate={handleTimeUpdate}
					onLoadedMetadata={handleLoadedMetadata}
					onEnded={handleAudioEnded}
					onPlay={() => setIsPlaying(true)}
					onPause={() => setIsPlaying(false)}
					src={track.audioUrl}
				/>
				<PlayButton isPlaying={isPlaying} onClick={togglePlayPause} />
				<Waveform
					data={track.waveformData}
					currentTime={currentTime}
					duration={duration}
					updateTime={(time) => jumpToPosition(time)}
				/>
			</div>
			<span style={{ color: "white", fontSize: "14px" }}>
				{formatTime(currentTime)} / {formatTime(duration)}
			</span>
		</div>
	);
};

export default AudioPlayer;

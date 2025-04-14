import { useState, useRef } from "react";
import type { Track } from "@/types/track";
import { Link } from "react-router";
import {
	trackViewArtist,
	trackViewDetails,
	trackViewInfo,
	trackViewTagsWrapper,
	trackViewTitle,
	trackViewWaveformWrapper,
	trackViewWrapper,
} from "./TrackView.css";

// Play button component that changes based on playing state
const PlayButton = ({
	isPlaying,
	onClick,
}: { isPlaying: boolean; onClick: () => void }) => (
	<button
		type="button"
		onClick={onClick}
		aria-label={isPlaying ? "Pause" : "Play"}
		style={{ background: "transparent", color: "white" }}
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

const Waveform = ({ width = 60 }: { width?: number }) => {
	const waveformBars = [
		{ width: 1, height: 8, y: 10 },
		{ width: 1, height: 13, y: 8 },
		{ width: 1, height: 21, y: 4 },
		{ width: 1, height: 29, y: 0 },
	];
	const count = Math.floor(width / 5);
	return (
		<svg
			width={width}
			height="29"
			viewBox={`0 0 ${width} 29`}
			aria-hidden="true"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
		>
			{Array.from({ length: count }).map((_, index) => {
				const waveform =
					waveformBars[Math.floor(Math.random() * waveformBars.length)];
				return (
					<rect
						key={index}
						x={index * 5}
						y={waveform.y}
						width={waveform.width}
						height={waveform.height}
						fill="#D9D9D9"
					/>
				);
			})}
		</svg>
	);
};

function TrackView({ track }: { track: Track }) {
	const [isPlaying, setIsPlaying] = useState(false);
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

	return (
		<main>
			<div className={trackViewWrapper}>
				<div className={trackViewInfo}>
					<div>
						<h1 className={trackViewTitle}>{track.title}</h1>
						<p>
							by{" "}
							<Link
								to={`/${track.artist.username}`}
								className={trackViewArtist}
							>
								{track.artist.username}
							</Link>
						</p>
					</div>
					<div className={trackViewWaveformWrapper}>
						<div className="flex items-center gap-4">
							<PlayButton isPlaying={isPlaying} onClick={togglePlayPause} />
							<Waveform width={200} />
						</div>
					</div>

					{/* Hidden audio element controlled by our custom UI */}
					{/* biome-ignore lint/a11y/useMediaCaption: <explanation> */}
					<audio
						ref={audioRef}
						onEnded={handleAudioEnded}
						onPlay={() => setIsPlaying(true)}
						onPause={() => setIsPlaying(false)}
						src={`http://localhost:8000${track.audioUrl}`}
					/>

					<div className={trackViewDetails}>
						<p>{track.description || "no notes"}</p>
					</div>
					<div className={trackViewTagsWrapper} />
				</div>
			</div>
		</main>
	);
}

export default TrackView;

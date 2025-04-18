import type { HTMLAttributes } from "react";
import type { Track } from "@/types/track";
import { Link } from "react-router";
import {
	trackArtist,
	trackChipPlayButton,
	trackChipWrapper,
	trackText,
	trackTitle,
	waveformElement,
	waveformWrapper,
} from "./TrackChip.css";
import PlayButton from "@/components/audioPlayer/components/playButton/PlayButton";
import { useAudio } from "@/providers/AudioProvider";
import { memo, useCallback, useMemo } from "react";

type WaveformProps = HTMLAttributes<SVGSVGElement> & {
	width?: number;
};

// Memoize the Waveform component since it doesn't need to re-render
const Waveform = memo(({ width = 60, ...rest }: WaveformProps) => {
	const waveformBars = [
		{ width: 1, height: 8, y: 10 },
		{ width: 1, height: 13, y: 8 },
		{ width: 1, height: 21, y: 4 },
		{ width: 1, height: 29, y: 0 },
	];

	const count = Math.floor(width / 5);

	// Pre-generate bars to avoid re-calculation
	const bars = useMemo(() => {
		return Array.from({ length: count }).map((_, index) => {
			const waveform =
				waveformBars[Math.floor(Math.random() * waveformBars.length)];
			const uniqueKey = `${index}-${waveform.height}-${waveform.y}`;
			return (
				<rect
					key={uniqueKey}
					x={index * 5}
					y={waveform.y}
					width={waveform.width}
					height={waveform.height}
					fill="#D9D9D9"
				/>
			);
		});
	}, [count]);

	return (
		<svg
			width={width}
			height="29"
			aria-hidden="true"
			viewBox={`0 0 ${width} 29`}
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			{...rest}
		>
			{bars}
		</svg>
	);
});

Waveform.displayName = "Waveform";

const TrackChip = memo(function TrackChip({ track }: { track: Track }) {
	const audio = useAudio();

	// Only subscribe to the state we need
	const isCurrentTrack = useMemo(() => {
		return (
			audio.currentTrack?.id === track.id && audio.activeSource === "global"
		);
	}, [audio.currentTrack?.id, audio.activeSource, track.id]);

	const isPlaying = isCurrentTrack && audio.isPlaying;

	const handleClick = useCallback(() => {
		if (isCurrentTrack) {
			if (isPlaying) {
				audio.pauseTrack();
			} else {
				audio.resumeTrack();
			}
		} else {
			audio.playTrack(track, "global");
		}
	}, [audio, isCurrentTrack, isPlaying, track]);

	return (
		<div className={trackChipWrapper}>
			{/* biome-ignore lint/a11y/useKeyWithClickEvents: <there's an actual button present within> */}
			<div
				style={{ border: "none" }}
				className={waveformWrapper}
				onClick={handleClick}
			>
				<PlayButton
					className={trackChipPlayButton}
					isPlaying={isPlaying}
					onClick={handleClick}
					color="white"
				/>
				<Waveform className={waveformElement} width={55} />
			</div>
			<div className={trackText}>
				<Link
					to={`/${track.artist.username}/track/${track.titleSlug}`}
					className={trackTitle}
				>
					{track.title}
				</Link>
				<Link to={`/${track.artist.username}`} className={trackArtist}>
					{track.artist.profile?.profilePictureOptimizedUrl && (
						<img
							src={`http://localhost:8000/media/${track.artist.profile?.profilePictureOptimizedUrl}`}
							alt="user profile"
							width={16}
							height={16}
							style={{ borderRadius: "50%", display: "inline-block" }}
						/>
					)}
					{track.artist.profile.name || track.artist.username}
				</Link>
			</div>
		</div>
	);
});

export default TrackChip;

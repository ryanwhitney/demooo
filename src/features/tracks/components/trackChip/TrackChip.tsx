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

type WaveformProps = HTMLAttributes<SVGSVGElement> & {
	width?: number;
};

const Waveform = ({ width = 60, ...rest }: WaveformProps) => {
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
			aria-hidden="true"
			viewBox={`0 0 ${width} 29`}
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			{...rest}
		>
			{Array.from({ length: count }).map((_, index) => {
				const waveform =
					waveformBars[Math.floor(Math.random() * waveformBars.length)];
				return (
					// biome-ignore lint/correctness/useJsxKeyInIterable: <explanation>
					<rect
						x={index * 5} // Space by 5
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

function TrackChip({ track }: { track: Track }) {
	return (
		<Link
			to={`/${track.artist.username}/track/${track.titleSlug}`}
			className={trackChipWrapper}
		>
			<div className={waveformWrapper}>
				<PlayButton
					className={trackChipPlayButton}
					isPlaying={false}
					onClick={() => {}}
					color="white"
				/>
				<Waveform className={waveformElement} width={55} />
			</div>
			<div className={trackText}>
				<p className={trackTitle}>{track.title}</p>
				<Link to={`/${track.artist.username}`} className={trackArtist}>
					{track.artist.username}
				</Link>
			</div>
		</Link>
	);
}

export default TrackChip;

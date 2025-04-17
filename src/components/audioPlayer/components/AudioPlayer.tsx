import type { Track } from "@/types/track";
import { formatTime } from "@/utils/timeAndDate";
import PlayButton from "./playButton/PlayButton";
import { parseWaveformData } from "./utilities/parseWaveformData";
import * as style from "./AudioPlayer.css";
import Waveform from "./waveform/Waveform";
import TimelineSlider from "./timeline/TimelineSlider";
import { useAudioPlayback } from "../hooks/useAudioPlayback";
import { useAudioEvents } from "../hooks/useAudioEvents";
import { useState } from "react";

interface AudioPlayerProps {
	track: Track;
	isPlaying?: boolean;
	onPlayPause?: (isPlaying: boolean) => void;
	onTimeUpdate?: (time: number) => void;
	onDurationChange?: (duration: number) => void;
	onEnded?: () => void;
}

/**
 * AudioPlayer component with waveform visualization and playback controls
 */
const AudioPlayer = ({
	track,
	isPlaying: externalIsPlaying,
	onPlayPause,
	onTimeUpdate,
	onDurationChange,
	onEnded,
}: AudioPlayerProps) => {
	// Add local loaded state for the component
	const [localIsLoaded, setLocalIsLoaded] = useState(false);

	// Use our custom hook to manage audio playback
	const {
		isPlaying,
		currentTime,
		duration,
		isScrubbing,
		isLoaded,
		audioRef,
		togglePlayPause,
		jumpToPosition,
		handleScrubbing,
	} = useAudioPlayback({
		track,
		externalIsPlaying,
		onPlayPause,
		onTimeUpdate,
		onDurationChange,
		onEnded,
	});

	// Define error handler
	const handleError = () => {
		console.error("Audio error occurred");
		if (onPlayPause) {
			onPlayPause(false);
		}
	};

	// Handle loaded data
	const handleLoadedData = () => {
		setLocalIsLoaded(true);
	};

	// Use our audio events hook to handle audio element events
	const audioEvents = useAudioEvents({
		audioRef,
		isPlaying,
		isScrubbing,
		onTimeUpdate: (time) => {
			onTimeUpdate?.(time);
		},
		onDurationChange: (newDuration) => {
			onDurationChange?.(newDuration);
		},
		onLoadedData: handleLoadedData,
		onEnded: () => {
			onEnded?.();
		},
		onPlaybackStateChange: (state) => {
			onPlayPause?.(state);
		},
		onError: () => handleError(),
	});

	// Parse waveform data for visualization
	const waveformData = parseWaveformData(track.audioWaveformData);

	// Calculate audio URL
	const audioFileUrl = track.audioFile?.startsWith("http")
		? track.audioFile
		: `http://localhost:8000/media/${track.audioFile}`;

	// Calculate progress as a normalized value between 0 and 1
	const normalizedProgress = duration > 0 ? currentTime / duration : 0;

	// Handle timeline click manually to ensure it works
	const handleTimelineClick = (time: number) => {
		jumpToPosition(time);
	};

	return (
		<div className={style.audioPlayerWrapper}>
			<div className={style.controlsWrapper}>
				{/* biome-ignore lint/a11y/useMediaCaption: Audio captions not required for music player */}
				<audio
					ref={audioRef}
					onTimeUpdate={audioEvents.handleTimeUpdate}
					onLoadedMetadata={audioEvents.handleLoadedMetadata}
					onLoadedData={audioEvents.handleLoadedData}
					onCanPlay={audioEvents.handleLoadedData}
					onEnded={audioEvents.handleEnded}
					onDurationChange={audioEvents.handleDurationChange}
					onStalled={audioEvents.handleStalled}
					onError={() => handleError()}
					onPlay={audioEvents.handlePlay}
					onPause={audioEvents.handlePause}
					preload="auto"
					src={audioFileUrl}
					className={style.audioElement}
				/>

				{/* Play/Pause button */}
				<div className={style.playButtonWrapper}>
					<PlayButton
						className={style.playButton}
						isPlaying={isPlaying}
						onToggle={togglePlayPause}
					/>
				</div>

				{/* Timeline with waveform display */}
				<div className={style.waveformContainer}>
					<TimelineSlider
						currentTime={currentTime}
						duration={duration}
						isPlaying={isPlaying}
						onTimeChange={handleTimelineClick}
						onScrubbing={handleScrubbing}
						className={style.timelineSlider}
					>
						<Waveform
							data={waveformData}
							progress={normalizedProgress}
							isInteractive={true}
						/>
					</TimelineSlider>
				</div>
			</div>

			{/* Time display */}
			<span className={style.timeDisplay}>
				{formatTime(currentTime)} / {formatTime(duration || 0)}
			</span>
		</div>
	);
};

export default AudioPlayer;

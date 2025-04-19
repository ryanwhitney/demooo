import type { Track } from "@/types/track";
import { formatTime } from "@/utils/timeAndDate";
import PlayButton from "./playButton/PlayButton";
import { parseWaveformData } from "./utilities/parseWaveformData";
import * as style from "./AudioPlayer.css";
import Waveform from "./waveform/Waveform";
import TimelineSlider from "./timeline/TimelineSlider";
import { useAudioPlayback } from "../hooks/useAudioPlayback";
import { useAudioEvents } from "../hooks/useAudioEvents";

interface AudioPlayerProps {
	track: Track;
	isPlaying?: boolean;
	onPlayPause?: (isPlaying: boolean) => void;
	onTimeUpdate?: (time: number) => void;
	onDurationChange?: (duration: number) => void;
	onEnded?: () => void;
}

const AudioPlayer = ({
	track,
	isPlaying: externalIsPlaying,
	onPlayPause,
	onTimeUpdate,
	onDurationChange,
	onEnded,
}: AudioPlayerProps) => {
	const {
		isPlaying,
		currentTime,
		duration,
		isScrubbing,
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
		onLoadedData: () => {
			// Data loaded handling if needed
		},
		onEnded: () => {
			// When a track ends, call onEnded which will be handled by the calling component
			// This allows the parent to decide whether to play the next track
			onEnded?.();
		},
		onPlaybackStateChange: (state) => {
			onPlayPause?.(state);
		},
		onError: () => handleError(),
	});

	const waveformData = parseWaveformData(track.audioWaveformData);

	// set this to desired audio file URL based on env and quality
	const audioFileUrl = track.audioFile?.startsWith("http")
		? `${track.audioFile}/320.mp3`
		: `${import.meta.env.VITE_API_URL || "http://localhost:8000"}/media/${track.audioFile}/320/${track.id}.mp3`;

	const normalizedProgress = duration > 0 ? currentTime / duration : 0;

	const handleTimelineClick = (time: number) => {
		// Check if this is likely a play/pause toggle from space key press
		// We detect this by seeing if the time is exactly the same as currentTime
		if (time === currentTime) {
			togglePlayPause();
		} else {
			jumpToPosition(time);
		}
	};

	return (
		<section
			className={style.audioPlayerWrapper}
			aria-label={`Audio player for ${track.title || "track"}`}
			onKeyDown={(e) => {
				// Add global keyboard shortcut for play/pause
				if (
					e.key === " " &&
					!(e.target as Element).closest('[role="slider"]')
				) {
					e.preventDefault();
					togglePlayPause();
				}
			}}
		>
			<div
				className={style.controlsWrapper}
				tabIndex={-1} // Make focusable but not in tab order
				aria-roledescription="Audio player controls"
			>
				{/* biome-ignore lint/a11y/useMediaCaption: No caption support for music */}
				{/* biome-ignore lint/a11y/noAriaHiddenOnFocusable: SR controls are provided by Timeline Slider */}
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
					aria-hidden="true"
				/>

				<div className={style.playButtonWrapper}>
					<PlayButton
						className={style.playButton}
						isPlaying={isPlaying}
						onToggle={togglePlayPause}
					/>
				</div>

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
			<span
				className={style.timeDisplay}
				aria-live="polite"
				aria-atomic="true"
				aria-label="Current playback time"
			>
				{formatTime(currentTime)} / {formatTime(duration || 0)}
			</span>
		</section>
	);
};

export default AudioPlayer;

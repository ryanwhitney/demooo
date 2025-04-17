import type { Track } from "@/types/track";
import { formatTime } from "@/utils/timeAndDate";
import PlayButton from "./playButton/PlayButton";
import { parseWaveformData } from "./utilities/parseWaveformData";
import * as style from "./AudioPlayer.css";
import Waveform from "./waveform/Waveform";
import TimelineSlider from "./timeline/TimelineSlider";
import { useAudioPlayback } from "../hooks/useAudioPlayback";
import { useAudioEvents } from "../hooks/useAudioEvents";
import { useRef } from "react";

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
	// Ref for the audio player controls to manage focus
	const controlsRef = useRef<HTMLDivElement>(null);

	// Function to focus the controls when needed
	const focusControls = () => {
		controlsRef.current?.focus();
	};

	// Use our custom hook to manage audio playback
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
		onLoadedData: () => {
			// Data loaded handling if needed
		},
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
		// Check if this is likely a play/pause toggle from space key press
		// We detect this by seeing if the time is exactly the same as currentTime
		if (time === currentTime) {
			// Toggle play/pause when receiving identical time (from space key in slider)
			togglePlayPause();
		} else {
			// Normal seek operation
			jumpToPosition(time);
		}
	};

	return (
		<section
			className={style.audioPlayerWrapper}
			aria-label={`Audio player for ${track.title || "track"}`}
			onKeyDown={(e) => {
				// Add global keyboard shortcut for play/pause
				if (e.key === " " && !(e.target as Element).closest('[role="slider"]')) {
					e.preventDefault();
					togglePlayPause();
				}
			}}
		>
			{/* Visually hidden skip link for accessibility */}
			<button
				onClick={focusControls}
				type="button"
				style={{
					position: "absolute",
					width: "1px",
					height: "1px",
					padding: "0",
					margin: "-1px",
					overflow: "hidden",
					clip: "rect(0, 0, 0, 0)",
					whiteSpace: "nowrap",
					borderWidth: "0",
				}}
				aria-label="Skip to audio controls"
			>
				Skip to audio controls
			</button>

			<div
				className={style.controlsWrapper}
				ref={controlsRef}
				tabIndex={-1} // Make focusable but not in tab order
				aria-roledescription="Audio player controls"
			>
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
					aria-hidden="true"
				/>

				<div className={style.playButtonWrapper}>
					<PlayButton
						className={style.playButton}
						isPlaying={isPlaying}
						onToggle={togglePlayPause}
					/>
				</div>

				<div
					className={style.waveformContainer}
					aria-hidden="true" // Hide visual container from screen readers
				>
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

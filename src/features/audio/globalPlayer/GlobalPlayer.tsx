import AudioPlayer from "@/components/audioPlayer/components/AudioPlayer";
import { useAudio } from "@/providers/AudioProvider";
import type { Track } from "@/types/track";
import { useCallback, useEffect, useState } from "react";
import * as style from "./GlobalPlayer.css";
import { clsx } from "clsx";

const GlobalPlayer = () => {
	const [isVisible, setIsVisible] = useState(false);
	const audio = useAudio();
	const shouldShow =
		audio.currentTrack !== null &&
		(audio.activeSource === "global" || audio.activeSource === "artist-view");
	const isPlaying = shouldShow && audio.isPlaying;

	useEffect(() => {
		setTimeout(() => {
			setIsVisible(shouldShow);
		}, 50);
	}, [shouldShow]);

	// Handle track ending - play the next track in queue if available
	const handleTrackEnded = useCallback(() => {
		audio.nextTrack();
	}, [audio]);

	return (
		<div className={clsx(style.container, isVisible && style.containerVisible)}>
			<div className={style.playerWrapper}>
				{shouldShow && (
					<AudioPlayer
						track={audio.currentTrack as Track}
						isPlaying={isPlaying}
						onPlayPause={audio.setIsPlaying}
						onTimeUpdate={audio.setCurrentTime}
						onDurationChange={audio.setDuration}
						onEnded={handleTrackEnded}
					/>
				)}
			</div>
		</div>
	);
};

export default GlobalPlayer;

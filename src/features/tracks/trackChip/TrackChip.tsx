import type { Track } from "@/types/track";
import { Link } from "react-router";
import * as style from "./TrackChip.css";
import PlayButton from "@/components/audioPlayer/components/playButton/PlayButton";
import { useAudio } from "@/providers/AudioProvider";
import { memo, useCallback, useMemo } from "react";
import ProfilePhoto from "@/features/nav/profilePhoto/ProfilePhoto";
import Waveform from "@/components/audioPlayer/components/waveform/Waveform";

const TrackChip = memo(function TrackChip({ track }: { track: Track }) {
	const audio = useAudio();

	// subscribe to the state we need
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
		<article className={style.trackChipWrapper}>
			<div className={style.trackText}>
				<strong>
					<Link
						className={style.trackTitle}
						to={`/${track.artist.username}/track/${track.titleSlug}`}
					>
						{track.title}
					</Link>
				</strong>
				<Link
					className={style.trackArtistContainer}
					to={`/${track.artist.username}`}
				>
					<ProfilePhoto
						ariaHidden={true}
						height={16}
						width={16}
						profile={track.artist.profile}
					/>
					<span className={style.trackArtist}>
						{track.artist.profile.name || track.artist.username}
					</span>
				</Link>
			</div>
			<div className={style.waveformWrapper}>
				<PlayButton
					className={style.trackChipPlayButton({ isPlaying: isPlaying })}
					isPlaying={isPlaying}
					onClick={handleClick}
					color="white"
				/>
				<div className={style.waveformElement({ isPlaying: isPlaying })}>
					<Waveform
						data={track.audioWaveformData}
						width={91}
						height={29}
						barWidth={1}
						spacing={4}
						progress={0}
					/>
				</div>
			</div>
		</article>
	);
});

export default TrackChip;

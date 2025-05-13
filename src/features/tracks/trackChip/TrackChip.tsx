import PlayButton from "@/components/audioPlayer/components/playButton/PlayButton";
import Waveform from "@/components/audioPlayer/components/waveform/Waveform";
import ProfilePhoto from "@/features/nav/profilePhoto/ProfilePhoto";
import { useAudio } from "@/providers/AudioProvider";
import type { Track } from "@/types/track";
import { memo, useCallback, useMemo } from "react";
import { Link } from "react-router";
import * as style from "./TrackChip.css";

const TrackChip = memo(function TrackChip({ track }: { track: Track }) {
  const audio = useAudio();

  // Check if this track is currently active
  const isCurrentTrack = useMemo(() => {
    return audio.currentTrack?.id === track.id;
  }, [audio.currentTrack?.id, track.id]);

  const isPlaying = isCurrentTrack && audio.isPlaying;

  // Calculate progress for the waveform
  const progress = useMemo(() => {
    if (isCurrentTrack && audio.duration > 0) {
      return audio.currentTime / audio.duration;
    }
    return 0;
  }, [isCurrentTrack, audio.currentTime, audio.duration]);

  const handleClick = useCallback(() => {
    if (isCurrentTrack) {
      if (isPlaying) {
        audio.pauseTrack();
      } else {
        audio.resumeTrack();
        audio.setActiveSource("global");
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
            progress={progress}
          />
        </div>
      </div>
    </article>
  );
});

export default TrackChip;

import { GET_ARTIST } from "@/apollo/queries/userQueries";
import PlayButton from "@/components/audioPlayer/components/playButton/PlayButton";
import NotFound from "@/components/notFound/NotFound";
import ProfileGrainSVG from "@/components/svg/ProfileGrainSVG";
import TrackList from "@/features/artistProfile/artistTrackList/TrackList";
import FollowButton from "@/features/followButton/FollowButton";
import ProfilePhoto from "@/features/nav/profilePhoto/ProfilePhoto";
import { useAudio } from "@/providers/AudioProvider";
import { tokens } from "@/styles/tokens";
import type { Track } from "@/types/track";
import { useQuery } from "@apollo/client";
import { useCallback } from "react";
import * as style from "./ArtistProfile.css";
import PageLoadingIndicator from "./pageLoadingIndicator/PageLoadingIndicator";

const ArtistProfile = ({ artistName }: { artistName: string }) => {
  const { data, loading, error } = useQuery(GET_ARTIST, {
    variables: { username: artistName },
    fetchPolicy: "cache-first",
  });

  // Derive data directly from query result
  const artist = data?.user || null;
  const tracks = artist?.tracks || [];

  const audio = useAudio();

  const isTrackInCurrentTracksList = useCallback(
    (trackId: string | undefined): boolean => {
      if (!trackId || !tracks) return false;
      return tracks.some((track: Track) => track.id === trackId);
    },
    [tracks],
  );

  const isPlayingFromArtistPage = useCallback((): boolean => {
    return (
      !!audio.isPlaying &&
      audio.activeSource === "artist-view" &&
      isTrackInCurrentTracksList(audio.currentTrack?.id)
    );
  }, [
    audio.isPlaying,
    audio.activeSource,
    audio.currentTrack?.id,
    isTrackInCurrentTracksList,
  ]);

  const handlePlayToggle = useCallback(() => {
    if (!tracks.length) return;

    const allTracksInList = tracks;
    const firstTrack = tracks[0];

    // If already playing from this artist page
    if (
      audio.activeSource === "artist-view" &&
      isTrackInCurrentTracksList(audio.currentTrack?.id)
    ) {
      if (audio.isPlaying) {
        audio.pauseTrack();
      } else {
        audio.resumeTrack();
      }
    }
    // Otherwise play the first track
    else {
      audio.playTrackInQueue(firstTrack, allTracksInList, "artist-view");
    }
  }, [audio, tracks, isTrackInCurrentTracksList]);

  if (loading) return <PageLoadingIndicator />;
  if (error) return <NotFound />;
  if (artist === null) return <NotFound />;

  return (
    <div className={style.artistProfileContainer}>
      <div className={style.artistViewWrapper}>
        <title>Music | {artist?.username}</title>
        <div className={style.artistHeaderBackgroundGrain} aria-hidden>
          <ProfileGrainSVG />
        </div>
        <div className={style.artistHeaderBackground} aria-hidden>
          <ProfilePhoto
            profile={artist?.profile}
            width="100%"
            height={200}
            borderRadius={tokens.radii.md}
          />
        </div>

        <header className={style.artistHeaderContainer}>
          <div className={style.artistInfoAndPhoto}>
            <div className={style.artistInfoContainer}>
              <h1 className={style.artistTitle}>
                {artist?.profile?.name || artist?.username}
              </h1>
              <div className={style.artistButtons}>
                <FollowButton userToFollow={artist} />
              </div>
              <div className={style.artistDetails}>
                <p className={style.artistLocation}>
                  {artist?.profile?.location}
                </p>
                <p className={style.artistBio}>{artist?.profile?.bio}</p>
              </div>
            </div>
            <div className={style.profileImageContainer}>
              <PlayButton
                isPlaying={isPlayingFromArtistPage()}
                onToggle={handlePlayToggle}
                className={style.artistPlayButton}
                aria-label={
                  isPlayingFromArtistPage()
                    ? "pause"
                    : `play all ${tracks.length} tracks`
                }
              >
                play all {tracks.length} tracks
              </PlayButton>
              <ProfilePhoto
                aria-hidden
                profile={artist?.profile}
                width={200}
                height={200}
                borderRadius={tokens.radii.md}
              />
            </div>
          </div>
        </header>
        <div className={style.artistContentWrapper}>
          <div className={style.artistTrackViewInfo}>
            {tracks && <TrackList tracks={tracks} />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArtistProfile;

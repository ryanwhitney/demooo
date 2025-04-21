import { useCallback } from "react";
import * as style from "./ArtistProfile.css";
import TrackList from "@/features/artistProfile/artistTrackList/TrackList";
import { useAudio } from "@/providers/AudioProvider";
import PlayButton from "@/components/audioPlayer/components/playButton/PlayButton";
import { tokens } from "@/styles/tokens";
import ProfilePhoto from "@/features/nav/profilePhoto/ProfilePhoto";
import FollowButton from "@/features/followButton/FollowButton";
import { useQuery } from "@apollo/client";
import { GET_ARTIST } from "@/apollo/queries/userQueries";
import NotFound from "@/components/notFound/NotFound";
import PageLoadingIndicator from "./pageLoadingIndicator/PageLoadingIndicator";
import { Track } from "@/types/track";

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
		<div style={{ transition: "height 0.3s ease-in-out" }}>
			<div className={style.artistViewWrapper}>
				<title>Music | {artist?.username}</title>
				<div className={style.artistHeaderBackgroundGrain} aria-hidden>
					<svg
						viewBox="0 0 200 200"
						xmlns="http://www.w3.org/2000/svg"
						aria-hidden="true"
					>
						<filter id="noise">
							<feTurbulence
								type="fractalNoise"
								baseFrequency="5"
								numOctaves="10"
								stitchTiles="stitch"
							/>
							<feColorMatrix
								type="matrix"
								values="0 0 0 0 0
                        0 0 0 0 0
                        0 0 0 0 0
                        0 0 0 1 0"
							/>
						</filter>
						<rect
							width="100%"
							height="100%"
							filter="url(#noise)"
							opacity="0.25"
						/>
					</svg>
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
							<p className={style.artistLocation}>
								{artist?.profile?.location}
							</p>
							<p className={style.artistBio}>{artist?.profile?.bio}</p>
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
					<div className={style.artistButtons}>
						<FollowButton userToFollow={artist} />
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

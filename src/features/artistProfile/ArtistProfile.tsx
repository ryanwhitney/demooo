import { useCallback, useState } from "react";
import type { Track } from "@/types/track";
import * as style from "./ArtistProfile.css";
import TrackList from "@/features/artistProfile/artistTrackList/TrackList";
import { useAudio } from "@/providers/AudioProvider";
import PlayButton from "@/components/audioPlayer/components/playButton/PlayButton";
import { tokens } from "@/styles/tokens";
import ProfilePhoto from "@/features/nav/profilePhoto/ProfilePhoto";
import FollowButton from "@/features/followButton/FollowButton";
import type { User } from "@/types/user";
import { useQuery } from "@apollo/client";
import { GET_ARTIST } from "@/apollo/queries/userQueries";
import NotFound from "@/components/notFound/NotFound";
import PageLoadingIndicator from "./pageLoadingIndicator/PageLoadingIndicator";

const ArtistProfile = ({ artistName }: { artistName: string }) => {
	const [artist, setArtist] = useState<User | null>(null);
	const [tracks, setTracks] = useState<Track[] | []>([]);

	const { loading, error } = useQuery(GET_ARTIST, {
		variables: { username: artistName },
		fetchPolicy: "cache-first",
		onCompleted: (data) => {
			if (data?.user) {
				setArtist(data.user);
				setTracks(data.user?.tracks || []);
			}
		},
	});

	const audio = useAudio();

	const isTrackInCurrentTracksList = useCallback(
		(trackId: string | undefined): boolean => {
			if (!trackId || !tracks) return false;
			return tracks.some((track) => track.id === trackId);
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
		if (!tracks) return;

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
	console.log("artist", artist);
	return artist === null ? (
		<NotFound />
	) : (
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
						{/* <Button
								size="large"
								variant="primary"
								color={tokens.colors.primary}
								style={{
									width: "fit-content",
									paddingLeft: "8px",
									paddingRight: "8px",
									backgroundColor: tokens.colors.backgroundSecondary,
									border: `2px solid ${tokens.colors.backgroundSecondary}`,
								}}
							>
								•••
							</Button> */}
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

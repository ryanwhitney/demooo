import { useQuery } from "@apollo/client";
import { useCallback, useEffect } from "react";
import { GET_ARTIST } from "@/apollo/queries/userQueries";
import type { Track } from "@/types/track";
import {
	artistTrackViewInfo,
	artistViewWrapper,
	artistHeaderBackground,
	profileImageContainer,
	profileImage,
	artistInfoContainer,
	artistLocation,
	artistBio,
	artistPlayButton,
	artistHeaderContainer,
	artistTitle,
	artistContentWrapper,
	artistHeaderBackgroundGrain,
} from "./ArtistProfile.css";
import ProgressIndicator from "@/components/progressIndicator/ProgressIndicator";
import TrackList from "./artistTrackList/TrackList";
import { useAudio } from "@/providers/AudioProvider";
import PlayButton from "@/components/audioPlayer/components/playButton/PlayButton";
import { tokens } from "@/styles/tokens";
import Button from "@/components/button/Button";
import { useFollow } from "@/hooks/useFollow";

const ArtistProfile = ({ artistName }: { artistName: string }) => {
	const { data, loading, error, refetch } = useQuery(GET_ARTIST, {
		variables: { username: artistName },
	});

	const audio = useAudio();

	const tracks: Track[] = data?.user.tracks;

	const {
		isFollowing,
		// loading: loadingFollow,
		toggleFollow,
	} = useFollow(data?.user.username);

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

	useEffect(() => {
		refetch();
	}, [refetch]);

	return (
		<>
			{loading ? (
				<ProgressIndicator />
			) : error ? (
				error.message
			) : data.user === null ? (
				<p>Artist not found</p>
			) : (
				<div className={artistViewWrapper}>
					<title>Music | {data.user.username}</title>
					<div className={artistHeaderBackgroundGrain} role="presentation">
						<svg
							viewBox="0 0 200 200"
							xmlns="http://www.w3.org/2000/svg"
							role="presentation"
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
					<div
						className={artistHeaderBackground}
						role="presentation"
						style={{
							background: `url(http://localhost:8000/media/${data.user.profile.profilePictureOptimizedUrl})`,
						}}
					/>

					<header className={artistHeaderContainer}>
						<div className={profileImageContainer}>
							<PlayButton
								isPlaying={isPlayingFromArtistPage()}
								onToggle={handlePlayToggle}
								className={artistPlayButton}
							>
								play
							</PlayButton>
							<img
								src={`http://localhost:8000/media/${data.user.profile.profilePictureOptimizedUrl}`}
								width={200}
								height={200}
								className={profileImage}
								alt="buga"
							/>
						</div>
						<div className={artistInfoContainer}>
							<h2 className={artistTitle}>
								{data.user.profile.name || data.user.username}
							</h2>
							<p className={artistLocation}>{data.user.profile.location}</p>
							<p className={artistBio}>{data.user.profile.bio}</p>
						</div>
						<div
							style={{
								alignSelf: "flex-start",
								display: "flex",
								flexShrink: 100,
								justifyContent: "flex-end",
								alignItems: "center",
								width: "100%",
								gap: "10px",
							}}
						>
							<Button
								size="large"
								variant="primary"
								color={tokens.colors.primary}
								onClick={toggleFollow}
								style={{
									width: "fit-content",
									minWidth: 140,
									textAlign: "center",
									backgroundColor: isFollowing
										? tokens.colors.backgroundSecondary
										: tokens.colors.tintColor,
									border: `2px solid ${tokens.colors.backgroundSecondary}`,
									transition: "background-color 0.3s ease",
								}}
							>
								{isFollowing ? "✅ Following" : "Follow"}
							</Button>
							<Button
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
							</Button>
						</div>
					</header>
					<div className={artistContentWrapper}>
						<div className={artistTrackViewInfo}>
							{tracks && <TrackList tracks={tracks} />}
						</div>
					</div>
				</div>
			)}
		</>
	);
};

export default ArtistProfile;

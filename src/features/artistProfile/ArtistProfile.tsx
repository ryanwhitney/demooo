import { useQuery } from "@apollo/client";
import { useCallback, useEffect, useState } from "react";
import { GET_ARTIST } from "@/apollo/queries/userQueries";
import type { Track } from "@/types/track";
import {
	artistTrackViewInfo,
	artistViewWrapper,
	artistHeaderBackground,
	profileImageContainer,
	artistPlayButton,
	profileImage,
	artistInfoContainer,
	artistLocation,
	artistBio,
} from "./ArtistProfile.css";
import ProgressIndicator from "@/components/progressIndicator/ProgressIndicator";
import TrackList from "./artistTrackList/TrackList";
import { useAudio } from "@/providers/AudioProvider";
import PlayButton from "@/components/audioPlayer/components/playButton/PlayButton";
import { tokens } from "@/styles/tokens";

const ArtistProfile = ({ artistName }: { artistName: string }) => {
	const [tracks, setTracks] = useState<[Track] | null>(null);
	const { data, loading, error, refetch } = useQuery(GET_ARTIST, {
		variables: { username: artistName },
		onCompleted: (data) => {
			setTracks(data.user.tracks);
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
					<div
						className={artistHeaderBackground}
						style={{
							background: `url(http://localhost:8000/media/${data.user.profile.profilePictureOptimizedUrl})`,
						}}
					/>
					<div className={profileImageContainer}>
						<PlayButton
							isPlaying={isPlayingFromArtistPage()}
							onToggle={handlePlayToggle}
							// passing class currently not working for this component
							style={{
								width: 44,
								height: 44,
								padding: 0,
								border: `3px solid ${tokens.colors.background}`,
								background: tokens.colors.tintColor,
								borderRadius: tokens.radii.full,
								display: "flex",
								justifyContent: "center",
								alignItems: "center",
								cursor: "pointer",
								color: tokens.colors.primary,
								position: "absolute",
								bottom: -14,
								right: -14,
							}}
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
					<title>Music | {data.user.username}</title>
					<div className={artistInfoContainer}>
						<h2>{data.user.profile.name || data.user.username}</h2>
						<p className={artistLocation}>{data.user.profile.location}</p>
						<p className={artistBio}>{data.user.profile.bio}</p>
					</div>
					<div className={artistTrackViewInfo}>
						{tracks && <TrackList tracks={tracks} />}
					</div>
				</div>
			)}
		</>
	);
};

export default ArtistProfile;

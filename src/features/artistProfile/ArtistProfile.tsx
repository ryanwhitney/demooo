import { useQuery } from "@apollo/client";
import { useCallback, useEffect, useState } from "react";
import { GET_ARTIST } from "@/apollo/queries/userQueries";
import type { Track } from "@/types/track";
import { artistTrackViewInfo, artistViewWrapper } from "./ArtistProfile.css";
import ProgressIndicator from "@/components/progressIndicator/ProgressIndicator";
import { tokens } from "@/styles/tokens";

import TrackList from "./artistTrackList/TrackList";
import { useAudio } from "@/providers/AudioProvider";
import PlayButton from "@/components/audioPlayer/components/playButton/PlayButton";

const ArtistProfile = ({ artistName }: { artistName: string }) => {
	const [tracks, setTracks] = useState<[Track] | null>(null);
	const [isPLayingAll, setIsPlayingAll] = useState(false);

	const { data, loading, error, refetch } = useQuery(GET_ARTIST, {
		variables: { username: artistName },
		onCompleted: (data) => {
			setTracks(data.user.tracks);
		},
	});

	const audio = useAudio();

	const handlePlayToggle = useCallback(() => {
		if (tracks) {
			const allTracksInList = tracks;
			const firstTrack = tracks[0];
			audio.playTrackInQueue(firstTrack, allTracksInList, "global");
		}
	}, [audio, tracks]);

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
						style={{
							width: "100%",
							height: "200px",
							background: `url(http://localhost:8000/media/${data.user.profile.profilePictureOptimizedUrl})`,
							position: "absolute",
							top: 0,
							zIndex: -1,
							filter: "blur(50px) saturate(1.1) brightness(0.7)",
						}}
					/>
					<img
						src={`http://localhost:8000/media/${data.user.profile.profilePictureOptimizedUrl}`}
						width={200}
						height={200}
						style={{ borderRadius: tokens.radii.md }}
						alt="buga"
					/>
					<title>Music | {data.user.username}</title>
					<div
						style={{
							display: "flex",
							flexDirection: "column",
							justifyContent: "center",
							alignItems: "center",
						}}
					>
						<h2>{data.user.profile.name || data.user.username}</h2>
						<p
							style={{
								color: tokens.colors.secondary,
								fontSize: tokens.fontSizes.sm,
								marginBottom: tokens.space.md,
							}}
						>
							{data.user.profile.location}
						</p>
						<PlayButton
							isPlaying={
								audio.isPlaying && audio.activeSource === "artist-view"
							}
							onToggle={handlePlayToggle}
						>
							play
						</PlayButton>
						<p
							style={{
								color: tokens.colors.primary,
								fontSize: tokens.fontSizes.sm,
							}}
						>
							{data.user.profile.bio}
						</p>
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

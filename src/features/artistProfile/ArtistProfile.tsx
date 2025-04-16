import { useQuery } from "@apollo/client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { GET_ARTIST } from "@/apollo/queries/userQueries";
import type { Track } from "@/types/track";
import { artistTrackViewInfo, artistViewWrapper } from "./ArtistProfile.css";
import ProgressIndicator from "@/components/progressIndicator/ProgressIndicator";
import { tokens } from "@/styles/tokens";
import { formatTime, monthOrder } from "@/utils/timeAndDate";
import { useAudio } from "@/providers/AudioProvider";
import IconToggleButton from "@/components/IconToggleButton/IconToggleButton";
import HeartSVG from "@/components/svg/HeartSVG";
import PlaySVG from "@/components/svg/PlaySVG";
import PauseSVG from "@/components/svg/PauseSVG";
import TrackList from "./artistTrackList/TrackList";

const ArtistProfile = ({ artistName }: { artistName: string }) => {
	const [tracks, setTracks] = useState<[Track] | null>(null);

	const { data, loading, error, refetch } = useQuery(GET_ARTIST, {
		variables: { username: artistName },
		onCompleted: (data) => {
			setTracks(data.user.tracks);
		},
	});

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
					<img
						src="https://f4.bcbits.com/img/0035425273_10.jpg"
						width={200}
						height={200}
						style={{ borderRadius: tokens.radii.md }}
						alt="buga"
					/>
					<title>Music | {data.user.username}</title>
					<h2>{data.user.username}</h2>
					<div className={artistTrackViewInfo}>
						{tracks && <TrackList tracks={tracks} />}
					</div>
				</div>
			)}
		</>
	);
};

export default ArtistProfile;

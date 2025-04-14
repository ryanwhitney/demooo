import { useQuery } from "@apollo/client";
import { useEffect, useState } from "react";
import { GET_ARTIST } from "@/apollo/queries/userQueries";
import type { Track } from "@/types/track";
import TrackChip from "@/features/tracks/trackChip/TrackChip";
import { artistTrackViewInfo, artistViewWrapper } from "./ArtistProfile.css";
import ProgressIndicator from "@/components/progressIndicator/ProgressIndicator";

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
					<h2>{data.user.username}</h2>
					<div className={artistTrackViewInfo}>
						{tracks?.map((track: Track) => (
							<TrackChip key={track.id} track={track} />
						))}
					</div>
				</div>
			)}
		</>
	);
};

export default ArtistProfile;

import { useQuery } from "@apollo/client";
import { useEffect } from "react";
import { GET_ALL_TRACKS } from "../../apollo/queries/trackQueries";
import type { Track } from "../../types/track";
import TrackChip from "./trackChip/TrackChip";

const RecentTracks = () => {
	const { data, loading, error, refetch } = useQuery(GET_ALL_TRACKS);

	useEffect(() => {
		refetch();
	}, [refetch]);

	if (error) return `${error.message}`;
	if (loading) return "Submission error!";

	return (
		<div
			style={{
				display: "flex",
				flexDirection: "column",
				justifyContent: "center",
				alignItems: "center",
			}}
		>
			<p
				style={{
					padding: 20,
					textTransform: "uppercase",
					fontSize: 11,
					letterSpacing: 8,
					opacity: 0.3,
				}}
			>
				Latest
			</p>
			<div style={{ display: "flex", gap: 20, padding: 20, flexWrap: "wrap" }}>
				{data?.tracks?.map((track: Track) => (
					<TrackChip key={track.id} track={track} />
				))}
			</div>
		</div>
	);
};

export default RecentTracks;

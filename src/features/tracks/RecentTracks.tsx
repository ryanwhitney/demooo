import { GET_ALL_TRACKS } from "@/apollo/queries/trackQueries";
import ProgressIndicator from "@/components/progressIndicator/ProgressIndicator";
import TrackChip from "@/features/tracks/trackChip/TrackChip";
import type { Track } from "@/types/track";
import { useQuery } from "@apollo/client";
import { useEffect } from "react";

const RecentTracks = () => {
	const { data, loading, error, refetch } = useQuery(GET_ALL_TRACKS);

	useEffect(() => {
		refetch();
	}, [refetch]);

	return (
		<section
			style={{
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
			}}
		>
			<h2
				id="latest-tracks-heading"
				style={{
					padding: 20,
					textTransform: "uppercase",
					fontSize: 11,
					letterSpacing: 8,
					opacity: 0.3,
				}}
			>
				Latest
			</h2>
			{loading ? (
				<ProgressIndicator />
			) : error ? (
				<p>{error.message}</p>
			) : (
				<ul
					style={{
						display: "flex",
						gap: 16,
						justifyContent: "center",
						padding: 0,
						flexWrap: "wrap",
						listStyle: "none",
						margin: 0,
						maxWidth: 768,
					}}
				>
					{data?.tracks?.map((track: Track) => (
						<li key={`${track.id}`}>
							<TrackChip track={track} />
						</li>
					))}
				</ul>
			)}
		</section>
	);
};

export default RecentTracks;

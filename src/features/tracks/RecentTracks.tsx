import { GET_ALL_TRACKS } from "@/apollo/queries/trackQueries";
import { useQuery } from "@apollo/client";
import TrackChip from "@/features/tracks/trackChip/TrackChip";
import type { Track } from "@/types/track";
import { tokens } from "@/styles/tokens";
import PageLoadingIndicator from "../artistProfile/pageLoadingIndicator/PageLoadingIndicator";
import { GridList, GridListItem } from "react-aria-components";

const RecentTracks = () => {
	const { data, loading, error } = useQuery(GET_ALL_TRACKS, {
		fetchPolicy: "cache-first",
	});

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
					color: tokens.colors.secondary,
				}}
			>
				Latest
			</h2>
			{loading && !data?.tracks ? (
				<PageLoadingIndicator height={400} />
			) : error ? (
				<p>{error.message}</p>
			) : (
				<GridList
					aria-label="latest-tracks-heading"
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
						<GridListItem
							key={`${track.id}`}
							textValue={`${track.title} by ${track.artist.profile.name || track.artist.username}`}
						>
							<TrackChip track={track} />
						</GridListItem>
					))}
				</GridList>
			)}
		</section>
	);
};

export default RecentTracks;

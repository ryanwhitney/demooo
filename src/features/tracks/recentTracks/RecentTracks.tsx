import { GET_RECENT_TRACKS } from "@/apollo/queries/trackQueries";
import { useQuery } from "@apollo/client";
import TrackChip from "@/features/tracks/trackChip/TrackChip";
import type { Track } from "@/types/track";
import PageLoadingIndicator from "../../artistProfile/pageLoadingIndicator/PageLoadingIndicator";
import { GridList, GridListItem } from "react-aria-components";
import * as style from "./RecentTracks.css";

const RecentTracks = () => {
	const { data, loading, error } = useQuery(GET_RECENT_TRACKS, {
		fetchPolicy: "cache-first",
		variables: { limit: 12 }, // Limit to 12 tracks
	});

	return (
		<section className={style.recentTracksContainer}>
			<h2 id="recent-tracks-heading" className={style.recentTracksHeader}>
				Latest
			</h2>
			{loading && !data?.tracks ? (
				<PageLoadingIndicator height={400} timeout={0} />
			) : error ? (
				<p>{error.message}</p>
			) : (
				<GridList
					aria-labelledby="recent-tracks-heading"
					className={style.recentTracksGridContainer}
				>
					{data?.tracks?.map((track: Track) => (
						<GridListItem
							key={`${track.id}`}
							textValue={`${track.title} by ${track.artist.profile.name || track.artist.username}`}
							className={style.recentTracksGridListItem}
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

import { useParams } from "react-router";
import NavBar from "@/features/nav/NavBar";
import TrackView from "@/features/tracks/trackView/TrackView";
import { GET_TRACK_BY_SLUG } from "@/apollo/queries/trackQueries";
import { useQuery } from "@apollo/client";
import { useEffect } from "react";
import ProgressIndicator from "@/components/progressIndicator/ProgressIndicator";

function TrackPage() {
	const { artistName, titleSlug } = useParams();

	const { loading, error, data, refetch } = useQuery(GET_TRACK_BY_SLUG, {
		variables: { username: artistName, slug: titleSlug },
	});

	useEffect(() => {
		refetch();
	}, [refetch]);

	return (
		<>
			<NavBar />

			{loading ? (
				<ProgressIndicator />
			) : error ? (
				error.message
			) : data.trackBySlug === null ? (
				<p>track not found</p>
			) : (
				<TrackView track={data.trackBySlug} />
			)}
		</>
	);
}

export default TrackPage;

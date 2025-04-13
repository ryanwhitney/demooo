import { useParams } from "react-router";
import { mockData } from "../apollo/mockData";
import NavBar from "../features/nav/components/NavBar";
import TrackView from "../features/tracks/components/trackView/TrackView";
import { GET_TRACK_BY_SLUG } from "@/apollo/queries/trackQueries";
import { useQuery } from "@apollo/client";
import { useEffect } from "react";

function TrackPage() {
	const { artistName, titleSlug } = useParams();

	const { loading, error, data, refetch } = useQuery(GET_TRACK_BY_SLUG, {
		variables: { username: artistName, slug: titleSlug },
	});

	useEffect(() => {
		refetch();
	}, [refetch]);

	if (loading) return <p>Loading...</p>;
	if (error) return <p>Error: {error.message}</p>;

	return (
		<>
			<NavBar />
			<TrackView track={data.trackBySlug} />
		</>
	);
}

export default TrackPage;

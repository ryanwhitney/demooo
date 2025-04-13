import { useQuery } from "@apollo/client";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { GET_ARTIST } from "../apollo/queries/userQueries";
import NavBar from "../features/nav/components/NavBar";
import type { Track } from "../types/track";

const ArtistPage = () => {
	const { artistName } = useParams();
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

	if (loading) return <p>Loading...</p>;
	if (error) return <p>Error: {error.message}</p>;

	return (
		<>
			<NavBar />
			{data.user === null ? (
				<p>Artist not found</p>
			) : (
				<div>
					<h2>{data.user.username}</h2>
					{tracks &&
						tracks.map((track: Track) => (
							<div key={track.id}>
								<Link to={`/${data.user.username}/track?id=${track.id}`}>
									{track.title}
								</Link>
							</div>
						))}
				</div>
			)}
		</>
	);
};

export default ArtistPage;

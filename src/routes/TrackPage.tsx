import NavBar from "../components/nav/NavBar";
import { useSearchParams } from "react-router";
import { mockData } from "../apollo/mockData";
import TrackView from "../components/trackView/TrackView";

function TrackPage() {
	const [searchParams] = useSearchParams();
	const trackId = searchParams.get("id");
	const track = mockData.tracks.find((track) => track.id === trackId);

	return (
		<>
			<NavBar />
			{track ? <TrackView track={track} /> : <div>Track not found</div>}
		</>
	);
}

export default TrackPage;

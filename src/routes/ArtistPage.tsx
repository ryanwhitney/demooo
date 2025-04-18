import { useParams } from "react-router";
import ArtistProfile from "@/features/artistProfile/ArtistProfile";

const ArtistPage = () => {
	const { artistName } = useParams();

	return <>{artistName ? <ArtistProfile artistName={artistName} /> : "404"}</>;
};

export default ArtistPage;

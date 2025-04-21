import { useParams } from "react-router";
import ArtistProfile from "@/features/artistProfile/ArtistProfile";
const ArtistPage = () => {
	const { artistName } = useParams();
	if (!artistName) {
		return "404"; // should never happen as this would hit root route
	}
	return <ArtistProfile artistName={artistName} />;
};

export default ArtistPage;

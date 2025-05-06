import { useParams } from "react-router";
import ArtistProfile from "@/features/artistProfile/ArtistProfile";
import NotFound from "@/components/notFound/NotFound";
const ArtistPage = () => {
	const { artistName } = useParams();
	if (!artistName) {
		return <NotFound />; // should never happen as this would hit root route
	}
	return <ArtistProfile artistName={artistName} />;
};

export default ArtistPage;

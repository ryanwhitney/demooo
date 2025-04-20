import { useParams } from "react-router";
import ArtistProfile from "@/features/artistProfile/ArtistProfile";
import NotFound from "@/features/notFound/notFound";

const ArtistPage = () => {
	const { artistName } = useParams();

	return (
		<>
			{!artistName ? <ArtistProfile artistName={"artistName"} /> : <NotFound />}
		</>
	);
};

export default ArtistPage;

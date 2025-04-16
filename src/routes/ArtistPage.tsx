import { useParams } from "react-router";
import NavBar from "@/features/nav/navBar/NavBar";
import ArtistProfile from "@/features/artistProfile/ArtistProfile";

const ArtistPage = () => {
	const { artistName } = useParams();

	return (
		<>
			<NavBar />
			{artistName ? <ArtistProfile artistName={artistName} /> : "404"}
		</>
	);
};

export default ArtistPage;

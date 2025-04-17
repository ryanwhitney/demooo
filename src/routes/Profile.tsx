import NavBar from "@/features/nav/navBar/NavBar";
import { GET_ME } from "@/apollo/queries/userQueries";
import { useQuery } from "@apollo/client";
import { useEffect } from "react";

const ProfilePage = () => {
	const { data, loading, error, refetch } = useQuery(GET_ME, {
		onCompleted: (data) => {
			console.log(data);
		},
	});

	useEffect(() => {
		refetch();
	}, [refetch]);

	return (
		<>
			<NavBar />
			<main>{data && <h1>{data.me.username}</h1>}</main>
		</>
	);
};

export default ProfilePage;

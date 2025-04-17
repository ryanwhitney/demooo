import NavBar from "@/features/nav/navBar/NavBar";
import { GET_ME, UPDATE_USER_PROFILE } from "@/apollo/queries/userQueries";
import { useMutation, useQuery } from "@apollo/client";
import { useEffect, useState } from "react";
import TextInput from "@/components/textInput/TextInput";
import ProgressIndicator from "@/components/progressIndicator/ProgressIndicator";

const ProfilePage = () => {
	const [formData, setFormData] = useState({
		username: "",
		bio: "",
		name: "",
	});
	const { data, loading, error, refetch } = useQuery(GET_ME, {
		onCompleted: (data) => {
			console.log(data);
			if (data?.me) {
				setFormData({
					username: data.me.username || "",
					bio: data.me.profile?.bio || "",
					name: data.me.profile?.name || "",
				});
			}
		},
	});

	const [updateProfile, { loading: updateLoading }] = useMutation(
		UPDATE_USER_PROFILE,
		{
			onCompleted: (data) => {
				console.log("Profile updated:", data);
			},
			refetchQueries: [{ query: GET_ME }], // Refresh the profile data
		},
	);

	// Example function to handle form submission
	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		updateProfile({
			variables: {
				name: formData.name,
				bio: formData.bio,
			},
		});
	};

	useEffect(() => {
		refetch();
	}, [refetch]);

	const JsonViewer = ({ data }: { data: string }) => {
		const formattedJson = JSON.stringify(data, null, 2);

		return (
			<pre
				style={{
					padding: "10px",
					overflow: "auto",
					fontSize: 10,
				}}
			>
				<code>{formattedJson}</code>
			</pre>
		);
	};

	return (
		<>
			<NavBar />
			<main style={{ width: 400 }}>
				{updateLoading ? (
					<ProgressIndicator />
				) : (
					data && (
						<p>
							<JsonViewer data={data.me} />
							<br />
						</p>
					)
				)}
				<form onSubmit={handleSubmit}>
					<TextInput
						label="Username"
						disabled
						value={formData.username}
						// onChange={(e) =>
						// 	setFormData({ ...formData, username: e.target.value })
						// }
					/>
					<TextInput
						label="Display Name"
						value={formData.name}
						onChange={(e) => setFormData({ ...formData, name: e.target.value })}
					/>
					<TextInput
						label="Bio"
						value={formData.bio}
						onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
					/>
					<button type="submit">Save</button>
				</form>
			</main>
		</>
	);
};

export default ProfilePage;

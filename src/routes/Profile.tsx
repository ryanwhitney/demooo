import NavBar from "@/features/nav/navBar/NavBar";
import { GET_ME, UPDATE_USER_PROFILE } from "@/apollo/queries/userQueries";
import { useMutation, useQuery } from "@apollo/client";
import { type ChangeEvent, useEffect, useRef, useState } from "react";
import TextInput from "@/components/textInput/TextInput";
import ProgressIndicator from "@/components/progressIndicator/ProgressIndicator";
import TextArea from "@/components/textArea/TextArea";
import Button from "@/components/button/Button";
import ErrorBox from "@/components/errorBox/ErrorBox";

interface FormData {
	username?: string;
	bio?: string;
	name?: string;
	location?: string;
	profilePicture?: File | null;
}

const ProfilePage = () => {
	const [imagePreview, setImagePreview] = useState<string | null>(null);

	const [formData, setFormData] = useState<FormData>({
		username: "",
		bio: "",
		name: "",
		location: "",
		profilePicture: null,
	});

	const { data, loading, error, refetch } = useQuery(GET_ME, {
		onCompleted: (data) => {
			console.log(data);
			if (data?.me) {
				setFormData({
					username: data.me.username || "",
					bio: data.me.profile?.bio || "",
					name: data.me.profile?.name || "",
					location: data.me.profile?.location || "",
					profilePicture: null,
				});
			}
		},
	});

	const [updateProfile, { error: updateError, loading: updateLoading }] =
		useMutation(UPDATE_USER_PROFILE, {
			onCompleted: (data) => {
				console.log("Profile updated:", data);
				setImagePreview(null); // Clear the image preview after successful update
			},
			refetchQueries: ["Whom"], // Refresh the profile data
		});

	const fileInputRef = useRef<HTMLInputElement>(null);

	const triggerFileUpload = () => {
		if (!fileInputRef.current) return;
		fileInputRef.current.click();
	};

	const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
		if (!e.target.files || e.target.files.length === 0) return;
		const selectedFile = e.target.files[0];

		// Create a temporary URL for preview
		const previewUrl = URL.createObjectURL(selectedFile);
		setImagePreview(previewUrl);

		setFormData({ ...formData, profilePicture: selectedFile });
	};

	useEffect(() => {
		return () => {
			if (imagePreview) URL.revokeObjectURL(imagePreview);
		};
	}, [imagePreview]);

	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		// Only include profilePicture in variables if a file is selected
		const variables: {
			name: string | undefined;
			bio: string | undefined;
			location?: string;
			profilePicture?: File;
		} = {
			name: formData.name,
			bio: formData.bio,
			location: formData.location,
		};

		// Add profilePicture to variables only if a file is selected
		if (formData.profilePicture) {
			variables.profilePicture = formData.profilePicture;
		}

		updateProfile({
			variables: variables,
		});
	};

	useEffect(() => {
		refetch();
	}, [refetch]);

	const validateBio = async (value: string) => {
		if (value.length > 400) {
			return "Max 400 chars";
		}
		return "";
	};

	return (
		<>
			<NavBar />
			<main style={{ width: 400 }}>
				<div
					style={{
						width: 140,
						height: 140,
						overflow: "hidden",
						borderRadius: "8px",
						marginBottom: "15px",
						display: "flex",
						justifyContent: "center",
						alignItems: "center",
					}}
					onClick={triggerFileUpload}
					// trigger on spacebar
					tabIndex={0}
					onKeyDown={(e) => {
						if (e.key === "spacebar") {
							triggerFileUpload();
						}
					}}
				>
					{imagePreview ? (
						<img
							src={imagePreview}
							// biome-ignore lint/a11y/noRedundantAlt: it makes sense here.
							alt="preview of new profile photo"
						/>
					) : (
						data?.me?.profile?.profilePictureOptimizedUrl && (
							<img
								src={`http://localhost:8000/media/${data.me.profile.profilePictureOptimizedUrl}`}
								// biome-ignore lint/a11y/noRedundantAlt: it makes sense here.
								alt="Your profile photo"
								width={140}
								height={140}
								style={{
									borderRadius: "8px",
									marginBottom: "15px",
								}}
							/>
						)
					)}
				</div>
				{updateError && <ErrorBox text={updateError.message} />}
				<form onSubmit={handleSubmit}>
					<div style={{ marginBottom: "15px" }}>
						<label
							htmlFor="profilePicture"
							style={{ display: "block", marginBottom: "5px" }}
						>
							Profile Photo
						</label>
						<input
							ref={fileInputRef}
							id="profilePicture"
							name="profilePicture"
							type="file"
							style={{ fontSize: "11px" }}
							accept="image/*"
							onChange={handleFileChange}
						/>
					</div>

					<TextInput
						label="Username"
						disabled
						value={formData.username}
						// Read-only field
					/>

					<TextInput
						label="Display Name"
						value={formData.name}
						onChange={(e) => setFormData({ ...formData, name: e.target.value })}
					/>

					<TextInput
						label="Location"
						value={formData.location}
						onChange={(e) =>
							setFormData({ ...formData, location: e.target.value })
						}
					/>

					<TextArea
						label="Bio"
						value={formData.bio}
						onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
						validate={validateBio}
					/>

					<Button
						type="submit"
						disabled={updateLoading}
						size="large"
						style={{
							marginTop: "15px",
							padding: "8px 16px",
							backgroundColor: "#4f46e5",
							color: "white",
							border: "none",
							borderRadius: "4px",
							cursor: updateLoading ? "not-allowed" : "pointer",
						}}
					>
						{updateLoading ? <ProgressIndicator /> : "update profile"}
					</Button>
				</form>
			</main>
		</>
	);
};

export default ProfilePage;

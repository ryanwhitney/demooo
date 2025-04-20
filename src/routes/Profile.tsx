import { useMutation, useQuery } from "@apollo/client";
import { type ChangeEvent, useEffect, useRef, useState } from "react";
import { GET_ME } from "@/apollo/queries/userQueries";
import { UPDATE_USER_PROFILE } from "@/apollo/mutations/userMutations";
import Button from "@/components/button/Button";
import ErrorBox from "@/components/errorBox/ErrorBox";
import ProgressIndicator from "@/components/progressIndicator/ProgressIndicator";
import TextArea from "@/components/textArea/TextArea";
import TextInput from "@/components/textInput/TextInput";
import * as styles from "./profile.css";

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

	const fileInputRef = useRef<HTMLInputElement>(null);

	// Query to fetch user data
	// TODO: HANDLE ERROR STATES
	const { data, loading, refetch } = useQuery(GET_ME, {
		onCompleted: (data) => {
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

	// Mutation to update user profile
	const [updateProfile, { error: updateError, loading: updateLoading }] =
		useMutation(UPDATE_USER_PROFILE, {
			onCompleted: () => {
				setImagePreview(null); // Clear image preview after successful update
			},
			refetchQueries: ["Whom"], // Refresh the profile data
		});

	// Refresh data on component mount
	useEffect(() => {
		refetch();
	}, [refetch]);

	// Clean up image preview URL when component unmounts
	useEffect(() => {
		return () => {
			if (imagePreview) URL.revokeObjectURL(imagePreview);
		};
	}, [imagePreview]);

	const triggerFileUpload = () => {
		if (!fileInputRef.current) return;
		fileInputRef.current.click();
	};

	const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
		if (!e.target.files || e.target.files.length === 0) return;

		const selectedFile = e.target.files[0];
		const previewUrl = URL.createObjectURL(selectedFile);

		setImagePreview(previewUrl);
		setFormData({ ...formData, profilePicture: selectedFile });
	};

	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

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

		// Only add profilePicture if a file is selected
		if (formData.profilePicture) {
			variables.profilePicture = formData.profilePicture;
		}

		updateProfile({ variables });
	};

	const validateBio = async (value: string) => {
		if (value.length > 400) {
			return "Max 400 chars";
		}
		return "";
	};

	function getProfilePhotoUrl() {
		if (data?.me.profile?.profilePictureOptimizedUrl) {
			if (data.me.profile.profilePictureOptimizedUrl?.startsWith("http")) {
				return data.me.profile.profilePictureOptimizedUrl;
			}
			return `http://localhost:8000/${data.me.profile.profilePictureOptimizedUrl}`;
		}
		return null;
	}

	return (
		<>
			<main className={styles.main}>
				<div
					className={styles.imageContainer}
					onClick={triggerFileUpload}
					// biome-ignore lint/a11y/noNoninteractiveTabindex: it's been made iteractive
					tabIndex={0}
					onKeyDown={(e) => {
						if (e.key === "Enter" || e.key === " ") {
							e.preventDefault();
							triggerFileUpload();
						}
					}}
				>
					<div className={styles.uploadButtonContainer}>
						{loading && <ProgressIndicator />}
						<svg
							width="11"
							height="12"
							viewBox="0 0 11 12"
							fill="none"
							className={styles.uploadButton}
							xmlns="http://www.w3.org/2000/svg"
						>
							<title>upload new profile image</title>
							<path
								d="M5.33398 11.4238C5.02539 11.4238 4.77734 11.3242 4.58984 11.125C4.40234 10.9297 4.30859 10.6699 4.30859 10.3457V4.49219L4.41992 2.04883L4.98828 2.48828L3.5 4.26953L2.19336 5.58203C2.09961 5.67578 1.99219 5.75391 1.87109 5.81641C1.75391 5.87891 1.61719 5.91016 1.46094 5.91016C1.1875 5.91016 0.957031 5.82031 0.769531 5.64062C0.585938 5.45703 0.494141 5.2207 0.494141 4.93164C0.494141 4.6543 0.599609 4.41016 0.810547 4.19922L4.58398 0.419922C4.67383 0.326172 4.78711 0.253906 4.92383 0.203125C5.06055 0.148438 5.19727 0.121094 5.33398 0.121094C5.4707 0.121094 5.60742 0.148438 5.74414 0.203125C5.88086 0.253906 5.99609 0.326172 6.08984 0.419922L9.86328 4.19922C10.0742 4.41016 10.1797 4.6543 10.1797 4.93164C10.1797 5.2207 10.0859 5.45703 9.89844 5.64062C9.71484 5.82031 9.48633 5.91016 9.21289 5.91016C9.05664 5.91016 8.91797 5.87891 8.79688 5.81641C8.67969 5.75391 8.57422 5.67578 8.48047 5.58203L7.16797 4.26953L5.67969 2.48828L6.24805 2.04883L6.35352 4.49219V10.3457C6.35352 10.6699 6.25977 10.9297 6.07227 11.125C5.88477 11.3242 5.63867 11.4238 5.33398 11.4238Z"
								fill="currentColor"
							/>
						</svg>
					</div>
					<div className={styles.imageWrapper}>
						{imagePreview ? (
							<img
								width={140}
								height={140}
								src={imagePreview}
								className={styles.previewImage}
								// biome-ignore lint/a11y/noRedundantAlt: it makes sense here
								alt="preview of new profile photo"
							/>
						) : (
							getProfilePhotoUrl() && (
								<img
									width={140}
									height={140}
									src={getProfilePhotoUrl()}
									// biome-ignore lint/a11y/noRedundantAlt: it makes sense here
									alt="Your profile photo"
									className={styles.profileImage}
								/>
							)
						)}
					</div>
				</div>

				{/* Form Section */}
				{updateError && <ErrorBox text={updateError.message} />}
				<form onSubmit={handleSubmit}>
					{/* Hidden file input */}
					<div className={styles.formGroup}>
						<label htmlFor="profilePicture" className={styles.visuallyHidden}>
							Profile Photo
						</label>
						<input
							ref={fileInputRef}
							id="profilePicture"
							name="profilePicture"
							type="file"
							accept="image/*"
							onChange={handleFileChange}
							className={styles.visuallyHidden}
						/>
					</div>

					<TextInput label="Username" disabled value={formData.username} />

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
						className={styles.submitButton}
					>
						{updateLoading ? <ProgressIndicator /> : "update profile"}
					</Button>
				</form>
			</main>
		</>
	);
};

export default ProfilePage;

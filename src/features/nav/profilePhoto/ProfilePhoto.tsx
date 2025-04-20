import type { Profile } from "@/types/user";
import * as style from "./ProfilePhoto.css";
import { useState } from "react";

const ProfilePhoto = ({
	profile,
	size = 34,
}: { profile: Profile; size?: number }) => {
	const [imageError, setImageError] = useState(false);

	function getProfilePhotoUrl() {
		if (profile.profilePictureOptimizedUrl?.startsWith("http")) {
			return profile.profilePictureOptimizedUrl;
		}
		return `${import.meta.env.VITE_API_BASE_URL}${profile.profilePictureOptimizedUrl}`;
	}

	// Generate a consistent gradient color based on the user's ID or name
	function generateGradient() {
		const seed = profile.id || profile.name || "default";
		// Simple hash function to generate a number from a string
		const hash = seed
			.split("")
			.reduce((acc, char) => acc + char.charCodeAt(0), 0);

		// Generate two colors based on the hash
		const hue1 = hash % 360;
		const hue2 = (hash * 13) % 360; // Multiply by prime for more variation

		return `linear-gradient(135deg, hsl(${hue1}, 70%, 60%), hsl(${hue2}, 70%, 60%))`;
	}

	return imageError ? (
		<div
			style={{
				width: size,
				height: size,
				background: generateGradient(),
			}}
			className={style.profilePhoto}
		/>
	) : (
		<img
			width={size}
			height={size}
			src={getProfilePhotoUrl()}
			// biome-ignore lint/a11y/noRedundantAlt: makes sense here
			alt="Your profile photo"
			className={style.profilePhoto}
			onError={() => setImageError(true)}
		/>
	);
};

export default ProfilePhoto;

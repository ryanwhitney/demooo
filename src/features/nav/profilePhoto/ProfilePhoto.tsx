import { tokens } from "@/styles/tokens";
import type { Profile } from "@/types/user";
import { useState } from "react";

const DEFAULT_SIZE = 34;

const ProfilePhoto = ({
	profile,
	height = DEFAULT_SIZE,
	width = DEFAULT_SIZE,
	borderRadius = tokens.radii.full,
	ariaHidden,
}: {
	profile: Profile;
	height?: number | string;
	width?: number | string;
	borderRadius?: string;
	ariaHidden?: boolean;
}) => {
	const [imageError, setImageError] = useState(false);

	function getProfilePhotoUrl() {
		if (profile.profilePictureOptimizedUrl?.startsWith("http")) {
			return profile.profilePictureOptimizedUrl;
		}
		return `${import.meta.env.VITE_API_BASE_URL}${profile.profilePictureOptimizedUrl}`;
	}

	// Generate a consistent gradient color based on the user's ID or name
	function generateGradient() {
		const seed = profile.id || "default";
		//  hash function to generate a number from a string
		const hash = seed
			.split("")
			.reduce((acc, char) => acc + char.charCodeAt(0), 0);

		const hue1 = hash % 360;
		const hue2 = (hash * 13) % 360;
		return `linear-gradient(135deg, hsl(${hue1}, 70%, 60%), hsl(${hue2}, 70%, 60%))`;
	}

	// Helper function to convert height/width to CSS value
	function toCssValue(value: number | string): string {
		return typeof value === "number" ? `${value}px` : value;
	}

	return imageError ? (
		<div
			style={{
				width: toCssValue(width),
				height: toCssValue(height),
				borderRadius: borderRadius,
				background: generateGradient(),
				flexShrink: 0,
			}}
			aria-hidden={ariaHidden}
		/>
	) : (
		<img
			width={toCssValue(width)}
			height={toCssValue(height)}
			src={getProfilePhotoUrl()}
			alt="profile photo"
			style={{ borderRadius: `${borderRadius}`, flexShrink: 0 }}
			onError={() => setImageError(true)}
			aria-hidden={ariaHidden}
		/>
	);
};

export default ProfilePhoto;

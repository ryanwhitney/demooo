import type { Profile } from "@/types/user";
import * as style from "./ProfilePhoto.css";

const ProfilePhoto = ({
	profile,
	size = 34,
}: { profile: Profile; size?: number }) => {
	function getProfilePhotoUrl() {
		if (profile.profilePictureOptimizedUrl?.startsWith("http")) {
			return profile.profilePictureOptimizedUrl;
		}
		return `http://localhost:8000/${profile.profilePictureOptimizedUrl}`;
	}

	return (
		<img
			width={size}
			height={size}
			src={getProfilePhotoUrl()}
			// biome-ignore lint/a11y/noRedundantAlt: it's descriptive here
			alt="Your profile photo"
			className={style.profilePhoto}
		/>
	);
};

export default ProfilePhoto;

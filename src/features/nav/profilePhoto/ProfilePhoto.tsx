import type { User } from "@/types/auth";
import * as style from "./ProfilePhoto.css";

const ProfilePhoto = ({ me, size = 34 }: { me: User; size?: number }) => {
	function getProfilePhotoUrl() {
		if (me.profile.profilePictureOptimizedUrl?.startsWith("http")) {
			return me.profile.profilePictureOptimizedUrl;
		}
		return `http://localhost:8000/media/${me.profile.profilePictureOptimizedUrl}`;
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

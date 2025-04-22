import Button from "@/components/button/Button";
import { useAuth } from "@/hooks/useAuth";
import { useFollow } from "@/hooks/useFollow";
import { tokens } from "@/styles/tokens";
import type { User } from "@/types/user";

const FollowButton = ({ userToFollow }: { userToFollow: User }) => {
	const {
		isFollowing,
		// loading: loadingFollow,
		toggleFollow,
	} = useFollow(userToFollow.username);
	const { user } = useAuth();

	// Check if current user is the same as userToFollow
	const isSameUser = user?.username === userToFollow.username;

	return isSameUser ? (
		<Button
			variant="primary"
			style={{
				minWidth: 120,
				borderRadius: 40,
				fontSize: 11,
				padding: " 6px 10px",
				// transition: "background-color 0s",
				border: `2px solid ${tokens.colors.backgroundSecondary}`,
			}}
		>
			Edit Profile
		</Button>
	) : (
		<Button
			variant={isFollowing ? "secondary" : "primary"}
			onClick={toggleFollow}
			style={{
				minWidth: 120,
				borderRadius: 40,
				fontSize: 11,
				padding: " 6px 10px",
				transition: "background-color 0s",
				border: `2px solid ${tokens.colors.backgroundSecondary}`,
			}}
			disabled={isSameUser}
		>
			{isFollowing ? "Following" : "+ Follow"}
		</Button>
	);
};
export default FollowButton;

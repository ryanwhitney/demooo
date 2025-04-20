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
		<Button size="large" variant="primary" color={tokens.colors.primary}>
			it's you :-)
		</Button>
	) : (
		<Button
			size="large"
			variant="primary"
			color={tokens.colors.primary}
			onClick={toggleFollow}
			style={{
				width: "fit-content",
				minWidth: 140,
				textAlign: "center",
				backgroundColor: isFollowing
					? tokens.colors.backgroundSecondary
					: tokens.colors.tintColor,
				border: `2px solid ${tokens.colors.backgroundSecondary}`,
				transition: "background-color 0.3s ease",
			}}
			disabled={isSameUser}
		>
			{isFollowing ? "✅ Following" : "Follow"}
		</Button>
	);
};
export default FollowButton;

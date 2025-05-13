import Button from "@/components/button/Button";
import { useAuth } from "@/hooks/useAuth";
import { useFollow } from "@/hooks/useFollow";
import { useModal } from "@/hooks/useModal";
import { ModalType } from "@/types/modal";
import { tokens } from "@/styles/tokens";
import type { User } from "@/types/user";
import UpdateProfile from "../updateProfile/UpdateProfile";

const FollowButton = ({ userToFollow }: { userToFollow: User }) => {
	const {
		isFollowing,
		// loading: loadingFollow,
		toggleFollow,
	} = useFollow(userToFollow.username);

	const { openModal } = useModal();
	const { user, isAuthenticated } = useAuth();

	// Check if current user is the same as userToFollow
	const isSameUser = user?.username === userToFollow.username;

	const handleFollowClick = () => {
		if (!isAuthenticated) {
			// Open the auth prompt modal which will handle the transition to signup/login
			openModal(ModalType.AUTH, {
				authRedirect: {
					login: false,
					message: `Sign up to follow ${userToFollow.username}`,
					actionText: "Sign up to follow",
				},
				onSuccess: toggleFollow,
			});
			return;
		}
		toggleFollow();
	};

	const handleEditProfileClick = () => {
		openModal(ModalType.PROFILE, {
			content: <UpdateProfile />,
		});
	};

	return (
		<>
			{isSameUser ? (
				<Button
					variant="primary"
					onClick={handleEditProfileClick}
					style={{
						minWidth: 120,
						borderRadius: 40,
						fontSize: 11,
						padding: " 6px 10px",
						border: `2px solid ${tokens.colors.backgroundSecondary}`,
					}}
				>
					Edit Profile
				</Button>
			) : (
				<Button
					variant={isFollowing ? "secondary" : "primary"}
					onClick={handleFollowClick}
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
			)}
		</>
	);
};

export default FollowButton;

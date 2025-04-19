import type { User } from "@/types/auth";
import ProfilePhoto from "@/features/nav/profilePhoto/ProfilePhoto";
import {
	Button,
	Menu,
	MenuItem,
	MenuTrigger,
	Popover,
	Separator,
} from "react-aria-components";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router";
import * as styles from "./ProfileMenu.css";

const ProfileMenu = ({ me }: { me: User }) => {
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const [opacity, setOpacity] = useState(0);
	const TRANSITION_SPEED = 200;
	const auth = useAuth();

	const handleOpenChange = (open: boolean) => {
		if (open) {
			setIsMenuOpen(true);
			setTimeout(() => {
				setOpacity(1);
			}, 1);
		} else {
			setOpacity(0);
			setTimeout(() => {
				setIsMenuOpen(false);
			}, TRANSITION_SPEED);
		}
	};

	return (
		<MenuTrigger isOpen={isMenuOpen} onOpenChange={handleOpenChange}>
			<Button type="button" aria-label="Menu">
				<ProfilePhoto me={me} />
			</Button>
			<Popover
				className={styles.popover}
				style={{
					transition: `opacity ${TRANSITION_SPEED}ms cubic-bezier(.05, .69, .14, 1)`,
					opacity: opacity,
				}}
			>
				<div className={styles.profileContainer}>
					<ProfilePhoto me={me} size={60} />
					<div className={styles.profileInfoContainer}>
						<span className={styles.profileName}>{me.profile.name}</span>
						<span className={styles.profileUsername}>{me.username}</span>
					</div>
				</div>
				<Separator className={styles.separator} />
				<Menu className={styles.menuContainer}>
					<MenuItem>
						<Link to={"/profile"} className={styles.menuItem}>
							Profile
						</Link>
					</MenuItem>
					<Separator className={styles.separator} />
					<MenuItem>
						<Button onPress={auth.logout} className={styles.menuItem}>
							Log Out
						</Button>
					</MenuItem>
				</Menu>
			</Popover>
		</MenuTrigger>
	);
};

export default ProfileMenu;

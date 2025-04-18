import Button from "@/components/button/Button";
import Modal from "@/components/modal/Modal";
import CreateAccount from "@/features/auth/CreateAccount";
import Login from "@/features/auth/Login";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";
import { createPortal } from "react-dom";
import { Link, NavLink } from "react-router";
import { logo, navBar, navBarUserAvatar, navItemsList } from "./NavBar.css";
import TrackUpload from "@/features/tracks/trackUpload/TrackUpload";
import DemoooLogo from "../AnimatedLogo/DemoooLogo";
import { buttonStyles } from "@/components/button/Button.css";
import { useQuery } from "@apollo/client";
import { GET_ME } from "@/apollo/queries/userQueries";
import TrackMultiUpload from "@/features/tracks/trackMultiUpload/TrackMultiUpload";

function NavBar() {
	const [showSignUpModal, setShowSignUpModal] = useState(false);
	const [showLoginModal, setShowLoginModal] = useState(false);
	const [showUploadModal, setShowUploadModal] = useState(false);

	const me = useAuth();

	const { loading, data } = useQuery(GET_ME, {
		fetchPolicy: "cache-and-network",
	});

	return (
		<>
			<nav className={navBar}>
				<NavLink to={"/"} className={logo}>
					<DemoooLogo text="demoooooooo" />
				</NavLink>
				<ul className={navItemsList}>
					{me.isAuthenticated ? (
						<>
							<li>
								<Link
									className={buttonStyles({})}
									style={{
										textDecoration: "none",
										display: "flex",
										alignItems: "center",
										gap: 8,
									}}
									to={`${me.user?.username}`}
								>
									me
								</Link>
							</li>
							<li>
								<Button
									variant="primary"
									onClick={() => setShowUploadModal(true)}
								>
									upload
								</Button>
							</li>
							<li>
								<Button variant="primary" onClick={me.logout}>
									logout
								</Button>
							</li>
							<li>
								<Link
									className={buttonStyles({})}
									style={{
										textDecoration: "none",
										display: "flex",
										alignItems: "center",
										gap: 8,
									}}
									to={"/profile"}
								>
									{me.user?.username}
									{data?.me?.profile.profilePictureOptimizedUrl && (
										<img
											src={`http://localhost:8000/media/${data.me?.profile.profilePictureOptimizedUrl}`}
											alt="user profile"
											className={navBarUserAvatar}
										/>
									)}
								</Link>
							</li>
						</>
					) : (
						<>
							<li>
								<Button
									variant="primary"
									onClick={() => setShowLoginModal(true)}
								>
									log in
								</Button>
							</li>
							<li>
								<Button
									variant="primary"
									onClick={() => setShowSignUpModal(true)}
								>
									join
								</Button>
							</li>
						</>
					)}
				</ul>
			</nav>
			{showLoginModal &&
				createPortal(
					<Modal title="Log in" onClose={() => setShowLoginModal(false)}>
						<Login onSuccess={() => setShowLoginModal(false)} />
					</Modal>,
					document.body,
				)}
			{showSignUpModal &&
				createPortal(
					<Modal title="Join demooo" onClose={() => setShowSignUpModal(false)}>
						<CreateAccount onSuccess={() => setShowSignUpModal(false)} />
					</Modal>,
					document.body,
				)}
			{showUploadModal &&
				createPortal(
					<Modal
						title="Upload a Track"
						onClose={() => setShowUploadModal(false)}
					>
						<TrackMultiUpload />
					</Modal>,
					document.body,
				)}
		</>
	);
}

export default NavBar;

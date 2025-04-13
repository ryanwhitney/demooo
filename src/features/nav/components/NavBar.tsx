import demoSvg from "@/assets/demoooooooooooooooo.svg";
import Button from "@/components/button/Button";
import Modal from "@/components/modal/Modal";
import CreateAccount from "@/features/auth/components/CreateAccount";
import Login from "@/features/auth/components/Login";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router";
import { logo, navBar, navBarUser, navItemsList } from "./NavBar.css";
import TrackUpload from "@/features/tracks/components/trackUpload/TrackUpload";

function NavBar() {
	const [showSignUpModal, setShowSignUpModal] = useState(false);
	const [showLoginModal, setShowLoginModal] = useState(false);
	const [showUploadModal, setShowUploadModal] = useState(false);

	const me = useAuth();

	return (
		<>
			<nav className={navBar}>
				<Link to="/" className={logo}>
					<img src={demoSvg} alt="Demo" />
				</Link>
				<ul className={navItemsList}>
					{me.isAuthenticated ? (
						<>
							<li className={navBarUser}>{me.user?.username}</li>
							<li>
								<Button variant="primary">explore</Button>
							</li>
							<li>
								<Button variant="primary">favs</Button>
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
						</>
					) : (
						<>
							<li>
								<Button
									variant="primary"
									onClick={() => setShowLoginModal(true)}
								>
									explore
								</Button>
							</li>
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
						onClose={() => setShowSignUpModal(false)}
					>
						<TrackUpload />
					</Modal>,
					document.body,
				)}
		</>
	);
}

export default NavBar;

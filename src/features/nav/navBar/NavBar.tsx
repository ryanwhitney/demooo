import Button from "@/components/button/Button";
import Modal from "@/components/modal/Modal";
import CreateAccount from "@/features/auth/CreateAccount";
import Login from "@/features/auth/Login";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";
import { createPortal } from "react-dom";
import { Link, NavLink } from "react-router";
import { logo, navBar, navBarUser, navItemsList } from "./NavBar.css";
import TrackUpload from "@/features/tracks/trackUpload/TrackUpload";
import DemoooLogo from "../AnimatedLogo/DemoooLogo";
import { buttonStyles } from "@/components/button/Button.css";

function NavBar() {
	const [showSignUpModal, setShowSignUpModal] = useState(false);
	const [showLoginModal, setShowLoginModal] = useState(false);
	const [showUploadModal, setShowUploadModal] = useState(false);

	const me = useAuth();

	return (
		<>
			<nav className={navBar}>
				<NavLink to={"/"} className={logo}>
					<DemoooLogo text="demoooooooo" />
				</NavLink>
				<ul className={navItemsList}>
					{me.isAuthenticated ? (
						<>
							<li className={navBarUser}>{me.user?.username}</li>
							<Link
								className={buttonStyles({})}
								style={{ textDecoration: "none" }}
								to={"/profile"}
							>
								profile
							</Link>
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
						<TrackUpload />
					</Modal>,
					document.body,
				)}
		</>
	);
}

export default NavBar;

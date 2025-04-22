import Button from "@/components/button/Button";
import Modal from "@/components/modal/Modal";
import CreateAccount from "@/features/auth/CreateAccount";
import Login from "@/features/auth/Login";
import { useState } from "react";
import { createPortal } from "react-dom";
import { Link, NavLink } from "react-router";
import { logo, navBar, navItemsList } from "./NavBar.css";
import DemoooLogo from "../AnimatedLogo/DemoooLogo";
import { buttonStyles } from "@/components/button/Button.css";
import { useQuery } from "@apollo/client";
import { GET_ME } from "@/apollo/queries/userQueries";
import ProfileMenu from "@/features/nav/profileMenu/ProfileMenu";

function NavBar() {
	const [showSignUpModal, setShowSignUpModal] = useState(false);
	const [showLoginModal, setShowLoginModal] = useState(false);

	const { data } = useQuery(GET_ME, {
		fetchPolicy: "cache-and-network",
	});

	return (
		<>
			<nav className={navBar}>
				<NavLink to={"/"} className={logo}>
					<DemoooLogo text="demoooooooo" />
				</NavLink>
				<ul className={navItemsList}>
					{data?.me?.username ? (
						<>
							<li>
								<Link className={buttonStyles({ variant: "nav" })} to="/upload">
									upload
								</Link>
							</li>
							<ProfileMenu me={data.me} />
						</>
					) : (
						<>
							<li>
								<Button variant="nav" onClick={() => setShowLoginModal(true)}>
									log in
								</Button>
							</li>
							<li>
								<Button variant="nav" onClick={() => setShowSignUpModal(true)}>
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
						<Login />
					</Modal>,
					document.body,
				)}
			{showSignUpModal &&
				createPortal(
					<Modal title="Join demooo" onClose={() => setShowSignUpModal(false)}>
						<CreateAccount />
					</Modal>,
					document.body,
				)}
		</>
	);
}

export default NavBar;

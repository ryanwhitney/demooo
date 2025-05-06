import Button from "@/components/button/Button";
import Modal from "@/components/modal/ModalForm";
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

type ActiveModal = "login" | "signup" | null;

const NavBar = () => {
	const [activeModal, setActiveModal] = useState<ActiveModal>(null);

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
								<Button variant="nav" onClick={() => setActiveModal("login")}>
									log in
								</Button>
							</li>
							<li>
								<Button variant="nav" onClick={() => setActiveModal("signup")}>
									join
								</Button>
							</li>
						</>
					)}
				</ul>
			</nav>
			{createPortal(
				<Modal
					title="Log in"
					isOpen={activeModal === "login"}
					onOpenChange={(isOpen) => {
						if (!isOpen) setActiveModal(null);
					}}
				>
					<Login />
				</Modal>,
				document.body,
			)}
			{createPortal(
				<Modal
					title="Join demooo"
					isOpen={activeModal === "signup"}
					onOpenChange={(isOpen) => {
						if (!isOpen) setActiveModal(null);
					}}
				>
					<CreateAccount />
				</Modal>,
				document.body,
			)}
		</>
	);
};

export default NavBar;

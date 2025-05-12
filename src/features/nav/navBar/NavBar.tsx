import Button from "@/components/button/Button";
import { useQuery } from "@apollo/client";
import { GET_ME } from "@/apollo/queries/userQueries";
import { Link, NavLink } from "react-router";
import { logo, navBar, navItemsList } from "./NavBar.css";
import DemoooLogo from "../AnimatedLogo/DemoooLogo";
import { buttonStyles } from "@/components/button/Button.css";
import ProfileMenu from "@/features/nav/profileMenu/ProfileMenu";
import { useModal } from "@/hooks/useModal";
import { ModalType } from "@/types/modal";

const NavBar = () => {
	const { openModal } = useModal();

	const { data } = useQuery(GET_ME, {
		fetchPolicy: "cache-and-network",
	});

	return (
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
							<Button variant="nav" onClick={() => openModal(ModalType.LOGIN)}>
								log in
							</Button>
						</li>
						<li>
							<Button variant="nav" onClick={() => openModal(ModalType.SIGNUP)}>
								join
							</Button>
						</li>
					</>
				)}
			</ul>
		</nav>
	);
};

export default NavBar;

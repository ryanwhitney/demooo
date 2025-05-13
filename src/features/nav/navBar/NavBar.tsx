import { GET_ME } from "@/apollo/queries/userQueries";
import Button from "@/components/button/Button";
import { buttonStyles } from "@/components/button/Button.css";
import ProfileMenu from "@/features/nav/profileMenu/ProfileMenu";
import { useModal } from "@/hooks/useModal";
import { ModalType } from "@/types/modal";
import { useQuery } from "@apollo/client";
import { Link, NavLink } from "react-router";
import DemoooLogo from "../AnimatedLogo/DemoooLogo";
import { logo, navBar, navItemsList } from "./NavBar.css";

const NavBar = () => {
  const { openModal } = useModal();

  const { data } = useQuery(GET_ME, {
    fetchPolicy: "cache-and-network",
  });

  const handleLoginClick = () => {
    openModal(ModalType.LOGIN);
  };

  const handleSignupClick = () => {
    openModal(ModalType.SIGNUP);
  };

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
              <Button variant="nav" onClick={handleLoginClick}>
                log in
              </Button>
            </li>
            <li>
              <Button variant="nav" onClick={handleSignupClick}>
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

import { Outlet } from "react-router";
import NavBar from "@/features/nav/navBar/NavBar";
import SiteFooter from "@/features/footer/SiteFooter";
import GlobalPlayer from "@/features/audio/globalPlayer/GlobalPlayer";
import ToastSystem from "@/features/toastSystem/ToastSystem";

const MainLayout = () => {
	return (
		<>
			<ToastSystem />
			<NavBar />
			<main className="content">
				<Outlet />
			</main>
			<SiteFooter />
			<GlobalPlayer />
		</>
	);
};

export default MainLayout;

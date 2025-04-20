// src/layouts/MainLayout.tsx
import { Outlet } from "react-router";
import NavBar from "@/features/nav/navBar/NavBar";
import SiteFooter from "@/features/footer/SiteFooter";
import GlobalPlayer from "@/features/audio/globalPlayer/GlobalPlayer";

const MainLayout = () => {
	return (
		<>
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

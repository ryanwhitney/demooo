import GlobalPlayer from "@/features/audio/globalPlayer/GlobalPlayer";
import SiteFooter from "@/features/footer/SiteFooter";
import NavBar from "@/features/nav/navBar/NavBar";
import ToastSystem from "@/features/toastSystem/ToastSystem";
import { Outlet } from "react-router";

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

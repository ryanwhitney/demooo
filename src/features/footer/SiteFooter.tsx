import { tokens } from "@/styles/tokens";
import * as style from "./SiteFooter.css";

const SiteFooter = () => {
	return (
		<footer className={style.siteFooterContainer}>
			<small>
				<span className={style.siteFooterCopyright}>&copy;</span> demoooo 2025
			</small>
		</footer>
	);
};

export default SiteFooter;

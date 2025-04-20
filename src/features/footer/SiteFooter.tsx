import { tokens } from "@/styles/tokens";

const SiteFooter = () => {
	return (
		<footer
			style={{
				display: "flex",
				justifyContent: "center",
				padding: tokens.space.xl,
				paddingTop: tokens.space.xxl,
				alignItems: "center",
				lineHeight: 1,
				color: tokens.colors.secondary,
			}}
		>
			<small>
				<span style={{ fontSize: 12, position: "relative", bottom: -2 }}>
					&copy;
				</span>{" "}
				demoooo 2025
			</small>
		</footer>
	);
};

export default SiteFooter;

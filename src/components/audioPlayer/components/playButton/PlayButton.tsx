import { tokens } from "@/styles/tokens";
import type { HTMLAttributes } from "react";

export type PlayButtonProps = HTMLAttributes<HTMLButtonElement> & {
	isPlaying: boolean;
	onClick: () => void;
	color?: string;
};

const PlayButton = ({
	isPlaying,
	onClick,
	color,
	style,
	...rest
}: PlayButtonProps) => (
	<button
		type="button"
		onClick={onClick}
		aria-label={isPlaying ? "Pause" : "Play"}
		style={{
			background: tokens.colors.backgroundSecondary,
			borderRadius: 999,
			display: "flex",
			justifyContent: "center",
			alignContent: "center",
			cursor: "pointer",
			color: color || "white",
			border: "none",
			...style, // Merge with any styles passed in props
		}}
		{...rest}
	>
		{isPlaying ? (
			<svg
				width="100%"
				height="100%"
				viewBox="0 0 21 28"
				xmlns="http://www.w3.org/2000/svg"
			>
				<title>pause</title>
				<path
					d="M2.44141 27.7432C1.71094 27.7432 1.15755 27.555 0.78125 27.1787C0.416016 26.8024 0.233398 26.249 0.233398 25.5186V2.49219C0.233398 1.76172 0.416016 1.21387 0.78125 0.848633C1.15755 0.472331 1.71094 0.28418 2.44141 0.28418H6.22656C6.94596 0.28418 7.49382 0.461263 7.87012 0.81543C8.24642 1.1696 8.43457 1.72852 8.43457 2.49219V25.5186C8.43457 26.249 8.24642 26.8024 7.87012 27.1787C7.49382 27.555 6.94596 27.7432 6.22656 27.7432H2.44141ZM14.5107 27.7432C13.7803 27.7432 13.2269 27.555 12.8506 27.1787C12.4743 26.8024 12.2861 26.249 12.2861 25.5186V2.49219C12.2861 1.76172 12.4743 1.21387 12.8506 0.848633C13.2269 0.472331 13.7803 0.28418 14.5107 0.28418H18.2793C19.0098 0.28418 19.5576 0.461263 19.9229 0.81543C20.2992 1.1696 20.4873 1.72852 20.4873 2.49219V25.5186C20.4873 26.249 20.2992 26.8024 19.9229 27.1787C19.5576 27.555 19.0098 27.7432 18.2793 27.7432H14.5107Z"
					fill="currentColor"
				/>
			</svg>
		) : (
			<svg
				width="100%"
				height="100%"
				viewBox="0 0 26 28"
				style={{ position: "relative", right: -1.5 }}
			>
				<title>play</title>
				<path
					d="M0.233398 25.5352V2.49219C0.233398 1.66211 0.438151 1.05339 0.847656 0.666016C1.25716 0.267578 1.74414 0.0683594 2.30859 0.0683594C2.80664 0.0683594 3.31576 0.21224 3.83594 0.5L23.1768 11.8057C23.863 12.2041 24.3389 12.5638 24.6045 12.8848C24.8812 13.1947 25.0195 13.571 25.0195 14.0137C25.0195 14.4453 24.8812 14.8216 24.6045 15.1426C24.3389 15.4635 23.863 15.8232 23.1768 16.2217L3.83594 27.5273C3.31576 27.8151 2.80664 27.959 2.30859 27.959C1.74414 27.959 1.25716 27.7598 0.847656 27.3613C0.438151 26.9629 0.233398 26.3542 0.233398 25.5352Z"
					fill="currentColor"
				/>
			</svg>
		)}
	</button>
);

export default PlayButton;

import { arraySample } from "@/utils/arraySample";
import * as style from "../AudioPlayer.css";

interface WaveformProps {
	data: number[];
	progress?: number;
	width?: number;
	height?: number;
	barWidth?: number;
	spacing?: number;
	progressColor?: string;
	barColor?: string;
	isInteractive?: boolean;
}

/**
 * Pure visual component that renders a waveform visualization from amplitude data
 */
const Waveform = ({
	data,
	progress = 0,
	width = 240,
	height = 30,
	barWidth = 1.2,
	spacing = 3,
	isInteractive = false,
}: WaveformProps) => {
	const progressWidth = progress * 100;
	let xPosition = (barWidth + spacing) * -1;

	const bars = width / (spacing + barWidth);
	const sampledWavelengthData = arraySample({
		array: data,
		sampleCount: Math.floor(bars),
	});

	return (
		<div className={style.waveformVisualization}>
			{/* Progress overlay */}
			<div
				className={style.waveformProgress}
				style={{
					width: `${progressWidth}%`,
					display: progressWidth > 0 ? "block" : "none",
				}}
			/>

			{/* Waveform visualization */}
			<svg
				width={width}
				height={height}
				aria-hidden="true"
				viewBox={`0 0 ${width} ${height}`}
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
				style={{ display: "block", position: "relative", zIndex: 1 }}
			>
				{sampledWavelengthData.map((amplitude, index) => {
					const barHeight = Math.min(height * amplitude, height);
					const yPosition = (height - barHeight) / 2;
					xPosition = xPosition + barWidth + spacing;
					const barKey = `waveform-bar-${index}-${Math.random().toString(36).substring(2, 9)}`;
					return (
						<rect
							key={barKey}
							x={xPosition}
							y={yPosition}
							width={barWidth}
							height={barHeight}
							style={{ borderRadius: 20 }}
							fill="currentColor"
							rx="0.5"
						/>
					);
				})}
			</svg>
		</div>
	);
};

export default Waveform;

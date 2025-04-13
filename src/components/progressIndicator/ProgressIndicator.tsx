import type React from "react";
import { animatedDots } from "./ProgressIndicator.css";

function ProgressIndicator(): React.ReactNode {
	return <span className={animatedDots} />;
}

export default ProgressIndicator;

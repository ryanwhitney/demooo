import type React from "react";
import * as style from "./DotLoadIndicator.css";

function DotLoadIndicator(): React.ReactNode {
	return <span className={style.dotLoadIndicatorDots} />;
}

export default DotLoadIndicator;

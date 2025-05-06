import LoadIndicator from "@/components/spinnerLoadIndicator/SpinnerLoadIndicator";
import { useEffect, useState } from "react";
import { pageLoadingIndicatorContainer } from "./PageLoadingIndicator.css";

const PageLoadingIndicator = ({
	height,
	timeout = 2000,
}: { height?: number; timeout?: number }) => {
	const [shown, setShown] = useState(false);

	useEffect(() => {
		setTimeout(() => {
			setShown(true);
		}, timeout); // Show loading indicator after 1 second
	}, [timeout]);

	return (
		<div
			className={pageLoadingIndicatorContainer}
			style={{ opacity: shown ? 1 : 0, maxHeight: `${height}px` }}
		>
			<LoadIndicator />
		</div>
	);
};

export default PageLoadingIndicator;

import LoadIndicator from "@/components/loadIndicator/LoadIndicator";
import { useEffect, useState } from "react";
import { pageLoadingIndicatorContainer } from "./PageLoadingIndicator.css";

const PageLoadingIndicator = ({ height }: { height?: number }) => {
	const [shown, setShown] = useState(false);

	useEffect(() => {
		setTimeout(() => {
			setShown(true);
		}, 2000); // Show loading indicator after 1 second
	}, []);

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

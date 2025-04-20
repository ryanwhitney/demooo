import * as style from "./notFound.css";

const NotFound = ({
	headerText,
	descriptionText,
}: { headerText?: string; descriptionText?: string }) => {
	return (
		<div>
			<h1 className={style.notFoundHeader}>
				{headerText ? "Sorry…Not Found" : headerText}
			</h1>
			<p className={style.notFoundDescription}>
				{headerText ? "We couldn't find that page." : descriptionText}
			</p>
		</div>
	);
};

export default NotFound;

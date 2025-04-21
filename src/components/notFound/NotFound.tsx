import * as style from "./NotFound.css";

const NotFound = ({
	headerText,
	descriptionText,
}: { headerText?: string; descriptionText?: string }) => {
	return (
		<div>
			<h1 className={style.notFoundHeader}>
				{headerText ? "Sorry…we couldn't find that" : headerText}
			</h1>
			<p className={style.notFoundDescription}>
				{headerText ? "Go baaack or try again." : descriptionText}
			</p>
		</div>
	);
};

export default NotFound;

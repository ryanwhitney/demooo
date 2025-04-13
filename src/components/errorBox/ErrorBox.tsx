import { errorBoxContainer } from "./ErrorBox.css";

const ErrorBox = ({ text }: { text: string }) => {
	return <div className={errorBoxContainer}>{text}</div>;
};

export default ErrorBox;

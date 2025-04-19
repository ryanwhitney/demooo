import { useEffect, useState } from "react";
import Button from "../button/Button";
import {
	modalBackdropContainer,
	modalButtonClose,
	modalCard,
	modalDescription,
	modalTitle,
} from "./Modal.css";

type ModalProps = {
	children: React.ReactNode;
	onClose: () => void;
	title?: string;
	description?: string;
};

function Modal({ children, onClose, title, description }: ModalProps) {
	const [isVisible, setIsVisible] = useState(false);

	const TRANSITION_TIME = 150;

	const handleClose = () => {
		setIsVisible(false);
		setTimeout(() => {
			onClose();
		}, TRANSITION_TIME);
	};

	useEffect(() => {
		setIsVisible(true);
	}, []);

	return (
		<div
			className={modalBackdropContainer({ isActive: isVisible })}
			onKeyDown={(e) => {
				if (e.key === "Escape") {
					handleClose();
				}
			}}
			style={{
				transition: `all ${TRANSITION_TIME}ms ease-in-out`,
			}}
		>
			<section
				className={modalCard({ isActive: isVisible })}
				style={{
					transition: `all ${TRANSITION_TIME}ms ease-in-out`,
				}}
			>
				<Button
					variant="icon"
					type="button"
					title="close modal"
					className={modalButtonClose}
					onClick={handleClose}
				>
					<span aria-label="X">&times;</span>
				</Button>
				<h1 className={modalTitle}>{title}</h1>
				<p className={modalDescription}>{description}</p>
				{children}
			</section>
		</div>
	);
}

export default Modal;

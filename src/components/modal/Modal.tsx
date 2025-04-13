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
	const [opacity, setOpacity] = useState(0);

	const TRANSITION_TIME = 100;

	const handleClose = () => {
		setOpacity(0);
		setTimeout(() => {
			onClose();
		}, TRANSITION_TIME);
	};

	useEffect(() => {
		setOpacity(1);
	}, []);

	return (
		<div
			className={modalBackdropContainer}
			style={{
				transition: `opacity ${TRANSITION_TIME}ms ease-in`,
				opacity: opacity,
			}}
		>
			<section
				className={modalCard}
				style={{
					transition: `opacity ${TRANSITION_TIME}ms ease-in`,
					opacity: opacity,
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

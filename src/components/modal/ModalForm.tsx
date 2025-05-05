import { useEffect, useState } from "react";
import Button from "../button/Button";
import * as style from "./ModalForm.css";
import { Dialog, Modal } from "react-aria-components";
import { assignInlineVars } from "@vanilla-extract/dynamic";

const ModalForm = ({
	children,
	onClose,
	title,
	description,
	minWidth = "400px",
}: {
	children: React.ReactNode;
	onClose: () => void;
	title?: string;
	description?: string;
	minWidth?: string;
}) => {
	const [isOpen, setIsOpen] = useState(true);
	const [isVisible, setIsVisible] = useState(false);

	const TRANSITION_DURATION = 150;

	const handleClose = () => {
		setIsVisible(false);
		setTimeout(() => {
			setIsOpen(false);
			onClose();
		}, TRANSITION_DURATION);
	};

	useEffect(() => {
		setTimeout(() => {
			setIsVisible(true);
		}, 50);
	}, []);

	return (
		<Modal
			isOpen={isOpen}
			// onOpenChange={setIsOpen}
			className={style.modalBackdropContainer({ isActive: isVisible })}
			style={{
				...assignInlineVars({
					[style.transitionDurationVar]: `${TRANSITION_DURATION}ms`,
				}),
			}}
		>
			<Dialog
				className={style.modalCard({ isActive: isVisible })}
				style={{
					...assignInlineVars({
						[style.minWidthVar]: `${minWidth}`,
					}),
				}}
			>
				<Button
					variant="icon"
					type="button"
					title="close modal"
					className={style.modalButtonClose}
					onClick={handleClose}
				>
					<span aria-label="X">&times;</span>
				</Button>
				<h1 className={style.modalTitle}>{title}</h1>
				<p className={style.modalDescription}>{description}</p>
				{children}
			</Dialog>
		</Modal>
	);
};

export default ModalForm;

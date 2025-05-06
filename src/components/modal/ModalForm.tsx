import { useEffect, useState } from "react";
import Button from "../button/Button";
import * as style from "./ModalForm.css";
import { Dialog, Modal } from "react-aria-components";
import { assignInlineVars } from "@vanilla-extract/dynamic";

const ModalForm = ({
	children,
	onOpenChange,
	title,
	description,
	minWidth = "400px", // only applies at screen width > 480px
	isOpen = true,
}: {
	children: React.ReactNode;
	onOpenChange?: (isOpen: boolean) => void;
	title?: string;
	description?: string;
	minWidth?: string;
	isOpen?: boolean;
}) => {
	const [isVisible, setIsVisible] = useState(false);
	const TRANSITION_DURATION = 150;

	const handleClose = () => {
		setIsVisible(false);
		setTimeout(() => {
			if (onOpenChange) onOpenChange(false);
		}, TRANSITION_DURATION);
	};

	useEffect(() => {
		if (isOpen) {
			setIsVisible(true);
		} else {
			setIsVisible(false);
		}
	}, [isOpen]);

	return (
		<Modal
			isOpen={isOpen}
			onOpenChange={(open) => {
				if (!open) {
					handleClose();
				} else if (onOpenChange) {
					onOpenChange(true);
				}
			}}
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

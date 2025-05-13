import React from "react";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import Button from "../button/Button";
import * as style from "./ModalForm.css";
import { Dialog, Modal, ModalOverlay } from "react-aria-components";
import { assignInlineVars } from "@vanilla-extract/dynamic";

const TRANSITION_DURATION = 150;
const ModalForm = ({
	children,
	onOpenChange,
	title,
	description,
	minWidth = "400px", // only applies at screen width > 480px
	isOpen = true,
}: {
	children: ReactNode;
	onOpenChange?: (isOpen: boolean) => void;
	title?: string;
	description?: string;
	minWidth?: string;
	isOpen?: boolean;
}) => {
	const [isVisible, setIsVisible] = useState(false);

	const handleClose = () => {
		setIsVisible(false);
		setTimeout(() => {
			if (onOpenChange) onOpenChange(false);
		}, TRANSITION_DURATION);
	};

	useEffect(() => {
		if (!isOpen) {
			setIsVisible(false);
			return;
		}

		setIsVisible(true);
	}, [isOpen]);

	return (
		<ModalOverlay
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
			isDismissable={true}
		>
			<Modal
				className={style.modalCard({ isActive: isVisible })}
				style={{
					...assignInlineVars({
						[style.minWidthVar]: `${minWidth}`,
					}),
				}}
			>
				<Dialog
					aria-labelledby={title ? "modal-title" : undefined}
					aria-describedby={description ? "modal-description" : undefined}
				>
					<Button
						variant="icon"
						type="button"
						title="close modal"
						className={style.modalButtonClose}
						onClick={handleClose}
						autoFocus
					>
						<span aria-label="Close">×</span>
					</Button>
					{title && (
						<h1 id="modal-title" className={style.modalTitle}>
							{title}
						</h1>
					)}
					{description && (
						<p id="modal-description" className={style.modalDescription}>
							{description}
						</p>
					)}
					{children}
				</Dialog>
			</Modal>
		</ModalOverlay>
	);
};

export default ModalForm;

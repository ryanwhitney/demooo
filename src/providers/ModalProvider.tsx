import { useState } from "react";
import type { ReactNode } from "react";
import { createPortal } from "react-dom";
import Modal from "@/components/modal/ModalForm";
import Login from "@/features/auth/Login";
import CreateAccount from "@/features/auth/CreateAccount";
import { ModalContext } from "./ModalContext";
import {
	ModalType,
	type ModalConfig,
	type ModalProps,
	type ModalProviderProps,
} from "@/types/modal";
import AuthPrompt from "@/components/auth/AuthPrompt";

// Define modal configurations with their default properties
const MODAL_CONFIGS: Record<ModalType, ModalConfig> = {
	[ModalType.LOGIN]: {
		type: ModalType.LOGIN,
		defaultTitle: "Log in",
		minWidth: "400px",
	},
	[ModalType.SIGNUP]: {
		type: ModalType.SIGNUP,
		defaultTitle: "Join demooo",
		minWidth: "400px",
	},
	[ModalType.AUTH]: {
		type: ModalType.AUTH,
		defaultTitle: "Join demooo", // Default title when not specified
		minWidth: "400px",
	},
	[ModalType.PROFILE]: {
		type: ModalType.PROFILE,
		defaultTitle: "Edit Profile",
		minWidth: "500px",
	},
	[ModalType.CUSTOM]: {
		type: ModalType.CUSTOM,
		defaultTitle: "",
		minWidth: "400px",
	},
	[ModalType.NONE]: {
		type: ModalType.NONE,
		defaultTitle: "",
		minWidth: "400px",
	},
};

export function ModalProvider({ children }: ModalProviderProps) {
	const [activeModal, setActiveModal] = useState<ModalType>(ModalType.NONE);
	const [modalProps, setModalProps] = useState<ModalProps>({});

	const openModal = (type: ModalType, props: Partial<ModalProps> = {}) => {
		setActiveModal(type);
		setModalProps(props);
	};

	const closeModal = () => {
		setActiveModal(ModalType.NONE);
		setModalProps({});
	};

	// Get the configuration for the current modal
	const getConfig = () =>
		MODAL_CONFIGS[activeModal] || MODAL_CONFIGS[ModalType.CUSTOM];

	const renderModalContent = () => {
		switch (activeModal) {
			case ModalType.LOGIN:
				return <Login onSuccess={modalProps.onSuccess} />;
			case ModalType.SIGNUP:
				return <CreateAccount onSuccess={modalProps.onSuccess} />;
			case ModalType.AUTH:
				return (
					<AuthPrompt
						message={modalProps.authRedirect?.message}
						actionText={modalProps.authRedirect?.actionText}
						isLogin={modalProps.authRedirect?.login ?? false}
						onSuccess={modalProps.onSuccess}
					/>
				);
			case ModalType.PROFILE:
			case ModalType.CUSTOM:
				return modalProps.content || null;
			default:
				return null;
		}
	};

	// Get the title, using the user-provided title first, then falling back to the default
	const getModalTitle = () => {
		return modalProps.title || getConfig().defaultTitle;
	};

	// Get the appropriate min-width, using the user-provided value first
	const getMinWidth = () => {
		return modalProps.minWidth || getConfig().minWidth;
	};

	// Check if modal should be rendered
	const shouldRenderModal = activeModal !== ModalType.NONE;

	return (
		<ModalContext.Provider
			value={{
				activeModal,
				modalProps,
				openModal,
				closeModal,
			}}
		>
			{children}
			{shouldRenderModal &&
				createPortal(
					<Modal
						title={getModalTitle()}
						description={modalProps.description}
						minWidth={getMinWidth()}
						isOpen={true}
						onOpenChange={(isOpen) => {
							if (!isOpen) closeModal();
						}}
					>
						{renderModalContent()}
					</Modal>,
					document.body,
				)}
		</ModalContext.Provider>
	);
}

import { useState, useEffect } from "react";
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
	// Track if a modal is currently transitioning to avoid focus issues
	const [isTransitioning, setIsTransitioning] = useState(false);
	// Track the next modal to open after a transition
	const [nextModal, setNextModal] = useState<{
		type: ModalType;
		props: Partial<ModalProps>;
	} | null>(null);

	const openModal = (type: ModalType, props: Partial<ModalProps> = {}) => {
		// If a modal is already open, handle the transition properly
		if (activeModal !== ModalType.NONE) {
			// Queue the next modal
			setNextModal({ type, props });
			// Start the transition by closing the current modal
			setIsTransitioning(true);
			// The current modal will close and trigger onOpenChange
		} else {
			// If no modal is open, simply open the new modal
			setActiveModal(type);
			setModalProps(props);
		}
	};

	const closeModal = () => {
		setActiveModal(ModalType.NONE);
		setModalProps({});
		setNextModal(null);
		setIsTransitioning(false);
	};

	// Handle modal transitions
	useEffect(() => {
		// If we're transitioning and the active modal is now NONE,
		// open the next modal
		if (isTransitioning && activeModal === ModalType.NONE && nextModal) {
			// Increased timeout to allow the DOM to update and React Aria to clean up
			// This ensures focus management works properly
			const timer = setTimeout(() => {
				setActiveModal(nextModal.type);
				setModalProps(nextModal.props);
				setNextModal(null);
				setIsTransitioning(false);
			}, 150); // Increased from 50ms to 150ms for better focus management

			return () => clearTimeout(timer);
		}
	}, [isTransitioning, activeModal, nextModal]);

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

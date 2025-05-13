import AuthPrompt from "@/components/auth/AuthPrompt";
import Modal from "@/components/modal/ModalForm";
import CreateAccount from "@/features/auth/CreateAccount";
import Login from "@/features/auth/Login";
import {
  type ModalConfig,
  type ModalProps,
  type ModalProviderProps,
  ModalType,
} from "@/types/modal";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { ModalContext } from "./ModalContext";

// Modal configurations with their default properties
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
    defaultTitle: "Join demooo",
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

const TRANSITION_DURATION = 150;

/**
 * Manages modal state and transitions between different modal types
 */
export function ModalProvider({ children }: ModalProviderProps) {
  const [activeModal, setActiveModal] = useState<ModalType>(ModalType.NONE);
  const [modalProps, setModalProps] = useState<ModalProps>({});
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [nextModal, setNextModal] = useState<{
    type: ModalType;
    props: Partial<ModalProps>;
  } | null>(null);

  const openModal = (type: ModalType, props: Partial<ModalProps> = {}) => {
    if (activeModal !== ModalType.NONE) {
      setActiveModal(type);
      setModalProps(props);
      setNextModal(null);
      setIsTransitioning(false);
    } else {
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

  // Handle transitions for closing modals only
  useEffect(() => {
    if (isTransitioning && activeModal === ModalType.NONE && nextModal) {
      const timer = setTimeout(() => {
        setActiveModal(nextModal.type);
        setModalProps(nextModal.props);
        setNextModal(null);
        setIsTransitioning(false);
      }, TRANSITION_DURATION);

      return () => clearTimeout(timer);
    }
  }, [isTransitioning, activeModal, nextModal]);

  const getConfig = () =>
    MODAL_CONFIGS[activeModal] || MODAL_CONFIGS[ModalType.CUSTOM];
  const getModalTitle = () => modalProps.title || getConfig().defaultTitle;
  const getMinWidth = () => modalProps.minWidth || getConfig().minWidth;
  const shouldRenderModal = activeModal !== ModalType.NONE;

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

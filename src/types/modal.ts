import type { ReactNode } from "react";

export enum ModalType {
  LOGIN = "login",
  SIGNUP = "signup",
  AUTH = "auth",
  PROFILE = "profile",
  CUSTOM = "custom",
  NONE = "none",
}

export interface ModalConfig {
  type: ModalType;
  defaultTitle: string;
  component?: ReactNode;
  minWidth?: string;
}

export interface ModalContextType {
  activeModal: ModalType;
  modalProps: ModalProps;
  openModal: (type: ModalType, props?: Partial<ModalProps>) => void;
  closeModal: () => void;
}

export interface ModalProps {
  title?: string;
  description?: string;
  content?: ReactNode;
  minWidth?: string;
  onSuccess?: () => void;
  authRedirect?: {
    login: boolean;
    message?: string;
    actionText?: string;
  };
}

export interface ModalProviderProps {
  children: ReactNode;
}

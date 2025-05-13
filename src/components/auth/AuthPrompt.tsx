import Button from "@/components/button/Button";
import { useModal } from "@/hooks/useModal";
import { ModalType } from "@/types/modal";
import * as style from "./AuthPrompt.css";

/**
 * AuthPrompt provides an initial step before auth forms
 * Shows a message and lets user choose whether to sign up or log in
 */
const AuthPrompt = ({
  message = "Sign up to access this feature",
  actionText = "Continue",
  isLogin = false,
  onSuccess,
}: {
  message?: string;
  actionText?: string;
  isLogin?: boolean;
  onSuccess?: () => void;
}) => {
  const { openModal } = useModal();

  const handleContinue = () => {
    const modalType = isLogin ? ModalType.LOGIN : ModalType.SIGNUP;
    openModal(modalType, { onSuccess });
  };

  const handleSwitchAuth = () => {
    const modalType = isLogin ? ModalType.SIGNUP : ModalType.LOGIN;
    openModal(modalType, { onSuccess });
  };

  return (
    <div className={style.authPromptContainer}>
      <p className={style.authPromptMessage}>{message}</p>
      <Button variant="primary" onClick={handleContinue}>
        {actionText}
      </Button>
      <Button variant="secondary" onClick={handleSwitchAuth}>
        {isLogin
          ? "Don't have an account? Sign up"
          : "Already have an account? Log in"}
      </Button>
    </div>
  );
};

export default AuthPrompt;

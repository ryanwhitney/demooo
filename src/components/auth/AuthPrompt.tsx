import { useState } from "react";
import type { ReactNode } from "react";
import Login from "@/features/auth/Login";
import CreateAccount from "@/features/auth/CreateAccount";
import Button from "@/components/button/Button";

interface AuthPromptProps {
	message?: string;
	actionText?: string;
	isLogin?: boolean;
	onSuccess?: () => void;
}

const AuthPrompt = ({
	message = "Sign up to access this feature",
	actionText = "Continue",
	isLogin = false,
	onSuccess,
}: AuthPromptProps) => {
	const [showForm, setShowForm] = useState(false);
	const [isLoginForm, setIsLoginForm] = useState(isLogin);

	if (showForm) {
		return isLoginForm ? (
			<>
				<Login onSuccess={onSuccess} />
				<div style={{ textAlign: "center", marginTop: "16px" }}>
					<Button
						variant="text"
						onClick={() => setIsLoginForm(false)}
						aria-label="Switch to sign up form"
					>
						Don't have an account? Sign up
					</Button>
				</div>
			</>
		) : (
			<>
				<CreateAccount onSuccess={onSuccess} />
				<div style={{ textAlign: "center", marginTop: "16px" }}>
					<Button
						variant="text"
						onClick={() => setIsLoginForm(true)}
						aria-label="Switch to login form"
					>
						Already have an account? Log in
					</Button>
				</div>
			</>
		);
	}

	return (
		<div
			style={{ textAlign: "center", padding: "20px 0" }}
			role="dialog"
			aria-labelledby="auth-prompt-message"
		>
			<p id="auth-prompt-message" style={{ marginBottom: "20px" }}>
				{message}
			</p>
			<Button
				variant="primary"
				onClick={() => setShowForm(true)}
				aria-label={actionText}
			>
				{actionText}
			</Button>
		</div>
	);
};

export default AuthPrompt;

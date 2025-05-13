import { useState } from "react";
import Login from "@/features/auth/Login";
import CreateAccount from "@/features/auth/CreateAccount";
import Button from "@/components/button/Button";

/**
 * AuthPrompt is used within a Modal and provides authentication flow options
 * Accessibility notes:
 * - When used inside a modal, the modal provides aria context (title, role, etc.)
 * - The message serves as the description for the modal action
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
	const [showForm, setShowForm] = useState(false);
	const [showLoginForm, setShowLoginForm] = useState(isLogin);

	if (showForm) {
		return showLoginForm ? (
			<>
				<Login onSuccess={onSuccess} />
				<div style={{ textAlign: "center", marginTop: "16px" }}>
					<Button variant="secondary" onClick={() => setShowLoginForm(false)}>
						Don't have an account? Sign up
					</Button>
				</div>
			</>
		) : (
			<>
				<CreateAccount onSuccess={onSuccess} />
				<div style={{ textAlign: "center", marginTop: "16px" }}>
					<Button variant="secondary" onClick={() => setShowLoginForm(true)}>
						Already have an account? Log in
					</Button>
				</div>
			</>
		);
	}

	return (
		<div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
			<p style={{ marginBottom: "20px" }}>{message}</p>
			<Button variant="primary" onClick={() => setShowForm(true)}>
				{actionText}
			</Button>
			<Button
				variant="secondary"
				onClick={() => {
					setShowLoginForm(!isLogin);
					setShowForm(true);
				}}
			>
				{isLogin
					? "Don't have an account? Sign up"
					: "Already have an account? Log in"}
			</Button>
		</div>
	);
};

export default AuthPrompt;

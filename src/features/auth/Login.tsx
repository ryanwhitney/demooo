import { LOGIN } from "@/apollo/mutations/userMutations";
import Button from "@/components/button/Button";
import ErrorBox from "@/components/errorBox/ErrorBox.tsx";
import ProgressIndicator from "@/components/progressIndicator/ProgressIndicator.tsx";
import TextInput from "@/components/textInput/TextInput";
import { useAuth } from "@/hooks/useAuth";
import type { LoginFormInput } from "@/types/auth";
import { useCsrf } from "@/utils/csrf";
import { useMutation } from "@apollo/client";
import { useState } from "react";

const DEBUG = false;

const Login = () => {
	const [formData, setFormData] = useState<LoginFormInput>({
		username: "",
		password: "",
	});

	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const { csrfFetched, error: csrfError, getToken } = useCsrf();
	const { setIsAuthenticated } = useAuth();

	const [login, { loading }] = useMutation(LOGIN, {
		variables: {
			username: formData.username,
			password: formData.password,
		},
		onCompleted: (data) => {
			if (DEBUG) console.log("Login response:", data);

			if (data.login.success) {
				setFormData({ username: "", password: "" });
				setIsAuthenticated(true);
				window.location.reload();
			} else {
				setErrorMessage(data.login.message || "Login failed");
			}
		},
		onError: (error) => {
			if (DEBUG) console.error("Login error:", error);
			if (error.message.includes("CSRF")) {
				setErrorMessage(
					"CSRF token validation failed. Please refresh the page and try again.",
				);
			} else {
				setErrorMessage(error.message);
			}
		},
	});

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		setErrorMessage(null);

		// Check if we should proceed even without full CSRF setup
		// In private browsing, we might need to proceed anyway
		const token = getToken();

		if (!csrfFetched && !token) {
			setErrorMessage(
				"Setting up secure connection... Please try again in a moment.",
			);
			return;
		}

		if (DEBUG) console.log("Submitting login with:", formData);

		login();
	};

	return (
		<>
			{errorMessage && <ErrorBox text={errorMessage} />}
			{csrfError && !errorMessage && <ErrorBox text={csrfError} />}

			<form onSubmit={handleSubmit}>
				<TextInput
					label="Username"
					type="text"
					value={formData.username}
					autoComplete="username"
					onChange={(e) =>
						setFormData({ ...formData, username: e.target.value })
					}
					required
				/>

				<TextInput
					label="Password"
					type="password"
					value={formData.password}
					autoComplete="current-password"
					onChange={(e) =>
						setFormData({ ...formData, password: e.target.value })
					}
					required
				/>
				<br />
				<Button
					type="submit"
					disabled={
						loading ||
						(!csrfFetched && !getToken()) ||
						!formData.username ||
						!formData.password
					}
				>
					{loading ? <ProgressIndicator /> : "Login"}
				</Button>
			</form>
		</>
	);
};

export default Login;

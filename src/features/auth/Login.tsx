import { LOGIN } from "@/apollo/mutations/userMutations";
import Button from "@/components/button/Button";
import ErrorBox from "@/components/errorBox/ErrorBox.tsx";
import ProgressIndicator from "@/components/progressIndicator/ProgressIndicator.tsx";
import TextInput from "@/components/textInput/TextInput";
import { useAuth } from "@/hooks/useAuth";
import type { LoginFormInput } from "@/types/auth";
import { useMutation } from "@apollo/client";
import { useState, useEffect } from "react";

// For debugging
const DEBUG = true;
const API_BASE_URL =
	import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

type LoginProps = {
	onSuccess: () => void;
};

const Login = ({ onSuccess }: LoginProps) => {
	const [formData, setFormData] = useState<LoginFormInput>({
		username: "",
		password: "",
	});

	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [csrfFetched, setCsrfFetched] = useState(false);

	const { setIsAuthenticated } = useAuth();

	// Fetch CSRF token on component mount
	useEffect(() => {
		const fetchCsrfToken = async () => {
			try {
				if (DEBUG) console.log("Login component: Fetching CSRF token...");

				const response = await fetch(`${API_BASE_URL}/api/csrf/`, {
					method: "GET",
					credentials: "include",
				});

				if (response.ok) {
					if (DEBUG)
						console.log("Login component: CSRF token fetched successfully");
					setCsrfFetched(true);
				} else {
					console.error(
						"Login component: Failed to fetch CSRF token:",
						response.statusText,
					);
					setErrorMessage(
						"Failed to fetch CSRF token. Please try refreshing the page.",
					);
				}
			} catch (error) {
				console.error("Login component: Error fetching CSRF token:", error);
				setErrorMessage(
					"Network error when setting up secure connection. Please try again.",
				);
			}
		};

		fetchCsrfToken();
	}, []);

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
				onSuccess();
			} else {
				setErrorMessage(data.login.message || "Login failed");
			}
		},
		onError: (error) => {
			if (DEBUG) console.error("Login error:", error);
			setErrorMessage(error.message);
		},
	});

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		setErrorMessage(null);

		if (!csrfFetched) {
			setErrorMessage("Please wait, setting up secure connection...");
			return;
		}

		if (DEBUG) console.log("Submitting login with:", formData);

		login();
	};

	return (
		<>
			{errorMessage && <ErrorBox text={errorMessage} />}
			{!errorMessage &&
				!loading &&
				formData.username === "" &&
				formData.password === "" && (
					<p>Please enter your credentials to log in.</p>
				)}
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
					size="large"
					type="submit"
					disabled={
						loading || !csrfFetched || !formData.username || !formData.password
					}
				>
					{loading ? <ProgressIndicator /> : "Login"}
				</Button>
			</form>
		</>
	);
};

export default Login;

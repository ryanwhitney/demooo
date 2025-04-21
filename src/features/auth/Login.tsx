import { LOGIN } from "@/apollo/mutations/userMutations";
import Button from "@/components/button/Button";
import ErrorBox from "@/components/errorBox/ErrorBox.tsx";
import ProgressIndicator from "@/components/progressIndicator/ProgressIndicator.tsx";
import TextInput from "@/components/textInput/TextInput";
import { useAuth } from "@/hooks/useAuth";
import type { LoginFormInput } from "@/types/auth";
import { useMutation } from "@apollo/client";
import { useState, useEffect } from "react";

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
				const response = await fetch(
					`${import.meta.env.VITE_API_BASE_URL}/api/csrf/`,
					{
						method: "GET",
						credentials: "include",
					},
				);

				if (response.ok) {
					setCsrfFetched(true);
				} else {
					setErrorMessage("Failed to fetch token. Please try again.");
				}
			} catch (error) {
				setErrorMessage("Something went wrong. Please try again.");
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
			if (data.login.success) {
				setFormData({ username: "", password: "" });
				setIsAuthenticated(true);
				window.location.reload();
				onSuccess();
			} else {
				setErrorMessage(data.login.message || "Login failed");
			}
		},
		onError: (error) => {
			setErrorMessage(error.message);
		},
	});

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		setErrorMessage(null);

		if (!csrfFetched) {
			return;
		}

		login();
	};

	return (
		<>
			{errorMessage && <ErrorBox text={errorMessage} />}
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

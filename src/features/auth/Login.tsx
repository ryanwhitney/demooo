import { AUTH_USER } from "@/apollo/queries/userQueries";
import Button from "@/components/button/Button";
import ErrorBox from "@/components/errorBox/ErrorBox.tsx";
import ProgressIndicator from "@/components/progressIndicator/ProgressIndicator.tsx";
import TextInput from "@/components/textInput/TextInput";
import { useAuth } from "@/hooks/useAuth";
import type { LoginFormInput } from "@/types/auth";
import { useMutation } from "@apollo/client";
import { useState } from "react";

type LoginProps = {
	onSuccess: () => void;
};

const Login = ({ onSuccess }: LoginProps) => {
	const [formData, setFormData] = useState<LoginFormInput>({
		username: "",
		password: "",
	});

	const { setIsAuthenticated } = useAuth();

	const [authenticateUser, { loading, error }] = useMutation(AUTH_USER, {
		variables: {
			username: formData.username,
			password: formData.password,
		},
		onCompleted: (data) => {
			setFormData({ username: "", password: "" });
			localStorage.setItem("authToken", data.tokenAuth.token);
			setIsAuthenticated(true);
			onSuccess();
		},
	});

	return (
		<>
			{error && <ErrorBox text={error.message} />}
			<form
				onSubmit={(e) => {
					e.preventDefault();
					authenticateUser();
				}}
			>
				<TextInput
					label="Username"
					type="text"
					// placeholder=""
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
					// placeholder="Enter your password"
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
					disabled={loading || !formData.username || !formData.password}
				>
					{loading ? <ProgressIndicator /> : "Login"}
				</Button>
			</form>
		</>
	);
};

export default Login;

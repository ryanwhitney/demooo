import { GET_USERNAME } from "@/apollo/queries/userQueries";
import { AUTH_USER, CREATE_USER } from "@/apollo/mutations/userMutations";
import Button from "@/components/button/Button";
import ErrorBox from "@/components/errorBox/ErrorBox";
import ProgressIndicator from "@/components/progressIndicator/ProgressIndicator";
import TextInput from "@/components/textInput/TextInput";
import { useAuth } from "@/hooks/useAuth";
import type { SignupFormInput } from "@/types/auth";
import { useLazyQuery, useMutation } from "@apollo/client";
import { useEffect, useState, useRef } from "react";

type CreateAccountProps = {
	onSuccess: () => void;
};

const CreateAccount = ({ onSuccess }: CreateAccountProps) => {
	const [usernameError, setUsernameError] = useState("");
	const [formData, setFormData] = useState<SignupFormInput>({
		email: "",
		username: "",
		password: "",
	});
	const { setIsAuthenticated } = useAuth();

	const [checkUsername, { loading: checkingUsername }] = useLazyQuery(
		GET_USERNAME,
		{
			onCompleted: (data) => {
				if (data.user) {
					setUsernameError("This username is already taken");
				} else {
					setUsernameError("");
				}
			},
		},
	);

	const [createAccount, { loading, error }] = useMutation(CREATE_USER, {
		variables: {
			username: formData.username,
			email: formData.email,
			password: formData.password,
		},
		onCompleted: () => {
			authenticateUser({
				variables: {
					username: formData.username,
					password: formData.password,
				},
			});
		},
	});

	const [authenticateUser] = useMutation(AUTH_USER, {
		onCompleted: (data) => {
			setFormData({ ...formData, password: "" });
			localStorage.setItem("authToken", data.tokenAuth.token);
			setIsAuthenticated(true);
			onSuccess();
		},
		onError: (error) => {
			setFormData({ ...formData, password: "" });
			console.error("Authentication error after signup:", error);
		},
	});

	const validateUsername = async (value: string) => {
		if (!value) {
			return "Username is required";
		}
		if (value.length < 3) {
			return "Username must be at least 3 characters";
		}

		// Only check w server if length is valid
		try {
			const { data } = await checkUsername({
				variables: { username: value },
				fetchPolicy: "network-only",
			});

			if (data?.user) {
				return "This username is already taken";
			}
			return "";
		} catch (error) {
			console.error("Error checking username:", error);
			return "Error checking username availability";
		}
	};

	function validateEmail(value: string) {
		if (!value) {
			return "Email is required";
		}
		if (!/\S+@\S+\.\S+/.test(value)) {
			return "Please enter a valid email address";
		}
		return "";
	}

	// Store the timer in a ref so we can clear it when needed
	const timerRef = useRef<NodeJS.Timeout | undefined>(undefined);

	// Clean up the timer when username changes
	useEffect(() => {
		// Clear previous timer if it exists
		if (timerRef.current) {
			clearTimeout(timerRef.current);
			timerRef.current = undefined;
		}

		// Set new timer if username is long enough
		if (formData.username.length >= 3) {
			timerRef.current = setTimeout(() => {
				checkUsername({ variables: { username: formData.username } });
			}, 500);
		}
	}, [formData.username, checkUsername]);

	return (
		<>
			{error && <ErrorBox text={error.message} />}
			<form
				onSubmit={(e) => {
					e.preventDefault();
					if (usernameError) return; // Prevent submission if username is taken
					console.log("About to send mutation with:", {
						username: formData.username,
						email: formData.email,
						password: formData.password,
					});
					createAccount();
				}}
			>
				<TextInput
					label="Username"
					type="text"
					// placeholder="ryannn"
					value={formData.username}
					autoComplete="username"
					debounceTime={750}
					onChange={(e) =>
						setFormData({ ...formData, username: e.target.value })
					}
					validate={validateUsername}
					required
				/>
				<TextInput
					label="Email"
					type="email"
					// placeholder="ryan@sadbedroommusic.com"
					value={formData.email}
					autoComplete="email"
					debounceTime={2000}
					onChange={(e) => setFormData({ ...formData, email: e.target.value })}
					validate={validateEmail}
					required
				/>
				<TextInput
					label="Password"
					type="password"
					// placeholder="Enter your password"
					autoComplete="new-password"
					value={formData.password}
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
						!!usernameError ||
						checkingUsername ||
						loading ||
						!formData.username ||
						!formData.password ||
						!formData.email
					}
				>
					{loading ? <ProgressIndicator /> : "Joinnnn"}
				</Button>
			</form>
		</>
	);
};

export default CreateAccount;

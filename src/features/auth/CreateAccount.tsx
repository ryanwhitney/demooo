import { GET_USERNAME } from "@/apollo/queries/userQueries";
import { LOGIN, CREATE_USER } from "@/apollo/mutations/userMutations";
import Button from "@/components/button/Button";
import ErrorBox from "@/components/errorBox/ErrorBox";
import ProgressIndicator from "@/components/dotLoadIndicator/DotLoadIndicator";
import TextInput from "@/components/textInput/TextInput";
import { useAuth } from "@/hooks/useAuth";
import type { SignupFormInput } from "@/types/auth";
import { useCsrf } from "@/utils/csrf";
import { useLazyQuery, useMutation } from "@apollo/client";
import { useEffect, useState, useRef } from "react";

const DEBUG = false;

const CreateAccount = () => {
	const [usernameError, setUsernameError] = useState("");
	const [formData, setFormData] = useState<SignupFormInput>({
		email: "",
		username: "",
		password: "",
	});

	const { csrfFetched, error: csrfError, getToken } = useCsrf();
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
			username: formData.username.toLowerCase(),
			email: formData.email,
			password: formData.password,
		},
		onCompleted: () => {
			authenticateUser({
				variables: {
					username: formData.username.toLowerCase(),
					password: formData.password,
				},
			});
		},
		onError: (error) => {
			if (DEBUG) console.error("Create account error:", error);
		},
	});

	const [authenticateUser] = useMutation(LOGIN, {
		onCompleted: (data) => {
			if (data.login.success) {
				setFormData({ ...formData, password: "" });
				setIsAuthenticated(true);
				window.location.reload();
			}
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

		const normalizedValue = value.toLowerCase();

		if (normalizedValue.length < 3) {
			return "Username must be at least 3 characters";
		}

		if (!/^[a-z0-9]+$/.test(normalizedValue)) {
			return "only contain lowercase letters and numbers";
		}

		// Only check w server if client validation passes
		try {
			const { data } = await checkUsername({
				variables: { username: normalizedValue },
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

	const timerRef = useRef<NodeJS.Timeout | undefined>(undefined);

	// Clean up timer when username changes
	useEffect(() => {
		// Clear prev timer if exists
		if (timerRef.current) {
			clearTimeout(timerRef.current);
			timerRef.current = undefined;
		}

		// Set new timer if username is long enough and valid format
		const normalizedUsername = formData.username.toLowerCase();
		if (
			normalizedUsername.length >= 3 &&
			/^[a-z0-9]+$/.test(normalizedUsername)
		) {
			timerRef.current = setTimeout(() => {
				checkUsername({ variables: { username: normalizedUsername } });
			}, 500);
		}
	}, [formData.username, checkUsername]);

	const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const sanitizedValue = e.target.value
			.toLowerCase()
			.replace(/[^a-z0-9]/g, "");
		setFormData({ ...formData, username: sanitizedValue });
	};

	return (
		<>
			{csrfError && !error && <ErrorBox text={csrfError} />}
			{error && <ErrorBox text={error.message} />}
			<form
				onSubmit={(e) => {
					e.preventDefault();
					if (usernameError) return; // Prevent submission if username is taken

					// Proceed even if CSRF token is in memory but not cookies (private browsing)
					const token = getToken();
					if (!csrfFetched && !token) {
						console.error("Cannot submit form - CSRF token not available");
						return;
					}

					createAccount();
				}}
			>
				<TextInput
					label="Username"
					type="text"
					value={formData.username}
					autoComplete="username"
					debounceTime={750}
					onChange={handleUsernameChange}
					validate={validateUsername}
					required
				/>
				<TextInput
					label="Email"
					type="email"
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
					autoComplete="new-password"
					value={formData.password}
					onChange={(e) =>
						setFormData({ ...formData, password: e.target.value })
					}
					required
				/>
				<br />
				<Button
					type="submit"
					disabled={
						!!usernameError ||
						checkingUsername ||
						loading ||
						(!csrfFetched && !getToken()) ||
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

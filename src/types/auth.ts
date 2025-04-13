export interface User {
	id: string;
	username: string;
	email: string;
	firstName: string;
	lastName: string;
}

export interface AuthContextType {
	isAuthenticated: boolean;
	setIsAuthenticated: (value: boolean) => void;
	user: User | null;
	logout: () => void;
	refreshLoading: boolean;
}

export interface AuthProviderProps {
	children: React.ReactNode;
}

export interface LoginFormInput {
	username: string;
	password: string;
}

export interface SignupFormInput extends LoginFormInput {
	email: string;
	firstName?: string;
	lastName?: string;
}

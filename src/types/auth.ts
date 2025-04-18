export interface User {
	id: string;
	username: string;
	email: string;
	firstName: string;
	lastName: string;
	profile: Profile;
}

export interface Profile {
	id: string;
	name?: string;
	location?: string;
	bio?: string;
	profilePictureOptimizedUrl?: string;
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

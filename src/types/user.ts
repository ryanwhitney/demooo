export interface User {
	id: string;
	username: string;
	email?: string;
	firstName?: string;
	lastName?: string;
	profile: Profile;
}

export interface Profile {
	id: string;
	name?: string;
	location?: string;
	bio?: string;
	profilePictureOptimizedUrl?: string;
}
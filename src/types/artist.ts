import type { Track } from "./track";

export interface Artist {
	id: string;
	name?: string;
	bio?: string;
	location?: string;
	profilePicture?: File | null;
	socialLinks?: SocialLink[];
	tracks?: Track[];
}



export interface SocialLink {
	name: string;
	link: URL;
}

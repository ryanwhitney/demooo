export interface Track {
	id: string;
	title: string;
	description: string;
	artist: string;
	albumArt?: string;
	duration: number;
	createdAt: string;
	user: TrackUser;
	recordedAt: string;
	tags: string; // comma-separated tags
}

export interface TrackUser {
	username: string;
	id: string;
}

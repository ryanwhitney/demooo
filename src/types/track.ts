export interface Track {
	id: string;
	title: string; // A Great Song 
	titleSlug: string; // a-great-song
	description: string; // this is a song i made
	artist: TrackUser; // foreignKey, user.id
	duration: number;
	createdAt: string;
	recordedAt: string;
}

export interface TrackUser {
	username: string;
	id: string;
}

export interface Track {
	audioFile: string | undefined
	id: string;
	title: string; // A Great Song 
	titleSlug: string; // a-great-song
	description: string; // this is a song i made
	audioWaveformData: string;
	audioWaveformResolution: number;
	artist: TrackUser; // foreignKey, user.id
	duration: number;
	createdAt: string;
	recordedAt: string;
}

export interface TrackUser {
	username: string;
	id: string;
}

export interface UploadTrackFormInput {
	title: string;
	description: string;
	file: File | null;
}
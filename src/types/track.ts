import type { Profile } from "./auth"

export interface Track {
	audioFile: string | undefined
	audioUrl: string | undefined
	id: string;
	title: string; // A Great Song 
	titleSlug: string; // a-great-song
	description: string; // this is a song i made
	audioWaveformData: string;
	audioWaveformResolution: number;
	artist: TrackUser; // foreignKey, user.id
	audioLength: number;
	createdAt: string;
	recordedAt: string;
}

export interface TrackUser {
	username: string;
	id: string;
	profile: Profile
}

export interface UploadTrackFormInput {
	title: string;
	description: string;
	file: File | null;
}
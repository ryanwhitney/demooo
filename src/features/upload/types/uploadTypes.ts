// Track status for individual tracks in the upload list
export enum TrackStatus {
	PENDING = "pending",
	UPLOADING = "uploading",
	SUCCESS = "success",
	ERROR = "error",
}

// Overall upload process status
export enum UploadStatus {
	NOT_STARTED = "notStarted",
	IN_PROGRESS = "inProgress",
	ALL_COMPLETE = "allComplete",
	COMPLETE_WITH_ERRORS = "completeWithErrors",
}

// Track file interface for the upload list
export interface TrackFile {
	title: string;
	file: File;
	originalFileName: string;
	status: TrackStatus;
	errorMessage?: string;
	hasValidationError?: boolean;
}

// User track interface for validation
export interface UserTrack {
	id: string;
	title: string;
}

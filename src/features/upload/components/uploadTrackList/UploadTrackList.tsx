import type { ChangeEvent } from "react";
import TextInput from "@/components/textInput/TextInput";
import * as style from "./UploadTrackList.css";
import LoadIndicator from "@/components/spinnerLoadIndicator/SpinnerLoadIndicator";
import type { TrackFile } from "../../types/uploadTypes";
import { TrackStatus, UploadStatus } from "../../types/uploadTypes";
import { VisuallyHidden } from "react-aria";

const UploadTrackList = ({
	tracks,
	onTrackChange,
	onTrackRemove,
	uploadStatus,
	errorMessage,
}: {
	tracks: TrackFile[];
	onTrackChange: (index: number, field: "title", value: string) => void;
	onTrackRemove: (index: number) => void;
	uploadStatus: UploadStatus;
	errorMessage?: string;
}) => {
	const getTrackStatusComponent = (track: TrackFile) => {
		switch (track.status) {
			case TrackStatus.UPLOADING:
				return <LoadIndicator size={16} />;
			case TrackStatus.SUCCESS:
				return (
					<span className={style.successStatus} aria-hidden="true">
						✓
					</span>
				);
			case TrackStatus.ERROR:
				return (
					<span className={style.errorStatus} aria-hidden="true">
						✗
					</span>
				);
			default:
				return null;
		}
	};

	const getTrackStatusText = (track: TrackFile, index: number) => {
		switch (track.status) {
			case TrackStatus.UPLOADING:
				return `Track ${index + 1} uploading`;
			case TrackStatus.SUCCESS:
				return `Track ${index + 1} uploaded successfully`;
			case TrackStatus.ERROR:
				return `Track ${index + 1} failed to upload: ${track.errorMessage || "Unknown error"}`;
			default:
				return `Track ${index + 1} pending upload`;
		}
	};

	const haveSuccessfulUploads = tracks.some(
		(track) => track.status === TrackStatus.SUCCESS,
	);

	const getHeaderText = () => {
		if (uploadStatus !== UploadStatus.NOT_STARTED) {
			if (uploadStatus === UploadStatus.IN_PROGRESS) {
				return "Uploading...";
			}
			if (haveSuccessfulUploads) {
				const successCount = tracks.filter(
					(t) => t.status === TrackStatus.SUCCESS,
				).length;
				const errorCount = tracks.filter(
					(t) => t.status === TrackStatus.ERROR,
				).length;

				if (errorCount === 0) {
					return `${successCount} track${successCount === 1 ? "" : "s"} added to your profile.`;
				}
				return `${successCount} track${successCount === 1 ? "" : "s"} successfully uploaded, ${errorCount} failed.`;
			}
		}

		return `Ready to upload${tracks.length === 1 ? "." : ` ${tracks.length} tracks.`}`;
	};

	const getStatusAnnouncements = () => {
		if (uploadStatus !== UploadStatus.IN_PROGRESS) return null;

		// Find currently uploading track
		const uploadingTrack = tracks.findIndex(
			(track) => track.status === TrackStatus.UPLOADING,
		);
		if (uploadingTrack === -1) return null;

		// Add previous track's status
		const previousTrack =
			uploadingTrack > 0 ? tracks[uploadingTrack - 1] : null;
		const announcements = [];
		if (previousTrack) {
			if (previousTrack.status === TrackStatus.SUCCESS) {
				announcements.push(`Track ${uploadingTrack} uploaded successfully`);
			} else if (previousTrack.status === TrackStatus.ERROR) {
				announcements.push(
					`Track ${uploadingTrack} failed to upload: ${previousTrack.errorMessage || "Unknown error"}`,
				);
			}
		}

		// Add current track's status
		announcements.push(`Track ${uploadingTrack + 1} uploading`);

		// "track 1 uploaded successfully. track 2 uploading."
		return announcements.join(". ");
	};

	return (
		<section className={style.uploadTrackListContainer}>
			<h2 className={style.uploadTrackListHeader}>{getHeaderText()}</h2>

			{/* Live region for track status updates */}
			<VisuallyHidden aria-live="polite">
				{getStatusAnnouncements()}
			</VisuallyHidden>

			{/* Live region for validation errors */}
			{errorMessage && (
				<div
					role="alert"
					aria-live="assertive"
					className={`${style.uploadTrackListDescription} ${errorMessage ? style.errorText : ""}`}
				>
					{errorMessage}
				</div>
			)}

			<ol className={style.uploadTrackListWrapper}>
				{tracks.map((track, index) => (
					<li
						key={`track-${track.originalFileName}-${index}`}
						className={`${style.uploadTrackListRow} ${track.hasValidationError ? style.fileItemError : ""}`}
					>
						<span className={style.uploadTrackListRowIndex}>
							{index + 1}
							{track.hasValidationError ? (
								<span className={style.errorAsterisk}>*</span>
							) : (
								"."
							)}
						</span>

						<div className={style.uploadTrackListTrackContainer}>
							<TextInput
								type="text"
								label={track.originalFileName}
								value={track.title}
								disabled={uploadStatus !== UploadStatus.NOT_STARTED}
								onChange={(e: ChangeEvent<HTMLInputElement>) =>
									onTrackChange(index, "title", e.target.value)
								}
								placeholder="Title"
								className={style.uploadRowTitleInput}
								aria-invalid={track.hasValidationError}
								required
							/>
						</div>

						{uploadStatus === UploadStatus.NOT_STARTED ? (
							<button
								type="button"
								onClick={() => onTrackRemove(index)}
								className={style.removeButton}
								aria-label="Remove track"
							>
								×
							</button>
						) : (
							<div
								className={style.statusIndicator}
								aria-label={getTrackStatusText(track, index)}
							>
								{getTrackStatusComponent(track)}
							</div>
						)}
					</li>
				))}
			</ol>
		</section>
	);
};

export default UploadTrackList;

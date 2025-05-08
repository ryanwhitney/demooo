import type { ChangeEvent } from "react";
import TextInput from "@/components/textInput/TextInput";
import * as style from "./UploadTrackList.css";
import LoadIndicator from "@/components/spinnerLoadIndicator/SpinnerLoadIndicator";

export enum TrackStatus {
	Pending = "pending",
	Uploading = "uploading",
	Success = "success",
	Error = "error",
}

export interface TrackFile {
	title: string;
	file: File;
	originalFileName: string;
	status: TrackStatus;
	errorMessage?: string;
	hasValidationError?: boolean;
}

interface UploadTrackListProps {
	tracks: TrackFile[];
	onTrackChange: (index: number, field: "title", value: string) => void;
	onTrackRemove: (index: number) => void;
	isSubmitted: boolean;
	errorMessage?: string;
}

const UploadTrackList = ({
	tracks,
	onTrackChange,
	onTrackRemove,
	isSubmitted,
	errorMessage,
}: UploadTrackListProps) => {
	const getTrackStatusComponent = (track: TrackFile) => {
		switch (track.status) {
			case TrackStatus.Uploading:
				return <LoadIndicator size={16} />;
			case TrackStatus.Success:
				return <span className={style.successStatus}>✓</span>;
			case TrackStatus.Error:
				return <span className={style.errorStatus}>✗</span>;
			default:
				return null;
		}
	};

	const haveSuccessfulUploads = tracks.some(
		(track) => track.status === TrackStatus.Success,
	);

	const getHeaderText = () => {
		if (isSubmitted) {
			if (tracks.some((track) => track.status === TrackStatus.Uploading)) {
				return "Uploading...";
			}
			if (haveSuccessfulUploads) {
				const successCount = tracks.filter(
					(t) => t.status === TrackStatus.Success,
				).length;
				const errorCount = tracks.filter(
					(t) => t.status === TrackStatus.Error,
				).length;

				if (errorCount === 0) {
					return `${successCount} track${successCount === 1 ? "" : "s"} added to your profile.`;
				}
				return `${successCount} track${successCount === 1 ? "" : "s"} successfully uploaded, ${errorCount} failed.`;
			}
		}

		// Ready to upload (default)
		return `Ready to upload${tracks.length === 1 ? "." : ` ${tracks.length} tracks.`}`;
	};

	return (
		<div className={style.uploadTrackListContainer}>
			<h2 className={style.uploadTrackListHeader}>{getHeaderText()} </h2>
			{!isSubmitted && (
				<p
					className={`${style.uploadTrackListDescription} ${errorMessage ? style.errorText : ""}`}
				>
					{!errorMessage ? "You can edit titles beforehand." : errorMessage}
				</p>
			)}
			<div className={style.uploadTrackListRowWrapper}>
				{tracks.map((track, index) => (
					<div
						key={`track-${track.originalFileName}-${index}`}
						className={`${style.uploadTrackListRow} ${track.hasValidationError ? style.fileItemError : ""}`}
					>
						<span
							style={{
								fontSize: 11,
								opacity: 0.5,
								marginLeft: -4,
								marginRight: -4,
							}}
						>
							{index + 1}.
						</span>

						<div className={style.uploadTrackListTrackContainer}>
							<TextInput
								type="text"
								label={track.originalFileName}
								value={track.title}
								disabled={isSubmitted}
								onChange={(e: ChangeEvent<HTMLInputElement>) =>
									onTrackChange(index, "title", e.target.value)
								}
								placeholder="Title"
								className={style.uploadRowTitleInput}
								required
							/>
							<div className={style.fileInfoContainer}>
								{track.errorMessage && (
									<span className={style.errorText}>{track.errorMessage}</span>
								)}
							</div>
						</div>

						{!isSubmitted ? (
							<button
								type="button"
								onClick={() => onTrackRemove(index)}
								className={style.removeButton}
								aria-label={`Remove ${track.title}`}
							>
								×
							</button>
						) : (
							<div className={style.statusIndicator}>
								{getTrackStatusComponent(track)}
							</div>
						)}
					</div>
				))}
			</div>
		</div>
	);
};

export default UploadTrackList;

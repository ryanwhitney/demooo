import { useState, type ChangeEvent } from "react";
import TextInput from "@/components/textInput/TextInput";
import * as style from "./TrackList.css";
import LoadIndicator from "@/components/loadIndicator/LoadIndicator";

export interface Track {
	title: string;
	file: File;
	originalFileName: string;
	status: "pending" | "uploading" | "success" | "error";
	errorMessage?: string;
	hasValidationError?: boolean;
}

interface TrackListProps {
	tracks: Track[];
	onTrackChange: (index: number, field: "title", value: string) => void;
	onTrackRemove: (index: number) => void;
	isSubmitted: boolean;
	errorMessage?: string;
}

const TrackList = ({
	tracks,
	onTrackChange,
	onTrackRemove,
	isSubmitted,
	errorMessage,
}: TrackListProps) => {
	const getTrackStatusComponent = (track: Track) => {
		switch (track.status) {
			case "uploading":
				return <LoadIndicator size={16} />;
			case "success":
				return <span className={style.successStatus}>✓</span>;
			case "error":
				return <span className={style.errorStatus}>✗</span>;
			default:
				return null;
		}
	};

	const haveSuccessfulUploads = tracks.some(
		(track) => track.status === "success",
	);

	const getHeaderText = () => {
		if (isSubmitted) {
			if (haveSuccessfulUploads) {
				// Case 1: Upload completed with some successful uploads
				const successCount = tracks.filter(
					(t) => t.status === "success",
				).length;
				return `Successfully uploaded ${successCount} of ${tracks.length} tracks`;
			}
			if (tracks.some((track) => track.status === "uploading")) {
				return "Uploading...";
			}
		}

		// Case 3: Ready to upload (default)
		return `Ready to upload${tracks.length === 1 ? "." : ` ${tracks.length} tracks.`}`;
	};

	return (
		<div className={style.fileList}>
			<h2 className={style.editHeader}>{getHeaderText()} </h2>
			{!isSubmitted && (
				<p
					className={`${style.editHeaderDescription} ${errorMessage ? style.errorText : ""}`}
				>
					{!errorMessage ? "You can edit titles beforehand." : errorMessage}
				</p>
			)}
			<div className={style.fileListRows}>
				{tracks.map((track, index) => (
					<div
						key={`track-${track.originalFileName}-${index}`}
						className={`${style.fileItem} ${track.hasValidationError ? style.fileItemError : ""}`}
					>
						<div className={style.titleContainer}>
							<TextInput
								type="text"
								label={`${index + 1}.`}
								value={track.title}
								disabled={isSubmitted}
								onChange={(e: ChangeEvent<HTMLInputElement>) =>
									onTrackChange(index, "title", e.target.value)
								}
								placeholder="Title"
								className={`${style.uploadRowTitleInput} ${track.hasValidationError ? style.titleInputError : ""}`}
								required
							/>
						</div>
						<div className={style.fileInfoContainer}>
							<div>
								{track.file && (
									<span className={style.fileName}>
										{track.originalFileName}
									</span>
								)}
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

export default TrackList;

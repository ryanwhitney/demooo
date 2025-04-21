import { GET_ALL_TRACKS, GET_USER_TRACKS } from "@/apollo/queries/trackQueries";
import { UPLOAD_MULTIPLE_TRACKS } from "@/apollo/mutations/trackMutations";

import ProgressIndicator from "@/components/progressIndicator/ProgressIndicator";
import ErrorBox from "@/components/errorBox/ErrorBox";
import { useMutation } from "@apollo/client";
import { useState, type ChangeEvent, type FormEvent } from "react";
import { Button, DropZone, FileTrigger } from "react-aria-components";
import TextInput from "@/components/textInput/TextInput";
import * as style from "./UploadTracks.css";

// Simplified track type
interface UploadTrack {
	title: string;
	description: string;
	file: File;
	originalFileName: string;
}

const UploadTracks = () => {
	const [dropped, setDropped] = useState(false);
	const [tracks, setTracks] = useState<UploadTrack[]>([]);
	const [errorMessage, setErrorMessage] = useState<string>("");
	const [isSubmitted, setIsSubmitted] = useState(false);

	const [uploadMultipleTracks, { loading }] = useMutation(
		UPLOAD_MULTIPLE_TRACKS,
		{
			refetchQueries: [{ query: GET_USER_TRACKS }, { query: GET_ALL_TRACKS }],
		},
	);

	// Process audio files
	const processAudioFiles = (files: File[]) => {
		const validFiles: UploadTrack[] = [];

		for (const file of files) {
			if (file.type.startsWith("audio/")) {
				const fileName = file.name;
				const fileNameWithoutExtension = fileName
					.split(".")
					.slice(0, -1)
					.join(".");

				validFiles.push({
					title: fileNameWithoutExtension,
					description: "",
					file: file,
					originalFileName: fileName,
				});
			}
		}

		if (validFiles.length > 0) {
			setTracks((prev) => [...prev, ...validFiles]);
			return true;
		}

		return false;
	};

	// Handle files selected via FileTrigger
	const handleSelectFiles = (files: FileList | null) => {
		if (!files) return;
		const fileArray = Array.from(files);
		processAudioFiles(fileArray);
	};

	const handleInputChange = (
		index: number,
		field: "title" | "description",
		value: string,
	) => {
		const updatedTracks = [...tracks];
		updatedTracks[index] = {
			...updatedTracks[index],
			[field]: value,
		};
		setTracks(updatedTracks);
	};

	const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		// Check if any tracks are missing titles
		const invalidTracks = tracks.filter((track) => !track.title.trim());

		if (invalidTracks.length > 0) {
			alert("Please provide a title for each track");
			return;
		}

		setIsSubmitted(true);
		setErrorMessage("");

		try {
			const { data } = await uploadMultipleTracks({
				variables: {
					files: tracks.map((track) => track.file),
					titles: tracks.map((track) => track.title),
					descriptions: tracks.map((track) => track.description || ""),
				},
			});

			// If upload was successful, show success state
			if (data.uploadMultipleTracks) {
				console.log("Tracks uploaded successfully:", data);
			} else {
				// If the upload failed, show error
				setIsSubmitted(false);
				setErrorMessage("Upload failed for all tracks");
			}
		} catch (err) {
			// Handle errors
			const errorMsg = err instanceof Error ? err.message : String(err);
			setErrorMessage(errorMsg);
			setIsSubmitted(false);
		}
	};

	const removeTrack = (index: number) => {
		const updatedTracks = [...tracks];
		updatedTracks.splice(index, 1);
		setTracks(updatedTracks);
	};

	const resetForm = () => {
		setTracks([]);
		setErrorMessage("");
		setDropped(false);
		setIsSubmitted(false);
	};

	return (
		<div className={style.container}>
			<form onSubmit={handleSubmit}>
				{errorMessage && <ErrorBox text={errorMessage} />}

				<div className="upload-page">
					<h1 className={style.pageTitle}>Upload Tracks</h1>

					{(!isSubmitted || tracks.length === 0) && (
						<DropZone
							className={({ isDropTarget }) =>
								`${tracks.length > 0 ? style.dropZoneWithFiles : ""} ${isDropTarget ? style.dropZoneDropping : ""} ${style.dropZone} `
							}
							getDropOperation={(types) =>
								types.has("audio/*") ? "copy" : "cancel"
							}
							onDrop={async (e) => {
								setDropped(true);
								const droppedFiles: File[] = [];
								for (const item of e.items) {
									if (item.kind === "file") {
										const file = await item.getFile();
										droppedFiles.push(file);
									}
								}
								processAudioFiles(droppedFiles);
							}}
						>
							{dropped
								? tracks.length > 0
									? ""
									: "Audio files only"
								: "Drop files here"}
							<FileTrigger
								acceptedFileTypes={["audio/*, video/*"]}
								allowsMultiple={true}
								onSelect={handleSelectFiles}
							>
								<Button className={style.addFilesButton}>
									{dropped && tracks.length > 0
										? "add more"
										: "or browse files"}
								</Button>
							</FileTrigger>
						</DropZone>
					)}

					<div className={style.fileList}>
						{tracks.length > 0 && (
							<>
								<h2 className={style.editHeader}>Edit titles and upload</h2>
								{tracks.map((track, index) => (
									<div
										key={`track-upload-${style.fileItem}`}
										className={style.fileItem}
									>
										<div className={style.titleContainer}>
											{isSubmitted ? (
												<div className={style.titleText}>{track.title}</div>
											) : (
												<TextInput
													type="text"
													label={`${index + 1}.`}
													value={track.title}
													onChange={(e: ChangeEvent<HTMLInputElement>) =>
														handleInputChange(index, "title", e.target.value)
													}
													placeholder="Title"
													className={style.titleInput}
													required
												/>
											)}
										</div>
										<div className={style.fileInfoContainer}>
											<div>
												{track.file && (
													<span className={style.fileName}>
														{track.originalFileName}
													</span>
												)}
											</div>
										</div>
										{!isSubmitted && (
											<button
												type="button"
												onClick={() => removeTrack(index)}
												className={style.removeButton}
											>
												×
											</button>
										)}
									</div>
								))}

								{isSubmitted ? (
									<Button
										type="button"
										onClick={resetForm}
										className={style.actionButton}
									>
										Upload More Tracks
									</Button>
								) : (
									<Button
										type="submit"
										className={style.actionButton}
										isDisabled={
											loading ||
											tracks.length === 0 ||
											tracks.some((track) => !track.title.trim())
										}
									>
										{loading ? (
											<ProgressIndicator />
										) : (
											`Upload ${tracks.length} ${tracks.length === 1 ? "Track" : "Tracks"}`
										)}
									</Button>
								)}
							</>
						)}
					</div>
				</div>
			</form>
		</div>
	);
};

export default UploadTracks;

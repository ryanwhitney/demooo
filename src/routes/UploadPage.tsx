import { GET_ALL_TRACKS, GET_USER_TRACKS } from "@/apollo/queries/trackQueries";
import { UPLOAD_MULTIPLE_TRACKS } from "@/apollo/mutations/trackMutations";

import ProgressIndicator from "@/components/progressIndicator/ProgressIndicator";
import ErrorBox from "@/components/errorBox/ErrorBox";
import { tokens } from "@/styles/tokens";
import type { UploadTrackFormInput } from "@/types/track";
import { useMutation } from "@apollo/client";
import { useState, type ChangeEvent, type FormEvent } from "react";
import { Button, DropZone, FileTrigger } from "react-aria-components";
import { dropping, notDropping } from "./UploadPage.css";
import TextInput from "@/components/textInput/TextInput";

// Extended type to track upload status
interface UploadTrackWithStatus extends UploadTrackFormInput {
	id?: string; // ID will be set after successful upload
	status?: "pending" | "success" | "error"; // Track upload status
	errorMessage?: string; // Error message if upload failed
	originalFileName: string; // Store original file name for display
	originalFileDate: string; // Store original file date for display
}

const UploadPage = () => {
	const [dropped, setDropped] = useState(false);
	const [tracks, setTracks] = useState<UploadTrackWithStatus[]>([]);
	const [uploadErrors, setUploadErrors] = useState<string[]>([]);
	const [isSubmitted, setIsSubmitted] = useState(false);

	const [uploadMultipleTracks, { loading }] = useMutation(
		UPLOAD_MULTIPLE_TRACKS,
		{
			refetchQueries: [{ query: GET_USER_TRACKS }, { query: GET_ALL_TRACKS }],
		},
	);

	// Helper function to validate and process audio files
	const processAudioFiles = (files: File[]) => {
		const validFiles: UploadTrackWithStatus[] = [];

		for (const file of files) {
			// Check if the file is an audio file
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
					status: "pending",
					originalFileName: fileName,
					originalFileDate: new Date(file.lastModified).toLocaleDateString(),
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
		field: keyof Omit<UploadTrackFormInput, "file">,
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

		// Set all tracks to pending status
		setTracks(
			tracks.map((track) => ({
				...track,
				status: "pending",
			})),
		);

		setIsSubmitted(true);

		try {
			const { data } = await uploadMultipleTracks({
				variables: {
					files: tracks.map((track) => track.file),
					titles: tracks.map((track) => track.title),
					descriptions: tracks.map((track) => track.description || ""),
				},
			});

			console.log("Tracks uploaded response:", data);

			// If we get null response, all tracks failed
			if (!data.uploadMultipleTracks) {
				// Keep form editable when all uploads fail
				setIsSubmitted(false);
				throw new Error("Upload failed for all tracks");
			}

			// Track which files were successfully uploaded by comparing with response
			const successfulTracks = data.uploadMultipleTracks.tracks || [];

			// Update status for all tracks
			const updatedTracks = [...tracks].map((track) => {
				// Find this track in the successful uploads response
				const uploadedTrack = successfulTracks.find(
					(t: any) => t.title === track.title,
				);

				if (uploadedTrack) {
					// Track was successfully uploaded
					return {
						...track,
						id: uploadedTrack.id,
						status: "success",
					};
				} else {
					// Track was not in the response, so it failed
					return {
						...track,
						status: "error",
						errorMessage: "Upload failed",
					};
				}
			});

			setTracks(updatedTracks);

			// Handle any failed uploads
			if (data.uploadMultipleTracks.failedUploads?.length > 0) {
				setUploadErrors(data.uploadMultipleTracks.failedUploads);
			} else {
				setUploadErrors([]);
			}
		} catch (err) {
			// Extract duplicate title errors if present
			const errorMsg = err instanceof Error ? err.message : String(err);
			const duplicateTitleMatches = errorMsg.match(
				/You already have a track with title: '([^']+)'/g,
			);

			if (duplicateTitleMatches) {
				// Parse out the duplicate titles
				const duplicateTitles = duplicateTitleMatches
					.map((match) => {
						const titleMatch = match.match(
							/You already have a track with title: '([^']+)'/,
						);
						return titleMatch ? titleMatch[1] : null;
					})
					.filter(Boolean);

				// Mark only the duplicate titled tracks as errors
				const updatedTracks = [...tracks].map((track) => {
					if (duplicateTitles.includes(track.title)) {
						return {
							...track,
							status: "error",
							errorMessage: `A track with this title already exists"`,
						};
					}
					return {
						...track,
						status: "pending",
					};
				});

				setTracks(updatedTracks);
				// Keep form editable for duplicate title errors
				setIsSubmitted(false);
			} else {
				// For other errors, mark all tracks as failed
				setTracks(
					tracks.map((track) => ({
						...track,
						status: "error",
						errorMessage: errorMsg,
					})),
				);
			}

			setUploadErrors([errorMsg]);
		}
	};

	const removeTrack = (index: number) => {
		const updatedTracks = [...tracks];
		updatedTracks.splice(index, 1);
		setTracks(updatedTracks);
	};

	const resetForm = () => {
		setTracks([]);
		setUploadErrors([]);
		setDropped(false);
		setIsSubmitted(false);
	};

	return (
		<div style={{ maxWidth: "600px", margin: "0 auto", padding: "20px" }}>
			<form onSubmit={handleSubmit}>
				{uploadErrors.length > 0 && <ErrorBox text={uploadErrors.join("\n")} />}

				<div className="upload-page">
					<h1 style={{ marginBottom: 40 }}>Upload Tracks</h1>

					{(!isSubmitted || tracks.length === 0) && (
						<DropZone
							style={{
								width: "100%",
								borderRadius: tokens.radii.xl,
								padding: 20,
								height: tracks.length > 0 ? 80 : 100,
								border: ".5px dashed rgba(130,130,139,0.5)",
								textAlign: "center",
								display: "flex",
								flexDirection: "column",
								justifyContent: "center",
								alignItems: "center",
								transition: "filter 0.2s ease-in-out",
							}}
							className={({ isDropTarget }) =>
								isDropTarget ? dropping : notDropping
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
									? "Successful drop!"
									: "Audio files only"
								: "Drop files here"}
							<FileTrigger
								acceptedFileTypes={["audio/*"]}
								allowsMultiple={true}
								onSelect={handleSelectFiles}
							>
								<Button
									style={{
										color: "white",
										border: "none",
										textDecoration: "underline",
										borderRadius: "4px",
										cursor: "pointer",
										fontWeight: "bold",
									}}
								>
									or click to add
								</Button>
							</FileTrigger>
						</DropZone>
					)}

					{tracks.length > 0 && (
						<div className="file-list" style={{ marginTop: "20px" }}>
							{tracks.map((track, index) => (
								<div
									key={track.id || `track-${index}`}
									style={{
										display: "flex",
										gap: "16px",
										alignItems: "center",
										background:
											track.status === "success"
												? "rgba(0,255,0,0.1)"
												: track.status === "error"
													? "rgba(255,0,0,0.1)"
													: "rgba(0,0,0,0.1)",
										borderRadius: "8px",
									}}
								>
									<div style={{ flex: "0 0 30%" }}>
										{isSubmitted ? (
											<div style={{ padding: "4px 8px", fontSize: "14px" }}>
												{track.title}
											</div>
										) : (
											<TextInput
												type="text"
												value={track.title}
												onChange={(e: ChangeEvent<HTMLInputElement>) =>
													handleInputChange(index, "title", e.target.value)
												}
												placeholder="Title"
												style={{ padding: "6px 16px", margin: 0 }}
												required
											/>
										)}
									</div>
									<div
										style={{
											flex: "1",
											fontSize: 12,
											display: "flex",
											flexDirection: "column",
										}}
									>
										<div>
											{track.file && (
												<span
													style={{
														color: tokens.colors.secondary,
														paddingRight: 8,
													}}
												>
													{track.originalFileName}
												</span>
											)}
											<span style={{ color: tokens.colors.tertiary }}>
												({track.originalFileDate})
											</span>
										</div>
										{track.status && (
											<span
												style={{
													marginLeft: "auto",
													color:
														track.status === "success"
															? "green"
															: track.status === "error"
																? "red"
																: "gray",
													fontWeight: "bold",
												}}
											>
												{track.status === "success"
													? "Success"
													: track.status === "error"
														? track.errorMessage || "Failed"
														: ""}
											</span>
										)}
									</div>
									{!isSubmitted && (
										<button
											type="button"
											onClick={() => removeTrack(index)}
											style={{
												background: tokens.colors.secondaryDark,
												border: "none",
												width: "20px",
												height: "20px",
												display: "flex",
												alignItems: "center",
												justifyContent: "center",
												cursor: "pointer",
												fontSize: "16px",
												borderRadius: tokens.radii.full,
												color: tokens.colors.primary,
											}}
										>
											×
										</button>
									)}
								</div>
							))}

							{isSubmitted &&
							tracks.some((track) => track.status === "success") ? (
								<Button
									type="button"
									onClick={resetForm}
									style={{
										marginTop: "20px",
										padding: "10px 16px",
										background: tokens.colors.backgroundSecondary,
										color: "white",
										border: "none",
										borderRadius: "8px",
										cursor: "pointer",
										fontSize: "16px",
										fontWeight: "bold",
										display: "flex",
										alignItems: "center",
										justifyContent: "center",
										width: "100%",
									}}
								>
									Upload More Tracks
								</Button>
							) : (
								<Button
									type="submit"
									style={{
										marginTop: "20px",
										padding: "10px 16px",
										background: tokens.colors.backgroundSecondary,
										color: "white",
										border: "none",
										borderRadius: "8px",
										cursor: "pointer",
										fontSize: "16px",
										fontWeight: "bold",
										display: "flex",
										alignItems: "center",
										justifyContent: "center",
										width: "100%",
									}}
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
						</div>
					)}
				</div>
			</form>
		</div>
	);
};

export default UploadPage;

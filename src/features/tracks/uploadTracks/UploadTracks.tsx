import {
	GET_ALL_TRACKS,
	GET_TRACK_TITLES,
	GET_USER_TRACKS,
} from "@/apollo/queries/trackQueries";
import { UPLOAD_TRACK } from "@/apollo/mutations/trackMutations";
import { GET_ME } from "@/apollo/queries/userQueries";

import ProgressIndicator from "@/components/progressIndicator/ProgressIndicator";
import { useMutation, useQuery } from "@apollo/client";
import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { Button, DropZone, FileTrigger } from "react-aria-components";
import TextInput from "@/components/textInput/TextInput";
import * as style from "./UploadTracks.css";
import LoadIndicator from "@/components/loadIndicator/LoadIndicator";
import { tokens } from "@/styles/tokens";
import { Link } from "react-router";

interface UploadTrack {
	title: string;
	description: string;
	file: File;
	originalFileName: string;
	status: "pending" | "uploading" | "success" | "error";
	errorMessage?: string;
	hasValidationError?: boolean;
}

// Interface for track data from the API
interface UserTrack {
	id: string;
	title: string;
}

const UploadTracks = () => {
	const [dropped, setDropped] = useState(false);
	const [tracks, setTracks] = useState<UploadTrack[]>([]);
	const [errorMessage, setErrorMessage] = useState<string>("");
	const [isSubmitted, setIsSubmitted] = useState(false);
	const [isDropZoneMinimized, setIsDropZoneMinimized] = useState(false);
	const [isLoadingFiles, setIsLoadingFiles] = useState(false);
	const [isUploading, setIsUploading] = useState(false);
	const [isValidating, setIsValidating] = useState(false);

	// Fetch current user data
	const { data: userData } = useQuery(GET_ME, {
		fetchPolicy: "cache-and-network",
	});

	// Fetch only track titles for validation (optimized)
	const { data: trackTitlesData } = useQuery(GET_TRACK_TITLES, {
		variables: { username: userData?.me?.username || "" },
		skip: !userData?.me?.username,
		fetchPolicy: "cache-and-network",
	});

	const [uploadTrack] = useMutation(UPLOAD_TRACK, {
		refetchQueries: [{ query: GET_USER_TRACKS }, { query: GET_ALL_TRACKS }],
	});

	const processAudioFiles = (files: File[]) => {
		console.log("Processing audio files:", files.length);
		setDropped(true);
		setIsLoadingFiles(true);

		const validFiles: UploadTrack[] = [];

		for (const file of files) {
			console.log("Processing file:", file.name, file.type);
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
					status: "pending",
				});
			}
		}

		console.log("Valid audio files:", validFiles.length);
		if (validFiles.length > 0) {
			setTracks((prev) => [...prev, ...validFiles]);
			return true;
		}

		setTimeout(() => {
			setIsLoadingFiles(false);
			if (dropped && tracks.length === 0) {
				setDropped(false);
			}
		}, 500);

		return false;
	};

	// Handle files selected via FileTrigger
	const handleSelectFiles = (files: FileList | null) => {
		console.log("Files selected via FileTrigger:", files);
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

	const uploadNextTrack = async (
		trackIndex: number,
		allTracks: UploadTrack[],
	) => {
		if (trackIndex >= allTracks.length) {
			// All uploads complete
			setIsUploading(false);
			return;
		}

		const currentTrack = allTracks[trackIndex];

		// Update status to uploading
		setTracks((prevTracks) => {
			const updatedTracks = [...prevTracks];
			updatedTracks[trackIndex] = {
				...updatedTracks[trackIndex],
				status: "uploading",
			};
			return updatedTracks;
		});

		try {
			const { data } = await uploadTrack({
				variables: {
					file: currentTrack.file,
					title: currentTrack.title,
					description: currentTrack.description || "",
				},
			});

			// Update track with success status
			setTracks((prevTracks) => {
				const updatedTracks = [...prevTracks];
				updatedTracks[trackIndex] = {
					...updatedTracks[trackIndex],
					status: "success",
				};
				return updatedTracks;
			});

			// Proceed to next track
			uploadNextTrack(trackIndex + 1, allTracks);
		} catch (err) {
			const errorMsg = err instanceof Error ? err.message : String(err);

			// Update track with error status
			setTracks((prevTracks) => {
				const updatedTracks = [...prevTracks];
				updatedTracks[trackIndex] = {
					...updatedTracks[trackIndex],
					status: "error",
					errorMessage: errorMsg,
				};
				return updatedTracks;
			});

			// Continue with next track despite error
			uploadNextTrack(trackIndex + 1, allTracks);
		}
	};

	// Validate track titles against existing user tracks
	const validateTrackTitles = () => {
		if (!trackTitlesData?.userTracks) return false;

		setIsValidating(true);
		setErrorMessage("");

		const userTrackTitles = trackTitlesData.userTracks.map((track: UserTrack) =>
			track.title.toLowerCase().trim(),
		);

		const tracksWithErrors: number[] = [];
		const duplicateTitlesInBatch = new Set<string>();
		const titlesInBatch = new Set<string>();

		// First, check for duplicates within the batch
		tracks.forEach((track, index) => {
			const normalizedTitle = track.title.toLowerCase().trim();

			if (titlesInBatch.has(normalizedTitle)) {
				duplicateTitlesInBatch.add(track.title);
				tracksWithErrors.push(index);
			} else {
				titlesInBatch.add(normalizedTitle);
			}
		});

		// Then check against existing tracks
		tracks.forEach((track, index) => {
			const normalizedTitle = track.title.toLowerCase().trim();

			// If it's already marked as an error (duplicate in batch), skip
			if (tracksWithErrors.includes(index)) return;

			if (userTrackTitles.includes(normalizedTitle)) {
				tracksWithErrors.push(index);
			}
		});

		// Update tracks with validation errors
		if (tracksWithErrors.length > 0) {
			setTracks((prev) =>
				prev.map((track, index) => ({
					...track,
					hasValidationError: tracksWithErrors.includes(index),
					errorMessage: tracksWithErrors.includes(index)
						? duplicateTitlesInBatch.has(track.title)
							? "Duplicate title"
							: ""
						: undefined,
				})),
			);

			setErrorMessage(
				tracks.length === 1
					? "You already have a track with this title."
					: tracksWithErrors.length === 1
						? "One track needs a unique title."
						: `${tracksWithErrors.length} tracks need unique titles.`,
			);

			setIsValidating(false);
			return false;
		}

		setIsValidating(false);
		return true;
	};

	const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		// Check if any tracks are missing titles
		const invalidTracks = tracks.filter((track) => !track.title.trim());

		if (invalidTracks.length > 0) {
			setErrorMessage("Please provide a title for each track");
			return;
		}

		// Validate track titles against existing user tracks
		const titlesValid = validateTrackTitles();
		if (!titlesValid) {
			return;
		}

		// Clear all validation errors before submission
		// This ensures that error styling is removed before upload starts
		setTracks(
			tracks.map((track) => ({
				...track,
				hasValidationError: false,
				errorMessage: undefined,
			})),
		);

		setIsSubmitted(true);
		setIsUploading(true);

		// Start uploading tracks sequentially
		const tracksToUpload = [...tracks];
		uploadNextTrack(0, tracksToUpload);
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
		setIsLoadingFiles(false);
		setIsUploading(false);
	};

	useEffect(() => {
		if (tracks.length > 0) {
			setIsDropZoneMinimized(true);
			setIsLoadingFiles(false);
		} else {
			setErrorMessage("");
			setDropped(false);
			setIsDropZoneMinimized(false);
		}
	}, [tracks]);

	// Using a more specific type instead of any
	const handleDrop = (e: {
		type: string;
		items: Array<unknown>;
		dropOperation?: string;
		// For native drag events
		dataTransfer?: DataTransfer;
	}) => {
		console.log("Drop event triggered:", e);
		try {
			// Check if we have a dataTransfer object (native HTML drag/drop)
			if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
				console.log("Found files in dataTransfer:", e.dataTransfer.files);
				const fileArray = Array.from(e.dataTransfer.files);
				processAudioFiles(fileArray);
				return;
			}

			// Directly look for DroppedFiles and extract them
			// React Aria specific item structure inspection
			if (e.items && e.items.length > 0) {
				console.log("Inspecting drop items:", e.items);

				// The items may be complex objects, extract any files
				const files: File[] = [];
				const promises: Promise<void>[] = [];

				for (const item of e.items) {
					console.log("Item:", item);

					// Based on logs, items have a getFile method, not getAsFile
					if (item && typeof item === "object") {
						const itemObj = item as any;

						// Try different ways to get the file
						if (item instanceof File) {
							files.push(item);
						} else if (itemObj.file instanceof File) {
							files.push(itemObj.file);
						} else if (typeof itemObj.getFile === "function") {
							// getFile might return a Promise, so we need to handle it properly
							const promise = Promise.resolve(itemObj.getFile())
								.then((file) => {
									console.log("Got file from getFile:", file);
									if (file instanceof File) {
										files.push(file);
									}
								})
								.catch((err) => {
									console.error("Error getting file:", err);
								});

							promises.push(promise);
						}
					}
				}

				// Wait for all getFile promises to resolve
				if (promises.length > 0) {
					Promise.all(promises).then(() => {
						console.log("All getFile promises resolved, files:", files.length);
						if (files.length > 0) {
							processAudioFiles(files);
						} else {
							console.log("No files found after resolving promises");
						}
					});
					return;
				}

				if (files.length > 0) {
					console.log("Found files in items immediately:", files.length);
					processAudioFiles(files);
					return;
				}
			}

			console.log("No files found in drop event", e);
		} catch (error) {
			console.error("Error handling drop:", error);
		}
	};

	const GetDropZoneContents = ({ dropped }: { dropped: boolean }) => {
		const getDisplayText = () => {
			if (!dropped) {
				return "or drop files here";
			}

			if (isLoadingFiles && !isDropZoneMinimized) {
				return <LoadIndicator size={16} />;
			}
		};

		const getButtonText = () => {
			if (dropped && tracks.length > 0) {
				return !isDropZoneMinimized ? "" : "Add more";
			}
			return "Browse to add";
		};

		const getInstructionText = () => {
			if ((dropped && tracks.length > 0) || isDropZoneMinimized) return null;
			return (
				<small style={{ marginTop: 20, color: tokens.colors.secondary }}>
					(supports most audio files, max 30mb each.)
				</small>
			);
		};

		return (
			<>
				<FileTrigger
					acceptedFileTypes={["audio/*"]}
					allowsMultiple={true}
					onSelect={handleSelectFiles}
				>
					<Button
						className={style.addFilesButton}
						style={{
							textDecoration: isDropZoneMinimized ? "none" : "underline",
							fontWeight: isDropZoneMinimized ? 400 : 600,
							width: "auto",
							padding: "10px 16px",
						}}
					>
						{getButtonText()}
					</Button>
				</FileTrigger>
				{getDisplayText()}
				{getInstructionText()}
			</>
		);
	};

	const getTrackStatusComponent = (track: UploadTrack) => {
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

	// Determine if we need a general error message
	useEffect(() => {
		if (isSubmitted && !isUploading) {
			const errorTracks = tracks.filter((track) => track.status === "error");
			if (errorTracks.length > 0) {
				if (errorTracks.length === tracks.length) {
					setErrorMessage(
						"All uploads failed. Please check individual tracks for errors.",
					);
				} else {
					setErrorMessage(
						`${errorTracks.length} of ${tracks.length} uploads failed.`,
					);
				}
			}
		}
	}, [isSubmitted, isUploading, tracks]);

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
			if (isUploading) {
				return "Uploading...";
			}
		}

		// Case 3: Ready to upload (default)
		return `Ready to upload${tracks.length === 1 ? "." : ` ${tracks.length} tracks.`}`;
	};

	return (
		<section className={style.uploadPageContainer}>
			<header>
				<h1 className={style.uploadPageTitle}>
					Upload your demo<span style={{ fontSize: 17 }}>o</span>
					<span style={{ fontSize: 15 }}>o</span>
					<span style={{ fontSize: 12 }}>o</span>
					<span style={{ fontSize: 9 }}>o</span>
					<span style={{ fontSize: 6 }}>s</span>
				</h1>
				<p className={style.uploadHeaderDescription}>
					Demos, experiments, sketches, whatever. Just share it.
				</p>
			</header>
			<form onSubmit={handleSubmit}>
				<div>
					{(!isSubmitted || tracks.length === 0) && (
						<DropZone
							className={({ isDropTarget }) =>
								`${isDropZoneMinimized ? style.dropZoneWithFiles : ""} ${
									isDropTarget ? style.dropZoneDropping : ""
								} ${style.dropZone}`
							}
							getDropOperation={() => "copy"}
							onDrop={handleDrop}
							aria-label="Drop audio files here or click to select files"
						>
							<GetDropZoneContents dropped={dropped} />
						</DropZone>
					)}

					<div className={style.fileList({ isShown: tracks.length > 0 })}>
						{tracks.length > 0 && (
							<>
								<h2 className={style.editHeader}>{getHeaderText()} </h2>
								{!isSubmitted && (
									<p
										className={`${style.editHeaderDescription} ${errorMessage ? style.errorText : ""}`}
									>
										{!errorMessage
											? "You can edit titles beforehand."
											: errorMessage}
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
														handleInputChange(index, "title", e.target.value)
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
														<span className={style.trackError}>
															{track.errorMessage}
														</span>
													)}
												</div>
											</div>
											{!isSubmitted ? (
												<button
													type="button"
													onClick={() => removeTrack(index)}
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
								{isSubmitted && haveSuccessfulUploads ? (
									<div>
										<Link
											to={`/${userData.me.username}`}
											className={style.actionButton}
											style={{
												background: tokens.colors.tintColor,
												textDecoration: "none",
											}}
										>
											Go to your profile
										</Link>
										<Button
											type="button"
											onClick={resetForm}
											className={style.actionButton}
										>
											Upload More Tracks
										</Button>
									</div>
								) : (
									<Button
										type="submit"
										className={style.actionButton}
										style={{ background: tokens.colors.tintColor }}
										isDisabled={
											isUploading ||
											tracks.length === 0 ||
											tracks.some((track) => !track.title.trim())
										}
									>
										{isUploading ? (
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
		</section>
	);
};

export default UploadTracks;

import { useState } from "react";
import { Button, DropZone, FileTrigger } from "react-aria-components";
import LoadIndicator from "@/components/loadIndicator/LoadIndicator";
import * as style from "./AudioDropzone.css";
import { tokens } from "@/styles/tokens";

// Interface for drag and drop items
interface DropItem {
	file?: File;
	getFile?: () => Promise<File> | File;
}

export interface AudioFile {
	title: string;
	file: File;
	originalFileName: string;
}

interface AudioDropzoneProps {
	onFilesAdded: (files: AudioFile[]) => void;
	isMinimized?: boolean;
}

const AudioDropzone = ({
	onFilesAdded,
	isMinimized = false,
}: AudioDropzoneProps) => {
	const [dropped, setDropped] = useState(false);
	const [isLoadingFiles, setIsLoadingFiles] = useState(false);

	const processAudioFiles = (files: File[]) => {
		console.log("Processing audio files:", files.length);
		setDropped(true);
		setIsLoadingFiles(true);

		const validFiles: AudioFile[] = [];

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
					file: file,
					originalFileName: fileName,
				});
			}
		}

		console.log("Valid audio files:", validFiles.length);
		if (validFiles.length > 0) {
			onFilesAdded(validFiles);
			setTimeout(() => {
				setIsLoadingFiles(false);
			}, 500);
			return true;
		}

		setTimeout(() => {
			setIsLoadingFiles(false);
			if (dropped) {
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

	// Handle dropped files
	const handleDrop = (e: {
		type: string;
		items: Array<unknown>;
		dropOperation?: string;
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
						const dropItem = item as DropItem;

						// Try different ways to get the file
						if (item instanceof File) {
							files.push(item);
						} else if (dropItem.file instanceof File) {
							files.push(dropItem.file);
						} else if (typeof dropItem.getFile === "function") {
							// getFile might return a Promise, so we need to handle it properly
							const promise = Promise.resolve(dropItem.getFile())
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

	const getDisplayText = () => {
		if (!dropped) {
			return "or drop files here";
		}

		if (isLoadingFiles && !isMinimized) {
			return <LoadIndicator size={16} />;
		}
	};

	const getButtonText = () => {
		if (dropped) {
			return !isMinimized ? "" : "Add more";
		}
		return "Browse to add";
	};

	const getInstructionText = () => {
		if (dropped || isMinimized) return null;
		return (
			<small style={{ marginTop: 20, color: tokens.colors.secondary }}>
				(supports most audio files, max 30mb each.)
			</small>
		);
	};

	return (
		<DropZone
			className={({ isDropTarget }) =>
				`${isMinimized ? style.dropZoneMinimized : ""} ${
					isDropTarget ? style.dropZoneDropping : ""
				} ${style.dropZone}`
			}
			getDropOperation={() => "copy"}
			onDrop={handleDrop}
			aria-label="Drop audio files here or click to select files"
		>
			<FileTrigger
				acceptedFileTypes={["audio/*"]}
				allowsMultiple={true}
				onSelect={handleSelectFiles}
			>
				<Button
					className={style.addFilesButton}
					style={{
						textDecoration: isMinimized ? "none" : "underline",
						fontWeight: isMinimized ? 400 : 600,
						width: "auto",
						padding: "10px 16px",
					}}
				>
					{getButtonText()}
				</Button>
			</FileTrigger>
			{getDisplayText()}
			{getInstructionText()}
		</DropZone>
	);
};

export default AudioDropzone;

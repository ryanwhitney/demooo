import {
	GET_ALL_TRACKS,
	GET_USER_TRACKS,
	UPLOAD_MULTIPLE_TRACKS,
} from "@/apollo/queries/trackQueries";
import ProgressIndicator from "@/components/progressIndicator/ProgressIndicator";
import ErrorBox from "@/components/errorBox/ErrorBox";
import { tokens } from "@/styles/tokens";
import type { UploadTrackFormInput } from "@/types/track";
import { useMutation } from "@apollo/client";
import { useState, type ChangeEvent, type FormEvent } from "react";
import { Button, DropZone, FileTrigger } from "react-aria-components";
import { dropping, notDropping } from "./UploadPage.css";
import TextInput from "@/components/textInput/TextInput";

const UploadPage = () => {
	const [dropped, setDropped] = useState(false);
	const [tracks, setTracks] = useState<UploadTrackFormInput[]>([]);
	const [uploadErrors, setUploadErrors] = useState<string[]>([]);

	const [uploadMultipleTracks, { loading }] = useMutation(
		UPLOAD_MULTIPLE_TRACKS,
		{
			refetchQueries: [{ query: GET_USER_TRACKS }, { query: GET_ALL_TRACKS }],
		},
	);

	// Helper function to validate and process audio files
	const processAudioFiles = (files: File[]) => {
		const validFiles: UploadTrackFormInput[] = [];

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
					dateCreated: new Date(file.lastModified).toLocaleDateString(),
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
		field: keyof Omit<UploadTrackFormInput, "file" | "dateCreated">,
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

		try {
			const { data } = await uploadMultipleTracks({
				variables: {
					files: tracks.map((track) => track.file),
					titles: tracks.map((track) => track.title),
					descriptions: tracks.map((track) => track.description),
				},
			});

			console.log("Tracks uploaded:", data.uploadMultipleTracks.tracks);

			// Handle any failed uploads
			if (data.uploadMultipleTracks.failedUploads?.length > 0) {
				setUploadErrors(data.uploadMultipleTracks.failedUploads);
			} else {
				// Reset form on complete success
				setTracks([]);
				setUploadErrors([]);
				setDropped(false);
			}
		} catch (err) {
			setUploadErrors([err instanceof Error ? err.message : String(err)]);
		}
	};

	const removeTrack = (index: number) => {
		const updatedTracks = [...tracks];
		updatedTracks.splice(index, 1);
		setTracks(updatedTracks);
	};

	return (
		<div style={{ maxWidth: "600px", margin: "0 auto", padding: "20px" }}>
			<form onSubmit={handleSubmit}>
				{uploadErrors.length > 0 && <ErrorBox text={uploadErrors.join("\n")} />}

				<div className="upload-page">
					<h1 style={{ marginBottom: 40 }}>Upload Tracks</h1>

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

					{tracks.length > 0 && (
						<div className="file-list" style={{ marginTop: "20px" }}>
							{tracks.map((track, index) => (
								<div
									key={track.file.name + index}
									style={{
										display: "flex",
										alignItems: "center",
										marginBottom: "12px",
										padding: "8px 12px",
										background: "rgba(0,0,0,0.1)",
										borderRadius: "8px",
									}}
								>
									<div style={{ flex: "0 0 30%" }}>
										<TextInput
											type="text"
											value={track.title}
											onChange={(e: ChangeEvent<HTMLInputElement>) =>
												handleInputChange(index, "title", e.target.value)
											}
											placeholder="Title"
											style={{
												width: "100%",
												padding: "4px 8px",
												border: "1px solid #ccc",
												borderRadius: "4px",
												fontSize: "14px",
											}}
											required
										/>
									</div>
									<div
										style={{
											flex: "1",
											marginLeft: "10px",
											marginRight: "10px",
											fontSize: "14px",
											display: "flex",
											gap: "8px",
										}}
									>
										<span style={{ color: "#888" }}>{track.file.name}</span>
										<span style={{ color: "#888" }}>({track.dateCreated})</span>
									</div>
									<button
										type="button"
										onClick={() => removeTrack(index)}
										style={{
											background: "none",
											border: "none",
											cursor: "pointer",
											fontSize: "16px",
											color: "#888",
										}}
									>
										×
									</button>
								</div>
							))}

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
						</div>
					)}
				</div>
			</form>
		</div>
	);
};

export default UploadPage;

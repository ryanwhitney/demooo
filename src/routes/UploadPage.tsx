import { tokens } from "@/styles/tokens";
import { useState } from "react";
import { Button, DropZone, FileTrigger } from "react-aria-components";
import { dropping, notDropping } from "./UploadPage.css";

interface AudioFile {
	name: string;
	file: File;
}

const UploadPage = () => {
	const [dropped, setDropped] = useState(false);
	const [audioFiles, setAudioFiles] = useState<AudioFile[]>([]);

	// Helper function to validate and process audio files
	const processAudioFiles = (files: File[]) => {
		const validFiles: AudioFile[] = [];

		for (const file of files) {
			// Check if the file is an audio file
			if (file.type.startsWith("audio/")) {
				validFiles.push({
					name: file.name,
					file: file,
				});
			}
		}

		if (validFiles.length > 0) {
			setAudioFiles((prev) => [...prev, ...validFiles]);
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

	return (
		<div style={{ maxWidth: "600px", margin: "0 auto", padding: "20px" }}>
			<div className="upload-page">
				<h1 style={{ marginBottom: 40 }}>Upload Tracks</h1>
				<DropZone
					style={{
						width: "100%",
						borderRadius: tokens.radii.xl,
						padding: 20,
						height: audioFiles.length > 0 ? 80 : 100,
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
						? audioFiles.length > 0
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
				{audioFiles.length > 0 && (
					<div className="file-list">
						<ul>
							{audioFiles.map((audioFile, index) => (
								// biome-ignore lint/suspicious/noArrayIndexKey: theres a name too
								<li key={audioFile.name + index}>
									<span>{audioFile.name}</span>
									<span className="file-type">({audioFile.file.type})</span>
								</li>
							))}
						</ul>
					</div>
				)}
			</div>
		</div>
	);
};

export default UploadPage;

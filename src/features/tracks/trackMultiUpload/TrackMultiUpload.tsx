import { GET_ALL_TRACKS, GET_USER_TRACKS } from "@/apollo/queries/trackQueries";
import { UPLOAD_MULTIPLE_TRACKS } from "@/apollo/mutations/trackMutations";
import Button from "@/components/button/Button";
import ErrorBox from "@/components/errorBox/ErrorBox";
import ProgressIndicator from "@/components/progressIndicator/ProgressIndicator";
import TextInput from "@/components/textInput/TextInput";
import type { UploadTrackFormInput } from "@/types/track";
import { useMutation } from "@apollo/client";
import { useState, type ChangeEvent, type FormEvent } from "react";

const TrackMultiUpload = () => {
	const [tracks, setTracks] = useState<UploadTrackFormInput[]>([]);
	const [uploadErrors, setUploadErrors] = useState<string[]>([]);
	const [uploadMultipleTracks, { loading }] = useMutation(
		UPLOAD_MULTIPLE_TRACKS,
		{
			refetchQueries: [{ query: GET_USER_TRACKS }, { query: GET_ALL_TRACKS }],
		},
	);

	const handleFilesChange = (e: ChangeEvent<HTMLInputElement>) => {
		if (!e.target.files || e.target.files.length === 0) return;

		const fileList = Array.from(e.target.files);
		const newTracks = fileList.map((file) => {
			const fileName = file.name;
			const fileNameWithoutExtension = fileName
				.split(".")
				.slice(0, -1)
				.join(".");

			return {
				title: fileNameWithoutExtension,
				description: "",
				file: file,
			};
		});

		setTracks(newTracks);
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
				// Reset the file input
				const fileInput = document.getElementById(
					"multi-track-file-input",
				) as HTMLInputElement;
				if (fileInput) fileInput.value = "";
			}
		} catch (err) {
			setUploadErrors([err instanceof Error ? err.message : String(err)]);
		}
	};

	return (
		<form onSubmit={handleSubmit}>
			{uploadErrors.length > 0 && <ErrorBox text={uploadErrors.join("\n")} />}

			<div>
				<h3>Select Audio Files</h3>
				<input
					id="multi-track-file-input"
					name="files"
					type="file"
					multiple
					style={{ fontSize: "11px" }}
					accept="audio/*"
					onChange={handleFilesChange}
					required
				/>
			</div>

			{tracks.length > 0 && (
				<div style={{ marginTop: "20px" }}>
					<h3>Track Details</h3>

					{tracks.map((track, index) => (
						<div
							key={`${track.title}_${index}`}
							style={{
								marginBottom: "20px",
								padding: "15px",
								border: "1px solid #ccc",
								borderRadius: "5px",
							}}
						>
							<div
								style={{
									fontWeight: "bold",
									marginBottom: "10px",
								}}
							>
								File: {track.file?.name}
							</div>

							<TextInput
								label="title*"
								type="text"
								value={track.title}
								onChange={(e: ChangeEvent<HTMLInputElement>) =>
									handleInputChange(index, "title", e.target.value)
								}
								required
							/>

							<TextInput
								label="description"
								type="textarea"
								value={track.description}
								onChange={(e: ChangeEvent<HTMLInputElement>) =>
									handleInputChange(index, "description", e.target.value)
								}
							/>
						</div>
					))}
				</div>
			)}

			{tracks.length > 0 && (
				<Button
					size="large"
					type="submit"
					disabled={loading || tracks.some((track) => !track.title.trim())}
				>
					{loading ? (
						<ProgressIndicator />
					) : (
						`Upload ${tracks.length} ${tracks.length === 1 ? "Track" : "Tracks"}`
					)}
				</Button>
			)}
		</form>
	);
};

export default TrackMultiUpload;

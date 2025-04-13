import { UPLOAD_TRACK } from "@/apollo/queries/trackQueries";
import { useMutation } from "@apollo/client";
import { type ChangeEvent, type FormEvent, useState } from "react";

const TrackUpload = () => {
	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [file, setFile] = useState<File | null>(null);

	const [uploadTrack, { loading, error }] = useMutation(UPLOAD_TRACK);

	const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
		if (!e.target.files) return;
		const selectedFile = e.target.files[0];
		setFile(selectedFile);
	};

	const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		if (!file) {
			alert("Please select an audio file");
			return;
		}

		try {
			const { data } = await uploadTrack({
				variables: {
					title,
					description,
					file,
				},
			});

			console.log("Track uploaded:", data.uploadTrack.track);
			// Reset form or redirect
		} catch (err) {
			console.error("Upload error:", err);
		}
	};

	return (
		<form onSubmit={handleSubmit}>
			<h2>Upload New Track</h2>
			<div>
				<label htmlFor="title">Title:</label>
				<input
					name="title"
					type="text"
					value={title}
					onChange={(e) => setTitle(e.target.value)}
					required
				/>
			</div>

			<div>
				<label htmlFor="desc">Description:</label>
				<textarea
					name="desc"
					value={description}
					onChange={(e) => setDescription(e.target.value)}
				/>
			</div>

			<div>
				<label htmlFor="file">Audio File:</label>
				<input
					name="file"
					type="file"
					accept="audio/*"
					onChange={handleFileChange}
					required
				/>
			</div>

			<button type="submit" disabled={loading}>
				{loading ? "Uploading..." : "Upload Track"}
			</button>

			{error && <p>Error: {error.message}</p>}
		</form>
	);
};

export default TrackUpload;

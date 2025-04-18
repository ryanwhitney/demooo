import { UPLOAD_TRACK } from "@/apollo/mutations/trackMutations";
import Button from "@/components/button/Button";
import ErrorBox from "@/components/errorBox/ErrorBox";
import ProgressIndicator from "@/components/progressIndicator/ProgressIndicator";
import TextInput from "@/components/textInput/TextInput";
import type { UploadTrackFormInput } from "@/types/track";
import { useMutation } from "@apollo/client";
import { type ChangeEvent, type FormEvent, useState } from "react";

const TrackUpload = () => {
	const [formData, setFormData] = useState<UploadTrackFormInput>({
		title: "",
		description: "",
		file: null,
	});

	const [uploadTrack, { loading, error }] = useMutation(UPLOAD_TRACK, {
		refetchQueries: ["GetAllTracks"],
	});

	const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
		if (!e.target.files) return;
		const selectedFile = e.target.files[0];
		const selectedFileName = selectedFile.name;
		const fileNameWithoutExtension = selectedFileName
			.split(".")
			.slice(0, -1)
			.join(".");
		setFormData({
			...formData,
			title: formData.title || fileNameWithoutExtension,
			file: selectedFile,
		});
	};

	const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		if (!formData.file) {
			alert("Please select an audio file");
			return;
		}

		try {
			const { data } = await uploadTrack({
				variables: {
					title: formData.title,
					description: formData.description,
					file: formData.file,
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
			{error && <ErrorBox text={error.message} />}

			<input
				name="file"
				type="file"
				style={{ fontSize: "11px" }}
				accept="audio/*"
				onChange={handleFileChange}
				required
			/>
			<br />
			<br />
			<TextInput
				label="title*"
				type="text"
				// placeholder=""
				value={formData.title}
				onChange={(e) => setFormData({ ...formData, title: e.target.value })}
				required
			/>
			<TextInput
				label="description"
				type="textarea"
				value={formData.description}
				onChange={(e) =>
					setFormData({ ...formData, description: e.target.value })
				}
			/>
			<br />
			<Button
				size="large"
				type="submit"
				disabled={loading || !formData.file || !formData.title}
			>
				{loading ? <ProgressIndicator /> : "Upload"}
			</Button>
		</form>
	);
};

export default TrackUpload;

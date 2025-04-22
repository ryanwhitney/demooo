import {
	GET_ALL_TRACKS,
	GET_TRACK_TITLES,
	GET_USER_TRACKS,
} from "@/apollo/queries/trackQueries";
import { UPLOAD_TRACK } from "@/apollo/mutations/trackMutations";
import { useAuth } from "@/hooks/useAuth";

import ProgressIndicator from "@/components/progressIndicator/ProgressIndicator";
import { useMutation, useQuery } from "@apollo/client";
import { useEffect, useState, type FormEvent } from "react";
import { Button } from "react-aria-components";
import * as style from "./UploadTracks.css";
import { Link } from "react-router";

// Import the new components
import AudioDropzone from "@/features/upload/audioDropzone/AudioDropzone";
import TrackList from "@/features/upload/uploadTrackList/UploadTrackList";
import type { AudioFile } from "@/features/upload/audioDropzone/AudioDropzone";
import type { TrackFile } from "@/features/upload/uploadTrackList/UploadTrackList";

// Interface for track data from the API
interface UserTrack {
	id: string;
	title: string;
}

const UploadTracks = () => {
	const [tracks, setTracks] = useState<TrackFile[]>([]);
	const [errorMessage, setErrorMessage] = useState<string>("");
	const [isSubmitted, setIsSubmitted] = useState(false);
	const [isDropZoneMinimized, setIsDropZoneMinimized] = useState(false);
	const [isUploading, setIsUploading] = useState(false);

	// Use auth context to get current user instead of making an additional query
	const { user } = useAuth();
	const username = user?.username || "";

	// Fetch track titles for validation
	const { data: trackTitlesData } = useQuery(GET_TRACK_TITLES, {
		variables: { username },
		skip: !username,
		fetchPolicy: "cache-and-network",
	});

	const [uploadTrack] = useMutation(UPLOAD_TRACK, {
		refetchQueries: [{ query: GET_USER_TRACKS }, { query: GET_ALL_TRACKS }],
	});

	const handleFilesAdded = (audioFiles: AudioFile[]) => {
		setTracks((prev) => [
			...prev,
			...audioFiles.map((file) => ({
				...file,
				status: "pending" as const,
			})),
		]);
	};

	const handleInputChange = (index: number, field: "title", value: string) => {
		const updatedTracks = [...tracks];
		updatedTracks[index] = {
			...updatedTracks[index],
			[field]: value,
		};
		setTracks(updatedTracks);
	};

	const uploadNextTrack = async (
		trackIndex: number,
		allTracks: TrackFile[],
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
			await uploadTrack({
				variables: {
					file: currentTrack.file,
					title: currentTrack.title,
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

	const validateTrackTitles = () => {
		if (!trackTitlesData?.userTracks) return false;

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
			return false;
		}

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
		validateTrackTitles(); // Re-validate titles after removal
	};

	const resetForm = () => {
		setTracks([]);
		setErrorMessage("");
		setIsSubmitted(false);
		setIsUploading(false);
	};

	useEffect(() => {
		if (tracks.length > 0) {
			setIsDropZoneMinimized(true);
		} else {
			setErrorMessage("");
			setIsDropZoneMinimized(false);
		}
	}, [tracks]);

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
					Demos, experiments, sketches, etc. Just share it.
				</p>
			</header>
			<form onSubmit={handleSubmit}>
				<div>
					{(!isSubmitted || tracks.length === 0) && (
						<AudioDropzone
							onFilesAdded={handleFilesAdded}
							isMinimized={isDropZoneMinimized}
						/>
					)}

					<div className={style.fileList({ isShown: tracks.length > 0 })}>
						{tracks.length > 0 && (
							<>
								<TrackList
									tracks={tracks}
									onTrackChange={handleInputChange}
									onTrackRemove={removeTrack}
									isSubmitted={isSubmitted}
									errorMessage={errorMessage}
								/>

								{isSubmitted && haveSuccessfulUploads ? (
									<div>
										<Link
											to={`/${username}`}
											className={style.primaryActionButton}
										>
											Go to your profile &rarr;
										</Link>
										<Button
											type="button"
											onClick={resetForm}
											className={style.actionButton}
										>
											Upload more tracks
										</Button>
									</div>
								) : (
									<Button
										type="submit"
										className={style.primaryActionButton}
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

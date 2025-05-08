import {
	GET_ALL_TRACKS,
	GET_TRACK_TITLES,
	GET_USER_TRACKS,
} from "@/apollo/queries/trackQueries";
import { UPLOAD_TRACK } from "@/apollo/mutations/trackMutations";
import { useAuth } from "@/hooks/useAuth";
import { useMutation, useQuery } from "@apollo/client";
import { useEffect, useState, type FormEvent } from "react";
import * as style from "./UploadTracks.css";
import { Link } from "react-router";
import AudioDropzone from "@/features/upload/components/audioDropzone/AudioDropzone";
import TrackList from "@/features/upload/components/uploadTrackList/UploadTrackList";
import type { AudioFile } from "@/features/upload/components/audioDropzone/AudioDropzone";
import type { TrackFile } from "@/features/upload/types/uploadTypes";
import Button from "@/components/button/Button";
import { buttonStyles } from "@/components/button/Button.css";
import { UploadStatus, TrackStatus } from "../../types/uploadTypes";

const UploadTracks = () => {
	const [tracks, setTracks] = useState<TrackFile[]>([]);
	const [errorMessage, setErrorMessage] = useState<string>("");
	const [isDropZoneMinimized, setIsDropZoneMinimized] = useState(false);
	const [uploadStatus, setUploadStatus] = useState<UploadStatus>(
		UploadStatus.NOT_STARTED,
	);

	const { user } = useAuth();
	const username = user?.username || "";

	// Fetch track titles for validation
	const { data: trackTitlesData } = useQuery(GET_TRACK_TITLES, {
		variables: { username },
		skip: !username,
		fetchPolicy: "cache-and-network",
	});

	const [uploadTrack] = useMutation(UPLOAD_TRACK, {
		refetchQueries: [
			{
				query: GET_USER_TRACKS,
				variables: { username },
			},
			{ query: GET_ALL_TRACKS },
		],
	});

	const handleFilesAdded = (audioFiles: AudioFile[]) => {
		setTracks((prev) => [
			...prev,
			...audioFiles.map((file) => ({
				...file,
				status: TrackStatus.PENDING,
			})),
		]);
	};

	const getValidationErrorMessage = (
		tracksToValidate: TrackFile[],
		errorCount: number,
	) => {
		if (errorCount === 0) return "";
		return tracksToValidate.length === 1
			? "You already have a track with this title."
			: errorCount === 1
				? "One track needs a unique title."
				: `${errorCount} tracks need unique titles.`;
	};

	const updateTrackValidationState = (
		tracksToUpdate: TrackFile[],
		tracksWithErrors: number[],
		duplicateTitlesInBatch: Set<string>,
	) => {
		setTracks((prev) =>
			prev.map((track, idx) => ({
				...track,
				hasValidationError: tracksWithErrors.includes(idx),
				errorMessage: tracksWithErrors.includes(idx)
					? duplicateTitlesInBatch.has(track.title)
						? "Duplicate title"
						: "Title already exists"
					: undefined,
			})),
		);
	};

	const validateTracks = (tracksToValidate: TrackFile[]) => {
		if (!trackTitlesData?.userTracks)
			return {
				isValid: true,
				tracksWithErrors: [],
				duplicateTitlesInBatch: new Set<string>(),
			};

		const userTrackTitles = trackTitlesData.userTracks.map(
			(track: { title: string }) => track.title.toLowerCase().trim(),
		);

		const titlesInBatch = new Set<string>();
		const tracksWithErrors: number[] = [];
		const duplicateTitlesInBatch = new Set<string>();

		// Check for duplicates within the batch
		tracksToValidate.forEach((track, idx) => {
			const normalizedTitle = track.title.toLowerCase().trim();
			if (normalizedTitle && titlesInBatch.has(normalizedTitle)) {
				duplicateTitlesInBatch.add(track.title);
				tracksWithErrors.push(idx);
			} else {
				titlesInBatch.add(normalizedTitle);
			}
		});

		// Check against existing tracks
		tracksToValidate.forEach((track, idx) => {
			const normalizedTitle = track.title.toLowerCase().trim();
			if (
				normalizedTitle &&
				!tracksWithErrors.includes(idx) &&
				userTrackTitles.includes(normalizedTitle)
			) {
				tracksWithErrors.push(idx);
			}
		});

		setErrorMessage(
			getValidationErrorMessage(tracksToValidate, tracksWithErrors.length),
		);

		return {
			isValid: tracksWithErrors.length === 0,
			tracksWithErrors,
			duplicateTitlesInBatch,
		};
	};

	const handleInputChange = (index: number, field: "title", value: string) => {
		const updatedTracks = [...tracks];
		updatedTracks[index] = {
			...updatedTracks[index],
			[field]: value,
		};
		setTracks(updatedTracks);

		// Validate titles in real-time
		if (field === "title") {
			const { tracksWithErrors, duplicateTitlesInBatch } =
				validateTracks(updatedTracks);
			updateTrackValidationState(
				updatedTracks,
				tracksWithErrors,
				duplicateTitlesInBatch,
			);
		}
	};

	const validateTrackTitles = () => {
		const { isValid, tracksWithErrors, duplicateTitlesInBatch } =
			validateTracks(tracks);

		if (!isValid) {
			updateTrackValidationState(
				tracks,
				tracksWithErrors,
				duplicateTitlesInBatch,
			);
			return false;
		}

		return true;
	};

	const uploadNextTrack = async (
		trackIndex: number,
		allTracks: TrackFile[],
	) => {
		if (trackIndex >= allTracks.length) {
			// All uploads complete
			const hasErrors = allTracks.some(
				(track) => track.status === TrackStatus.ERROR,
			);
			setUploadStatus(
				hasErrors
					? UploadStatus.COMPLETE_WITH_ERRORS
					: UploadStatus.ALL_COMPLETE,
			);
			return;
		}

		const currentTrack = allTracks[trackIndex];

		// Update status to uploading
		setTracks((prevTracks) => {
			const updatedTracks = [...prevTracks];
			updatedTracks[trackIndex] = {
				...updatedTracks[trackIndex],
				status: TrackStatus.UPLOADING,
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
					status: TrackStatus.SUCCESS,
				};
				return updatedTracks;
			});
		} catch (err) {
			const errorMsg = err instanceof Error ? err.message : String(err);

			// Update track with error status
			setTracks((prevTracks) => {
				const updatedTracks = [...prevTracks];
				updatedTracks[trackIndex] = {
					...updatedTracks[trackIndex],
					status: TrackStatus.ERROR,
					errorMessage: errorMsg,
				};
				return updatedTracks;
			});
		} finally {
			uploadNextTrack(trackIndex + 1, allTracks);
		}
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

		setUploadStatus(UploadStatus.IN_PROGRESS);

		// Start uploading tracks sequentially
		const tracksToUpload = [...tracks];
		uploadNextTrack(0, tracksToUpload);
	};

	const removeTrack = (index: number) => {
		const updatedTracks = [...tracks];
		updatedTracks.splice(index, 1);
		setTracks(updatedTracks);

		// Validate using the updated tracks array
		const { isValid, tracksWithErrors, duplicateTitlesInBatch } =
			validateTracks(updatedTracks);
		updateTrackValidationState(
			updatedTracks,
			tracksWithErrors,
			duplicateTitlesInBatch,
		);
	};

	const resetForm = () => {
		setTracks([]);
		setErrorMessage("");
		setUploadStatus(UploadStatus.NOT_STARTED);
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
		if (
			uploadStatus !== UploadStatus.NOT_STARTED &&
			uploadStatus !== UploadStatus.IN_PROGRESS
		) {
			const errorTracks = tracks.filter(
				(track) => track.status === TrackStatus.ERROR,
			);
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
	}, [uploadStatus, tracks]);

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
					<AudioDropzone
						onFilesAdded={handleFilesAdded}
						isMinimized={isDropZoneMinimized}
						isDisabled={uploadStatus === UploadStatus.IN_PROGRESS}
					/>

					<div className={style.fileList({ isShown: tracks.length > 0 })}>
						{tracks.length > 0 && (
							<>
								<TrackList
									tracks={tracks}
									onTrackChange={handleInputChange}
									onTrackRemove={removeTrack}
									uploadStatus={uploadStatus}
									errorMessage={errorMessage}
								/>

								{uploadStatus === UploadStatus.ALL_COMPLETE ||
								uploadStatus === UploadStatus.COMPLETE_WITH_ERRORS ? (
									<div>
										<Link
											to={`/${username}`}
											className={`${buttonStyles({
												variant: "primary",
											})} ${style.uploadCtaButton}`}
										>
											Go to your profile &rarr;
										</Link>
										<Button
											type="button"
											className={style.uploadCtaButton}
											variant="secondary"
											onClick={resetForm}
										>
											Upload more
										</Button>
									</div>
								) : (
									<Button
										type="submit"
										className={style.uploadCtaButton}
										variant="primary"
										disabled={
											uploadStatus === UploadStatus.IN_PROGRESS ||
											tracks.length === 0 ||
											tracks.some((track) => !track.title.trim())
										}
									>
										Uploaaad
										{tracks.length > 1 ? ` ${tracks.length} Tracks` : ""}
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

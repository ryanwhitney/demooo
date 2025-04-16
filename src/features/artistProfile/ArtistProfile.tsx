import { useQuery } from "@apollo/client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { GET_ARTIST } from "@/apollo/queries/userQueries";
import type { Track } from "@/types/track";
import { artistTrackViewInfo, artistViewWrapper } from "./ArtistProfile.css";
import ProgressIndicator from "@/components/progressIndicator/ProgressIndicator";
import { tokens } from "@/styles/tokens";
import { formatTime } from "@/utils/formatTime";
import { useAudio } from "@/providers/AudioProvider";
import IconToggleButton from "@/components/IconToggleButton/IconToggleButton";

const HeartSVG = () => (
	<svg width="12" height="11" viewBox="0 0 12 11" fill="none">
		<title>heart</title>
		<path
			d="M1.11562 6.48794L5.35078 10.7262C5.52656 10.902 5.75859 11 6 11C6.24141 11 6.47344 10.902 6.64922 10.7262L10.8844 6.48794C11.5969 5.77697 12 4.77959 12 3.737V3.59128C12 1.8352 10.8164 0.337879 9.20156 0.048967C8.13281 -0.141966 7.04531 0.232364 6.28125 1.05137L6 1.35284L5.71875 1.05137C4.95469 0.232364 3.86719 -0.141966 2.79844 0.048967C1.18359 0.337879 0 1.8352 0 3.59128V3.737C0 4.77959 0.403125 5.77697 1.11562 6.48794Z"
			fill="currentColor"
		/>
	</svg>
);

const PlaySVG = () => (
	<svg width="10" height="11" viewBox="0 0 10 11" fill="none">
		<title>play</title>
		<path
			d="M0 10.044V0.955952C0 0.628571 0.0826077 0.388492 0.247823 0.235714C0.413039 0.0785714 0.609511 0 0.83724 0C1.03818 0 1.24358 0.056746 1.45345 0.170238L9.25653 4.62917C9.53338 4.78631 9.72538 4.92817 9.83255 5.05476C9.94418 5.17698 10 5.3254 10 5.5C10 5.67024 9.94418 5.81865 9.83255 5.94524C9.72538 6.07183 9.53338 6.21369 9.25653 6.37083L1.45345 10.8298C1.24358 10.9433 1.03818 11 0.83724 11C0.609511 11 0.413039 10.9214 0.247823 10.7643C0.0826077 10.6071 0 10.3671 0 10.044Z"
			fill="currentColor"
		/>
	</svg>
);
const PauseSVG = () => (
	<div style={{ marginLeft: -2 }}>
		<svg width="9" height="11" viewBox="0 0 9 11" fill="none">
			<title>pause</title>
			<path
				d="M1.46289 10.6665C1.18359 10.6665 0.972005 10.5946 0.828125 10.4507C0.688477 10.3068 0.618652 10.0952 0.618652 9.81592V1.01172C0.618652 0.732422 0.688477 0.522949 0.828125 0.383301C0.972005 0.239421 1.18359 0.16748 1.46289 0.16748H2.91016C3.18522 0.16748 3.39469 0.235189 3.53857 0.370605C3.68245 0.506022 3.75439 0.719727 3.75439 1.01172V9.81592C3.75439 10.0952 3.68245 10.3068 3.53857 10.4507C3.39469 10.5946 3.18522 10.6665 2.91016 10.6665H1.46289ZM6.07764 10.6665C5.79834 10.6665 5.58675 10.5946 5.44287 10.4507C5.29899 10.3068 5.22705 10.0952 5.22705 9.81592V1.01172C5.22705 0.732422 5.29899 0.522949 5.44287 0.383301C5.58675 0.239421 5.79834 0.16748 6.07764 0.16748H7.51855C7.79785 0.16748 8.00732 0.235189 8.14697 0.370605C8.29085 0.506022 8.36279 0.719727 8.36279 1.01172V9.81592C8.36279 10.0952 8.29085 10.3068 8.14697 10.4507C8.00732 10.5946 7.79785 10.6665 7.51855 10.6665H6.07764Z"
				fill="currentColor"
			/>
		</svg>
	</div>
);

const TrackRow = ({ track }: { track: Track }) => {
	const audio = useAudio();
	const [isFavorite, setIsFavorite] = useState(false);
	// Only subscribe to the state we need
	const isCurrentTrack = useMemo(() => {
		return (
			audio.currentTrack?.id === track.id && audio.activeSource === "global"
		);
	}, [audio.currentTrack?.id, audio.activeSource, track.id]);

	const isPlaying = isCurrentTrack && audio.isPlaying;

	const handleClick = useCallback(() => {
		if (isCurrentTrack) {
			if (isPlaying) {
				audio.pauseTrack();
			} else {
				audio.resumeTrack();
			}
		} else {
			audio.playTrack(track, "global");
		}
	}, [audio, isCurrentTrack, isPlaying, track]);

	return (
		<div
			key={track.id}
			style={{
				display: "flex",
				padding: "10px 0",
				justifyContent: "space-between",
				fontSize: 11,
			}}
		>
			<div
				className="leftcontent"
				style={{
					display: "flex",
					gap: 8,
					paddingLeft: 16,
				}}
			>
				<p style={{ color: "white" }}>{track.title}</p>
				<p>{formatTime(track.audioLength)}</p>
			</div>
			<div
				style={{
					display: "flex",
					justifyContent: "center",
					gap: 16,
					paddingRight: 16,
				}}
			>
				<IconToggleButton
					iconOne={<HeartSVG />}
					iconOneTitle="Add to favorites"
					iconTwo={<HeartSVG />}
					iconTwoTitle="Remove from favorites"
					onToggle={() => setIsFavorite(!isFavorite)}
					style={{
						color: isFavorite
							? tokens.colors.heartRed
							: tokens.colors.quaternary,
						padding: 10,
						width: 16,
						height: 16,
						filter: isFavorite
							? `drop-shadow(0px 0px 10px ${tokens.colors.heartRed})`
							: "",
						transition: "filter 400ms ease-in-out",
					}}
				/>
				<IconToggleButton
					iconOne={<PlaySVG />}
					iconOneTitle="Play"
					iconTwo={<PauseSVG />}
					iconTwoTitle="Pause"
					defaultToggled={isPlaying && isCurrentTrack}
					onToggle={handleClick}
					style={{
						padding: 10,
						width: 16,
						height: 16,
					}}
				/>
			</div>
		</div>
	);
};

const TracksGroupedByDate = ({ tracks }: { tracks: Track[] }) => {
	// Group tracks by year and month
	const groupedTracks: Record<string, Record<string, Track[]>> = {};

	if (tracks) {
		for (const track of tracks) {
			const date = new Date(track.createdAt);
			const year = date.getFullYear().toString();
			const month = date.toLocaleString("default", { month: "long" });

			if (!groupedTracks[year]) {
				groupedTracks[year] = {};
			}

			if (!groupedTracks[year][month]) {
				groupedTracks[year][month] = [];
			}

			groupedTracks[year][month].push(track);
		}
	}

	// Sort years in descending order (newest first)
	const sortedYears = Object.keys(groupedTracks).sort(
		(a, b) => Number.parseInt(b) - Number.parseInt(a),
	);

	// Month order for sorting
	const monthOrder: string[] = [
		"January",
		"February",
		"March",
		"April",
		"May",
		"June",
		"July",
		"August",
		"September",
		"October",
		"November",
		"December",
	];

	return (
		<div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
			{sortedYears.map((year) => (
				<div key={`${year}_countainer`} style={{ display: "flex" }}>
					<div
						style={{
							width: 0,
							overflow: "visible",
							position: "relative",
							left: "-52px",
						}}
					>
						<h2
							key={`${year}_h2`}
							style={{
								fontSize: 10,
								color: tokens.colors.tertiary,
								fontWeight: 300,
								width: "fit-content",
							}}
						>
							{year}
						</h2>
					</div>
					<div
						key={year}
						style={{ display: "flex", gap: 16, flexDirection: "column" }}
					>
						{Object.keys(groupedTracks[year])
							.sort((a, b) => monthOrder.indexOf(a) - monthOrder.indexOf(b))
							.map((month) => (
								<div key={`${year}-${month}`}>
									<h3
										style={{
											fontSize: 10,
											color: tokens.colors.secondary,
											fontWeight: 300,
											paddingLeft: 16,
											paddingBottom: 8,
										}}
									>
										{month}
									</h3>
									<section
										className="month"
										style={{
											background: tokens.colors.tertiaryDark,
											borderRadius: tokens.radii.lg,
											width: 400,
											padding: "2px 0",
										}}
									>
										{groupedTracks[year][month].map((track, index) => (
											<>
												<TrackRow key={`${track.id}-${index}`} track={track} />
												{index !== groupedTracks[year][month].length - 1 && (
													<div
														style={{
															height: 1,
															background: tokens.colors.quaternaryDark,
															marginLeft: 16,
														}}
													/>
												)}
											</>
										))}
									</section>
								</div>
							))}
					</div>
				</div>
			))}
		</div>
	);
};

const ArtistProfile = ({ artistName }: { artistName: string }) => {
	const [tracks, setTracks] = useState<[Track] | null>(null);

	const { data, loading, error, refetch } = useQuery(GET_ARTIST, {
		variables: { username: artistName },
		onCompleted: (data) => {
			setTracks(data.user.tracks);
		},
	});

	useEffect(() => {
		refetch();
	}, [refetch]);

	return (
		<>
			{loading ? (
				<ProgressIndicator />
			) : error ? (
				error.message
			) : data.user === null ? (
				<p>Artist not found</p>
			) : (
				<div className={artistViewWrapper}>
					<img
						src="https://f4.bcbits.com/img/0035425273_10.jpg"
						width={200}
						height={200}
						style={{ borderRadius: tokens.radii.md }}
						alt="buga"
					/>
					<title>Music | {data.user.username}</title>
					<h2>{data.user.username}</h2>
					<div className={artistTrackViewInfo}>
						{tracks && <TracksGroupedByDate tracks={tracks} />}
					</div>
				</div>
			)}
		</>
	);
};

export default ArtistProfile;

import { useCallback, useMemo, useState } from "react";
import type { Track } from "@/types/track";
import { formatTime, monthOrder } from "@/utils/timeAndDate";
import { useAudio } from "@/providers/AudioProvider";
import IconToggleButton from "@/components/IconToggleButton/IconToggleButton";
import HeartSVG from "@/components/svg/HeartSVG";
import PlaySVG from "@/components/svg/PlaySVG";
import PauseSVG from "@/components/svg/PauseSVG";
import * as style from "./TrackList.css";
import { Link } from "react-router";

const TrackRow = ({
	track,
	allTracksInList,
}: { track: Track; allTracksInList: Track[] }) => {
	const [isFavorite, setIsFavorite] = useState(false);

	const audio = useAudio();

	// subscribe to the states we need
	const isCurrentTrack = useMemo(() => {
		return (
			audio.currentTrack?.id === track.id &&
			(audio.activeSource === "global" || audio.activeSource === "artist-view")
		);
	}, [audio.currentTrack?.id, audio.activeSource, track.id]);

	const isPlaying = isCurrentTrack && audio.isPlaying;

	const handlePlayToggle = useCallback(() => {
		if (isCurrentTrack) {
			if (isPlaying) {
				audio.pauseTrack();
			} else {
				audio.resumeTrack();
			}
		} else {
			// Play track in queue, starting from this track in the list
			audio.playTrackInQueue(track, allTracksInList, "global");
		}
	}, [audio, isCurrentTrack, isPlaying, track, allTracksInList]);

	return (
		<div key={track.id} className={style.trackRowWrapper}>
			<div className={style.trackLeftContent}>
				<Link
					className={style.trackRowTitleLinkWrapper}
					to={`/${track.artist.username}/track/${track.titleSlug}`}
				>
					<h4
						className={`${style.trackRowTitle({ isActive: isPlaying && isCurrentTrack })}`}
					>
						{track.title}
					</h4>
				</Link>
				<p>{formatTime(track.audioLength)}</p>
			</div>
			<div className={style.trackRightContent}>
				<IconToggleButton
					iconOne={<HeartSVG />}
					iconOneTitle="Add to favorites"
					iconTwo={<HeartSVG />}
					iconTwoTitle="Remove from favorites"
					onToggle={() => setIsFavorite(!isFavorite)}
					className={`${style.favoriteIconToggle({ isActive: isFavorite })}`}
				/>
				<IconToggleButton
					iconOne={<PlaySVG />}
					iconOneTitle="Play"
					iconTwo={<PauseSVG />}
					iconTwoTitle="Pause"
					defaultToggled={isPlaying && isCurrentTrack}
					onToggle={handlePlayToggle}
					className={`${style.playIconToggle({ isActive: isPlaying && isCurrentTrack })}`}
				/>
			</div>
		</div>
	);
};

const TrackList = ({ tracks }: { tracks: Track[] }) => {
	// Extract all tracks in a flat list for queueing
	const allTracks = useMemo(() => tracks || [], [tracks]);

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

	const sortedYears = Object.keys(groupedTracks).sort(
		(a, b) => Number.parseInt(b) - Number.parseInt(a),
	);

	return (
		<div className={style.allYearsWrapper}>
			{sortedYears.map((year) => (
				<div key={`${year}_countainer`}>
					<div className={style.yearWrapper}>
						<h2 key={`${year}_h2`} className={style.yearHeading}>
							{year}
						</h2>
					</div>
					<div key={year} className={style.allMonthsWrapper}>
						{Object.keys(groupedTracks[year])
							.sort((a, b) => monthOrder.indexOf(a) - monthOrder.indexOf(b))
							.map((month) => (
								<div key={`${year}-${month}`}>
									<h3 className={style.monthHeading}>{month}</h3>
									<section className={style.monthWrapper}>
										{groupedTracks[year][month].map((track, index) => (
											<>
												<TrackRow
													key={`${track.id}-${index}`}
													track={track}
													allTracksInList={allTracks}
												/>
												<hr
													key={`${track.id}-${index}-divider`}
													className={style.trackDivider}
												/>
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

export default TrackList;

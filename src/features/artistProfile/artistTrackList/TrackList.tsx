import { useCallback, useMemo } from "react";
import type { Track } from "@/types/track";
import { formatTime, monthOrder } from "@/utils/timeAndDate";
import { useAudio } from "@/providers/AudioProvider";
import { useAuth } from "@/hooks/useAuth";
import { useModal } from "@/hooks/useModal";
import { ModalType } from "@/types/modal";
import IconToggleButton from "@/components/IconToggleButton/IconToggleButton";
import HeartSVG from "@/components/svg/HeartSVG";
import PlaySVG from "@/components/svg/PlaySVG";
import PauseSVG from "@/components/svg/PauseSVG";
import * as style from "./TrackList.css";
import { Link } from "react-router";
import { useFavorite } from "@/hooks/useFavorite";
import { GridList, GridListItem } from "react-aria-components";

const TrackRow = ({
	track,
	allTracksInList,
}: { track: Track; allTracksInList: Track[] }) => {
	const audio = useAudio();
	const { isAuthenticated } = useAuth();
	const { openModal } = useModal();
	const {
		isFavorited,
		// loading: loadingFavorite,
		toggleFavorite,
		favoritesCount = track.favoritesCount || 0,
	} = useFavorite(track.id);

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
			audio.playTrackInQueue(track, allTracksInList, "artist-view");
		}
	}, [audio, isCurrentTrack, isPlaying, track, allTracksInList]);

	const handleFavoriteToggle = useCallback(() => {
		if (!isAuthenticated) {
			openModal(ModalType.AUTH, {
				authRedirect: {
					login: false,
					message: "Sign up to share the love and favorite tracks",
					actionText: "Sign up to favorite",
				},
				onSuccess: toggleFavorite,
			});
			return;
		}
		toggleFavorite();
	}, [isAuthenticated, openModal, toggleFavorite]);

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
				<div className={style.favoriteCountWrapper}>
					<IconToggleButton
						iconOne={<HeartSVG />}
						iconOneTitle="Add to favorites"
						iconTwo={<HeartSVG />}
						iconTwoTitle="Remove from favorites"
						defaultToggled={isFavorited}
						onToggle={handleFavoriteToggle}
						className={`${style.favoriteIconToggle({ isActive: isFavorited })}`}
					/>
					<span className={style.favoriteCount({ isActive: isFavorited })}>
						{favoritesCount > 0 ? favoritesCount : ""}
					</span>
				</div>
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
				<section key={`${year}_container`}>
					<header className={style.yearWrapper}>
						<h2 id={`year-${year}`} className={style.yearHeading}>
							{year}
						</h2>
					</header>

					<ul className={style.allMonthsWrapper}>
						{Object.keys(groupedTracks[year])
							.sort((a, b) => monthOrder.indexOf(b) - monthOrder.indexOf(a))
							.map((month) => (
								<li key={`${year}-${month}`} style={{ width: "100%" }}>
									<h3
										id={`year-${year}-month-${month}`}
										className={style.monthHeading}
									>
										{month}
									</h3>
									<GridList
										aria-labelledby={`year-${year}-month-${month}`}
										className={style.monthWrapper}
									>
										{groupedTracks[year][month].map((track, index) => (
											<GridListItem
												textValue={track.title}
												key={`${track.id}-${index}`}
											>
												<TrackRow track={track} allTracksInList={allTracks} />
												{index < groupedTracks[year][month].length - 1 && (
													<hr className={style.trackDivider} />
												)}
											</GridListItem>
										))}
									</GridList>
								</li>
							))}
					</ul>
				</section>
			))}
		</div>
	);
};

export default TrackList;

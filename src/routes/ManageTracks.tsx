import { GET_ARTIST } from "@/apollo/queries/userQueries";
import { useAuth } from "@/hooks/useAuth";
import type { Track } from "@/types/track";
import { useQuery } from "@apollo/client";
import { GridList, GridListItem } from "react-aria-components";
import { Link } from "react-router";
import * as styles from "./ManageTracks.css";
import { formatTime } from "@/utils/timeAndDate";

const ManageTracks = () => {
	const { user } = useAuth();

	// Only run the query if we have a user
	const { data, loading, error } = useQuery(GET_ARTIST, {
		variables: { username: user?.username || "" },
		skip: !user?.username,
		fetchPolicy: "cache-first",
	});

	// Derived state from query data
	const artist = data?.user || null;
	const tracks = data?.user?.tracks || [];

	// Handle loading and error states
	if (loading) return <div>Loading tracks...</div>;
	if (error) return <div>Error loading tracks: {error.message}</div>;

	return (
		<div className={styles.container}>
			{artist ? (
				<>
					<h2 className={styles.pageHeading}>{artist.username}'s Tracks</h2>
					{tracks.length === 0 ? (
						<div className={styles.emptyStateContainer}>
							<p>You haven't uploaded anything yet</p>
							<Link to="/upload" className={styles.uploadLink}>
								do that now
							</Link>
						</div>
					) : (
						<GridList aria-label="Tracks List" className={styles.tracksList}>
							{tracks.map((track: Track) => (
								<GridListItem
									key={track.id}
									/* Add textValue to support type-to-select accessibility feature */
									textValue={track.title}
									className={styles.trackItem}
								>
									<div className={styles.trackTitle}>{track.title}</div>
									<span className={styles.trackDuration}>
										{formatTime(track.audioLength)}{" "}
									</span>
									<span className={styles.trackDate}>
										{new Date(track.createdAt).toLocaleDateString()}
									</span>
									<div>
										<div className={styles.selectsContainer}>
											{/* Month dropdown */}
											<div className={styles.selectWrapper}>
												<label
													htmlFor={`${track.id}_month_select`}
													className={styles.visuallyHidden}
												>
													month
												</label>
												<select
													id={`${track.id}_month_select`}
													/* Ensure value is a number and convert to string */
													value={String(new Date(track.recordedAt).getMonth())}
													onChange={(e) => {
														console.log(e.target.value);
													}}
													className={styles.selectField}
												>
													{Array.from({ length: 12 }, (_, i) => (
														<option
															key={`${track.id}_${i}_month`}
															value={String(i)}
														>
															{new Date(2023, i, 1).toLocaleString("default", {
																month: "short",
															})}
														</option>
													))}
												</select>
											</div>
											<div className={styles.selectWrapper}>
												<label
													htmlFor={`${track.id}_year_select`}
													className={styles.visuallyHidden}
												>
													year
												</label>
												<select
													id={`${track.id}_year_select`}
													/* Ensure value is a number and convert to string */
													value={String(
														new Date(track.recordedAt).getFullYear(),
													)}
													onChange={(e) => {
														console.log(e.target.value);
													}}
													className={styles.selectField}
												>
													{Array.from({ length: 100 }, (_, i) => {
														const year = new Date().getFullYear() - i;
														return (
															<option
																key={`${track.id}_year_${year}`}
																value={String(year)}
															>
																{year}
															</option>
														);
													})}
												</select>
											</div>
										</div>
									</div>
									<button type="button">•••</button>
								</GridListItem>
							))}
						</GridList>
					)}
				</>
			) : (
				<div>No artist data found</div>
			)}
		</div>
	);
};

export default ManageTracks;

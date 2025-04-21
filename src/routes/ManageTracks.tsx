import { GET_ARTIST } from "@/apollo/queries/userQueries";
import { useAuth } from "@/hooks/useAuth";
import type { Track } from "@/types/track";
import { useQuery } from "@apollo/client";
import { GridList, GridListItem } from "react-aria-components";
import { Link } from "react-router";
import * as style from "./ManageTracks.css";
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
		<>
			{artist ? (
				<>
					<h2>{artist.username}'s Tracks</h2>
					{tracks.length === 0 ? (
						<>
							<p>You haven't uploaded anything yet</p>
							<Link to="/upload">do that now</Link>
						</>
					) : (
						<GridList>
							{tracks.map((track: Track) => (
								<GridListItem
									key={track.id}
									style={{
										display: "grid",
										gridTemplateColumns: "1fr 1fr 1fr 1fr",
										gap: "16px",
										alignItems: "center",
										padding: "12px",
										borderBottom: "1px solid #eee",
									}}
								>
									<div style={{ fontWeight: "bold" }}>
										<Link to={`/track/${track.id}`}>{track.title}</Link>
									</div>
									<span>{formatTime(track.audioLength)} </span>
									Added: {new Date(track.createdAt).toLocaleDateString()}
									<div>
										<div style={{ display: "flex", gap: "8px" }}>
											{/* Month dropdown */}
											<div
												style={{
													display: "flex",
													flexDirection: "column",
													flex: "1",
												}}
											>
												<label
													htmlFor={`${track.id}_month_select`}
													className={style.visuallyHidden}
												>
													month
												</label>
												<select
													id={`${track.id}_month_select`}
													value={new Date(track.recordedAt).getMonth()}
													style={{
														flex: "1",
														padding: "8px",
														borderRadius: "4px",
														border: "1px solid #ccc",
													}}
												>
													{Array.from({ length: 12 }, (_, i) => (
														<option key={`${track.id}_${i}_month`} value={i}>
															{new Date(2023, i, 1).toLocaleString("default", {
																month: "short",
															})}
														</option>
													))}
												</select>
											</div>
											<div
												style={{
													display: "flex",
													flexDirection: "column",
													flex: "1",
												}}
											>
												<label
													htmlFor={`${track.id}_year_select`}
													className={style.visuallyHidden}
												>
													year
												</label>
												<select
													id={`${track.id}_year_select`}
													value={new Date(track.recordedAt).getFullYear()}
													style={{
														flex: "1",
														padding: "8px",
														borderRadius: "4px",
														border: "1px solid #ccc",
													}}
												>
													{Array.from({ length: 100 }, (_, i) => {
														const year = new Date().getFullYear() - i;
														return (
															<option
																key={`${track.id}_year_${year}`}
																value={year}
															>
																{year}
															</option>
														);
													})}
												</select>
											</div>
										</div>
									</div>
								</GridListItem>
							))}
						</GridList>
					)}
				</>
			) : (
				<div>No artist data found</div>
			)}
		</>
	);
};

export default ManageTracks;

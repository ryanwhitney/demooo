import { GET_ARTIST } from "@/apollo/queries/userQueries";
import { useAuth } from "@/hooks/useAuth";
import type { Track } from "@/types/track";
import { useQuery } from "@apollo/client";
import { GridList, GridListItem } from "react-aria-components";
import { Link } from "react-router";
import * as style from "./ManageTracks.css";
import { formatTime } from "@/utils/timeAndDate";
import { tokens } from "@/styles/tokens";
import TextInput from "@/components/textInput/TextInput";
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
						<GridList aria-label="Tracks List">
							{tracks.map((track: Track) => (
								<GridListItem
									key={track.id}
									/* Add textValue to support type-to-select accessibility feature */
									textValue={track.title}
									style={{
										display: "grid",
										background: tokens.colors.backgroundSecondary,
										gridTemplateColumns: "2fr 0.5fr 1fr 1fr",
										gap: "16px",
										alignItems: "center",
										padding: "12px",
										borderBottom: `1px solid ${tokens.colors.quaternaryDark}`,
									}}
								>
									<div style={{ fontWeight: "bold" }}>{track.title}</div>
									<span
										style={{
											color: tokens.colors.secondary,
											// fontFamily: tokens.fonts.system,
											fontSize: 12,
										}}
									>
										{formatTime(track.audioLength)}{" "}
									</span>
									<span
										style={{
											color: tokens.colors.secondary,
											// fontFamily: tokens.fonts.system,
											fontSize: 12,
										}}
									>
										{new Date(track.createdAt).toLocaleDateString()}
									</span>
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
													/* Ensure value is a number and convert to string */
													value={String(new Date(track.recordedAt).getMonth())}
													onChange={(e) => {
														console.log(e.target.value);
													}}
													style={{
														padding: "8px",
														borderRadius: "4px",
														color: tokens.colors.primary,
														border: `1px solid ${tokens.colors.quaternary}`,
														background: tokens.colors.backgroundSecondary,
													}}
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
													/* Ensure value is a number and convert to string */
													value={String(
														new Date(track.recordedAt).getFullYear(),
													)}
													onChange={(e) => {
														console.log(e.target.value);
													}}
													style={{
														padding: "8px",
														borderRadius: "4px",
														color: tokens.colors.primary,
														border: `1px solid ${tokens.colors.quaternary}`,
														background: tokens.colors.backgroundSecondary,
													}}
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

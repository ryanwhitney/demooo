import type { Track } from "@/types/track";
import { Link } from "react-router";
import * as style from "./SingleTrackView.css";
import SinglePlayer from "@/features/audio/singlePlayer/SinglePlayer";

/**
 * SingleTrackView - Displays a single track with an embedded audio player
 * Takes control of audio playback when mounted
 */
function SingleTrackView({ track }: { track: Track }) {
	return (
		<main>
			<title>Music | {track.artist.username}</title>
			<div className={style.trackViewWrapper}>
				<div className={style.trackViewInfo}>
					<div>
						<h1 className={style.trackViewTitle}>{track.title}</h1>
						<p>
							by{" "}
							<Link
								to={`/${track.artist.username}`}
								className={style.trackViewArtist}
							>
								{track.artist.username}
							</Link>
						</p>
					</div>

					{/* Audio Player Container */}
					<div className={style.audioPlayerContainer}>
						<SinglePlayer track={track} source="track-view" />
					</div>

					<div className={style.trackViewDetails}>
						<p>{track.description || "no notes"}</p>
					</div>
					<div className={style.trackViewTagsWrapper} />
				</div>
			</div>
		</main>
	);
}

export default SingleTrackView;

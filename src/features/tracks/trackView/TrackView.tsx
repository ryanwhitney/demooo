import type { Track } from "@/types/track";
import { Link } from "react-router";
import {
	trackViewArtist,
	trackViewDetails,
	trackViewInfo,
	trackViewTagsWrapper,
	trackViewTitle,
	trackViewWrapper,
} from "./TrackView.css";
import SinglePlayer from "@/features/audio/singlePlayer/SinglePlayer";

function TrackView({ track }: { track: Track }) {
	return (
		<main>
			<title>Music | {track.artist.username}</title>
			<div className={trackViewWrapper}>
				<div className={trackViewInfo}>
					<div>
						<h1 className={trackViewTitle}>{track.title}</h1>
						<p>
							by{" "}
							<Link
								to={`/${track.artist.username}`}
								className={trackViewArtist}
							>
								{track.artist.username}
							</Link>
						</p>
					</div>
					<SinglePlayer track={track} />
					<div className={trackViewDetails}>
						<p>{track.description || "no notes"}</p>
					</div>
					<div className={trackViewTagsWrapper} />
				</div>
			</div>
		</main>
	);
}

export default TrackView;

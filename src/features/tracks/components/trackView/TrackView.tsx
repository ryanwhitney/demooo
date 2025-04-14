import type { Track } from "@/types/track";
import { Link } from "react-router";
import {
	trackViewArtist,
	trackViewDetails,
	trackViewInfo,
	trackViewTagsWrapper,
	trackViewTitle,
	trackViewWaveformWrapper,
	trackViewWrapper,
} from "./TrackView.css";
import AudioPlayer from "@/components/audioPlayer/components/AudioPlayer";

function TrackView({ track }: { track: Track }) {
	return (
		<main>
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
					<div className={trackViewWaveformWrapper}>
						<div className="flex items-center gap-4">
							<AudioPlayer track={track} />
						</div>
					</div>
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

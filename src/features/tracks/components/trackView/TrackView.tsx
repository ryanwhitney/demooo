import { Link } from 'react-router'
import { Track } from '@/types/track'
import {
  trackViewArtist,
  trackViewDetails,
  trackViewInfo,
  trackViewTagsWrapper,
  trackViewTitle,
  trackViewWaveformWrapper,
  trackViewWrapper,
} from './TrackView.css'

const Waveform = ({ width = 60 }: { width?: number }) => {
  const waveformBars = [
    { width: 1, height: 8, y: 10 },
    { width: 1, height: 13, y: 8 },
    { width: 1, height: 21, y: 4 },
    { width: 1, height: 29, y: 0 },
  ]

  const count = Math.floor(width / 5)

  return (
    <svg
      width={width}
      height="29"
      viewBox={`0 0 ${width} 29`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {Array.from({ length: count }).map((_, index) => {
        const waveform =
          waveformBars[Math.floor(Math.random() * waveformBars.length)]
        return (
          <rect
            key={index}
            x={index * 5} // Space by 5
            y={waveform.y}
            width={waveform.width}
            height={waveform.height}
            fill="#D9D9D9"
          />
        )
      })}
    </svg>
  )
}

function TrackView({ track }: { track: Track }) {
  return (
    <main>
      <div className={trackViewWrapper}>
        <div className={trackViewInfo}>
          <div>
            <h1 className={trackViewTitle}>{track.title}</h1>
            <p>
              by{' '}
              <Link to={`/${track.artist}`} className={trackViewArtist}>
                {track.artist}
              </Link>
            </p>
          </div>
          <div className={trackViewWaveformWrapper}>
            <Waveform width={200} />
          </div>
          <div className={trackViewDetails}>
            <p>{track.description || 'no notes'}</p>
            {/* <p>Created at: {track.createdAt.toLocaleDateString()}</p>
              <p>Recorded at: {track.recordedAt.toLocaleDateString()}</p> */}
          </div>
          <div className={trackViewTagsWrapper}></div>
        </div>
        <div>
          <img src={track.albumArt} alt={track.title} />
        </div>
      </div>
    </main>
  )
}

export default TrackView

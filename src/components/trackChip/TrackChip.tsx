import { Link } from "react-router"
import { Track } from "../../types/track"
import { trackArtist, trackChipWrapper, trackText, trackTitle, waveformWrapper } from "./TrackChip.css"

const Waveform = ({width = 60}:{width?: number} ) => {

  const waveformBars = [
    { width: 1, height: 8, y: 10 },
    { width: 1, height: 13, y: 8 },
    { width: 1, height: 21, y: 4 },
    { width: 1, height: 29, y: 0 },
  ]

   const count = Math.floor(width / 5);

   return (
     <svg width={width} height="29" viewBox={`0 0 ${width} 29`} fill="none" xmlns="http://www.w3.org/2000/svg">
       {Array.from({ length: count }).map((_, index) => {
         const waveform = waveformBars[Math.floor(Math.random() * waveformBars.length)];
         return (
           <rect
             key={index}
             x={index * 5} // Space by 5 
             y={waveform.y}
             width={waveform.width}
             height={waveform.height}
             fill="#D9D9D9"
           />
         );
       })}
     </svg>

  )
}

function TrackChip({ track }: { track: Track }) {
  
  return (
    <div className={trackChipWrapper}>
      <div className={waveformWrapper}>
        <Waveform width={55} />
      </div>
      <div className={trackText}>
        <Link to={`/${track.user.username}/track?id=${track.id}`} className={trackTitle}>{track.title}</Link>
        <Link to={`/${track.user.username}`} className={trackArtist}>{track.user.username}</Link>
      </div>
    </div>
  );
}

export default TrackChip
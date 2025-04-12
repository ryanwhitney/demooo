import NavBar from '../components/nav/NavBar'
import { tokens } from '../styles/tokens'
import { Track } from '../types/track'

const homeBanner: React.CSSProperties = ({
  fontSize: tokens.space.xxl,
  fontWeight: tokens.fontWeights.normal,
  textTransform: 'uppercase',
  display: 'flex',
  justifyContent: 'space-around',
  alignItems: 'center',
  paddingTop: 100,
  paddingBottom: 60,
});
const homeBannerText: React.CSSProperties = ({
  fontSize: tokens.fontSizes.xxl,
  fontWeight: tokens.fontWeights.normal,
  // textTransform: 'uppercase',
  // display: 'flex',
  // justifyContent: 'space-between',
  // alignItems: 'center',
});

function TrackView({track}:{track:Track}) {
  return (
    <>
      <NavBar />
      <div style={homeBanner}>
        <h1 style={homeBannerText}>{track.title}</h1>
      </div>
    </>
  )
}

export default TrackView

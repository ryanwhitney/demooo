import NavBar from '../components/nav/NavBar'
import { tokens } from '../styles/tokens'
import { useSearchParams } from 'react-router'

const homeBanner: React.CSSProperties = ({
  fontSize: tokens.space.xxl,
  fontWeight: tokens.fontWeights.normal,
  textTransform: 'uppercase',
  display: 'flex',
  justifyContent: 'space-around',
  alignItems: 'center',
  textAlign: 'center',
  paddingTop: 100,
  paddingBottom: 60,
});

const homeBannerText: React.CSSProperties = ({
  fontSize: tokens.fontSizes.xxl,
  fontWeight: tokens.fontWeights.normal,
});

function TrackView() {
  const [searchParams] = useSearchParams();
  const trackId = searchParams.get('id');

  return (
    <>
      <NavBar />
      <div style={homeBanner}>
        <h1 style={homeBannerText}>{trackId} - Track {trackId}</h1>
      </div>
    </>
  )
}

export default TrackView

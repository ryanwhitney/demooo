import { mockData } from '../apollo/mockData'
import NavBar from '../components/nav/NavBar'
import TrackChip from '../components/trackChip/TrackChip'
import TrackUpload from '../components/trackUpload/TrackUpload'
import { useAuth } from '../hooks/useAuth'
import { tokens } from '../styles/tokens'

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
  // textTransform: 'uppercase',
  // display: 'flex',
  // justifyContent: 'space-between',
  // alignItems: 'center',
});


function Home() {

  const auth = useAuth()

  return (
    <>
      <NavBar />
      <div style={homeBanner}>
        <h1 style={homeBannerText}>Free your voice memos</h1>
      </div>
      {auth.isAuthenticated && (
        <TrackUpload />
      )}
      <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}>
        <p style={{ padding: 20, textTransform: 'uppercase', fontSize: 11, letterSpacing:8, opacity: 0.3, }}>Latest</p>
        <div style={{ display: 'flex', gap: 20, padding: 20, flexWrap: 'wrap' }}>
          {mockData.tracks.map((track) => (
            <TrackChip key={track.id} track={track} />
          ))}
        </div>
      </div>
    </>
  )
}

export default Home

import NavBar from '../components/nav/NavBar'
import RecentTracks from '../components/RecentTracks'
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
      <RecentTracks />
    </>
  )
}

export default Home

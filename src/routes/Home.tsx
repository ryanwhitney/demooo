import NavBar from '../components/nav/NavBar'
import { tokens } from '../styles/tokens'

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

function Home() {
  return (
    <>
      <NavBar />
      <div style={homeBanner}>
        <h1 style={homeBannerText}>Free your voice notes</h1>
      </div>
    </>
  )
}

export default Home

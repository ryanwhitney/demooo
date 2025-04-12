import NavBar from '../components/nav/NavBar'
import { tokens } from '../styles/tokens'
import { Artist } from '../types/artist'

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

function ArtistView({artist}:{artist:Artist}) {
  return (
    <>
      <NavBar />
      <div style={homeBanner}>
        <h1 style={homeBannerText}>{artist.title}</h1>
      </div>
    </>
  )
}

export default ArtistView

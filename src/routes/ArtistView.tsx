import NavBar from '../components/nav/NavBar'
import { tokens } from '../styles/tokens'
import { useParams } from 'react-router'

const homeBanner: React.CSSProperties = ({
  fontSize: tokens.space.xxl,
  fontWeight: tokens.fontWeights.normal,
  textTransform: 'uppercase',
  textAlign: 'center',
  display: 'flex',
  justifyContent: 'space-around',
  alignItems: 'center',
  paddingTop: 100,
  paddingBottom: 60,
});

const homeBannerText: React.CSSProperties = ({
  fontSize: tokens.fontSizes.xxl,
  fontWeight: tokens.fontWeights.normal,
});

function ArtistView() {
  const { artistName } = useParams();

  return (
    <>
      <NavBar />
      <div style={homeBanner}>
        <h1 style={homeBannerText}>{artistName}</h1>
      </div>
    </>
  )
}

export default ArtistView

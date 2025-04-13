import { useQuery } from '@apollo/client'
import NavBar from '../components/nav/NavBar'
import { tokens } from '../styles/tokens'
import { useParams } from 'react-router'
import { GET_USERNAME } from '../apollo/queries/userQueries'
import { useEffect } from 'react'

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

function ArtistPage() {
  const { artistName } = useParams();
 
   const { data, loading, error, refetch } = useQuery(GET_USERNAME, {
     variables: { username: artistName }
    }
   )
 
   useEffect(() => {
     refetch()
   }, [loading])
 
  return (
    <>
      <NavBar />
      <div style={homeBanner}>
        <h1 style={homeBannerText}>{JSON.stringify(data)}</h1>
      </div>
    </>
  )
}

export default ArtistPage

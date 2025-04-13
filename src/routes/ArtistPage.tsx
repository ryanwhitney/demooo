import { useQuery } from '@apollo/client'
import NavBar from '../components/nav/NavBar'
import { tokens } from '../styles/tokens'
import { useParams } from 'react-router'
import { GET_ARTIST } from '../apollo/queries/userQueries'
import { useEffect, useState } from 'react'
import { Track } from '../types/track'


const ArtistPage = () => {
  const { artistName } = useParams();
  const [tracks, setTracks] = useState<[Track]>([])
  const { data, loading, error, refetch } = useQuery(GET_ARTIST, {
    variables: { username: artistName },
    onCompleted: (data) => {
      setTracks(data.user.tracks)
    }
  })

  useEffect(() => {
    refetch()
  }, [])

  if (loading) return <p>Loading...</p>
  if (error) return <p>Error: {error.message}</p>

  return (
    <>
      <NavBar />
      {data.user === null ? (
        <p>Artist not found</p> 
      ) : (
        <div>
          <h2>{data.user.username}</h2>
          {tracks.map((track: Track) => (
            <div key={track.id}>
              <p>{track.title}</p>
              <p>{track.artist}</p>
            </div>
          ))}
        </div>
      )}
    </>
  )
}

export default ArtistPage

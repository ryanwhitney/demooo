import '../App.css'
import NavBar from '../components/NavBar'
import { gql, useQuery } from '@apollo/client';



function Home() {


  const WHO_AM_I = gql`
  query whom {
    me {
      username
    }
  }
    `

  const { data, loading, error } = useQuery(WHO_AM_I)



  return (
    <>
      <NavBar />
      <main>
      <div className="card">
        <button >
          {error && 
           <p>{error.message}</p>
          }
          {loading && 
           <p>loading…</p>
          }
          {data && 
           <p>{data.me.firstName}</p>
          }
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      </main>
    </>
  )
}

export default Home

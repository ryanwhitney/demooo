import { useState } from 'react'
import '../App.css'
// import { useQuery, gql } from '@apollo/client';
import NavBar from '../components/NavBar'



function Homepage() {
  const [count, setCount] = useState(0)

  return (
    <>
      <NavBar />
      <main>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      </main>
    </>
  )
}

export default Homepage

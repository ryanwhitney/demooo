import { useState } from 'react'
import '../App.css'
import { useQuery, gql } from '@apollo/client';
import NavBar from '../components/NavBar'

const GET_HELLO = gql`
  query GetItems {
    items {
      id
      name
      description
      createdAt
    }
  }
`;


interface Item {
  id: string;
  name: string;
  description: string;
  createdAt: string;
}


function Homepage() {
  const [count, setCount] = useState(0)

  const { loading, error, data } = useQuery(GET_HELLO);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;


  return (
    <>
      <NavBar />
      <main>
      <p>{data.items.map((item:Item) => (
        <div key={item.id}>
          <h2>{item.name}</h2>
          <p>{item.description}</p>
          <p>{item.createdAt}</p>
        </div>
      )
      )}</p>
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

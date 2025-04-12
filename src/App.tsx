import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router';
import { ApolloProvider } from '@apollo/client';
import { client } from './apollo/client';
import './styles/reset.css'
import './styles/global.css'
import Home from './routes/Home';
import { AuthProvider } from './providers/AuthProvider'
import ArtistView from './routes/ArtistView'
import TrackView from './routes/TrackView'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ApolloProvider client={client}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/:artistName" element={<ArtistView />} />
            <Route path="/:artistName/track" element={<TrackView />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ApolloProvider>
  </StrictMode>,
)

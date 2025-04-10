import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router';
import { ApolloProvider } from '@apollo/client';
import { client } from './apollo/client';
import './index.css'
import Home from './routes/Home';
import { AuthProvider } from './components/auth/AuthProvider'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ApolloProvider client={client}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            {/* <Route path="/products/:id" element={<ProductPage />} /> */}
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ApolloProvider>
  </StrictMode>,
)

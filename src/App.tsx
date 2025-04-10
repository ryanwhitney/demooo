import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router';
import { ApolloProvider } from '@apollo/client';
import { client } from './apollo/client';
import './index.css'
import Homepage from './routes/Homepage';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ApolloProvider client={client}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Homepage />} />
          {/* <Route path="/products/:id" element={<ProductPage />} /> */}
        </Routes>
      </BrowserRouter>
    </ApolloProvider>
  </StrictMode>,
)

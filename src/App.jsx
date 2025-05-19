import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import Layout from '../src/components/layout/Layout'; // Import Layout
import Routers from './components/Routers/Routers'; // Import Routers
 
function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routers /> {/* This will render the routes */}
      </Layout>
    </BrowserRouter>
  );
}
 
export default App;
 
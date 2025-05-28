import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import Routers from './components/Routers/Routers'; // Just render Routers here
 
function App() {
  return (
    <BrowserRouter>
      <Routers />  {/* No Layout wrapping here */}
    </BrowserRouter>
  );
}
 
export default App;
 
 
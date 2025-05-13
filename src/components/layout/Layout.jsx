import React from 'react';
import Routers from '../Routers/Routers';
import Header from '../header/Header';
import Footer from '../footer/Footer';
 
function Layout() {
  return (
    <>
      <Header />
      <div>
        <Routers />
      </div>
      <Footer />
    </>
  );
}
 
export default Layout;
 
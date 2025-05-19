import React from 'react';
import Header from '../header/Header'; // Assuming you have a Header component
import Footer from '../footer/Footer'; // Assuming you have a Footer component
 
function Layout({ children }) {
  return (
    <>
      <Header />
      <div>{children}</div> {/* The page content (children) will be rendered here */}
      <Footer />
    </>
  );
}
 
export default Layout;
 
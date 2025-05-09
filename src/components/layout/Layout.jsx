import React from 'react'
import Routers from '../Routers/Routers'
import Header from '../header/Header'
import Footer from '../footer/Footer'
import {BrowserRouter as Router} from 'react-router-dom'
function Layout() {
  return (
<Router>
<Header/> 
<div>
<Routers/>
</div>  
<Footer/>
</Router>
  )
}

export default Layout

import React from 'react'
import { SignUp } from './components/SignUp'
import { Home as Hom } from './pages/Home'
import { Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import Contact from './pages/ContactUs'
import Filters from './pages/Filters'
import FashionGrid from './pages/Filters'
// import Main from './filterationComponents/Main'
// import FashionGrid from './components/filters/files/FashionGrid'


export default function App() {
  return (
    <>
      <Routes>
        <Route path='/login' element={<Login />} />
        <Route path='/signup' element={<SignUp />} />
        <Route path='/home' element={<Hom />} />
        <Route path='/filters' element={<Filters />} />
        <Route path='/contact' element={<Contact />} />
        <Route path='/realFilter' element={<FashionGrid />} />
      </Routes>
    </>
  )
}

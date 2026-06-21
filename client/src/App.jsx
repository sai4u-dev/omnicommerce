// App.jsx
import { Routes, Route, Navigate } from "react-router-dom"
import { useEffect, useState } from "react"
import axios from "axios"

import Login from "./pages/Login"
import { SignUp } from "./components/SignUp"
import { Home as Hom, Home } from "./pages/Home"
import Contact from "./pages/ContactUs"
import Filters from "./pages/Filters"
import FashionGrid from "./pages/Filters"
// import Main from './filterationComponents/Main'
// import FashionGrid from './components/filters/files/FashionGrid'

function App() {
  const [isAuth, setIsAuth] = useState(null)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await axios.get("http://localhost:5000/api/auth/me", {
          withCredentials: true,
        })
        setIsAuth(true)
      } catch {
        setIsAuth(false)
      }
    }

    checkAuth()
  }, [])

  if (isAuth === null) return <div>Loading...</div>

  return (
    <Routes>
      <Route
        path="/login"
        element={isAuth ? <Navigate to="/home" replace /> : <Login />}
      />

      <Route
        path="/signup"
        element={isAuth ? <Navigate to="/home" replace /> : <SignUp />}
      />

      <Route
        path="/home"
        element={isAuth ? <Home /> : <Navigate to="/home" replace />}
      />

      <Route path="/filters" element={<Filters />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/realFilter" element={<FashionGrid />} />
    </Routes>
  )
}

export default App

import React from 'react'
import { Button } from './components/ui/button'
import { GalleryVerticalEnd } from 'lucide-react'
import { SignUp } from './components/SignUp'
import { Routes, Route } from 'react-router-dom'
import Login from './pages/Login'

function Home() {
  return (
    <div>

      <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10 fontstyle">
        <div className="flex w-full max-w-sm flex-col gap-6">
          <a href="#" className="flex items-center gap-2 self-center font-medium">
            <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
              <GalleryVerticalEnd className="size-4" />
            </div>
            Omnicommerce - Bag your products.
          </a>
          <SignUp />
        </div>
      </div>

    </div>
  )
}

export default function App() {
  return (
    <>
      <Routes>
        <Route path='/login' element={<Login />} />
        <Route path='/signup' element={<Home />} />
        <Route path='/' element={<Home />} />
      </Routes>
    </>
  )
}

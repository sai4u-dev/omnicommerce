import { Routes, Route, Navigate } from 'react-router-dom'
import { ProtectedRoute, PublicOnlyRoute } from './components/ProtectedRoute'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import Earnings from './pages/Earnings'
import Profile from './pages/Profile'
import Login from './pages/Login'

function DeliveryLayout(){
  return (
    <div className="admin-layout">
      <Sidebar />
      <main className="admin-main">
        <Routes>
          <Route path="/" element={<Dashboard/>} />
          <Route path="/earnings" element={<Earnings/>} />
          <Route path="/profile" element={<Profile/>} />
          <Route path="*" element={<Navigate to="/" replace/>} />
        </Routes>
      </main>
    </div>
  )
}
export default function App(){
  return (
    <Routes>
      <Route path="/login" element={<PublicOnlyRoute><Login/></PublicOnlyRoute>} />
      <Route path="/*" element={<ProtectedRoute><DeliveryLayout/></ProtectedRoute>} />
    </Routes>
  )
}

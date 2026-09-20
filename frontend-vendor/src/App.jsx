import { Routes, Route, Navigate } from 'react-router-dom'
import { ProtectedRoute, PublicOnlyRoute } from './components/ProtectedRoute'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import Products from './pages/Products'
import Orders from './pages/Orders'
import Analytics from './pages/Analytics'
import Login from './pages/Login'

function VendorLayout(){
  return (
    <div className="admin-layout">
      <Sidebar />
      <main className="admin-main">
        <Routes>
          <Route path="/" element={<Dashboard/>} />
          <Route path="/products" element={<Products/>} />
          <Route path="/orders" element={<Orders/>} />
          <Route path="/analytics" element={<Analytics/>} />
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
      <Route path="/*" element={<ProtectedRoute><VendorLayout/></ProtectedRoute>} />
    </Routes>
  )
}

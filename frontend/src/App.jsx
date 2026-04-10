import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import Tracker from './pages/Tracker'
import Stories from './pages/Stories'
import Music from './pages/Music'
import Profile from './pages/Profile'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import Register from './pages/register'

function AppLayout() {
  const location = useLocation()
  const isRegisterPage = location.pathname === '/register'

  return (
    <>
      <Navbar />
      <div style={{ display: 'flex' }}>
        {!isRegisterPage && <Sidebar />}
        <div style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/tracker" element={<Tracker />} />
            <Route path="/stories" element={<Stories />} />
            <Route path="/music" element={<Music />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/register" element={<Register />} />
          </Routes>
        </div>
      </div>
    </>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  )
}

export default App
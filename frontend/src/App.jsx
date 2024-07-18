import { Route, Routes } from "react-router-dom"
import SignUpPage from "./pages/auth/signup/SignUpPage"
import LogInPage from "./pages/auth/login/LogInPage"
import Home from "./pages/home/Home"
import Sidebar from "./components/common/Sidebar"
import RightPanel from "./components/common/RightPanel"
import NotificationPage from "./pages/notification/NotificationPage"
import ProfilePage from "./pages/profile/ProfilePage"
import { Toaster } from "react-hot-toast"


function App() {
  

  return (
    <div className='flex max-w-6xl mx-auto'>
        <Sidebar/>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/login' element={<LogInPage />} />
        <Route path='/signup' element={<SignUpPage />} />
        <Route path='/notification' element={<NotificationPage />} />
        <Route path='/profile/:username' element={<ProfilePage />} />
        </Routes>
        <RightPanel/>
        <Toaster/>
    </div>
  )
}

export default App

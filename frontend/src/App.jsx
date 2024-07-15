import { Route, Routes } from "react-router-dom"
import SignUpPage from "./pages/auth/signup/SignUpPage"
import LogInPage from "./pages/auth/login/LogInPage"
import Home from "./pages/home/Home"


function App() {
  

  return (
    <div className='flex max-w-6xl mx-auto'>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/login' element={<LogInPage />} />
        <Route path='/signup' element={<SignUpPage />} />
        </Routes>
    </div>
  )
}

export default App

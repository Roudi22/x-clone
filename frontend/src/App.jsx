import { Navigate, Route, Routes } from "react-router-dom"
import SignUpPage from "./pages/auth/signup/SignUpPage"
import LogInPage from "./pages/auth/login/LogInPage"
import Home from "./pages/home/Home"
import Sidebar from "./components/common/Sidebar"
import RightPanel from "./components/common/RightPanel"
import NotificationPage from "./pages/notification/NotificationPage"
import ProfilePage from "./pages/profile/ProfilePage"
import { Toaster } from "react-hot-toast"
import { useQuery } from "@tanstack/react-query"
import LoadingSpinner from "./components/common/LoadingSpinner"

function App() {
  
const {data:authUser, isLoading} = useQuery({
  queryKey:["authUser"], // The query key is an array that uniquely identifies the query and refer to it in other parts of the application
  queryFn: async () => {
    // eslint-disable-next-line no-useless-catch
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      if (data.error) {
        return null
      }
      console.log(data);
      return data;
    } catch (error) {
      throw error;
    }
  },
  retry: false,
});
  if (isLoading) {
    return (
      <div className="h-screen flex justify-center items-center">
        <LoadingSpinner size="lg"/>
      </div>
    )
  }
  return (
    <div className='flex max-w-6xl mx-auto'>
        {authUser && <Sidebar/>}
      <Routes>
        <Route path='/' element={ authUser ? <Home /> : <Navigate to="/login"/>} />
        <Route path='/login' element={!authUser ? <LogInPage /> : <Navigate to="/"/> } />
        <Route path='/signup' element={!authUser ? <SignUpPage /> : <Navigate to={"/"}/> } />
        <Route path='/notifications' element={authUser ? <NotificationPage /> : <Navigate to={"/login"}/> } />
        <Route path='/profile/:username' element={authUser ? <ProfilePage /> : <Navigate to={"/login"}/> } />
        </Routes>
        {authUser && <RightPanel/>}
        <Toaster/>
    </div>
  )
}

export default App

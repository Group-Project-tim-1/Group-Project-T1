import { useEffect } from "react"
import Chatbox from "../components/Chatbox"
import Navbar from "../components/Navbar"
import User1 from "../components/User1"
import User2 from "../components/User2"
import { useNavigate } from "react-router"


export default function PlayGround() {
  const navigate = useNavigate()
  useEffect(()=>{
    if (!localStorage.username)
    navigate('/')
  },[])

  return (
    <>
      <Navbar />
      <div className='flex flex-row justify-center gap-20'>
        <div className="bg-white">
          <User1 />
        </div>
        <div className="bg-white">
          <User2 />
          <Chatbox />
        </div>
      </div>
    </>
  )
}
import { useEffect, useState } from "react"
import Chatbox from "../components/Chatbox"
import Navbar from "../components/Navbar"
import User1 from "../components/User1"
import { useNavigate } from "react-router"
import { socket } from "../socket/socket"


export default function PlayGround() {
  const navigate = useNavigate()
  const [enemy, setEnemy] = useState('')
  const [opponent, setOpponent] = useState({
    from: '',
    data: {
      points: 0,
      lines: 0
    }
  })
  


  useEffect(() => {
    if(!localStorage.username){
      navigate('/')
    }
    
    socket.auth = {
      username: localStorage.username
  }
    socket.connect()

    socket.on('opponents:update', (data) => {
      setOpponent(data)
    })

    socket.on('newPlayer', (data) => {
      setEnemy(data.opponent)
      console.log(data);
      
    })

    return () => {
      socket.off("message:update")
      socket.disconnect()
    }
  },[])

  useEffect(() => {
    console.log(opponent, 'op');
    console.log(enemy);
    
    
  })

  


  return (
    <>
      <Navbar />

      <div>
        <div className='flex flex-row justify-center gap-20'>
          <div className="bg-white"> 
            <h1>{opponent.data.points}</h1>   
            <h1>{enemy}</h1>   
            <h1>{opponent.data.lines}</h1>   
          </div>
          <div className="bg-white">
            <User1 />
          </div>
            <Chatbox />
        </div>
      </div>

    </>
  )
}
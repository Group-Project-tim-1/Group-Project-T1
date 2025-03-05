import { useEffect } from 'react';
import Chatbox from '../components/Chatbox';
import User1 from '../components/User1';
import { useNavigate } from 'react-router';
import { socket } from '../socket/socket';

export default function PlayGround() {
  const navigate = useNavigate();
  const [enemy, setEnemy] = useState('')
  const [opponent, setOpponent] = useState({
    from: '',
    data: {
      points: 0,
      lines: 0
    }
  })
  


  useEffect(() => {
    if (!localStorage.username) {
      navigate('/');
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
    <div className="fixed container mx-auto p-4 h-screen bg-gray-900 text-gray-200 mt-16">
      <div className="bg-gray-800 rounded-lg shadow-md p-4">
        <User1 />
      </div>
      <Chatbox />
    </div>
  );
}
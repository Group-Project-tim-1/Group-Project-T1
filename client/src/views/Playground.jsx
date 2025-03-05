import { useEffect, useState } from 'react';
import Chatbox from '../components/Chatbox';
import User1 from '../components/User1';
import { useNavigate } from 'react-router-dom';
import { socket } from '../socket/socket';

export default function PlayGround() {
  const navigate = useNavigate();
  const [enemy, setEnemy] = useState('');
  const [opponent, setOpponent] = useState({
    from: '',
    data: { points: 0, lines: 0 }
  });

  useEffect(() => {
    // Check for username
    const username = localStorage.getItem('username');
    if (!username) {
      navigate('/');
      return;
    }

    // Disconnect existing connection if any
    if (socket.connected) {
      socket.disconnect();
    }

    // Configure socket
    socket.auth = { username };
    
    // Connect to server
    socket.connect();

    // Socket event handlers
    socket.on('connect', () => {
      console.log('Connected to game server');
    });

    socket.on('opponents:update', (data) => {
      console.log('Opponent update:', data);
      setOpponent(data);
    });

    socket.on('newPlayer', (data) => {
      console.log('New player:', data);
      setEnemy(data.opponent);
    });

    // Cleanup on unmount
    return () => {
      socket.off('connect');
      socket.off('opponents:update');
      socket.off('newPlayer');
      socket.disconnect();
    };
  }, [navigate]);

  return (
    <div className="fixed container mx-auto p-4 h-screen bg-gray-900 text-gray-200 mt-16">
      <div className="bg-gray-800 rounded-lg shadow-md p-4">
        <User1 opponent={opponent} enemy={enemy} />
      </div>
      <Chatbox />
    </div>
  );
}
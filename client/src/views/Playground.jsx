import { useEffect } from 'react';
import Chatbox from '../components/Chatbox';
import User1 from '../components/User1';
import { useNavigate } from 'react-router';
import { socket } from '../socket/socket';

export default function PlayGround() {
  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.username) {
      navigate('/');
    }

    socket.emit('playground', 'tes');

    return () => {
      socket.off('message:update');
      socket.disconnect();
    };
  }, []);

  return (
    <div className="fixed container mx-auto p-4 h-screen bg-gray-900 text-gray-200 mt-16">
      <div className="bg-gray-800 rounded-lg shadow-md p-4">
        <User1 />
      </div>
      <Chatbox />
    </div>
  );
}
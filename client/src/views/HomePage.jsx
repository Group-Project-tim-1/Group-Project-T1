import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { socket } from '../socket/socket';

export default function HomePage() {
    const navigate = useNavigate()
    const [username, setUsername] = useState('')
    const [isReady, setIsReady] = useState(false)


  function handleSubmit(e) {
    e.preventDefault();
    localStorage.setItem('username', username);
    socket.auth = {
      username: localStorage.username,
    };

    socket.connect();
    socket.emit('player', { username: localStorage.username });
  }

    useEffect(() => {
        socket.on('play', (players) => {
            setIsReady(true)
            navigate('/plays')
        })
    }, [isReady])

    


  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
    <div className="bg-gray-800 p-8 rounded-lg shadow-md w-96">
      <h1 className="text-2xl font-bold text-gray-200 text-center mb-6 font-mono">
        WELCOME, GAMER!
      </h1>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <input
            type="text"
            name="username"
            placeholder="Nama Pengguna"
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-gray-500 bg-gray-900 text-gray-200"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <button
          type="submit"
          className="w-full bg-gray-700 hover:bg-gray-600 text-gray-200 font-bold py-2 px-4 rounded"
        >
          ▶ START GAME
        </button>
      </form>
    </div>
  </div>
  );
}
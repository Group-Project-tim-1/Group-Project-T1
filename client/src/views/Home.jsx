import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { socket } from '../socket/socket'; // Pastikan path ke socket Anda benar

export default function Home() {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const handlePlayersReady = () => {
            setIsLoading(false);
            if (socket.connected) {
                navigate('/playground');
            } else {
                console.log('Socket disconnected, navigation aborted.');
            }
        };

        socket.on('players:ready', handlePlayersReady);

        return () => {
            socket.off('players:ready', handlePlayersReady);
        };
    }, [navigate]);

    const handleSubmit = (e) => {
        e.preventDefault();

        if (username.trim()) {
            localStorage.setItem('username', username.trim());
            setIsLoading(true);

            // Emit event login
            socket.emit('user:login', { username: username.trim() });
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center">
            {isLoading ? (
                <div className="text-white">Loading...</div>
            ) : (
                <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-96">
                    <h1 className="text-2xl text-white mb-6 text-center">Enter Username</h1>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full p-2 rounded bg-gray-700 text-white"
                            placeholder="Enter your username"
                            required
                        />
                        <button
                            type="submit"
                            className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
                        >
                            Start Game
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
}
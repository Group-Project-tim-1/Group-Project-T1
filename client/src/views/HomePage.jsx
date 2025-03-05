import { useEffect, useState } from "react"
import { useNavigate } from "react-router"
import { socket } from "../socket/socket"


export default function HomePage() {
    const navigate = useNavigate()
    const [username, setUsername] = useState('')
    const [isReady, setIsReady] = useState(false)


    function handleSubmit(e) {
        e.preventDefault()
        localStorage.setItem('username', username)
        socket.auth = {
            username: localStorage.username
        }

        socket.connect()
        socket.emit('player', { username: localStorage.username })
    }

    useEffect(() => {
        socket.on('play', (players) => {
            setIsReady(true)
            navigate('/plays')
        })
    }, [isReady])

    


    return (
        <div className="h-screen flex items-center justify-center">
            <div className="bg-gray-900 bg-opacity-80 p-8 rounded-lg shadow-lg text-center text-white w-96">
                <h1 className="text-3xl font-bold mb-6">
                    Welcome!
                </h1>
                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        name="username"
                        placeholder="Nama Pengguna"
                        className="w-full p-2 mb-4 rounded bg-gray-800 text-white focus:outline-none focus:ring focus:border-blue-300"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                    <button
                        type="submit"
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
                    >
                        Mainkan
                    </button>
                </form>
            </div>

        </div>

    )
}
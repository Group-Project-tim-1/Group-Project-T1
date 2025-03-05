import { useNavigate } from "react-router"


export default function Navbar() {
    const navigate = useNavigate()
    function handleLogout(){
        localStorage.clear()
        navigate('/')

    }

    return (
        <div className="bg-gray-900 text-white">

            <nav className="bg-gray-800 p-4 flex justify-between items-center">
                <div className="flex-grow text-center">
                    <span className="font-bold text-xl">TEZTRIZ</span>
                </div>
                <div>
                    <button className="bg-blue-500 hover:bg-blue-700 py-2 px-4 rounded" onClick={handleLogout}>
                        Logout
                    </button>
                </div>
            </nav>
        </div>


    )
}
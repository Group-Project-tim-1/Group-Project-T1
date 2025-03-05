import { useEffect, useState } from "react";
import { socket } from "../socket/socket"


export default function Chatbox() {
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [messageSent, setMessageSent] = useState('')
    const [messages, setMessages] = useState([])


    const handleOpenChat = () => {
        setIsChatOpen(true);
    };

    const handleCloseChat = () => {
        setIsChatOpen(false);
    };

    function handleSubmit(e) {
        e.preventDefault()
        socket.emit("message:new", messageSent)
    }

    useEffect(() => {
        // console.log(messageSent)
        socket.auth = {
            username: localStorage.username
        }

        socket.connect()


        socket.on("message:update", (newMessage) => {
            // console.log(newMessage)
            setMessages(current => {
                return [...current, newMessage]
            })
        })

        return () => {
            socket.off("message:update")
            socket.disconnect()
        }

    }, [])

    // useEffect(()=>{
    //     console.log(messages)
    // })

    return (
        <>
            <div className="fixed bottom-0 right-0 mb-4 mr-4">
                {isChatOpen? (<button
                    id="open-chat"
                    className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition duration-300 flex items-center"
                    onClick={handleCloseChat}
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-6 h-6 mr-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                        />
                    </svg>
                    Chat
                </button>) : (<button
                    id="open-chat"
                    className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition duration-300 flex items-center"
                    onClick={handleOpenChat}
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-6 h-6 mr-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                        />
                    </svg>
                    Chat
                </button>)}
                
            </div>

            <div
                id="chat-container"
                className={`fixed bottom-16 right-4 w-96 ${isChatOpen ? '' : 'hidden'
                    }`}
            >
                <div className="bg-white shadow-md rounded-lg max-w-lg w-full">
                    <div className="p-4 border-b bg-blue-500 text-white rounded-t-lg flex justify-between items-center">
                        <p className="text-lg font-semibold">taunting ngab!</p>
                        <button
                            id="close-chat"
                            className="text-gray-300 hover:text-gray-400 focus:outline-none focus:text-gray-400"
                            onClick={handleCloseChat}
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="w-6 h-6"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </button>
                    </div>


                    <div id="chatbox" className="p-4 h-80 overflow-y-auto">
                        {/* Chat messages will be displayed here */}
                        {messages.map((msg, index) => {
                            return (

                                <div key={index} className={msg.from === localStorage.username? "mb-2 text-right" : "mb-2 text-left" }>
                                    <div>{msg.from == localStorage.username ? "You" : msg.from}</div>
                                    <p className="bg-blue-500 text-white rounded-lg py-2 px-4 inline-block">
                                        {msg.message}
                                    </p>
                                </div>
                            )
                        })}


                    </div>

                    <div className="p-4 border-t flex">
                        <form onSubmit={handleSubmit}>
                            <input
                                id="user-input"
                                type="text"
                                placeholder="Type a message"
                                className="w-full px-3 py-2 border rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                onChange={(e) => setMessageSent(e.target.value)}
                            />
                            <button
                                id="send-button"
                                className="bg-blue-500 text-white px-4 py-2 rounded-r-md hover:bg-blue-600 transition duration-300"
                            >
                                Send
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}
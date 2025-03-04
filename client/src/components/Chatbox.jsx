import { useEffect, useState } from "react";
import {socket} from "../socket/socket"


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

    // useEffect(()=>{
    //     // console.log(messageSent)
    //     socket.on("message:update", (newMessage) => {
            
    //     })
    // },[])

    return (
        <>
            <div className="fixed bottom-0 right-0 mb-4 mr-4">
                <button
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
                </button>
            </div>

            <div
                id="chat-container"
                className={`fixed bottom-16 right-4 w-96 ${isChatOpen ? '' : 'hidden'
                    }`}
            >
                <div className="bg-white shadow-md rounded-lg max-w-lg w-full">
                    <div className="p-4 border-b bg-blue-500 text-white rounded-t-lg flex justify-between items-center">
                        <p className="text-lg font-semibold">Admin Bot</p>
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
                        <div className="mb-2 text-right">
                            <p className="bg-blue-500 text-white rounded-lg py-2 px-4 inline-block">
                                hello
                            </p>
                        </div>
                        <div className="mb-2">
                            <p className="bg-gray-200 text-gray-700 rounded-lg py-2 px-4 inline-block">
                                This is a response from the chatbot.
                            </p>
                        </div>
                        <div className="mb-2 text-right">
                            <p className="bg-blue-500 text-white rounded-lg py-2 px-4 inline-block">
                                this example of chat
                            </p>
                        </div>
                        <div className="mb-2">
                            <p className="bg-gray-200 text-gray-700 rounded-lg py-2 px-4 inline-block">
                                This is a response from the chatbot.
                            </p>
                        </div>
                        <div className="mb-2 text-right">
                            <p className="bg-blue-500 text-white rounded-lg py-2 px-4 inline-block">
                                design with tailwind
                            </p>
                        </div>
                        <div className="mb-2">
                            <p className="bg-gray-200 text-gray-700 rounded-lg py-2 px-4 inline-block">
                                This is a response from the chatbot.
                            </p>
                        </div>
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
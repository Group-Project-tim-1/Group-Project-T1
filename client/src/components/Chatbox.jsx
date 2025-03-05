import { useEffect, useState, useRef } from 'react';
import { socket } from '../socket/socket';

export default function Chatbox() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messageSent, setMessageSent] = useState('');
  const [messages, setMessages] = useState([]);
  const chatboxRef = useRef(null);

  // Scroll ke pesan terbaru
  useEffect(() => {
    if (chatboxRef.current) {
      chatboxRef.current.scrollTop = chatboxRef.current.scrollHeight;
    }
  }, [messages]);

  // Setup socket connection - hanya sekali saat komponen mount
  useEffect(() => {
    // Listen for new messages
    const handleNewMessage = (newMessage) => {
      console.log('New message received:', newMessage);
      // Hanya tambahkan pesan jika bukan dari pengirim yang sama
      if (newMessage.from !== localStorage.getItem('username')) {
        setMessages(prevMessages => [...prevMessages, newMessage]);
      }
    };

    socket.on('message:update', handleNewMessage);

    // Cleanup on unmount
    return () => {
      socket.off('message:update', handleNewMessage);
    };
  }, []); // Empty dependency array

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!messageSent.trim()) return;

    const newMessage = {
      from: localStorage.getItem('username'),
      message: messageSent.trim()
    };

    // Emit new message
    socket.emit('message:new', messageSent.trim());
    
    // Add message to local state
    setMessages(prevMessages => [...prevMessages, newMessage]);
    
    // Clear input
    setMessageSent('');
  };

  const handleOpenChat = () => setIsChatOpen(true);
  const handleCloseChat = () => setIsChatOpen(false);

  return (
    <>
      <div className="fixed bottom-0 right-0 mb-4 mr-4">
        {isChatOpen ? (
          <button
            id="open-chat"
            className="absolute inset-0 bg-transparent text-gray-700 py-2 px-4 rounded-md flex items-center justify-center"
            onClick={handleCloseChat}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-8 h-8"
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
        ) : (
          <button
            id="open-chat"
            className="bg-gray-700 text-gray-200 py-2 px-4 rounded-md hover:bg-gray-600 transition duration-300 flex items-center"
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
        )}
      </div>

      <div
        id="chat-container"
        className={`fixed bottom-16 right-4 w-96 ${
          isChatOpen ? "border-4 border-black rounded-2xl" : "hidden"
        }`}
      >
        <div className="bg-gray-800 shadow-md rounded-t-2xl max-w-lg w-full">
          <div className="p-4 border-b bg-gray-700 text-gray-200 rounded-t-xl flex justify-between items-center">
            <p className="text-lg font-semibold">Game Chat</p>
            <button
              id="close-chat"
              className="text-gray-400 hover:text-gray-300 focus:outline-none focus:text-gray-300"
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

          <div 
            ref={chatboxRef}
            id="chatbox" 
            className="p-4 h-80 overflow-y-auto bg-gray-800"
          >
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`mb-2 ${
                  msg.from === localStorage.getItem('username')
                    ? "text-right"
                    : "text-left"
                }`}
              >
                <div className="text-gray-400 text-sm">
                  {msg.from === localStorage.getItem('username') ? "You" : msg.from}
                </div>
                <p className="bg-gray-700 text-gray-200 rounded-lg py-2 px-4 inline-block max-w-[80%]">
                  {msg.message}
                </p>
              </div>
            ))}
          </div>

          <div className="p-4 border-t border-gray-700">
            <form onSubmit={handleSubmit} className="flex">
              <input
                id="user-input"
                type="text"
                value={messageSent}
                placeholder="Type a message"
                className="flex-1 px-3 py-2 border rounded-l-md focus:outline-none focus:ring-2 focus:ring-gray-500 bg-gray-900 text-gray-200"
                onChange={(e) => setMessageSent(e.target.value)}
              />
              <button
                type="submit"
                id="send-button"
                className="bg-gray-700 text-gray-200 px-4 py-2 rounded-r-md hover:bg-gray-600 transition duration-300"
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
  
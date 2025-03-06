import { useNavigate } from "react-router-dom"
import { socket } from "../socket/socket"
import { useState, useEffect } from "react"

export function Navbar() {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [waitingConfirmation, setWaitingConfirmation] = useState(false);
  const [requestingUser, setRequestingUser] = useState('');

  useEffect(() => {
    console.log('Setting up socket listeners in Navbar, socket ID:', socket.id);

    // Pastikan socket terhubung
    if (!socket.connected) {
      console.log('Socket not connected, connecting...');
      socket.connect();
    }

    // Debug listener untuk semua event
    const originalOn = socket.on;
    socket.on = function(event, callback) {
      const wrappedCallback = function(...args) {
        console.log(`Event received: ${event}`, args);
        return callback.apply(this, args);
      };
      return originalOn.call(this, event, wrappedCallback);
    };

    // Listen untuk request logout dari player lain
    socket.on('player:logout-request', (data) => {
      console.log('Received logout request from:', data.username);
      setRequestingUser(data.username);
      setShowModal(true);
    });

    // Listen untuk konfirmasi logout dari semua player
    socket.on('all-players:logout', () => {
      console.log('All players confirmed logout');
      handleFinalLogout();
    });

    // Listen untuk pembatalan logout
    socket.on('logout:cancelled', () => {
      console.log('Logout cancelled by other player');
      setWaitingConfirmation(false);
      // Tampilkan notifikasi pembatalan
      alert('Permintaan logout dibatalkan oleh player lain');
    });

    // Cleanup listeners
    return () => {
      console.log('Cleaning up socket listeners');
      socket.off('player:logout-request');
      socket.off('all-players:logout');
      socket.off('logout:cancelled');
      // Restore original socket.on
      socket.on = originalOn;
    };
  }, []);

  function handleLogoutRequest() {
    const username = localStorage.getItem('username');
    console.log('Requesting logout as:', username);
    
    socket.emit('player:request-logout', {
      username: username
    });
    
    setWaitingConfirmation(true);
  }

  function handleConfirmLogout() {
    const username = localStorage.getItem('username');
    console.log('Confirming logout as:', username);
    
    socket.emit('player:confirm-logout', {
      username: username
    });
    
    setShowModal(false);
    setWaitingConfirmation(true);
  }

  function handleCancelLogout() {
    const username = localStorage.getItem('username');
    console.log('Cancelling logout as:', username);
    
    socket.emit('player:cancel-logout', {
      username: username
    });
    
    setShowModal(false);
  }

  function handleFinalLogout() {
    console.log('Performing final logout');
    localStorage.clear();
    socket.disconnect();
    navigate('/');
    setWaitingConfirmation(false)
  }

  return (
    <>
      <nav className="z-10 bg-gray-800 fixed top-0 w-full p-4 flex justify-between items-center shadow-md">
        <div className="flex items-center">
          <span className="text-gray-200 font-bold text-xl font-mono">
            TEZTRIZ
          </span>
        </div>
        <div className="flex items-center">
          <button
            className={`${
              waitingConfirmation 
                ? 'bg-gray-600 cursor-not-allowed'
                : 'bg-red-700 hover:bg-red-600'
            } text-gray-200 font-bold py-2 px-4 rounded transition-colors duration-200`}
            onClick={handleLogoutRequest}
            disabled={waitingConfirmation}
          >
            {waitingConfirmation ? 'Menunggu konfirmasi...' : 'Logout'}
          </button>
        </div>
      </nav>

      {/* Modal Konfirmasi Logout */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full mx-4 border border-gray-700">
            <h2 className="text-xl font-bold text-gray-200 mb-4">
              Konfirmasi Logout
            </h2>
            <p className="text-gray-300 mb-6">
              {requestingUser} meminta untuk mengakhiri permainan. 
              Apakah Anda setuju untuk logout?
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={handleCancelLogout}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded transition-colors duration-200"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmLogout}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded transition-colors duration-200"
              >
                Konfirmasi Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notifikasi Menunggu */}
      {waitingConfirmation && (
        <div className="fixed bottom-4 right-4 bg-blue-600 text-white p-4 rounded-lg shadow-lg z-40">
          <p>Menunggu konfirmasi logout dari player lain...</p>
        </div>
      )}
    </>
  );
}

export default Navbar;
  
import { useEffect } from 'react';
import { socket } from '../socket/socket';

const Login = () => {
  useEffect(() => {
    // Debug socket connection
    console.log('Login page loaded, socket status:', {
      id: socket.id,
      connected: socket.connected
    });
    
    // Pastikan socket terhubung
    if (!socket.connected) {
      socket.connect();
    }
    
    // Log ketika socket terhubung
    const handleConnect = () => {
      console.log('Socket connected:', socket.id);
    };
    
    socket.on('connect', handleConnect);
    
    return () => {
      socket.off('connect', handleConnect);
    };
  }, []);

  return (
    <div>Login Component</div>
  );
};

export default Login; 
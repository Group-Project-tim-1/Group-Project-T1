import { useEffect, useState, useCallback } from 'react';
import { socket } from '../socket/socket';

export default function GameCommentator({ points, lines, enemyPoints }) {
    const [comment, setComment] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);

    // Setup Text-to-Speech
    const speak = useCallback((text) => {
        if ('speechSynthesis' in window) {
            // Hentikan speech yang sedang berjalan
            window.speechSynthesis.cancel();

            const utterance = new SpeechSynthesisUtterance(text);
            
            // Set properti untuk Bahasa Indonesia
            utterance.lang = 'id-ID';
            utterance.rate = 1.0;  // Kecepatan bicara
            utterance.pitch = 1.0; // Nada suara
            utterance.volume = 1.0; // Volume

            // Event handlers
            utterance.onstart = () => setIsSpeaking(true);
            utterance.onend = () => setIsSpeaking(false);
            utterance.onerror = (event) => {
                console.error('Speech error:', event);
                setIsSpeaking(false);
            };

            window.speechSynthesis.speak(utterance);
        }
    }, []);

    useEffect(() => {
        // Hanya generate komentar ketika points berubah dan tidak sedang generating
        if (!isGenerating) {
            setIsGenerating(true);

            const gameState = {
                currentPoints: points,
                totalLines: lines,
                enemyPoints: enemyPoints,
            };

            console.log('Sending game state for commentary:', gameState);
            socket.emit('generate:commentary', gameState);
        }

        const handleCommentary = (data) => {
            console.log('Received commentary:', data);
            setComment(data.comment);
            setIsGenerating(false);
            // Otomatis membacakan komentar baru
            speak(data.comment);
        };

        socket.on('commentary:update', handleCommentary);

        return () => {
            socket.off('commentary:update', handleCommentary);
            // Hentikan speech yang sedang berjalan saat unmount
            if ('speechSynthesis' in window) {
                window.speechSynthesis.cancel();
            }
        };
    }, [points, lines, enemyPoints, speak]);

    // Handler untuk tombol play/stop
    const handleSpeakButton = () => {
        if (isSpeaking) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
        } else if (comment) {
            speak(comment);
        }
    };

    return (
        <div className="bg-gray-800 p-4 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold text-gray-200">Komentar Netijen</h3>
                <button
                    onClick={handleSpeakButton}
                    className={`px-3 py-1 rounded ${
                        isSpeaking 
                            ? 'bg-red-500 hover:bg-red-600' 
                            : 'bg-blue-500 hover:bg-blue-600'
                    } text-white transition-colors`}
                    disabled={!comment || isGenerating}
                >
                    {isSpeaking ? (
                        <>
                            <span className="mr-2">⏹</span>
                            Stop
                        </>
                    ) : (
                        <>
                            <span className="mr-2">▶</span>
                            Play
                        </>
                    )}
                </button>
            </div>
            <div className="text-gray-300">
                {isGenerating ? (
                    <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <p>Generating commentary...</p>
                    </div>
                ) : (
                    <div className="bg-gray-700 p-3 rounded">
                        <p className="font-mono text-lg">
                            {comment || 'Game is starting...'}
                        </p>
                    </div>
                )}
            </div>
            {/* Status indikator */}
            {isSpeaking && (
                <div className="mt-2 text-sm text-green-400 flex items-center">
                    <span className="animate-pulse mr-2">🔊</span>
                    Sedang berbicara...
                </div>
            )}
        </div>
    );
} 
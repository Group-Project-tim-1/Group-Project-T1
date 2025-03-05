import Tetris from "react-tetris";
import { socket } from "../socket/socket";
import { useEffect, useState, useRef } from "react";
import GameCommentator from './GameCommentator';

function User1({ opponent, enemy }) {
    const [scores, setScores] = useState(0);
    const [lines, setLines] = useState(0);
    const [gameState, setGameState] = useState(null);
    const gameRef = useRef(null);

    useEffect(() => {
        socket.auth = {
            username: localStorage.getItem('username')
        }
        socket.connect()
    }, []);

    useEffect(() => {
        console.log('Opponent data:', opponent);
        console.log('Enemy:', enemy);
    }, [opponent, enemy])

    useEffect(() => {
        // Mengirim update skor dan garis ke server setiap kali nilai berubah
        socket.emit('game:update', {
            points: scores,
            lines: lines
        })
    }, [scores, lines])

    return (
        <Tetris>
            {({
                Gameboard,
                PieceQueue,
                points,
                linesCleared,
                state,
                controller,
                // Mengakses game instance langsung
                game
            }) => {
                // Simpan referensi game
                gameRef.current = game;

                // Update game state setiap kali ada perubahan
                useEffect(() => {
                    if (game) {
                        const currentState = {
                            piece: game.piece && {
                                type: game.piece.name,
                                rotation: game.piece.rotation,
                                position: {
                                    x: game.piece.x,
                                    y: game.piece.y
                                }
                            },
                            board: game.board,
                            queue: game.bag.map(piece => ({
                                type: piece.name
                            }))
                        };

                        console.log('Current Game Instance:', game);
                        console.log('Processed Game State:', currentState);
                        
                        setGameState(currentState);
                    }
                }, [game?.piece, game?.board, game?.bag]);

                // Update scores
                useEffect(() => {
                    if (points !== scores) setScores(points);
                    if (linesCleared !== lines) setLines(linesCleared);

                    socket.emit('game:update', {
                        points: points,
                        lines: linesCleared
                    });
                }, [points, linesCleared]);

                return (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Enemy Info */}
                        <div className="md:col-span-1">
                            <div className="mb-4">
                                <p className="text-lg">Enemy Points</p>
                                <p className="text-2xl font-bold">{opponent?.data?.points ?? 0}</p>
                            </div>
                            <div>
                                <p className="text-lg">Enemy Lines</p>
                                <p className="text-2xl font-bold">{opponent?.data?.lines ?? 0}</p>
                            </div>
                            <div>
                                <p className="text-lg">Enemy Username</p>
                                <p className="text-2xl font-bold">{enemy || 'Waiting...'}</p>
                            </div>
                        </div>

                        {/* Game Board */}
                        <div className="md:col-span-1">
                            <Gameboard />
                        </div>

                        {/* Player Info */}
                        <div className="md:col-span-1">
                            <div className="mb-4">
                                <p className="text-lg">Next Piece:</p>
                                <PieceQueue />
                            </div>
                            <div className="mb-4">
                                <p className="text-lg">Score:</p>
                                <p className="text-2xl font-bold">{points}</p>
                            </div>
                            <div>
                                <p className="text-lg">Lines:</p>
                                <p className="text-2xl font-bold">{linesCleared}</p>
                            </div>
                        </div>

                        {/* AI Commentator */}
                        <div className="md:col-span-3 mt-4">
                            <GameCommentator
                                points={points}
                                lines={linesCleared}
                                enemyPoints={opponent?.data?.points ?? 0}
                            />
                        </div>
                    </div>
                );
            }}
        </Tetris>
    );
}

export default User1;
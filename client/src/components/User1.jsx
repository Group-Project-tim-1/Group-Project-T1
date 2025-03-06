import Tetris from "react-tetris";
import { socket } from "../socket/socket";
import { useEffect, useState, useRef } from "react";
import GameCommentator from './GameCommentator';
import WinModal from './WinModal';
import LoseModal from './LoseWn';
import { useNavigate } from "react-router-dom";
import { useGameContext } from "../context/GameContext";

function User1({ opponent, enemy }) {
    const { scores, setScores, lines, setLines } = useGameContext();
    const [gameState, setGameState] = useState(null);
    const gameRef = useRef(null);
    const [showWinModal, setShowWinModal] = useState(false);
    const [showLoseModal, setShowLoseModal] = useState(false);
    const navigate = useNavigate();
    const [timeoutId, setTimeoutId] = useState(null); // State untuk menyimpan ID setTimeout

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
        socket.emit('game:update', {
            points: scores,
            lines: lines
        })
    }, [scores, lines])

    useEffect(() => {
        if (scores >= 1000) {
            setShowWinModal(true);
            socket.disconnect();

            const id = setTimeout(() => {
                navigate('/');
            }, 7000);
            setTimeoutId(id);
        } else if (opponent?.data?.points >= 1000) {
            setShowLoseModal(true);
            socket.disconnect();

            const id = setTimeout(() => {
                navigate('/');
            }, 7000);
            setTimeoutId(id);
        }

        return () => {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
        };
    }, [scores, opponent?.data?.points, navigate]);

    const handlePlayAgain = () => {
        setScores(0);
        setLines(0);
        setShowWinModal(false);
        setShowLoseModal(false);
        gameRef.current.reset();
        gameRef.current.start();
    };

    return (
        <>
            <Tetris>
                {({
                    Gameboard,
                    PieceQueue,
                    points,
                    linesCleared,
                    state,
                    controller,
                    game
                }) => {
                    gameRef.current = game;

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
            <WinModal isOpen={showWinModal} onClose={() => setShowWinModal(false)} onButtonClick={handlePlayAgain} />
            <LoseModal isOpen={showLoseModal} onClose={() => setShowLoseModal(false)} onButtonClick={handlePlayAgain} />
        </>
    );
}

export default User1;
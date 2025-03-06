// components/GameContext.js
import { createContext, useState, useContext } from 'react';

const GameContext = createContext();

export const GameProvider = ({ children }) => {
    const [scores, setScores] = useState(0);
    const [lines, setLines] = useState(0);

    const value = {
        scores,
        setScores,
        lines,
        setLines,
    };

    return (
        <GameContext.Provider value={value}>
            {children}
        </GameContext.Provider>
    );
};

export const useGameContext = () => useContext(GameContext);
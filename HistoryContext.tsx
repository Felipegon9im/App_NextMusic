import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { Track } from './data.ts';

const HISTORY_STORAGE_KEY = 'next-music-history';
const MAX_HISTORY_SIZE = 50;

interface HistoryContextType {
  history: Track[];
  addToHistory: (track: Track) => void;
}

const HistoryContext = createContext<HistoryContextType | undefined>(undefined);

export const HistoryProvider = ({ children }: { children: ReactNode }) => {
    const [history, setHistory] = useState<Track[]>(() => {
        try {
            const storedHistory = window.localStorage.getItem(HISTORY_STORAGE_KEY);
            return storedHistory ? JSON.parse(storedHistory) : [];
        } catch (error) {
            console.error("Failed to parse history from localStorage", error);
            return [];
        }
    });

    useEffect(() => {
        try {
            window.localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
        } catch (error) {
            console.error("Failed to save history to localStorage", error);
        }
    }, [history]);

    const addToHistory = (track: Track) => {
        setHistory(prev => {
            // Remove the track if it already exists to move it to the front
            const filteredHistory = prev.filter(t => t.id !== track.id);
            // Add the new track to the beginning
            const newHistory = [track, ...filteredHistory];
            // Cap the history size
            return newHistory.slice(0, MAX_HISTORY_SIZE);
        });
    };

    const value = { history, addToHistory };

    return <HistoryContext.Provider value={value}>{children}</HistoryContext.Provider>;
};

export const useHistory = (): HistoryContextType => {
    const context = useContext(HistoryContext);
    if (context === undefined) {
        throw new Error('useHistory must be used within a HistoryProvider');
    }
    return context;
};
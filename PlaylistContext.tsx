import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { Track, Playlist } from './data.ts';
import { getDefaultPlaylists } from './data.ts';

const LOCAL_STORAGE_KEY = 'next-music-playlists';

interface PlaylistContextType {
  userPlaylists: Playlist[];
  createPlaylist: (name: string) => void;
  deletePlaylist: (name: string) => void;
  addTrackToPlaylist: (playlistName: string, track: Track) => void;
}

const PlaylistContext = createContext<PlaylistContextType | undefined>(undefined);

export const PlaylistProvider = ({ children }: { children: ReactNode }) => {
    const [userPlaylists, setUserPlaylists] = useState<Playlist[]>(() => {
        try {
            const storedPlaylists = window.localStorage.getItem(LOCAL_STORAGE_KEY);
            if (storedPlaylists) {
                return JSON.parse(storedPlaylists);
            }
        } catch (error) {
            console.error("Failed to parse playlists from localStorage", error);
        }
        return getDefaultPlaylists();
    });

    useEffect(() => {
        try {
            window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(userPlaylists));
        } catch (error) {
            console.error("Failed to save playlists to localStorage", error);
        }
    }, [userPlaylists]);

    const createPlaylist = (name: string) => {
        if (userPlaylists.some(pl => pl.name === name)) {
            alert("Uma playlist com este nome já existe.");
            return;
        }
        const newPlaylist: Playlist = { name, tracks: [] };
        setUserPlaylists(prev => [...prev, newPlaylist]);
    };

    const deletePlaylist = (name: string) => {
        setUserPlaylists(prev => prev.filter(pl => pl.name !== name));
    };

    const addTrackToPlaylist = (playlistName: string, track: Track) => {
        setUserPlaylists(prev => 
            prev.map(pl => {
                if (pl.name === playlistName) {
                    // Avoid adding duplicate tracks
                    if (pl.tracks.some(t => t.id === track.id)) {
                        return pl;
                    }
                    return { ...pl, tracks: [...pl.tracks, track] };
                }
                return pl;
            })
        );
    };

    const value = {
        userPlaylists,
        createPlaylist,
        deletePlaylist,
        addTrackToPlaylist,
    };

    return <PlaylistContext.Provider value={value}>{children}</PlaylistContext.Provider>;
};

export const usePlaylists = (): PlaylistContextType => {
    const context = useContext(PlaylistContext);
    if (context === undefined) {
        throw new Error('usePlaylists must be used within a PlaylistProvider');
    }
    return context;
};
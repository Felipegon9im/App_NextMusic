import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { Track, Playlist } from './data.ts';
import { useNotification } from './NotificationContext.tsx';

const LOCAL_STORAGE_KEY = 'next-music-playlists';

interface PlaylistContextType {
  userPlaylists: Playlist[];
  createPlaylist: (name: string, tracks?: Track[]) => void;
  deletePlaylist: (name: string) => void;
  addTrackToPlaylist: (playlistName: string, track: Track) => void;
  removeTrackFromPlaylist: (playlistName: string, trackId: string) => void;
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
        return [];
    });

    const { showNotification } = useNotification();

    useEffect(() => {
        try {
            window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(userPlaylists));
        } catch (error) {
            console.error("Failed to save playlists to localStorage", error);
        }
    }, [userPlaylists]);

    const createPlaylist = (name: string, tracks: Track[] = []) => {
        if (userPlaylists.some(pl => pl.name === name)) {
            // Instead of alert, we can use a notification system in the future.
            showNotification(`A playlist "${name}" já existe.`);
            return;
        }
        const newPlaylist: Playlist = { name, tracks };
        setUserPlaylists(prev => [...prev, newPlaylist]);
        showNotification(`Playlist "${name}" criada!`);
    };

    const deletePlaylist = (name: string) => {
        setUserPlaylists(prev => prev.filter(pl => pl.name !== name));
        showNotification(`Playlist "${name}" apagada.`);
    };

    const addTrackToPlaylist = (playlistName: string, track: Track) => {
        let wasAdded = false;
        setUserPlaylists(prev => 
            prev.map(pl => {
                if (pl.name === playlistName) {
                    if (pl.tracks.some(t => t.id === track.id)) {
                        return pl;
                    }
                    wasAdded = true;
                    return { ...pl, tracks: [...pl.tracks, track] };
                }
                return pl;
            })
        );
        if (wasAdded) {
            showNotification(`Adicionado a "${playlistName}"`);
        } else {
             showNotification(`Esta música já está em "${playlistName}"`);
        }
    };
    
    const removeTrackFromPlaylist = (playlistName: string, trackId: string) => {
        setUserPlaylists(prev =>
            prev.map(pl => {
                if (pl.name === playlistName) {
                    return { ...pl, tracks: pl.tracks.filter(t => t.id !== trackId) };
                }
                return pl;
            })
        );
        showNotification(`Removido de "${playlistName}"`);
    };

    const value = {
        userPlaylists,
        createPlaylist,
        deletePlaylist,
        addTrackToPlaylist,
        removeTrackFromPlaylist,
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
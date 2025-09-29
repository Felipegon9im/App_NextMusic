import React, { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar.tsx';
import { MainView } from './MainView.tsx';
import { Player } from './Player.tsx';
import { BottomNav } from './BottomNav.tsx';
import type { Playlist } from './data.ts';
import { usePlaylists } from './PlaylistContext.tsx';

export type View = 'home' | 'search' | 'ai-playlist' | 'library' | 'playlist';

export const App = () => {
    const [activeView, setActiveView] = useState<View>('home');
    const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [isPlayerExpanded, setIsPlayerExpanded] = useState(false);
    const { userPlaylists } = usePlaylists();

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        // If we are in playlist view but the selected playlist doesn't exist anymore
        if (activeView === 'playlist' && selectedPlaylist) {
            const playlistExists = userPlaylists.some(p => p.name === selectedPlaylist.name);
            if (!playlistExists) {
                // It was deleted, so go back to the library
                setActiveView('library');
                setSelectedPlaylist(null);
            }
        }
    }, [userPlaylists, selectedPlaylist, activeView]);

    const handleSelectPlaylist = (playlist: Playlist) => {
        setSelectedPlaylist(playlist);
        setActiveView('playlist');
    };
    
    const appContainerClasses = `app-container ${isMobile ? 'mobile-view' : ''} ${isPlayerExpanded ? 'player-expanded' : ''}`.trim();

    return (
        <div className={appContainerClasses}>
          {isMobile ? (
            <BottomNav activeView={activeView} setActiveView={setActiveView} />
          ) : (
            <Sidebar 
                activeView={activeView} 
                setActiveView={setActiveView} 
                onSelectPlaylist={handleSelectPlaylist}
            />
          )}
          <MainView 
            activeView={activeView} 
            selectedPlaylist={selectedPlaylist}
            onSelectPlaylist={handleSelectPlaylist}
            setActiveView={setActiveView}
          />
          <Player 
            isMobile={isMobile}
            isPlayerExpanded={isPlayerExpanded}
            setIsPlayerExpanded={setIsPlayerExpanded}
          />
        </div>
    );
};
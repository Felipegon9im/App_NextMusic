import React from 'react';
import { HomeIcon, SearchIcon, LibraryIcon, MagicIcon, PlusIcon } from './Icons.tsx';
import { userPlaylists } from './data.ts';
import { usePlayer } from './PlayerContext.tsx';
import type { View } from './App.tsx';

interface SidebarProps {
  activeView: View;
  setActiveView: (view: View) => void;
}

export const Sidebar = ({ activeView, setActiveView }: SidebarProps) => {
  const { playPlaylist } = usePlayer();

  return (
    <aside className="sidebar">
      <div>
        <div className="sidebar-logo">Next Music</div>
        <nav className="sidebar-nav">
          <ul>
            <li><a onClick={() => setActiveView('home')} className={activeView === 'home' ? 'active' : ''}><HomeIcon /><span>Início</span></a></li>
            <li><a onClick={() => setActiveView('search')} className={activeView === 'search' ? 'active' : ''}><SearchIcon /><span>Buscar</span></a></li>
            <li><a onClick={() => setActiveView('ai-playlist')} className={activeView === 'ai-playlist' ? 'active' : ''}><MagicIcon /><span>AI Playlist</span></a></li>
            <li><a><LibraryIcon /><span>Sua Biblioteca</span></a></li>
          </ul>
        </nav>
      </div>
      <div className="sidebar-playlists">
        <div className="playlist-header">
            <h3>Playlists</h3>
            <button className="icon-button" title="Create Playlist">
                <PlusIcon />
            </button>
        </div>
        <ul>
          {userPlaylists.map(playlist => (
            <li key={playlist.name} onClick={() => playPlaylist(playlist.tracks)}>
              {playlist.name}
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
};
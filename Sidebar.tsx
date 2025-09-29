import React from 'react';
import { HomeIcon, SearchIcon, LibraryIcon, MagicIcon, PlusIcon, TrashIcon } from './Icons.tsx';
import { usePlaylists } from './PlaylistContext.tsx';
import type { View } from './App.tsx';
import type { Playlist } from './data.ts';

interface SidebarProps {
  activeView: View;
  setActiveView: (view: View) => void;
  onSelectPlaylist: (playlist: Playlist) => void;
}

export const Sidebar = ({ activeView, setActiveView, onSelectPlaylist }: SidebarProps) => {
  const { userPlaylists, createPlaylist, deletePlaylist } = usePlaylists();

  const handleCreatePlaylist = (e: React.MouseEvent) => {
    e.stopPropagation();
    const playlistName = prompt('Nome da nova playlist:');
    if (playlistName) {
      createPlaylist(playlistName);
    }
  };

  const handleDeletePlaylist = (e: React.MouseEvent, playlistName: string) => {
    e.stopPropagation();
    if (window.confirm(`Tem certeza que quer apagar a playlist "${playlistName}"?`)) {
      deletePlaylist(playlistName);
    }
  };

  return (
    <aside className="sidebar">
      <div>
        <div className="sidebar-logo">Next Music</div>
        <nav className="sidebar-nav">
          <ul>
            <li><a onClick={() => setActiveView('home')} className={activeView === 'home' ? 'active' : ''}><HomeIcon /><span>Início</span></a></li>
            <li><a onClick={() => setActiveView('search')} className={activeView === 'search' ? 'active' : ''}><SearchIcon /><span>Buscar</span></a></li>
            <li><a onClick={() => setActiveView('ai-playlist')} className={activeView === 'ai-playlist' ? 'active' : ''}><MagicIcon /><span>AI Playlist</span></a></li>
          </ul>
        </nav>
      </div>
      <div className="sidebar-playlists">
        <div className="playlist-header" onClick={() => setActiveView('library')}>
            <div className="playlist-header-title">
                <LibraryIcon />
                <span>Sua Biblioteca</span>
            </div>
            <button className="icon-button" title="Create Playlist" onClick={handleCreatePlaylist}>
                <PlusIcon />
            </button>
        </div>
        <ul>
          {userPlaylists.map(playlist => (
            <li key={playlist.name} onClick={() => onSelectPlaylist(playlist)}>
              <span style={{ flexGrow: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {playlist.name}
              </span>
              <button
                className="delete-button"
                title="Apagar playlist"
                onClick={(e) => handleDeletePlaylist(e, playlist.name)}
              >
                <TrashIcon />
              </button>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
};
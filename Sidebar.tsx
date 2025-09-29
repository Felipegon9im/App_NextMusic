import React from 'react';
import { HomeIcon, SearchIcon, LibraryIcon } from './Icons.tsx';
import { userPlaylists } from './data.ts';
import { usePlayer } from './PlayerContext.tsx';

export const Sidebar = () => {
  const { playPlaylist } = usePlayer();

  return (
    <aside className="sidebar">
      <div>
        <div className="sidebar-logo">Next Music</div>
        <nav className="sidebar-nav">
          <ul>
            <li><a href="#" className="active"><HomeIcon /><span>Início</span></a></li>
            <li><a href="#"><SearchIcon /><span>Buscar</span></a></li>
            <li><a href="#"><LibraryIcon /><span>Sua Biblioteca</span></a></li>
          </ul>
        </nav>
      </div>
      <div className="sidebar-playlists">
        <h3>Playlists</h3>
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
import React from 'react';
import { Sidebar } from './Sidebar.tsx';
import { MainView } from './MainView.tsx';
import { Player } from './Player.tsx';
import { PlayerProvider } from './PlayerContext.tsx';

export const App = () => (
    <div className="app-container">
      <Sidebar />
      <MainView />
      <Player />
    </div>
);
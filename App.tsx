import React from 'https://esm.sh/react@18.2.0';
import { Sidebar } from './Sidebar.tsx';
import { MainView } from './MainView.tsx';
import { Player } from './Player.tsx';

export const App = () => (
  <div className="app-container">
    <Sidebar />
    <MainView />
    <Player />
  </div>
);

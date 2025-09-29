import React, { useState } from 'react';
import { Sidebar } from './Sidebar.tsx';
import { MainView } from './MainView.tsx';
import { Player } from './Player.tsx';

export type View = 'home' | 'search' | 'ai-playlist';

export const App = () => {
    const [activeView, setActiveView] = useState<View>('home');

    return (
        <div className="app-container">
          <Sidebar activeView={activeView} setActiveView={setActiveView} />
          <MainView activeView={activeView} />
          <Player />
        </div>
    );
};
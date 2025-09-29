import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App.tsx';
import { PlayerProvider } from './PlayerContext.tsx';
import { PlaylistProvider } from './PlaylistContext.tsx';
import { NotificationProvider } from './NotificationContext.tsx';
import { HistoryProvider } from './HistoryContext.tsx';

const container = document.getElementById('root');
const root = ReactDOM.createRoot(container!);
root.render(
  <React.StrictMode>
    <NotificationProvider>
      <HistoryProvider>
        <PlayerProvider>
          <PlaylistProvider>
            <App />
          </PlaylistProvider>
        </PlayerProvider>
      </HistoryProvider>
    </NotificationProvider>
  </React.StrictMode>
);
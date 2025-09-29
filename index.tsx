import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App.tsx';
import { PlayerProvider } from './PlayerContext.tsx';

const container = document.getElementById('root');
const root = ReactDOM.createRoot(container!);
root.render(
  <React.StrictMode>
    <PlayerProvider>
      <App />
    </PlayerProvider>
  </React.StrictMode>
);
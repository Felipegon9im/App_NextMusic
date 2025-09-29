import React from 'react';
import { HomeIcon, SearchIcon, LibraryIcon } from './Icons.tsx';
import type { View } from './App.tsx';

interface BottomNavProps {
  activeView: View;
  setActiveView: (view: View) => void;
}

export const BottomNav = ({ activeView, setActiveView }: BottomNavProps) => {
  return (
    <nav className="bottom-nav">
      <a onClick={() => setActiveView('home')} className={activeView === 'home' ? 'active' : ''}>
        <HomeIcon />
        <span>Início</span>
      </a>
      <a onClick={() => setActiveView('search')} className={activeView === 'search' ? 'active' : ''}>
        <SearchIcon />
        <span>Buscar</span>
      </a>
      <a onClick={() => setActiveView('library')} className={activeView === 'library' ? 'active' : ''}>
        <LibraryIcon />
        <span>Sua Biblioteca</span>
      </a>
    </nav>
  );
};

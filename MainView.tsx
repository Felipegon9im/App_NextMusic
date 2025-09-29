import React from 'react';
import { mainContentCards } from './data.ts';
import { usePlayer } from './PlayerContext.tsx';
import type { Track } from './data.ts';

interface CardProps {
  title: string;
  description: string;
  imageUrl: string;
  tracks: Track[];
}

const Card = ({ title, description, imageUrl, tracks }: CardProps) => {
  const { playPlaylist } = usePlayer();
  
  const handlePlay = () => {
    playPlaylist(tracks);
  };

  return (
    <div className="card" onClick={handlePlay}>
      <img src={imageUrl} alt={title} />
      <h4>{title}</h4>
      <p>{description}</p>
    </div>
  );
};

export const MainView = () => (
  <main className="main-view">
    <h1>Boa noite</h1>
    <div className="card-grid">
      {mainContentCards.map(card => (
        <Card
          key={card.title}
          {...card}
        />
      ))}
    </div>
  </main>
);
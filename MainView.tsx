import React from 'react';
import { mainContentCards } from './data.ts';

interface CardProps {
  title: string;
  description: string;
  imageUrl: string;
}

const Card = ({ title, description, imageUrl }: CardProps) => (
  <div className="card">
    <img src={imageUrl} alt={title} />
    <h4>{title}</h4>
    <p>{description}</p>
  </div>
);

export const MainView = () => (
  <main className="main-view">
    <h1>Boa noite</h1>
    <div className="card-grid">
      {mainContentCards.map(card => (
        // FIX: The `key` prop is handled by React and should not be in `CardProps`.
        // Spreading props resolves the TypeScript error.
        <Card
          key={card.title}
          {...card}
        />
      ))}
    </div>
  </main>
);
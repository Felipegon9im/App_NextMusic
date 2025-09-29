import React from 'https://esm.sh/react@18.2.0';
import { mainContentCards } from './data.ts';

export const MainView = () => (
  <main className="main-view">
    <h1>Boa noite</h1>
    <div className="card-grid">
      {mainContentCards.map(card => (
        <div className="card" key={card.title}>
          <img src={card.imageUrl} alt={card.title} />
          <h4>{card.title}</h4>
          <p>{card.description}</p>
        </div>
      ))}
    </div>
  </main>
);

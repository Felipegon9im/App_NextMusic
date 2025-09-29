import React, { useState, useEffect } from 'react';
import { mainContentCards, searchYoutube } from './data.ts';
import { usePlayer } from './PlayerContext.tsx';
import type { Track } from './data.ts';
import type { View } from './App.tsx';
import { SearchIcon } from './Icons.tsx';


const Home = () => {
  const { playPlaylist } = usePlayer();

  const Card = ({ title, description, imageUrl, tracks }: {
    title: string;
    description: string;
    imageUrl: string;
    tracks: Track[];
  }) => {
    const handlePlay = () => playPlaylist(tracks);

    return (
      <div className="card" onClick={handlePlay}>
        <img src={imageUrl} alt={title} />
        <h4>{title}</h4>
        <p>{description}</p>
      </div>
    );
  };

  return (
    <>
      <h1>Boa noite</h1>
      <div className="card-grid">
        {mainContentCards.map(card => (
          <Card
            key={card.title}
            {...card}
          />
        ))}
      </div>
    </>
  );
};

const Search = () => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<Track[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { playPlaylist } = usePlayer();

    useEffect(() => {
        const debounceTimer = setTimeout(() => {
            if (query) {
                setLoading(true);
                setError(null);
                searchYoutube(query)
                    .then(setResults)
                    .catch(err => setError(err.message))
                    .finally(() => setLoading(false));
            } else {
                setResults([]);
            }
        }, 500); // Debounce API calls

        return () => clearTimeout(debounceTimer);
    }, [query]);

    return (
        <div className="search-view">
            <div className="search-input-container">
                <SearchIcon />
                <input
                    type="text"
                    className="search-input"
                    placeholder="O que você quer ouvir?"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                />
            </div>
            {loading && <p className="loading-indicator">Buscando...</p>}
            {error && <p className="error-message">Erro: {error}</p>}
            <ul className="search-results-list">
                {results.map(track => (
                    <li key={track.id} className="search-result-item" onClick={() => playPlaylist([track])}>
                        <img src={track.albumArt} alt={track.title} />
                        <div className="track-info">
                            <span className="track-title">{track.title}</span>
                            <span className="track-artist">{track.artist}</span>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    )
}

interface MainViewProps {
  activeView: View;
}

export const MainView = ({ activeView }: MainViewProps) => {
  switch (activeView) {
    case 'search':
      return <Search />;
    case 'home':
    default:
      return <Home />;
  }
};
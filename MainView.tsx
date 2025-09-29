import React, { useState, useEffect, useRef } from 'react';
import { mainContentCards, searchYoutube, getTrendingMusic } from './data.ts';
import { usePlayer } from './PlayerContext.tsx';
import { usePlaylists } from './PlaylistContext.tsx';
import { useHistory } from './HistoryContext.tsx';
import type { Track, Playlist } from './data.ts';
import type { View } from './App.tsx';
import { SearchIcon, PlayIcon, TrashIcon, PlusIcon } from './Icons.tsx';
import { AIPlaylist } from './AIPlaylist.tsx';
import { AddToPlaylistPopover } from './AddToPlaylistPopover.tsx';

const TrackCard = ({ track, playPlaylist }: { track: Track, playPlaylist: (tracks: Track[]) => void }) => {
    const handlePlay = (e: React.MouseEvent) => {
        e.stopPropagation();
        playPlaylist([track]);
    };

    return (
      <div className="card" onClick={handlePlay}>
        <img src={track.albumArt} alt={track.title} />
        <h4>{track.title}</h4>
        <p>{track.artist}</p>
        <button className="play-button-overlay" onClick={handlePlay}>
            <PlayIcon />
        </button>
      </div>
    );
};


const Home = ({ onSelectPlaylist } : { onSelectPlaylist: (playlist: Playlist) => void }) => {
  const { playPlaylist } = usePlayer();
  const [trending, setTrending] = useState<Track[]>([]);
  const [loadingTrending, setLoadingTrending] = useState(true);

  useEffect(() => {
    getTrendingMusic()
        .then(setTrending)
        .catch(err => {
            console.error("Failed to fetch trending music:", err);
            // Optionally set an error state to show in the UI
        })
        .finally(() => setLoadingTrending(false));
  }, []);

  const Card = ({ title, description, imageUrl, tracks }: {
    title: string;
    description: string;
    imageUrl: string;
    tracks: Track[];
  }) => {
    const handlePlay = (e: React.MouseEvent) => {
        e.stopPropagation();
        playPlaylist(tracks);
    };

    const handleViewPlaylist = () => {
        onSelectPlaylist({name: title, tracks});
    };

    return (
      <div className="card" onClick={handleViewPlaylist}>
        <img src={imageUrl} alt={title} />
        <h4>{title}</h4>
        <p>{description}</p>
        <button className="play-button-overlay" onClick={handlePlay}>
            <PlayIcon />
        </button>
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
      
      {loadingTrending && <p className="loading-indicator" style={{marginTop: '2rem'}}>Carregando tendências...</p>}
      {trending.length > 0 && (
          <div style={{marginTop: '2.5rem'}}>
              <h2>Em alta no Brasil</h2>
              <div className="card-grid">
                  {trending.map(track => (
                      <TrackCard key={track.id} track={track} playPlaylist={playPlaylist} />
                  ))}
              </div>
          </div>
      )}
    </>
  );
};

const Library = ({ onSelectPlaylist }: { onSelectPlaylist: (playlist: Playlist) => void }) => {
    const { userPlaylists, deletePlaylist } = usePlaylists();
    const { playPlaylist } = usePlayer();
    const { history } = useHistory();

    const Card = ({ playlist }: { playlist: Playlist }) => {
        const handlePlay = (e: React.MouseEvent) => {
            e.stopPropagation();
            if (playlist.tracks.length > 0) {
                playPlaylist(playlist.tracks);
            }
        };

        const handleDelete = (e: React.MouseEvent) => {
            e.stopPropagation();
            if (window.confirm(`Tem certeza que quer apagar a playlist "${playlist.name}"?`)) {
                deletePlaylist(playlist.name);
            }
        };

        return (
            <div className="card" onClick={() => onSelectPlaylist(playlist)}>
                <button className="delete-button-overlay" onClick={handleDelete} title="Apagar playlist">
                    <TrashIcon />
                </button>
                <img src={playlist.tracks[0]?.albumArt || 'https://picsum.photos/300/300?random=' + playlist.name} alt={playlist.name} />
                <h4>{playlist.name}</h4>
                <p>{playlist.tracks.length} {playlist.tracks.length === 1 ? 'música' : 'músicas'}</p>
                 {playlist.tracks.length > 0 && (
                    <button className="play-button-overlay" onClick={handlePlay}>
                        <PlayIcon />
                    </button>
                 )}
            </div>
        );
    };

    return (
        <>
            <h1>Sua Biblioteca</h1>
            
            {history.length > 0 && (
                 <div style={{marginBottom: '2.5rem'}}>
                    <h2>Ouvido recentemente</h2>
                    <div className="card-grid">
                        {history.map((track, index) => (
                            <TrackCard key={`${track.id}-${index}`} track={track} playPlaylist={playPlaylist} />
                        ))}
                    </div>
                </div>
            )}

            { userPlaylists.length > 0 && <h2>Suas Playlists</h2> }
            
            {userPlaylists.length > 0 ? (
                <div className="card-grid">
                    {userPlaylists.map(playlist => (
                        <Card key={playlist.name} playlist={playlist} />
                    ))}
                </div>
            ) : (
                <p className="empty-state-message">Sua biblioteca está vazia. Crie sua primeira playlist!</p>
            )}
        </>
    );
};


const PlaylistView = ({ playlist } : { playlist: Playlist | null }) => {
    const { playPlaylist } = usePlayer();
    const { removeTrackFromPlaylist } = usePlaylists();

    if (!playlist) return <div>Selecione uma playlist para ver.</div>

    const handlePlayTrack = (trackIndex: number) => {
        playPlaylist(playlist.tracks, trackIndex);
    };
    
    const handleRemoveTrack = (e: React.MouseEvent, trackId: string) => {
        e.stopPropagation();
        if (playlist) {
            removeTrackFromPlaylist(playlist.name, trackId);
        }
    };

    return (
        <div className="playlist-view">
            <div className="playlist-view-header">
                 <img src={playlist.tracks[0]?.albumArt || 'https://picsum.photos/300/300?random=' + playlist.name} alt={playlist.name} />
                 <div className="playlist-view-header-details">
                    <p>Playlist</p>
                    <h1>{playlist.name}</h1>
                    <p>{playlist.tracks.length} músicas</p>
                 </div>
            </div>
            {playlist.tracks.length > 0 ? (
                <ul className="playlist-track-list search-results-list">
                    {playlist.tracks.map((track, index) => (
                        <li key={track.id + index} className="search-result-item" onClick={() => handlePlayTrack(index)}>
                            <span className="track-number">{index + 1}</span>
                            <img src={track.albumArt} alt={track.title} />
                            <div className="track-info">
                                <span className="track-title">{track.title}</span>
                                <span className="track-artist">{track.artist}</span>
                            </div>
                            <div className="track-actions">
                                <button className="icon-button" onClick={(e) => handleRemoveTrack(e, track.id)} title="Remover da playlist">
                                    <TrashIcon />
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="empty-state-message">Esta playlist está vazia. Adicione algumas músicas!</p>
            )}
        </div>
    )
};

const Search = () => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<Track[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasSearched, setHasSearched] = useState(false);
    const { playPlaylist } = usePlayer();
    const [popover, setPopover] = useState({ show: false, anchorEl: null as HTMLElement | null, track: null as Track | null });


    useEffect(() => {
        const debounceTimer = setTimeout(() => {
            if (query) {
                setLoading(true);
                setError(null);
                setHasSearched(true);
                searchYoutube(query)
                    .then(setResults)
                    .catch(err => setError(err.message))
                    .finally(() => setLoading(false));
            } else {
                setResults([]);
                setHasSearched(false);
            }
        }, 500); // Debounce API calls

        return () => clearTimeout(debounceTimer);
    }, [query]);

    const handleOpenPopover = (e: React.MouseEvent<HTMLButtonElement>, track: Track) => {
        e.stopPropagation();
        setPopover({ show: true, anchorEl: e.currentTarget, track });
    };

    const closePopover = () => {
        setPopover({ show: false, anchorEl: null, track: null });
    };

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
                    aria-label="Search for music"
                />
            </div>
            {loading && <p className="loading-indicator">Buscando...</p>}
            {error && <p className="error-message">Erro: {error}</p>}
            {!loading && hasSearched && results.length === 0 && (
                <p className="empty-state-message">Nenhum resultado encontrado para "{query}".</p>
            )}
            <ul className="search-results-list" aria-live="polite">
                {results.map(track => (
                    <li
                        key={track.id}
                        className="search-result-item"
                        onClick={() => playPlaylist([track])}
                    >
                        <img src={track.albumArt} alt={track.title} />
                        <div className="track-info">
                            <span className="track-title">{track.title}</span>
                            <span className="track-artist">{track.artist}</span>
                        </div>
                        <div className="track-actions">
                            <button className="icon-button" title="Adicionar à playlist" onClick={(e) => handleOpenPopover(e, track)}>
                                <PlusIcon />
                            </button>
                        </div>
                    </li>
                ))}
            </ul>
             <AddToPlaylistPopover
                anchorEl={popover.anchorEl}
                show={popover.show}
                onClose={closePopover}
                track={popover.track}
            />
        </div>
    )
}

interface MainViewProps {
  activeView: View;
  selectedPlaylist: Playlist | null;
  onSelectPlaylist: (playlist: Playlist) => void;
  setActiveView: (view: View) => void;
}

export const MainView = ({ activeView, selectedPlaylist, onSelectPlaylist }: MainViewProps) => {
  switch (activeView) {
    case 'search':
      return <Search />;
    case 'ai-playlist':
      return <AIPlaylist />;
    case 'library':
        return <Library onSelectPlaylist={onSelectPlaylist} />;
    case 'playlist':
        return <PlaylistView playlist={selectedPlaylist} />;
    case 'home':
    default:
      return <Home onSelectPlaylist={onSelectPlaylist} />;
  }
};
import React, { useState, useEffect, useRef } from 'react';
import { mainContentCards, searchYoutube } from './data.ts';
import { usePlayer } from './PlayerContext.tsx';
import { usePlaylists } from './PlaylistContext.tsx';
import type { Track, Playlist } from './data.ts';
import type { View } from './App.tsx';
import { SearchIcon, PlayIcon, TrashIcon, PlusIcon } from './Icons.tsx';
import { AIPlaylist } from './AIPlaylist.tsx';


const Home = ({ onSelectPlaylist } : { onSelectPlaylist: (playlist: Playlist) => void }) => {
  const { playPlaylist } = usePlayer();

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
    </>
  );
};

const Library = ({ onSelectPlaylist }: { onSelectPlaylist: (playlist: Playlist) => void }) => {
    const { userPlaylists, deletePlaylist } = usePlaylists();
    const { playPlaylist } = usePlayer();

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
            <div className="card-grid">
                {userPlaylists.map(playlist => (
                    <Card key={playlist.name} playlist={playlist} />
                ))}
            </div>
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
        </div>
    )
};


const AddToPlaylistPopover = ({ anchorEl, show, onClose, track }: { anchorEl: HTMLElement | null, show: boolean, onClose: () => void, track: Track | null }) => {
    const { userPlaylists, addTrackToPlaylist } = usePlaylists();

    if (!show || !track || !anchorEl) return null;

    const handleAdd = (playlist: Playlist) => {
        addTrackToPlaylist(playlist.name, track);
        onClose();
    };
    
    const rect = anchorEl.getBoundingClientRect();
    const style = {
      top: rect.bottom + 8,
      left: rect.left - 180, // Adjust to align better
    };

    return (
        <>
            <div className="context-menu-overlay" onClick={onClose}></div>
            <div className="context-menu" style={style}>
                 <div className="context-menu-header">Adicionar à playlist</div>
                 {userPlaylists.length > 0 ? (
                    userPlaylists.map(pl => (
                        <div key={pl.name} className="context-menu-item" onClick={() => handleAdd(pl)}>
                            {pl.name}
                        </div>
                    ))
                ) : (
                    <div className="context-menu-item" style={{ fontStyle: 'italic', color: 'var(--text-subdued)'}}>
                        Nenhuma playlist
                    </div>
                )}
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
    const [popover, setPopover] = useState({ show: false, anchorEl: null as HTMLElement | null, track: null as Track | null });


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
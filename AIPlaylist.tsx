import React, { useState } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import { MagicIcon, PlusIcon } from './Icons.tsx';
import { searchYoutube, Track, Playlist } from './data.ts';
import { usePlayer } from './PlayerContext.tsx';
import { usePlaylists } from './PlaylistContext.tsx';
import { AddToPlaylistPopover } from './AddToPlaylistPopover.tsx';

// This component is created with the assumption that the API_KEY is set in the environment.
// As per instructions, this component must not ask the user for the key.
const API_KEY = process.env.API_KEY;

const loadingMessages = [
    "Consultando nosso DJ de IA...",
    "Criando a sua vibe perfeita...",
    "Buscando músicas no cosmos...",
    "Mixando uma playlist fresquinha...",
    "Aquecendo os sintetizadores...",
];

export const AIPlaylist = () => {
    const [prompt, setPrompt] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [playlist, setPlaylist] = useState<Track[] | null>(null);
    const [playlistName, setPlaylistName] = useState('');
    const [currentLoadingMessage, setCurrentLoadingMessage] = useState(loadingMessages[0]);
    const { playPlaylist } = usePlayer();
    const { createPlaylist } = usePlaylists();
    const [popover, setPopover] = useState({ show: false, anchorEl: null as HTMLElement | null, track: null as Track | null });


    const generatePlaylist = async () => {
        if (!API_KEY) {
            setError("A chave da API não está configurada. Por favor, entre em contato com o administrador.");
            return;
        }
        setLoading(true);
        setError(null);
        setPlaylist(null);

        const messageInterval = setInterval(() => {
            setCurrentLoadingMessage(loadingMessages[Math.floor(Math.random() * loadingMessages.length)]);
        }, 2000);

        try {
            const ai = new GoogleGenAI({ apiKey: API_KEY });
            
            const model = 'gemini-2.5-flash';
            const schema = {
              type: Type.OBJECT,
              properties: {
                playlistName: { type: Type.STRING },
                songs: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      title: { type: Type.STRING },
                      artist: { type: Type.STRING },
                    },
                    required: ['title', 'artist'],
                  },
                },
              },
              required: ['playlistName', 'songs'],
            };

            const fullPrompt = `You are a world-class music recommender. Based on the following description, create a playlist of 10 songs. Description: "${prompt}"`;

            const response = await ai.models.generateContent({
                model,
                contents: fullPrompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: schema,
                },
            });

            const jsonResponse = JSON.parse(response.text);
            const { playlistName: name, songs } = jsonResponse;
            
            setPlaylistName(name);

            const trackPromises = songs.map((song: { title: string; artist: string }) => 
                searchYoutube(`${song.title} ${song.artist}`).then(results => results[0]).catch(() => null)
            );

            const tracks = (await Promise.all(trackPromises)).filter((track): track is Track => track !== null);
            setPlaylist(tracks);

        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Falha ao gerar a playlist.');
        } finally {
            setLoading(false);
            clearInterval(messageInterval);
        }
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        generatePlaylist();
    };

    const handleSavePlaylist = () => {
        if (playlistName && playlist && playlist.length > 0) {
            createPlaylist(playlistName, playlist);
            alert(`Playlist "${playlistName}" salva!`);
        }
    };
    
    const handleOpenPopover = (e: React.MouseEvent<HTMLButtonElement>, track: Track) => {
        e.stopPropagation();
        setPopover({ show: true, anchorEl: e.currentTarget, track });
    };

    const closePopover = () => {
        setPopover({ show: false, anchorEl: null, track: null });
    };

    return (
        <div className="ai-playlist-view">
            <h1><MagicIcon /> Criador de Playlists IA</h1>
            <p>Descreva o tipo de música que você quer ouvir, um humor ou uma atividade, e deixe a IA criar uma playlist customizada para você.</p>

            <form className="ai-prompt-form" onSubmit={handleSubmit}>
                <textarea
                    className="ai-prompt-input"
                    placeholder="ex: Indie rock animado para uma viagem de verão"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    aria-label="Playlist description prompt"
                />
                <button type="submit" className="ai-submit-button" disabled={loading || !prompt}>
                    {loading ? 'Gerando...' : 'Criar Playlist'}
                </button>
            </form>

            {loading && <div className="loading-indicator">{currentLoadingMessage}</div>}
            {error && <div className="error-message">Erro: {error}</div>}

            {playlist && (
                <div className="ai-playlist-results">
                    <div className="ai-playlist-header">
                        <h2>{playlistName}</h2>
                        <button className="ai-submit-button" onClick={handleSavePlaylist}>Salvar Playlist</button>
                    </div>
                    <ul className="search-results-list">
                        {playlist.map(track => (
                            <li key={track.id} className="search-result-item" onClick={() => playPlaylist([track])}>
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
                </div>
            )}
             <AddToPlaylistPopover
                anchorEl={popover.anchorEl}
                show={popover.show}
                onClose={closePopover}
                track={popover.track}
            />
        </div>
    );
};
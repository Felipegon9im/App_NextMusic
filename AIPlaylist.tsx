import React, { useState } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import { MagicIcon } from './Icons.tsx';
import { searchYoutube, Track } from './data.ts';
import { usePlayer } from './PlayerContext.tsx';

// This component is created with the assumption that the API_KEY is set in the environment.
// As per instructions, this component must not ask the user for the key.
const API_KEY = process.env.API_KEY;

const loadingMessages = [
    "Consulting our AI DJ...",
    "Crafting your perfect vibe...",
    "Searching the cosmos for tunes...",
    "Mixing up a fresh playlist...",
    "Warming up the synthesizers...",
];

export const AIPlaylist = () => {
    const [prompt, setPrompt] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [playlist, setPlaylist] = useState<Track[] | null>(null);
    const [playlistName, setPlaylistName] = useState('');
    const [currentLoadingMessage, setCurrentLoadingMessage] = useState(loadingMessages[0]);
    const { playPlaylist } = usePlayer();

    const generatePlaylist = async () => {
        if (!API_KEY) {
            setError("API key is not configured. Please contact the administrator.");
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
            setError(err.message || 'Failed to generate playlist.');
        } finally {
            setLoading(false);
            clearInterval(messageInterval);
        }
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        generatePlaylist();
    };

    return (
        <div className="ai-playlist-view">
            <h1><MagicIcon /> AI Playlist Creator</h1>
            <p>Describe the kind of music you want to hear, a mood, or an activity, and let AI create a custom playlist for you.</p>

            <form className="ai-prompt-form" onSubmit={handleSubmit}>
                <textarea
                    className="ai-prompt-input"
                    placeholder="e.g., Upbeat indie rock for a summer road trip"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    aria-label="Playlist description prompt"
                />
                <button type="submit" className="ai-submit-button" disabled={loading || !prompt}>
                    {loading ? 'Generating...' : 'Create Playlist'}
                </button>
            </form>

            {loading && <div className="loading-indicator">{currentLoadingMessage}</div>}
            {error && <div className="error-message">Error: {error}</div>}

            {playlist && (
                <div className="ai-playlist-results">
                    <h2>{playlistName}</h2>
                    <ul className="search-results-list">
                        {playlist.map(track => (
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
            )}
        </div>
    );
};

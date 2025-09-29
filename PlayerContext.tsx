import React, { createContext, useContext, useState, useRef, useEffect, ReactNode } from 'react';
import type { Track } from './data.ts';

interface PlayerContextType {
  isPlaying: boolean;
  currentTrack: Track | null;
  playlist: Track[];
  progress: number;
  duration: number;
  playPlaylist: (tracks: Track[], startIndex?: number) => void;
  togglePlay: () => void;
  playNext: () => void;
  playPrevious: () => void;
  seekTo: (time: number) => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export const PlayerProvider = ({ children }: { children: ReactNode }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playlist, setPlaylist] = useState<Track[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    audioRef.current = new Audio();
    
    const audio = audioRef.current;

    const handleTimeUpdate = () => setProgress(audio.currentTime);
    const handleLoadedMetadata = () => setDuration(audio.duration);
    const handleEnded = () => playNext();

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  const currentTrack = playlist[currentIndex] || null;

  useEffect(() => {
    if (audioRef.current && currentTrack) {
      audioRef.current.src = currentTrack.audioSrc;
      if (isPlaying) {
         audioRef.current.play().catch(e => console.error("Error playing audio:", e));
      }
    }
  }, [currentIndex, playlist]);

  const playPlaylist = (tracks: Track[], startIndex = 0) => {
    setPlaylist(tracks);
    setCurrentIndex(startIndex);
    setIsPlaying(true);
  };
  
  const togglePlay = () => {
      if (!currentTrack) return;
      if (isPlaying) {
        audioRef.current?.pause();
      } else {
        audioRef.current?.play().catch(e => console.error("Error playing audio:", e));
      }
      setIsPlaying(!isPlaying);
  };

  const playNext = () => {
      if (!playlist.length) return;
      const nextIndex = (currentIndex + 1) % playlist.length;
      setCurrentIndex(nextIndex);
  };

  const playPrevious = () => {
      if (!playlist.length) return;
      const prevIndex = (currentIndex - 1 + playlist.length) % playlist.length;
      setCurrentIndex(prevIndex);
  };
  
  const seekTo = (time: number) => {
      if(audioRef.current) {
          audioRef.current.currentTime = time;
          setProgress(time);
      }
  };


  const value = {
    isPlaying,
    currentTrack,
    playlist,
    progress,
    duration,
    playPlaylist,
    togglePlay,
    playNext,
    playPrevious,
    seekTo,
  };

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
};

export const usePlayer = (): PlayerContextType => {
  const context = useContext(PlayerContext);
  if (context === undefined) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
};
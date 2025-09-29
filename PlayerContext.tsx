import React, { createContext, useContext, useState, useRef, useEffect, ReactNode } from 'react';
import type { Track } from './data.ts';

declare global {
  interface Window {
    onYouTubeIframeAPIReady: () => void;
    YT: any;
  }
}

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
  const playerRef = useRef<any>(null);
  // FIX: Initialize useRef with null and use a more flexible type for the interval ID to avoid potential type errors.
  const progressInterval = useRef<any>(null);

  const [playlist, setPlaylist] = useState<Track[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const onPlayerStateChange = (event: any) => {
      if (event.data === window.YT.PlayerState.PLAYING) {
        setIsPlaying(true);
        setDuration(playerRef.current?.getDuration() ?? 0);
        
        clearInterval(progressInterval.current);
        progressInterval.current = setInterval(() => {
          const currentTime = playerRef.current?.getCurrentTime() ?? 0;
          setProgress(currentTime);
        }, 250);

        const newIndex = playerRef.current?.getPlaylistIndex();
        if (typeof newIndex === 'number' && newIndex !== currentIndex) {
            setCurrentIndex(newIndex);
        }

      } else {
        setIsPlaying(false);
        clearInterval(progressInterval.current);
      }
      
      if (event.data === window.YT.PlayerState.ENDED) {
        playNext();
      }
    };
    
    window.onYouTubeIframeAPIReady = () => {
      playerRef.current = new window.YT.Player('youtube-player', {
        height: '390',
        width: '640',
        playerVars: {
          'playsinline': 1,
          'controls': 0,
        },
        events: {
          'onStateChange': onPlayerStateChange
        }
      });
    };

    if (window.YT && window.YT.Player) {
      window.onYouTubeIframeAPIReady();
    }

    return () => {
        clearInterval(progressInterval.current);
        playerRef.current?.destroy();
    }
  }, []);

  const currentTrack = playlist[currentIndex] || null;

  const playPlaylist = (tracks: Track[], startIndex = 0) => {
    setPlaylist(tracks);
    setCurrentIndex(startIndex);
    setIsPlaying(true);
    if (playerRef.current?.loadPlaylist) {
        const videoIds = tracks.map(t => t.videoId);
        playerRef.current.loadPlaylist(videoIds, startIndex);
    }
  };
  
  const togglePlay = () => {
      if (!currentTrack || !playerRef.current) return;
      const playerState = playerRef.current.getPlayerState();
      if (playerState === window.YT.PlayerState.PLAYING) {
        playerRef.current.pauseVideo();
      } else {
        playerRef.current.playVideo();
      }
  };

  const playNext = () => {
      if (!playlist.length || !playerRef.current) return;
      playerRef.current.nextVideo();
  };

  const playPrevious = () => {
      if (!playlist.length || !playerRef.current) return;
      playerRef.current.previousVideo();
  };
  
  const seekTo = (time: number) => {
      if(playerRef.current) {
          playerRef.current.seekTo(time, true);
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

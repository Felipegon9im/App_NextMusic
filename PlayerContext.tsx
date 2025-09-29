import React, { createContext, useContext, useState, useRef, useEffect, ReactNode, useCallback } from 'react';
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
  volume: number;
  playPlaylist: (tracks: Track[], startIndex?: number) => void;
  togglePlay: () => void;
  playNext: () => void;
  playPrevious: () => void;
  seekTo: (time: number) => void;
  setVolume: (volume: number) => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export const PlayerProvider = ({ children }: { children: ReactNode }) => {
  const playerRef = useRef<any>(null);
  const progressInterval = useRef<number | undefined>(undefined);

  const [playlist, setPlaylist] = useState<Track[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(1);

  const playNext = useCallback(() => {
      if (!playlist.length || !playerRef.current) return;
      playerRef.current.nextVideo();
  }, [playlist]);

  const playPrevious = useCallback(() => {
      if (!playlist.length || !playerRef.current) return;
      playerRef.current.previousVideo();
  }, [playlist]);

  const callbacksRef = useRef({
    onPlayerReady: (_event: any) => {},
    onPlayerStateChange: (_event: any) => {},
  });

  useEffect(() => {
    callbacksRef.current.onPlayerReady = (event: any) => {
        event.target.setVolume(volume * 100);
    };

    callbacksRef.current.onPlayerStateChange = (event: any) => {
      if (event.data === window.YT.PlayerState.PLAYING) {
        setIsPlaying(true);
        setDuration(playerRef.current?.getDuration() ?? 0);
        
        clearInterval(progressInterval.current);
        progressInterval.current = window.setInterval(() => {
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
  }, [volume, currentIndex, playNext]);
  
  useEffect(() => {
    const createPlayer = () => {
      if (playerRef.current) {
        playerRef.current.destroy();
      }
      playerRef.current = new window.YT.Player('youtube-player', {
        height: '390',
        width: '640',
        playerVars: {
          'playsinline': 1,
          'controls': 0,
        },
        events: {
          'onReady': (event: any) => callbacksRef.current.onPlayerReady(event),
          'onStateChange': (event: any) => callbacksRef.current.onPlayerStateChange(event)
        }
      });
    };
    
    if (window.YT && window.YT.Player) {
      createPlayer();
    } else {
      window.onYouTubeIframeAPIReady = createPlayer;
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
  
  const seekTo = (time: number) => {
      if(playerRef.current) {
          playerRef.current.seekTo(time, true);
          setProgress(time);
      }
  };

  const setVolume = (newVolume: number) => {
      const clampedVolume = Math.max(0, Math.min(1, newVolume));
      if (playerRef.current?.setVolume) {
          playerRef.current.setVolume(clampedVolume * 100);
      }
      setVolumeState(clampedVolume);
  };

  const value = {
    isPlaying,
    currentTrack,
    playlist,
    progress,
    duration,
    volume,
    playPlaylist,
    togglePlay,
    playNext,
    playPrevious,
    seekTo,
    setVolume,
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
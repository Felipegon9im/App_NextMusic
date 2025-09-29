import React, { createContext, useContext, useState, useRef, useEffect, ReactNode, useCallback } from 'react';
import type { Track } from './data.ts';

// FIX: Removed conflicting redeclaration of MediaMetadata and related types.
// They are already available in the standard DOM typings.
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

  const currentTrack = playlist[currentIndex] || null;

  const playNext = useCallback(() => {
    if (playlist.length === 0 || !playerRef.current) return;
    const nextIndex = (currentIndex + 1) % playlist.length;
    playerRef.current.playVideoAt(nextIndex);
  }, [currentIndex, playlist.length]);

  const playPrevious = useCallback(() => {
    if (playlist.length === 0 || !playerRef.current) return;
    const prevIndex = (currentIndex - 1 + playlist.length) % playlist.length;
    playerRef.current.playVideoAt(prevIndex);
  }, [currentIndex, playlist.length]);

  const playVideo = useCallback(() => {
    if (playerRef.current?.playVideo) {
      playerRef.current.playVideo();
    }
  }, []);

  const pauseVideo = useCallback(() => {
    if (playerRef.current?.pauseVideo) {
      playerRef.current.pauseVideo();
    }
  }, []);
  
  const togglePlay = useCallback(() => {
      if (!currentTrack || !playerRef.current) return;
      const playerState = playerRef.current.getPlayerState();
      if (playerState === window.YT.PlayerState.PLAYING) {
        pauseVideo();
      } else {
        playVideo();
      }
  }, [currentTrack, playVideo, pauseVideo]);

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

  const playPlaylist = (tracks: Track[], startIndex = 0) => {
    setPlaylist(tracks);
    setCurrentIndex(startIndex);
    setIsPlaying(true);
    if (playerRef.current?.loadPlaylist) {
        const videoIds = tracks.map(t => t.videoId);
        playerRef.current.loadPlaylist(videoIds, startIndex);
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
  
  // Media Session API integration
  useEffect(() => {
    if ('mediaSession' in navigator && currentTrack) {
        navigator.mediaSession.metadata = new MediaMetadata({
            title: currentTrack.title,
            artist: currentTrack.artist,
            album: 'Next Music',
            artwork: [{ src: currentTrack.albumArt, sizes: '512x512', type: 'image/jpeg' }]
        });

        navigator.mediaSession.setActionHandler('play', playVideo);
        navigator.mediaSession.setActionHandler('pause', pauseVideo);
        navigator.mediaSession.setActionHandler('previoustrack', playPrevious);
        navigator.mediaSession.setActionHandler('nexttrack', playNext);
    }
  }, [currentTrack, playVideo, pauseVideo, playNext, playPrevious]);

  useEffect(() => {
      if ('mediaSession' in navigator) {
          navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';
      }
  }, [isPlaying]);

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
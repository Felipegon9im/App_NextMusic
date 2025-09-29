import React, { createContext, useContext, useState, useRef, useEffect, ReactNode, useCallback } from 'react';
import type { Track } from './data.ts';

declare global {
  interface Window {
    onYouTubeIframeAPIReady: () => void;
    YT: any;
  }
}

type RepeatMode = 'off' | 'playlist' | 'one';

interface PlayerContextType {
  isPlaying: boolean;
  currentTrack: Track | null;
  playlist: Track[];
  currentIndex: number;
  progress: number;
  duration: number;
  volume: number;
  shuffleMode: boolean;
  repeatMode: RepeatMode;
  playPlaylist: (tracks: Track[], startIndex?: number) => void;
  togglePlay: () => void;
  playNext: () => void;
  playPrevious: () => void;
  seekTo: (time: number) => void;
  setVolume: (volume: number) => void;
  setShuffleMode: (shuffle: boolean) => void;
  setRepeatMode: (mode: RepeatMode) => void;
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
  const [shuffleMode, setShuffleMode] = useState(false);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>('off');


  const currentTrack = playlist[currentIndex] || null;

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

  const playNext = useCallback(() => {
    playerRef.current?.nextVideo();
  }, []);
  
  const playPrevious = useCallback(() => {
    playerRef.current?.previousVideo();
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
        if (repeatMode === 'one') {
            playerRef.current?.seekTo(0);
            playVideo();
        } else {
            const currentIdx = playerRef.current?.getPlaylistIndex();
            const playlistSize = playerRef.current?.getPlaylist()?.length;
            if (repeatMode === 'playlist' && currentIdx === playlistSize - 1) {
                playerRef.current?.playVideoAt(0);
            }
            // If repeat is 'off', the player will naturally stop after the last song.
        }
      }
    };
  }, [volume, currentIndex, repeatMode, playVideo]);
  
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
        playerRef.current.loadPlaylist({
            playlist: videoIds,
            index: startIndex,
        });
        playerRef.current.setShuffle(shuffleMode);
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
  
  const handleSetShuffle = (shuffle: boolean) => {
      setShuffleMode(shuffle);
      if (playerRef.current?.setShuffle) {
          playerRef.current.setShuffle(shuffle);
      }
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
    currentIndex,
    progress,
    duration,
    volume,
    shuffleMode,
    repeatMode,
    playPlaylist,
    togglePlay,
    playNext,
    playPrevious,
    seekTo,
    setVolume,
    setShuffleMode: handleSetShuffle,
    setRepeatMode,
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
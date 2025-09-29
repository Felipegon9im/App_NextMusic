import React, { useRef } from 'react';
import { 
  PlayIcon, 
  PauseIcon, 
  ShuffleIcon, 
  PreviousIcon, 
  NextIcon, 
  RepeatIcon, 
  VolumeIcon 
} from './Icons.tsx';
import { usePlayer } from './PlayerContext.tsx';

const formatTime = (seconds: number) => {
  const flooredSeconds = Math.floor(seconds || 0);
  const min = Math.floor(flooredSeconds / 60);
  const sec = flooredSeconds % 60;
  return `${min}:${sec < 10 ? '0' : ''}${sec}`;
};

export const Player = () => {
  const { 
    isPlaying, 
    currentTrack, 
    togglePlay,
    playNext,
    playPrevious,
    progress,
    duration,
    seekTo,
    volume,
    setVolume,
  } = usePlayer();
  
  const progressBarRef = useRef<HTMLDivElement>(null);
  const volumeBarRef = useRef<HTMLDivElement>(null);

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (progressBarRef.current && duration > 0) {
      const rect = progressBarRef.current.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const width = rect.width;
      const percentage = clickX / width;
      seekTo(duration * percentage);
    }
  };

  const handleVolumeClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (volumeBarRef.current) {
        const rect = volumeBarRef.current.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const width = rect.width;
        if (width > 0) {
            const newVolume = clickX / width;
            setVolume(newVolume);
        }
    }
  };

  if (!currentTrack) {
    return (
      <footer className="player">
        <div className="player-song-info"></div>
        <div className="player-controls">
           <p>Select a song to play</p>
        </div>
        <div className="player-volume"></div>
      </footer>
    );
  }

  const progressPercentage = duration > 0 ? (progress / duration) * 100 : 0;

  return (
    <footer className="player">
      <div className="player-song-info">
        <img src={currentTrack.albumArt} alt={currentTrack.title} />
        <div className="details">
          <h5>{currentTrack.title}</h5>
          <p>{currentTrack.artist}</p>
        </div>
      </div>
      <div className="player-controls">
        <div className="player-buttons">
          <button title="Shuffle" aria-label="Shuffle">
            <ShuffleIcon />
          </button>
          <button title="Previous" onClick={playPrevious} aria-label="Previous track">
            <PreviousIcon />
          </button>
          <button className="play-button" onClick={togglePlay} title={isPlaying ? "Pause" : "Play"} aria-label={isPlaying ? "Pause" : "Play"}>
            {isPlaying ? <PauseIcon /> : <PlayIcon />}
          </button>
          <button title="Next" onClick={playNext} aria-label="Next track">
            <NextIcon />
          </button>
          <button title="Repeat" aria-label="Repeat">
            <RepeatIcon />
          </button>
        </div>
        <div className="progress-bar-container">
            <span>{formatTime(progress)}</span>
            <div className="progress-bar" ref={progressBarRef} onClick={handleProgressClick}>
              <div className="progress-bar-inner" style={{width: `${progressPercentage}%`}}>
                <div className="progress-bar-thumb"></div>
              </div>
            </div>
            <span>{formatTime(duration)}</span>
        </div>
      </div>
      <div className="player-volume">
        <VolumeIcon />
        <div className="progress-bar" ref={volumeBarRef} onClick={handleVolumeClick}>
          <div className="progress-bar-inner" style={{width: `${volume * 100}%`}}>
            <div className="progress-bar-thumb"></div>
          </div>
        </div>
      </div>
    </footer>
  );
};
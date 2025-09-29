import React, { useRef, useState } from 'react';
import { 
  PlayIcon, 
  PauseIcon, 
  ShuffleIcon, 
  PreviousIcon, 
  NextIcon, 
  RepeatIcon, 
  VolumeIcon,
  ChevronDownIcon
} from './Icons.tsx';
import { usePlayer } from './PlayerContext.tsx';

const formatTime = (seconds: number) => {
  const flooredSeconds = Math.floor(seconds || 0);
  const min = Math.floor(flooredSeconds / 60);
  const sec = flooredSeconds % 60;
  return `${min}:${sec < 10 ? '0' : ''}${sec}`;
};

interface PlayerProps {
    isMobile: boolean;
    isPlayerExpanded: boolean;
    setIsPlayerExpanded: (expanded: boolean) => void;
}

export const Player = ({ isMobile, isPlayerExpanded, setIsPlayerExpanded } : PlayerProps) => {
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
  const [isShuffle, setIsShuffle] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    if (duration > 0) {
      const rect = target.getBoundingClientRect();
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
            const newVolume = Math.max(0, Math.min(1, clickX / width));
            setVolume(newVolume);
        }
    }
  };

  if (!currentTrack) {
    // Return a simplified, non-interactive player if no track is loaded
    return (
      <footer className="player" style={{ gridArea: isMobile ? 'unset' : 'player'}}>
        <div className="player-song-info"></div>
        <div className="player-controls">
           <div className="progress-bar-container">
             <span>0:00</span>
             <div className="progress-bar"><div className="progress-bar-inner"></div></div>
             <span>0:00</span>
           </div>
        </div>
        <div className="player-volume"></div>
      </footer>
    );
  }

  const progressPercentage = duration > 0 ? (progress / duration) * 100 : 0;

  const playerClasses = `player ${isMobile ? (isPlayerExpanded ? 'fullscreen-player' : 'mini-player') : ''}`.trim();

  const playerContent = (
    <>
      { isPlayerExpanded && (
        <div className="header">
          <button onClick={() => setIsPlayerExpanded(false)} aria-label="Collapse player">
            <ChevronDownIcon />
          </button>
        </div>
      )}

      { isPlayerExpanded && (
        <div className="artwork">
          <img src={currentTrack.albumArt} alt={currentTrack.title} />
        </div>
      )}

      <div className="player-song-info" onClick={() => isMobile && !isPlayerExpanded && setIsPlayerExpanded(true)}>
        {!isPlayerExpanded && <img src={currentTrack.albumArt} alt={currentTrack.title} />}
        <div className="details">
          <h5>{currentTrack.title}</h5>
          <p>{currentTrack.artist}</p>
        </div>
      </div>
      
      <div className="player-controls">
        <div className="player-buttons">
          {!isPlayerExpanded && isMobile ? null : (
            <button title="Shuffle" aria-label="Shuffle" className={isShuffle ? 'active' : ''} onClick={() => setIsShuffle(!isShuffle)}>
              <ShuffleIcon />
            </button>
          )}

          {!isPlayerExpanded && isMobile ? null : (
            <button title="Previous" onClick={playPrevious} aria-label="Previous track">
              <PreviousIcon />
            </button>
          )}

          <button className="play-button" onClick={togglePlay} title={isPlaying ? "Pause" : "Play"} aria-label={isPlaying ? "Pause" : "Play"}>
            {isPlaying ? <PauseIcon /> : <PlayIcon />}
          </button>
          
          <button title="Next" onClick={playNext} aria-label="Next track">
            <NextIcon />
          </button>

          {!isPlayerExpanded && isMobile ? null : (
            <button title="Repeat" aria-label="Repeat" className={isRepeat ? 'active' : ''} onClick={() => setIsRepeat(!isRepeat)}>
              <RepeatIcon />
            </button>
          )}
        </div>

        {(!isMobile || isPlayerExpanded) && (
            <div className="progress-bar-container">
                <span>{formatTime(progress)}</span>
                <div className="progress-bar" ref={progressBarRef} onClick={handleProgressClick}>
                  <div className="progress-bar-inner" style={{width: `${progressPercentage}%`}}>
                    <div className="progress-bar-thumb"></div>
                  </div>
                </div>
                <span>{formatTime(duration)}</span>
            </div>
        )}
      </div>

      {!isMobile && (
          <div className="player-volume">
            <VolumeIcon />
            <div className="progress-bar" ref={volumeBarRef} onClick={handleVolumeClick}>
              <div className="progress-bar-inner" style={{width: `${volume * 100}%`}}>
                <div className="progress-bar-thumb"></div>
              </div>
            </div>
          </div>
      )}
    </>
  );

  return (
    <footer className={playerClasses}>
      {playerContent}
    </footer>
  );
};

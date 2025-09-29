import React, { useRef, useState, useEffect } from 'react';
import { 
  PlayIcon, 
  PauseIcon, 
  ShuffleIcon, 
  PreviousIcon, 
  NextIcon, 
  RepeatIcon,
  RepeatOneIcon,
  VolumeIcon,
  ChevronDownIcon,
  PlusIcon,
  QueueIcon,
  VideoIcon,
} from './Icons.tsx';
import { usePlayer } from './PlayerContext.tsx';
import { AddToPlaylistPopover } from './AddToPlaylistPopover.tsx';

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
    setIsQueueVisible: (visible: boolean) => void;
}

export const Player = ({ isMobile, isPlayerExpanded, setIsPlayerExpanded, setIsQueueVisible } : PlayerProps) => {
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
    shuffleMode,
    setShuffleMode,
    repeatMode,
    setRepeatMode,
    isVideoMode,
    toggleVideoMode,
  } = usePlayer();
  
  const progressBarRef = useRef<HTMLDivElement>(null);
  const volumeBarRef = useRef<HTMLDivElement>(null);
  const [popover, setPopover] = useState({ show: false, anchorEl: null as HTMLElement | null });

  useEffect(() => {
    document.body.classList.toggle('video-mode-active', isVideoMode);
    
    // When unmounting, ensure the class is removed
    return () => {
        document.body.classList.remove('video-mode-active');
    };
  }, [isVideoMode]);

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
    const target = e.currentTarget;
    const rect = target.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    if (width > 0) {
        const newVolume = Math.max(0, Math.min(1, clickX / width));
        setVolume(newVolume);
    }
  };

  const handleOpenPopover = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setPopover({ show: true, anchorEl: e.currentTarget });
  };

  const closePopover = () => {
    setPopover({ show: false, anchorEl: null });
  };
  
  const handleToggleRepeat = () => {
    // FIX: The type of `setRepeatMode` from the context does not accept a function.
    // We read the current `repeatMode` and pass the next value directly.
    const nextMode = repeatMode === 'off' ? 'playlist' : repeatMode === 'playlist' ? 'one' : 'off';
    setRepeatMode(nextMode);
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
        <button className="icon-button add-to-playlist-button" title="Adicionar à playlist" onClick={handleOpenPopover}>
            <PlusIcon />
        </button>
      </div>
      
      <div className="player-controls">
        <div className="player-buttons">
          {!isPlayerExpanded && isMobile ? null : (
            <button title="Shuffle" aria-label="Shuffle" className={shuffleMode ? 'active' : ''} onClick={() => setShuffleMode(!shuffleMode)}>
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
            <button title="Repeat" aria-label="Repeat" className={repeatMode !== 'off' ? 'active' : ''} onClick={handleToggleRepeat}>
              {repeatMode === 'one' ? <RepeatOneIcon /> : <RepeatIcon />}
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

      <div className="player-volume">
        {(!isMobile || isPlayerExpanded) && <VolumeIcon />}
        {(!isMobile || isPlayerExpanded) && (
            <div className="progress-bar" ref={volumeBarRef} onClick={handleVolumeClick}>
              <div className="progress-bar-inner" style={{width: `${volume * 100}%`}}>
                <div className="progress-bar-thumb"></div>
              </div>
            </div>
        )}
        {(!isMobile || isPlayerExpanded) && (
            <button className="icon-button" title="Assistir vídeo" onClick={toggleVideoMode}>
                <VideoIcon />
            </button>
        )}
        {!isMobile && (
             <button className="icon-button" title="Fila" onClick={() => setIsQueueVisible(true)}>
                <QueueIcon />
            </button>
        )}
      </div>
    </>
  );

  return (
    <>
        <footer className={playerClasses}>
          {playerContent}
        </footer>
        {isVideoMode && (
            <div className="video-player-overlay" onClick={toggleVideoMode}>
                <button className="close-video-button" onClick={(e) => { e.stopPropagation(); toggleVideoMode(); }} title="Fechar vídeo">
                    <PlusIcon style={{ transform: 'rotate(45deg)', width: '24px', height: '24px', fill: 'currentColor' }} />
                </button>
            </div>
        )}
        <AddToPlaylistPopover
            anchorEl={popover.anchorEl}
            show={popover.show}
            onClose={closePopover}
            track={currentTrack}
        />
    </>
  );
};
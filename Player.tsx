import React, { useState } from 'https://esm.sh/react@18.2.0';
import { 
  PlayIcon, 
  PauseIcon, 
  ShuffleIcon, 
  PreviousIcon, 
  NextIcon, 
  RepeatIcon, 
  VolumeIcon 
} from './Icons.tsx';
import { currentSong } from './data.ts';

export const Player = () => {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <footer className="player">
      <div className="player-song-info">
        <img src={currentSong.albumArt} alt={currentSong.title} />
        <div className="details">
          <h5>{currentSong.title}</h5>
          <p>{currentSong.artist}</p>
        </div>
      </div>
      <div className="player-controls">
        <div className="player-buttons">
          <button title="Shuffle">
            <ShuffleIcon />
          </button>
          <button title="Previous">
            <PreviousIcon />
          </button>
          <button className="play-button" onClick={() => setIsPlaying(!isPlaying)} title={isPlaying ? "Pause" : "Play"}>
            {isPlaying ? <PauseIcon /> : <PlayIcon />}
          </button>
          <button title="Next">
            <NextIcon />
          </button>
          <button title="Repeat">
            <RepeatIcon />
          </button>
        </div>
        <div className="progress-bar-container">
            <span>1:02</span>
            <div className="progress-bar"><div className="progress-bar-inner"></div></div>
            <span>3:24</span>
        </div>
      </div>
      <div className="player-volume">
        <VolumeIcon />
        <div className="progress-bar"><div className="progress-bar-inner" style={{width: '70%'}}></div></div>
      </div>
    </footer>
  );
};
import React from 'react';
import { usePlayer } from './PlayerContext.tsx';
import { PlusIcon } from './Icons.tsx'; // Using Plus as a close icon for now

interface QueueViewProps {
    isVisible: boolean;
    onClose: () => void;
}

export const QueueView = ({ isVisible, onClose }: QueueViewProps) => {
    const { playlist, currentTrack, currentIndex } = usePlayer();

    const upcomingTracks = playlist.slice(currentIndex + 1);

    const queueViewClasses = `queue-view ${isVisible ? 'visible' : ''}`.trim();
    const overlayClasses = `queue-view-overlay ${isVisible ? 'visible' : ''}`.trim();

    return (
        <>
            <div className={overlayClasses} onClick={onClose}></div>
            <aside className={queueViewClasses}>
                <div className="queue-view-header">
                    <h3>Fila de reprodução</h3>
                    <button className="icon-button" onClick={onClose} title="Fechar fila">
                       <PlusIcon style={{ transform: 'rotate(45deg)' }}/>
                    </button>
                </div>
                <div className="queue-view-content">
                    {currentTrack && (
                         <>
                            <h4>Tocando agora</h4>
                            <div className="queue-track-item is-playing">
                                <img src={currentTrack.albumArt} alt={currentTrack.title} />
                                <div className="track-info">
                                    <div className="track-title">{currentTrack.title}</div>
                                    <div className="track-artist">{currentTrack.artist}</div>
                                </div>
                            </div>
                        </>
                    )}
                    {upcomingTracks.length > 0 && (
                        <>
                            <h4>A seguir</h4>
                            {upcomingTracks.map((track, index) => (
                                <div key={track.id + index} className="queue-track-item">
                                    <img src={track.albumArt} alt={track.title} />
                                    <div className="track-info">
                                        <div className="track-title">{track.title}</div>
                                        <div className="track-artist">{track.artist}</div>
                                    </div>
                                </div>
                            ))}
                        </>
                    )}
                </div>
            </aside>
        </>
    );
};

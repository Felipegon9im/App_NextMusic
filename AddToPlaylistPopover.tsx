import React from 'react';
import { usePlaylists } from './PlaylistContext.tsx';
import type { Track, Playlist } from './data.ts';
import { PlusIcon } from './Icons.tsx';
import { useNotification } from './NotificationContext.tsx';

interface AddToPlaylistPopoverProps {
    anchorEl: HTMLElement | null;
    show: boolean;
    onClose: () => void;
    track: Track | null;
}

export const AddToPlaylistPopover = ({ anchorEl, show, onClose, track }: AddToPlaylistPopoverProps) => {
    const { userPlaylists, addTrackToPlaylist, createPlaylist } = usePlaylists();
    const { showNotification } = useNotification();

    if (!show || !track || !anchorEl) return null;

    const handleAdd = (playlist: Playlist) => {
        addTrackToPlaylist(playlist.name, track);
        onClose();
    };

    const handleCreateAndAdd = () => {
        const playlistName = prompt("Nome da nova playlist:");
        if (playlistName && track) {
            // createPlaylist will show its own notification
            createPlaylist(playlistName, [track]);
            onClose();
        }
    };
    
    const rect = anchorEl.getBoundingClientRect();
    
    // Default position is bottom-right of the anchor
    let top = rect.bottom + 8;
    let left = rect.left + rect.width / 2 - 220; // 220 is min-width of menu

    // If it goes off-screen to the right, adjust left
    if (left + 220 > window.innerWidth) {
        left = window.innerWidth - 228; // 220 + 8px padding
    }
    // If it goes off-screen to the left, adjust left
    if (left < 8) {
        left = 8;
    }
    // If it goes off-screen to the bottom, position it on top
    if (top + 300 > window.innerHeight) { // 300 is max-height
        top = rect.top - 300 - 8;
         if (top < 0) { // If still off-screen, adjust
            top = 8;
        }
    }


    const style = {
      top: top,
      left: left,
    };

    return (
        <>
            <div className="context-menu-overlay" onClick={onClose}></div>
            <div className="context-menu" style={style}>
                 <div className="context-menu-header">Adicionar à playlist</div>
                 <div className="context-menu-item create-playlist-item" onClick={handleCreateAndAdd}>
                    <PlusIcon />
                    <span>Criar playlist</span>
                 </div>
                 {userPlaylists.map(pl => (
                    <div key={pl.name} className="context-menu-item" onClick={() => handleAdd(pl)}>
                        {pl.name}
                    </div>
                 ))}
                 {userPlaylists.length === 0 && (
                    <div className="context-menu-item" style={{ fontStyle: 'italic', color: 'var(--text-subdued)', justifyContent: 'center' }}>
                        Nenhuma playlist existente
                    </div>
                 )}
            </div>
        </>
    );
};
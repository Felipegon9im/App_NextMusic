import React, { createContext, useContext, useState, ReactNode } from 'react';

type NotificationType = 'success' | 'error';

interface NotificationState {
    id: number;
    message: string;
    type: NotificationType;
}

interface NotificationContextType {
    notification: NotificationState | null;
    showNotification: (message: string, type?: NotificationType) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
    const [notification, setNotification] = useState<NotificationState | null>(null);

    const showNotification = (message: string, type: NotificationType = 'success') => {
        // Use a unique ID to re-trigger the animation even if the message is the same
        setNotification({ id: Date.now(), message, type });
    };

    const value = {
        notification,
        showNotification,
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotification = (): NotificationContextType => {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
};

import React, { useEffect, useState } from 'react';
import { useNotification } from './NotificationContext.tsx';

export const Notification = () => {
    const { notification } = useNotification();
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (notification) {
            setVisible(true);
            const timer = setTimeout(() => {
                setVisible(false);
            }, 3900); // A little less than the animation duration
            return () => clearTimeout(timer);
        }
    }, [notification]);

    if (!notification || !visible) {
        return null;
    }

    return (
        <div className="notification-container" key={notification.id}>
            <div className={`notification ${notification.type}`}>
                {notification.message}
            </div>
        </div>
    );
};

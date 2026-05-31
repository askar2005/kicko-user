import React, { useState } from 'react';
import { Bell, BellOff, Check, Trash2, Calendar } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';

interface Notification {
    id: string;
    title: string;
    message: string;
    time: string;
    isRead: boolean;
    type: 'BOOKING' | 'PAYMENT' | 'SYSTEM';
}

const MOCK_NOTIFICATIONS: Notification[] = [
    {
        id: '1',
        title: 'Booking Confirmed!',
        message: 'Your booking for Green Field Arena on 10th March is confirmed.',
        time: '2 hours ago',
        isRead: false,
        type: 'BOOKING'
    },
    {
        id: '2',
        title: 'Payment Successful',
        message: 'We have received your payment of ₹1250 for booking B1.',
        time: '1 day ago',
        isRead: true,
        type: 'PAYMENT'
    },
    {
        id: '3',
        title: 'Limited Offer',
        message: 'Get 20% off on your next booking at Kickoff Arena.',
        time: '2 days ago',
        isRead: true,
        type: 'SYSTEM'
    }
];

const Notifications: React.FC = () => {
    const t = useTranslation();
    const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);

    const markAllAsRead = () => {
        setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    };

    const deleteNotification = (id: string) => {
        setNotifications(notifications.filter(n => n.id !== id));
    };

    const toggleRead = (id: string) => {
        setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: !n.isRead } : n));
    };

    return (
        <div className="pt-32 pb-20 max-w-3xl mx-auto px-4">
            <div className="flex items-center justify-between mb-10">
                <h1 className="text-4xl font-black tracking-tighter italic text-text-heading">{t.notificationsLabel}</h1>
                <button
                    onClick={markAllAsRead}
                    className="text-primary font-bold text-sm hover:underline flex items-center"
                >
                    <Check size={16} className="mr-1" />
                    {t.markAllRead}
                </button>
            </div>

            <div className="space-y-4">
                {notifications.length > 0 ? (
                    notifications.map((n) => (
                        <div
                            key={n.id}
                            className={`bg-white p-6 rounded-[16px] flex gap-6 transition-all relative group shadow-[0_10px_25px_rgba(0,0,0,0.08)] ${!n.isRead ? 'ring-2 ring-primary/20' : ''}`}
                        >
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${!n.isRead ? 'bg-primary/20 text-primary' : 'bg-gray-100 text-gray-500'}`}>
                                {n.type === 'BOOKING' ? <Calendar size={20} /> : n.type === 'PAYMENT' ? <Check size={20} /> : <Bell size={20} />}
                            </div>

                            <div className="flex-grow">
                                <div className="flex justify-between items-start mb-1">
                                    <h3 className={`font-black ${!n.isRead ? 'text-text-heading' : 'text-text-secondary opacity-60'}`}>{n.title}</h3>
                                    <span className="text-[10px] text-text-description font-black uppercase tracking-widest">{n.time}</span>
                                </div>
                                <p className={`text-sm leading-relaxed mb-4 font-bold ${!n.isRead ? 'text-text-primary' : 'text-text-description'}`}>
                                    {n.message}
                                </p>

                                <div className="flex items-center space-x-4">
                                    <button
                                        onClick={() => toggleRead(n.id)}
                                        className="text-xs font-black text-text-description hover:text-primary transition-colors"
                                    >
                                        {n.isRead ? t.markAsUnread : t.markAsRead}
                                    </button>
                                    <button
                                        onClick={() => deleteNotification(n.id)}
                                        className="text-xs font-bold text-red-400 hover:text-red-500 transition-colors flex items-center"
                                    >
                                        <Trash2 size={12} className="mr-1" />
                                        {t.deleteLabel}
                                    </button>
                                </div>
                            </div>

                            {!n.isRead && (
                                <div className="absolute top-6 right-6 w-2 h-2 bg-primary rounded-full shadow-[0_0_10px_#22c55e]" />
                            )}
                        </div>
                    ))
                ) : (
                    <div className="bg-white p-20 rounded-[16px] text-center shadow-[0_10px_25px_rgba(0,0,0,0.08)]">
                        <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-6 border border-primary/10">
                            <BellOff size={32} className="text-primary" />
                        </div>
                        <h3 className="text-xl font-bold mb-2 text-text-heading">{t.noNotifications}</h3>
                        <p className="text-text-secondary font-bold">{t.noNotificationsDesc}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Notifications;

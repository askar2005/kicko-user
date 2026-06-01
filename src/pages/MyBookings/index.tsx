import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, MapPin, ChevronRight, XCircle, CheckCircle, AlertCircle, RefreshCcw } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';

type BookingStatus = 'CONFIRMED' | 'CANCELLED' | 'REFUNDED' | 'FAILED' | 'EXPIRED' | 'PENDING_VERIFICATION';

export interface Booking {
    id: string;
    turfName: string;
    location: string;
    date: string;
    time: string;
    price: number;
    status: BookingStatus;
    image: string;
}

const MyBookings: React.FC = () => {
    const t = useTranslation();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'UPCOMING' | 'PAST'>('UPCOMING');
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const userStr = localStorage.getItem('kicko_user');
                if (!userStr) {
                    setLoading(false);
                    return;
                }
                const user = JSON.parse(userStr);
                const headers: any = {};
                if (user.token) {
                    headers["Authorization"] = `Bearer ${user.token}`;
                }
                const res = await fetch(`http://localhost:5000/api/bookings/user/${user.id}`, { headers });
                if (res.ok) {
                    const data = await res.json();
                    const formatted: Booking[] = data.map((b: any) => ({
                        id: b.id,
                        turfName: b.turf?.name || 'Unknown Turf',
                        location: b.turf?.location || 'Unknown Location',
                        date: b.date,
                        time: `${b.startTime} - ${b.endTime}`,
                        price: b.turf?.pricePerHour || 1200,
                        status: b.status as BookingStatus,
                        image: b.turf?.image || 'https://images.unsplash.com/photo-1529900948633-14664539659a?w=400&auto=format&fit=crop'
                    }));
                    setBookings(formatted);
                }
            } catch (error) {
                console.error("Failed to fetch bookings", error);
            } finally {
                setLoading(false);
            }
        };

        fetchBookings();
    }, []);

    const upcomingBookings = bookings.filter(b => new Date(b.date) >= new Date(new Date().setHours(0, 0, 0, 0)) && b.status === 'CONFIRMED');
    const pastBookings = bookings.filter(b => new Date(b.date) < new Date(new Date().setHours(0, 0, 0, 0)) || b.status !== 'CONFIRMED');

    const filteredBookings = activeTab === 'UPCOMING' ? upcomingBookings : pastBookings;

    const getStatusStyles = (status: BookingStatus) => {
        switch (status) {
            case 'CONFIRMED': return 'bg-primary/10 text-text-heading border-primary/30';
            case 'CANCELLED': return 'bg-red-50 text-red-700 border-red-100';
            case 'EXPIRED': return 'bg-gray-100 text-text-description border-gray-200';
            case 'FAILED': return 'bg-orange-50 text-orange-700 border-orange-100';
            case 'REFUNDED': return 'bg-blue-50 text-blue-700 border-blue-100';
            case 'PENDING_VERIFICATION': return 'bg-yellow-50 text-yellow-700 border-yellow-100';
            default: return 'bg-gray-100 text-text-description border-gray-200';
        }
    };

    const getStatusIcon = (status: BookingStatus) => {
        switch (status) {
            case 'CONFIRMED': return <CheckCircle size={14} className="mr-1" />;
            case 'CANCELLED': return <XCircle size={14} className="mr-1" />;
            case 'EXPIRED': return <Clock size={14} className="mr-1" />;
            case 'FAILED': return <AlertCircle size={14} className="mr-1" />;
            case 'REFUNDED': return <RefreshCcw size={14} className="mr-1" />;
            case 'PENDING_VERIFICATION': return <AlertCircle size={14} className="mr-1" />;
        }
    };

    if (loading) {
        return <div className="pt-32 text-center text-text-secondary font-bold">Loading...</div>;
    }

    return (
        <div className="pt-32 pb-20 max-w-5xl mx-auto px-4">
            <h1 className="text-4xl font-black mb-10 tracking-tighter italic text-text-heading">{t.myBookings}</h1>

            {/* Tabs */}
            <div className="flex space-x-2 mb-10 p-1 bg-card-alternate rounded-2xl w-fit border border-gray-100 shadow-inner">
                <button
                    onClick={() => setActiveTab('UPCOMING')}
                    className={`px-8 py-3 rounded-xl font-bold transition-all ${activeTab === 'UPCOMING' ? 'bg-primary text-text-primary shadow-md' : 'text-text-secondary hover:text-primary'}`}
                >
                    {t.upcoming}
                </button>
                <button
                    onClick={() => setActiveTab('PAST')}
                    className={`px-8 py-3 rounded-xl font-bold transition-all ${activeTab === 'PAST' ? 'bg-primary text-text-primary shadow-md' : 'text-text-secondary hover:text-primary'}`}
                >
                    {t.pastBookings}
                </button>
            </div>

            {/* Booking List */}
            <div className="space-y-6">
                {filteredBookings.length > 0 ? (
                    filteredBookings.map((booking) => (
                        <div key={booking.id} className="bg-white p-6 rounded-[16px] shadow-[0_10px_25px_rgba(0,0,0,0.08)] group hover:shadow-[0_15px_35px_rgba(0,0,0,0.12)] transition-all">
                            <div className="flex flex-col md:flex-row gap-6">
                                {/* Image */}
                                <div className="w-full md:w-48 h-32 rounded-2xl overflow-hidden">
                                    <img src={booking.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={booking.turfName} />
                                </div>

                                {/* Info */}
                                <div className="flex-grow flex flex-col justify-between py-1">
                                    <div>
                                        <div className="flex justify-between items-start">
                                            <h3 className="text-xl font-bold mb-1 text-text-heading">{booking.turfName}</h3>
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase border flex items-center shadow-sm ${getStatusStyles(booking.status)}`}>
                                                {getStatusIcon(booking.status)}
                                                {booking.status === 'CONFIRMED' ? t.statusConfirmed :
                                                    booking.status === 'CANCELLED' ? t.statusCancelled :
                                                        booking.status === 'EXPIRED' ? t.statusExpired :
                                                            booking.status === 'FAILED' ? t.statusFailed :
                                                                booking.status === 'REFUNDED' ? t.statusRefunded :
                                                                    booking.status === 'PENDING_VERIFICATION' ? t.statusPending : booking.status}
                                            </span>
                                        </div>
                                        <div className="flex items-center text-text-secondary text-sm mb-4 font-bold">
                                            <MapPin size={14} className="mr-1 text-primary" />
                                            <span>{booking.location}</span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-100">
                                        <div className="space-y-1">
                                            <span className="text-[10px] uppercase tracking-widest font-black text-text-description">{t.date}</span>
                                            <div className="flex items-center font-bold text-text-primary">
                                                <Calendar size={14} className="mr-2 text-primary" />
                                                {new Date(booking.date).toLocaleDateString()}
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <span className="text-[10px] uppercase tracking-widest font-black text-text-description">{t.time}</span>
                                            <div className="flex items-center font-bold text-text-primary">
                                                <Clock size={14} className="mr-2 text-primary" />
                                                {booking.time}
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <span className="text-[10px] uppercase tracking-widest font-black text-text-description">{t.paidAmount}</span>
                                            <div className="font-extrabold text-primary">₹{booking.price}</div>
                                        </div>
                                        <div className="flex items-end justify-end">
                                            <button
                                                onClick={() => navigate(`/booking-details/${booking.id}`)}
                                                className="flex items-center text-sm font-bold text-text-secondary hover:text-primary transition-colors"
                                            >
                                                {t.viewDetails}
                                                <ChevronRight size={16} className="ml-1" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="bg-white p-20 rounded-[16px] text-center shadow-[0_10px_25px_rgba(0,0,0,0.08)]">
                        <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-6 border border-primary/10">
                            <Calendar size={32} className="text-primary" />
                        </div>
                        <h3 className="text-xl font-bold mb-2 text-text-heading">{t.noBookings}</h3>
                        <p className="text-text-secondary font-bold">{t.noBookingsDesc}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyBookings;

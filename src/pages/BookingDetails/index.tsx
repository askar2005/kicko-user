import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Calendar,
    Clock,
    MapPin,
    ChevronLeft,
    Download,
    CheckCircle,
    XCircle,
    AlertCircle,
    Hash,
    User,
    CreditCard
} from 'lucide-react';
import { motion } from 'framer-motion';
import { jsPDF } from 'jspdf';
import { useTranslation } from '../../hooks/useTranslation';

const BookingDetails: React.FC = () => {
    const t = useTranslation();
    const { bookingId } = useParams<{ bookingId: string }>();
    const navigate = useNavigate();

    const [booking, setBooking] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBooking = async () => {
            try {
                const res = await fetch(`http://localhost:5000/api/bookings/${bookingId}`);
                if (res.ok) {
                    const data = await res.json();
                    setBooking({
                        id: data.id,
                        turfName: data.turf?.name || 'Unknown Turf',
                        location: data.turf?.location || 'Unknown Location',
                        date: data.date,
                        time: `${data.startTime} - ${data.endTime}`,
                        price: data.turf?.pricePerHour || 1200,
                        status: data.status,
                        image: data.turf?.image || 'https://images.unsplash.com/photo-1529900948633-14664539659a?w=400&auto=format&fit=crop',
                        userName: data.user?.name || 'User',
                        isBogo: data.isBogo,
                        discountAmount: data.discountAmount,
                        discountPercentage: data.discountPercentage,
                        freeSlot: data.freeSlot,
                    });
                }
            } catch (err) {
                console.error("Failed to fetch booking details", err);
            } finally {
                setLoading(false);
            }
        };

        if (bookingId) fetchBooking();
    }, [bookingId]);

    const downloadReceipt = () => {
        if (!booking) return;

        const doc = new jsPDF();

        // Header
        doc.setFontSize(22);
        doc.setTextColor(34, 197, 94); // Primary Green
        doc.text('KICKO', 20, 20);
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text('Turf Booking Receipt', 20, 26);

        // Horizontal Line
        doc.setDrawColor(240);
        doc.line(20, 32, 190, 32);

        // Content
        doc.setFontSize(12);
        doc.setTextColor(0);
        doc.setFont('helvetica', 'bold');
        doc.text('Booking Status:', 20, 45);
        doc.setFont('helvetica', 'normal');
        doc.text(booking.status, 60, 45);

        doc.setFont('helvetica', 'bold');
        doc.text('Booking ID:', 20, 55);
        doc.setFont('helvetica', 'normal');
        doc.text(booking.id, 60, 55);

        doc.setFont('helvetica', 'bold');
        doc.text('Turf Name:', 20, 65);
        doc.setFont('helvetica', 'normal');
        doc.text(booking.turfName, 60, 65);

        doc.setFont('helvetica', 'bold');
        doc.text('Location:', 20, 75);
        doc.setFont('helvetica', 'normal');
        doc.text(booking.location, 60, 75);

        doc.setFont('helvetica', 'bold');
        doc.text('Date:', 20, 85);
        doc.setFont('helvetica', 'normal');
        doc.text(new Date(booking.date).toLocaleDateString(), 60, 85);

        doc.setFont('helvetica', 'bold');
        doc.text('Time Slot:', 20, 95);
        doc.setFont('helvetica', 'normal');
        doc.text(booking.time, 60, 95);

        doc.line(20, 105, 190, 105);

        doc.setFont('helvetica', 'bold');
        doc.text('Amount Paid:', 20, 115);
        doc.setFontSize(14);
        doc.text(`INR ${booking.price}`, 60, 115);

        // Footer
        doc.setFontSize(10);
        doc.setTextColor(150);
        doc.text('Thank you for booking with KICKO!', 20, 150);
        doc.text('Please arrive 15 minutes before your slot.', 20, 156);

        doc.save(`KICKO_Receipt_${booking.id}.pdf`);
    };

    if (loading) {
        return <div className="pt-32 text-center text-text-secondary font-bold">Loading...</div>;
    }

    if (!booking) {
        return (
            <div className="pt-32 text-center">
                <AlertCircle size={64} className="mx-auto text-text-description mb-4" />
                <h2 className="text-2xl font-black text-text-heading italic tracking-tight">{t.bookingNotFound}</h2>
                <p className="text-text-secondary font-bold mt-2">{t.bookingNotFoundDesc}</p>
                <button onClick={() => navigate('/bookings')} className="mt-8 px-8 py-4 bg-primary text-text-primary rounded-3xl font-black shadow-lg">{t.backToBookings}</button>
            </div>
        );
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'CONFIRMED': return <CheckCircle size={20} className="text-primary" />;
            case 'CANCELLED': return <XCircle size={20} className="text-red-500" />;
            case 'EXPIRED': return <Clock size={20} className="text-gray-400" />;
            case 'PENDING_VERIFICATION': return <AlertCircle size={20} className="text-yellow-500" />;
            default: return <AlertCircle size={20} className="text-gray-400" />;
        }
    };

    return (
        <div className="pt-24 pb-20 max-w-2xl mx-auto px-4">
            <div className="flex items-center mb-8">
                <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full transition-colors mr-2">
                    <ChevronLeft size={24} />
                </button>
                <h1 className="text-2xl font-black italic tracking-tighter text-text-heading">{t.bookingDetails}</h1>
            </div>

            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="bg-white rounded-[32px] border border-gray-100 shadow-[0_20px_50px_rgba(0,0,0,0.05)] overflow-hidden"
            >
                {/* Header */}
                <div className="p-8 border-b border-gray-50 bg-primary/5 flex justify-between items-center">
                    <div>
                        <p className="text-[10px] uppercase tracking-widest font-black text-text-description mb-1">{t.bookingId}</p>
                        <div className="flex items-center space-x-2">
                            <Hash size={14} className="text-primary" />
                            <span className="text-lg font-black text-text-heading uppercase">{booking.id.split('-')[0]}</span>
                        </div>
                    </div>
                    <div className="text-right flex items-center space-x-2">
                        {getStatusIcon(booking.status)}
                        <span className="font-black text-text-heading text-sm uppercase">
                            {booking.status === 'CONFIRMED' ? t.statusConfirmed :
                                booking.status === 'CANCELLED' ? t.statusCancelled :
                                    booking.status === 'EXPIRED' ? t.statusExpired :
                                        booking.status === 'FAILED' ? t.statusFailed :
                                            booking.status === 'REFUNDED' ? t.statusRefunded :
                                                booking.status === 'PENDING_VERIFICATION' ? t.statusPending : booking.status}
                        </span>
                    </div>
                </div>

                {/* Main Content */}
                <div className="p-8 space-y-8">
                    {/* Turf Info */}
                    <div className="flex items-center space-x-4">
                        <img src={booking.image} className="w-20 h-20 rounded-2xl object-cover" alt={booking.turfName} />
                        <div>
                            <h3 className="text-xl font-black text-text-heading">{booking.turfName}</h3>
                            <div className="flex items-center text-text-secondary text-sm font-bold mt-1">
                                <MapPin size={14} className="mr-1 text-primary" />
                                <span>{booking.location}</span>
                            </div>
                        </div>
                    </div>

                    {/* Meta Details */}
                    <div className="grid grid-cols-2 gap-8 pt-4">
                        <div className="space-y-1">
                            <p className="text-[10px] uppercase tracking-widest font-black text-text-description flex items-center">
                                <Calendar size={10} className="mr-1" /> {t.date}
                            </p>
                            <p className="font-bold text-text-primary">{new Date(booking.date).toLocaleDateString()}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] uppercase tracking-widest font-black text-text-description flex items-center">
                                <Clock size={10} className="mr-1" /> {t.timeSlot}
                            </p>
                            <p className="font-black italic text-text-heading">{booking.time}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] uppercase tracking-widest font-black text-text-description flex items-center">
                                <User size={10} className="mr-1" /> {t.user}
                            </p>
                            <p className="font-bold text-text-primary">{booking.userName}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] uppercase tracking-widest font-black text-text-description flex items-center">
                                <CreditCard size={10} className="mr-1" /> {t.payment}
                            </p>
                            <p className="font-bold text-text-primary uppercase">UPI / Card</p>
                        </div>
                    </div>

                    {booking.isBogo && (
                        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-sm font-bold flex justify-between items-center">
                            <span>🎁 Buy 1 Get 1 Offer Applied</span>
                            <span className="bg-amber-500 text-white px-3 py-1 rounded-full text-xs font-black">FREE SLOT INCLUDED</span>
                        </div>
                    )}

                    {!booking.isBogo && booking.discountPercentage > 0 && (
                        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-sm font-bold flex justify-between items-center">
                            <span>🏷️ {booking.discountPercentage}% Slot Discount Applied</span>
                            <span className="bg-emerald-600 text-white px-3 py-1 rounded-full text-xs font-black">SAVED ₹{booking.discountAmount || 0}</span>
                        </div>
                    )}

                    {/* Amount */}
                    <div className="pt-8 border-t border-gray-100 flex justify-between items-center">
                        <span className="text-lg font-black text-text-heading italic uppercase tracking-tighter">{t.paidAmount}</span>
                        <span className="text-3xl font-black text-primary italic">₹{booking.price}</span>
                    </div>
                </div>

                {/* Actions */}
                <div className="p-8 bg-gray-50">
                    <button
                        onClick={downloadReceipt}
                        className="w-full py-4 bg-white hover:bg-primary hover:text-text-primary text-text-primary border border-gray-200 hover:border-primary font-black rounded-2xl transition-all flex items-center justify-center space-x-2 group shadow-sm active:scale-95"
                    >
                        <Download size={18} className="group-hover:translate-y-1 transition-transform" />
                        <span>{t.downloadReceipt}</span>
                    </button>
                    {booking.status === 'CONFIRMED' && (
                        <p className="text-center text-[10px] text-text-description font-bold mt-4 uppercase tracking-widest">
                            {t.refundPolicy}
                        </p>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default BookingDetails;

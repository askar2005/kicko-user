import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
    CheckCircle2, 
    Download, 
    Home as HomeIcon, 
    Calendar, 
    Clock, 
    User, 
    CreditCard, 
    Hash,
    MapPin
} from 'lucide-react';
import { motion } from 'framer-motion';
import { jsPDF } from 'jspdf';
import { useTranslation } from '../../hooks/useTranslation';

const PaymentSuccess: React.FC = () => {
    const t = useTranslation();
    const location = useLocation();
    const navigate = useNavigate();
    const { 
        bookingId, 
        totalAmount, 
        turfName, 
        date, 
        slot, 
        slots,
        paymentMethod, 
        userName 
    } = (location.state as any) || {};

    const downloadReceipt = () => {
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
        doc.text('Confirmed', 60, 45);
        
        doc.setFont('helvetica', 'bold');
        doc.text('Booking ID:', 20, 55);
        doc.setFont('helvetica', 'normal');
        doc.text(bookingId || 'N/A', 60, 55);
        
        doc.setFont('helvetica', 'bold');
        doc.text('User Name:', 20, 65);
        doc.setFont('helvetica', 'normal');
        doc.text(userName || 'N/A', 60, 65);
        
        doc.setFont('helvetica', 'bold');
        doc.text('Turf Name:', 20, 75);
        doc.setFont('helvetica', 'normal');
        doc.text(turfName || 'N/A', 60, 75);
        
        doc.setFont('helvetica', 'bold');
        doc.text('Date:', 20, 85);
        doc.setFont('helvetica', 'normal');
        doc.text(date || 'N/A', 60, 85);
        
        doc.setFont('helvetica', 'bold');
        doc.text('Time Slot:', 20, 95);
        doc.setFont('helvetica', 'normal');
        doc.text(slot || (Array.isArray(slots) ? slots.join(', ') : 'N/A'), 60, 95);
        
        doc.line(20, 105, 190, 105);
        
        doc.setFont('helvetica', 'bold');
        doc.text('Amount Paid:', 20, 115);
        doc.setFontSize(14);
        doc.text(`INR ${totalAmount}`, 60, 115);
        
        doc.setFontSize(12);
        doc.text('Payment Method:', 20, 125);
        doc.setFont('helvetica', 'normal');
        doc.text(paymentMethod || 'N/A', 60, 125);
        
        // Footer
        doc.setFontSize(10);
        doc.setTextColor(150);
        doc.text('Thank you for booking with KICKO!', 20, 150);
        doc.text('Please arrive 15 minutes before your slot.', 20, 156);
        
        doc.save(`KICKO_Receipt_${bookingId}.pdf`);
    };

    if (!bookingId) {
        return (
            <div className="pt-32 text-center overflow-hidden">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                >
                    <AlertCircle size={64} className="mx-auto text-text-description mb-4" />
                    <h2 className="text-2xl font-black text-text-heading italic tracking-tight">{t.sessionExpired}</h2>
                    <p className="text-text-secondary font-bold mt-2">{t.couldNotFindDetails}</p>
                    <button onClick={() => navigate('/')} className="mt-8 px-8 py-4 bg-primary text-text-primary rounded-3xl font-black shadow-lg">{t.goToHome}</button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="pt-24 pb-20 max-w-2xl mx-auto px-4">
            <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="text-center mb-10"
            >
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 shadow-glow shadow-primary/20">
                    <CheckCircle2 size={40} className="text-primary" />
                </div>
                <h1 className="text-4xl font-black italic tracking-tighter text-text-heading mb-2">{t.paymentSuccessful}</h1>
                <p className="text-text-secondary font-bold">{t.bookingConfirmed}</p>
            </motion.div>

            <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-[32px] border border-gray-100 shadow-[0_20px_50px_rgba(0,0,0,0.05)] overflow-hidden"
            >
                <div className="p-8 border-b border-gray-50 bg-primary/5">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-[10px] uppercase tracking-widest font-black text-text-description mb-1">{t.bookingId}</p>
                            <div className="flex items-center space-x-2">
                                <Hash size={14} className="text-primary" />
                                <span className="text-lg font-black text-text-heading uppercase">{bookingId}</span>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] uppercase tracking-widest font-black text-text-description mb-1">{t.status}</p>
                            <span className="bg-primary/20 text-primary-dark text-[10px] font-black px-3 py-1 rounded-full uppercase">{t.confirmed}</span>
                        </div>
                    </div>
                </div>

                <div className="p-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1">
                            <p className="text-[10px] uppercase tracking-widest font-black text-text-description flex items-center">
                                <User size={10} className="mr-1" /> {t.userName}
                            </p>
                            <p className="font-bold text-text-primary">{userName}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] uppercase tracking-widest font-black text-text-description flex items-center">
                                <MapPin size={10} className="mr-1" /> {t.turfName}
                            </p>
                            <p className="font-black text-primary">{turfName}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] uppercase tracking-widest font-black text-text-description flex items-center">
                                <Calendar size={10} className="mr-1" /> {t.date}
                            </p>
                            <p className="font-bold text-text-primary">{date}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] uppercase tracking-widest font-black text-text-description flex items-center">
                                <Clock size={10} className="mr-1" /> {t.timeSlot}
                            </p>
                            <p className="font-black italic text-text-heading">{slot || (Array.isArray(slots) ? slots.join(', ') : 'N/A')}</p>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-gray-100 flex justify-between items-end">
                        <div>
                            <p className="text-[10px] uppercase tracking-widest font-black text-text-description mb-1 flex items-center">
                                <CreditCard size={10} className="mr-1" /> {t.paidVia.replace('{method}', paymentMethod)}
                            </p>
                            <p className="text-text-secondary text-xs font-bold italic">{t.transactionId}: TXN{Math.floor(Math.random() * 1000000)}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] uppercase tracking-widest font-black text-text-description mb-1">{t.totalAmount}</p>
                            <p className="text-3xl font-black text-text-heading italic">₹{totalAmount}</p>
                        </div>
                    </div>
                </div>

                <div className="p-8 bg-gray-50 flex flex-col md:flex-row gap-4">
                    <button 
                        onClick={downloadReceipt}
                        className="flex-1 py-4 bg-white hover:bg-gray-100 text-text-primary border border-gray-200 font-black rounded-2xl transition-all flex items-center justify-center space-x-2 group"
                    >
                        <Download size={18} className="group-hover:translate-y-1 transition-transform" />
                        <span>{t.downloadReceipt}</span>
                    </button>
                    <button 
                        onClick={() => navigate('/')}
                        className="flex-1 py-4 bg-primary hover:bg-primary-dark text-text-primary font-black rounded-2xl transition-all flex items-center justify-center space-x-2 shadow-lg shadow-primary/20"
                    >
                        <HomeIcon size={18} />
                        <span>{t.returnHome}</span>
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

// Sub-component for session expired state
const AlertCircle: React.FC<{ size: number, className: string }> = ({ size, className }) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width={size} 
        height={size} 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        className={className}
    >
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
);

export default PaymentSuccess;

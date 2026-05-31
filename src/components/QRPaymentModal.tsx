import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Share2, CheckCircle2, AlertCircle } from 'lucide-react';
import { Modal } from './SettingsModals';
import { useTranslation } from '../hooks/useTranslation';

interface QRPaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    amount: number;
    turfName: string;
    date: string;
    slot: string;
    onConfirm: () => void;
}

const QRPaymentModal: React.FC<QRPaymentModalProps> = ({
    isOpen,
    onClose,
    amount,
    turfName,
    date,
    slot,
    onConfirm
}) => {
    const t = useTranslation();
    const upiLink = `upi://pay?pa=merchant@upi&pn=KickoTurfBooking&am=${amount}&cu=INR`;
    
    const handleWhatsAppShare = () => {
        const message = `Hello,

Here is your payment link for Kicko Turf Booking.

Turf: ${turfName}
Date: ${new Date(date).toLocaleDateString()}
Slot: ${slot}
Amount: ₹${amount}

Please complete payment using this UPI link.

${upiLink}`;
        
        const encodedMessage = encodeURIComponent(message);
        window.open(`https://wa.me/?text=${encodedMessage}`, '_blank');
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={t.completePayment}>
            <div className="flex flex-col items-center space-y-6">
                <div className="text-center">
                    <p className="text-text-secondary font-bold mb-1">{t.totalToPay}</p>
                    <h2 className="text-4xl font-black text-primary italic">₹{amount}</h2>
                </div>

                <div className="bg-white p-4 rounded-2xl shadow-inner border border-gray-100">
                    <QRCodeSVG value={upiLink} size={200} />
                </div>

                <div className="text-center space-y-2">
                    <p className="text-sm font-bold text-text-primary px-4">
                        {t.scanQRMsg}
                    </p>
                    <p className="text-[10px] text-text-description font-bold uppercase tracking-widest flex items-center justify-center">
                        <AlertCircle size={10} className="mr-1 text-primary" />
                        {t.slotHoldMsg}
                    </p>
                </div>

                <div className="w-full space-y-3 pt-4">
                    <button
                        onClick={handleWhatsAppShare}
                        className="w-full py-4 bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#25D366] font-black rounded-2xl transition-all border border-[#25D366]/20 flex items-center justify-center group"
                    >
                        <Share2 className="mr-2 group-hover:scale-110 transition-transform" size={20} />
                        {t.sendWhatsApp}
                    </button>
                    
                    <button
                        onClick={onConfirm}
                        className="w-full py-5 bg-primary hover:bg-primary-dark text-text-primary font-black rounded-3xl transition-all shadow-lg shadow-primary/20 flex items-center justify-center group"
                    >
                        <CheckCircle2 className="mr-2 group-hover:scale-110 transition-transform" size={20} />
                        {t.havePaid}
                    </button>
                    
                    <button
                        onClick={onClose}
                        className="w-full py-2 text-text-description font-bold text-xs hover:text-text-secondary transition-colors"
                    >
                        {t.cancelPayment}
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default QRPaymentModal;

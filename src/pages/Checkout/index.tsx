import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Calendar, Clock, MapPin, ShieldCheck } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '');
const resolveUploadUrl = (path: string) => `${API_BASE_URL}${path}`;

const Checkout: React.FC = () => {
    const t = useTranslation();
    const location = useLocation();
    const navigate = useNavigate();
    const { turfId, slots, date, isBogo, discountAmount, freeSlot } = (location.state as {
        turfId: string;
        slots: string[];
        date: string;
        isBogo?: boolean;
        discountAmount?: number;
        freeSlot?: string;
    }) || {};

    const [turf, setTurf] = React.useState<any>(null);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        if (!turfId) return;
        const fetchTurf = async () => {
            try {
                const res = await fetch(`http://localhost:5000/api/turfs/${turfId}`);
                if (res.ok) {
                    const data = await res.json();
                    setTurf(data);
                }
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetchTurf();
    }, [turfId]);

    let firstImage = 'https://images.unsplash.com/photo-1529900948633-14664539659a?w=400&auto=format&fit=crop';
    if (turf) {
        try {
            if (turf.images) {
                const parsed = typeof turf.images === 'string' ? JSON.parse(turf.images) : turf.images;
                if (Array.isArray(parsed) && parsed.length > 0) {
                    const img = parsed[0];
                    firstImage = img.startsWith('/uploads') ? resolveUploadUrl(img) : img;
                }
            } else if (turf.imageUrl) {
                firstImage = turf.imageUrl;
            }
        } catch (e) {
            console.error("Failed to parse images in Checkout:", e);
        }
    }

    const getSlotPrice = (slotTime: string) => {
        if (turf && turf.slotPrices) {
            try {
                const slotPricesMap = typeof turf.slotPrices === 'string' ? JSON.parse(turf.slotPrices) : turf.slotPrices;
                const price = slotPricesMap[slotTime];
                if (price !== undefined) return Number(price);
            } catch (e) {
                console.error("Failed to parse slotPrices in Checkout:", e);
            }
        }
        return turf ? (turf.pricePerHour || turf.price || 1200) : 1200;
    };

    const rentalFee = slots ? slots.reduce((sum, slot) => sum + getSlotPrice(slot), 0) : 1200;
    const bogoDiscount = isBogo && discountAmount ? discountAmount : 0;
    const totalAmount = Math.max(0, rentalFee - bogoDiscount);

    const handlePayment = () => {
        navigate('/payment-options', {
            state: {
                totalAmount,
                turfId,
                turfName: turf?.name || 'Unknown Turf',
                date: new Date(date).toLocaleDateString(),
                rawDate: date,
                slots,
                isBogo,
                discountAmount: bogoDiscount,
                freeSlot
            }
        });
    };

    if (!turfId) {
        return (
            <div className="pt-32 text-center">
                <h2 className="text-2xl font-black text-text-heading">{t.noSession}</h2>
                <button onClick={() => navigate('/')} className="mt-4 text-primary underline font-bold">{t.goBackHome}</button>
            </div>
        );
    }

    if (loading) {
        return <div className="pt-32 text-center text-text-secondary">Loading...</div>;
    }

    return (
        <div className="pt-32 pb-20 max-w-4xl mx-auto px-4">
            <h1 className="text-4xl font-black mb-10 tracking-tighter italic text-text-heading">{t.checkout}</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {/* Order Summary */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-[16px] shadow-[0_10px_25px_rgba(0,0,0,0.08)]">
                        <h3 className="text-xl font-bold mb-6 flex items-center text-text-heading">
                            <ShieldCheck className="text-primary mr-2" />
                            {t.bookingSummary}
                        </h3>

                        <div className="flex items-center space-x-4 mb-6">
                            <img src={firstImage} className="w-20 h-20 rounded-[12px] object-cover" alt={turf?.name} />
                            <div>
                                <h4 className="font-black text-lg text-text-heading">{turf?.name}</h4>
                                <div className="flex items-center text-text-secondary text-sm font-bold">
                                    <MapPin size={14} className="mr-1" />
                                    <span>{turf?.location}</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4 border-t border-gray-100 pt-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center text-text-secondary font-bold">
                                    <Calendar size={18} className="mr-3" />
                                    <span className="text-sm">{t.date}</span>
                                </div>
                                <span className="font-black text-text-primary">{new Date(date).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center text-text-secondary font-bold">
                                    <Clock size={18} className="mr-3" />
                                    <span className="text-sm">{t.timeSlot}</span>
                                </div>
                                <span className="font-black text-primary italic text-right max-w-[200px] leading-tight">
                                    {slots?.map(s => <div key={s}>{s}</div>)}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-primary/5 p-6 rounded-[16px] border border-primary/10">
                        <p className="text-xs text-text-description leading-relaxed font-bold">
                            {t.termsAndConditions}
                        </p>
                    </div>
                </div>

                {/* Payment Details */}
                <div className="space-y-6">
                    <div className="bg-white p-8 rounded-[16px] shadow-[0_10px_35px_rgba(0,0,0,0.12)]">
                        <h3 className="text-xl font-bold mb-8 text-text-heading">{t.paymentDetails}</h3>

                        <div className="space-y-4 mb-8">
                            <div className="flex justify-between items-center">
                                <span className="text-text-secondary font-bold">{t.turfPrice}</span>
                                <span className="font-black text-text-primary">₹{rentalFee}</span>
                            </div>

                            {isBogo && bogoDiscount > 0 && (
                                <div className="flex justify-between items-center text-emerald-600 bg-emerald-50 p-2.5 rounded-xl border border-emerald-100 text-sm font-bold">
                                    <span className="flex items-center">🎁 BOGO Offer Discount</span>
                                    <span className="font-black">-₹{bogoDiscount}</span>
                                </div>
                            )}

                            <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                                <span className="text-xl font-black italic text-text-heading">{t.totalAmount}</span>
                                <span className="text-2xl font-black text-primary italic">₹{totalAmount}</span>
                            </div>
                        </div>

                        <button
                            onClick={handlePayment}
                            className="w-full py-5 bg-primary hover:bg-primary-dark text-black font-black rounded-3xl transition-all shadow-lg shadow-primary/20 flex items-center justify-center group active:scale-[0.98]"
                        >
                            <ShieldCheck className="mr-2 group-hover:scale-110 transition-transform" />
                            {t.proceedToPay}
                        </button>

                        <div className="mt-6 flex items-center justify-center space-x-4 grayscale opacity-30">
                            <div className="flex items-center space-x-1">
                                <span className="font-black text-xs">UPI</span>
                                <div className="h-3 w-3 bg-black rounded-full" />
                            </div>
                            <div className="h-4 w-[1px] bg-gray-200" />
                            <span className="text-[10px] uppercase tracking-widest font-bold text-text-description">{t.securePayment}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;

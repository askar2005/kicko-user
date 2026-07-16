import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, MapPin, Clock, Shield, Wifi, Calendar as CalendarIcon, ChevronLeft, ChevronRight, Timer } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';
import AuthModal from '../../components/auth/AuthModal';

const formatTimer = (seconds: number) => {
    if (typeof seconds !== 'number') return '';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
};

const SLOT_TIMES = [
    "06:00 - 07:00", "07:00 - 08:00", "08:00 - 09:00", "09:00 - 10:00",
    "10:00 - 11:00", "11:00 - 12:00", "12:00 - 13:00", "13:00 - 14:00",
    "14:00 - 15:00", "15:00 - 16:00", "16:00 - 17:00", "17:00 - 18:00",
    "18:00 - 19:00", "19:00 - 20:00", "20:00 - 21:00", "21:00 - 22:00",
    "22:00 - 23:00", "23:00 - 00:00"
];

const normalizeSlotLabel = (slot: string) => slot.replace(/\s*[-\u2013\u2014]\s*/, ' - ').trim();

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '');
const resolveUploadUrl = (path: string) => `${API_BASE_URL}${path}`;

const getLocalDateString = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const safeSlotStates = (value: unknown): Array<{ slot: string; state: string; releaseAt?: string }> => {
    if (!value || !Array.isArray(value)) return [];
    return value
        .map((item: any) => ({
            slot: normalizeSlotLabel(String(item?.slot || '')),
            state: String(item?.state || '').toUpperCase(),
            releaseAt: item?.releaseAt ? String(item.releaseAt) : undefined
        }))
        .filter((item) => item.slot && ['OPEN', 'BOOKED', 'OWNER_BOOKED', 'BLOCKED'].includes(item.state));
};

const TurfDetail: React.FC = () => {
    const t = useTranslation();
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const today = getLocalDateString();
    const [selectedDate, setSelectedDate] = useState(today);
    const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
    const [slotTimers, setSlotTimers] = useState<{ [key: string]: number }>({});
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

    const [turf, setTurf] = useState<any>(null);
    const [dynamicSlots, setDynamicSlots] = useState<{ time: string, status: string }[]>([]);
    const [loading, setLoading] = useState(true);
    const [reviews, setReviews] = useState<any[]>([]);
    const [userRating, setUserRating] = useState(5);
    const [userComment, setUserComment] = useState('');
    const [submittingReview, setSubmittingReview] = useState(false);
    const [currentUser, setCurrentUser] = useState<any>(null);

    React.useEffect(() => {
        const storedUser = localStorage.getItem('kicko_user');
        if (storedUser) {
            setCurrentUser(JSON.parse(storedUser));
        }

        const fetchTurfAndSlots = async () => {
            setLoading(true);
            try {
                let turfData = null;
                try {
                    const turfRes = await fetch(`http://localhost:5000/api/turfs/${id}`);
                    if (turfRes.ok) {
                        turfData = await turfRes.json();
                    }
                } catch (e) {
                    console.error("Backend not running or turf not found");
                }

                if (turfData) {
                    let parsedImages = [];
                    try {
                        if (turfData.images) {
                            parsedImages = typeof turfData.images === 'string' ? JSON.parse(turfData.images) : turfData.images;
                        }
                    } catch (e) {
                        console.error("Failed to parse images in TurfDetail", e);
                    }
                    if (!Array.isArray(parsedImages) || parsedImages.length === 0) {
                        parsedImages = turfData.imageUrl ? [turfData.imageUrl] : ['https://images.unsplash.com/photo-1529900948633-14664539659a?w=1200&auto=format&fit=crop'];
                    }
                    parsedImages = parsedImages.map((img: string) => img.startsWith('/uploads') ? resolveUploadUrl(img) : img);

                    let parsedSlotPrices: Record<string, number> = {};
                    try {
                        if (turfData.slotPrices) {
                            const rawPrices = typeof turfData.slotPrices === 'string' ? JSON.parse(turfData.slotPrices) : turfData.slotPrices;
                            Object.keys(rawPrices).forEach(key => {
                                parsedSlotPrices[key] = parseFloat(String(rawPrices[key]));
                            });
                        }
                    } catch (e) {
                        console.error("Failed to parse slotPrices in TurfDetail", e);
                    }

                    let parsedActiveSlots: string[] = [];
                    try {
                        if (turfData.activeSlots) {
                            parsedActiveSlots = typeof turfData.activeSlots === 'string' ? JSON.parse(turfData.activeSlots) : turfData.activeSlots;
                        }
                    } catch (e) {
                        console.error("Failed to parse activeSlots in TurfDetail", e);
                    }

                    turfData.images = parsedImages;
                    turfData.slotPrices = parsedSlotPrices;
                    turfData.activeSlots = parsedActiveSlots;
                    try {
                        if (turfData.blockedSlots) {
                            turfData.blockedSlots = typeof turfData.blockedSlots === 'string' ? JSON.parse(turfData.blockedSlots) : turfData.blockedSlots;
                        } else {
                            turfData.blockedSlots = [];
                        }
                    } catch (e) {
                        turfData.blockedSlots = [];
                    }
                }

                setTurf(turfData ? {
                    ...turfData,
                    rating: 4.8,
                    reviews: 124,
                    description: turfData.description || 'Premium turf facility...',
                    amenities: [
                        { icon: <Shield size={20} />, name: 'amenityChangingRoom' },
                        { icon: <Wifi size={20} />, name: 'amenityWiFi' }
                    ]
                } : {
                    id: '1',
                    name: 'Green Field Arena (Fallback)',
                    location: 'Sector 62, Noida',
                    pricePerHour: 1200,
                    price: 1200,
                    rating: 4.8,
                    reviews: 124,
                    description: 'Start backend to see real DB data.',
                    images: ['https://images.unsplash.com/photo-1529900948633-14664539659a?w=1200&auto=format&fit=crop'],
                    slotPrices: {},
                    activeSlots: SLOT_TIMES,
                    amenities: []
                });

                let availabilityData: {
                    activeSlots: string[];
                    blockedSlots: string[];
                    bookedSlots: string[];
                    ownerBookedSlots: Array<{ slot: string; date?: string; releaseAt?: string }>;
                    slotStates: Array<{ slot: string; state: string; releaseAt?: string }>;
                } = {
                    activeSlots: [],
                    blockedSlots: [],
                    bookedSlots: [],
                    ownerBookedSlots: [],
                    slotStates: [],
                };
                try {
                    const availabilityRes = await fetch(`http://localhost:5000/api/turfs/${id}/availability?date=${selectedDate}`);
                    if (availabilityRes.ok) {
                        availabilityData = await availabilityRes.json();
                    }
                } catch (e) { }

                const activeSlotsList = (turfData && turfData.activeSlots && turfData.activeSlots.length > 0)
                    ? turfData.activeSlots
                    : SLOT_TIMES;

                const effectiveSlots = Array.isArray(availabilityData.activeSlots) && availabilityData.activeSlots.length > 0
                    ? availabilityData.activeSlots
                    : activeSlotsList;
                const slotStateMap = new Map(
                    safeSlotStates(availabilityData.slotStates).map((item) => [item.slot, item.state] as const)
                );

                const baseSlots = effectiveSlots.map((slot: string) => {
                    const normalizedSlot = normalizeSlotLabel(slot);
                    const slotState = slotStateMap.get(normalizedSlot);
                    const isBooked = slotState === 'BOOKED' || slotState === 'OWNER_BOOKED';
                    const isBlocked = slotState === 'BLOCKED';

                    return {
                        time: normalizedSlot,
                        status: isBooked ? 'booked' : isBlocked ? 'blocked' : 'available'
                    };
                });
                setDynamicSlots(baseSlots);

                // Fetch reviews
                try {
                    const revRes = await fetch(`http://localhost:5000/api/turfs/${id}/reviews`);
                    if (revRes.ok) {
                        setReviews(await revRes.json());
                    }
                } catch (e) { }

            } catch (err) {
                console.error("Failed to fetch turf details:", err);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchTurfAndSlots();
        }
    }, [id, selectedDate]);

    // Countdown logic: Decrease all active timers every second
    React.useEffect(() => {
        const interval = setInterval(() => {
            setSlotTimers(prev => {
                const updated = { ...prev };
                let hasChanged = false;

                Object.keys(updated).forEach(slotTime => {
                    if (updated[slotTime] > 0) {
                        updated[slotTime] -= 1;
                        hasChanged = true;
                    }

                    // Auto-release when timer hits 0
                    if (updated[slotTime] === 0) {
                        setSelectedSlots(current => current.filter(s => s !== slotTime));
                        delete updated[slotTime];
                        hasChanged = true;
                    }
                });

                return hasChanged ? updated : prev;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    const toggleSlot = (slotTime: string) => {
        const slotInfo = dynamicSlots.find(slot => slot.time === slotTime);
        if (slotInfo && slotInfo.status !== 'available') {
            return;
        }

        setSelectedSlots(prev => {
            if (prev.includes(slotTime)) {
                // Deselecting: clear timer
                setSlotTimers(timers => {
                    const newTimers = { ...timers };
                    delete newTimers[slotTime];
                    return newTimers;
                });
                return prev.filter(s => s !== slotTime);
            } else {
                // Selecting: start 300s countdown
                setSlotTimers(timers => ({ ...timers, [slotTime]: 300 }));
                return [...prev, slotTime];
            }
        });
    };

    const handleBook = () => {
        if (selectedSlots.length > 0) {
            if (!currentUser) {
                setIsAuthModalOpen(true);
                return;
            }
            navigate('/checkout', { state: { turfId: id, slots: selectedSlots, date: selectedDate } });
        }
    };

    const handleReviewSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUser) {
            setIsAuthModalOpen(true);
            return;
        }

        setSubmittingReview(true);
        try {
            const res = await fetch(`http://localhost:5000/api/turfs/${id}/reviews`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: currentUser.id,
                    rating: userRating,
                    comment: userComment
                })
            });

            if (res.ok) {
                const newReview = await res.json();
                // Add local username for immediate display
                newReview.user = { name: currentUser.name };
                setReviews([newReview, ...reviews]);
                setUserComment('');
                alert("Review submitted successfully!");
            } else {
                const data = await res.json();
                alert(data.error || "Failed to submit review");
            }
        } catch (error) {
            alert("Error connecting to server");
        } finally {
            setSubmittingReview(false);
        }
    };

    const hasUserReviewed = currentUser && reviews.some(r => r.userId === currentUser.id);

    const getSlotPrice = (slotTime: string) => {
        if (turf && turf.slotPrices) {
            const price = turf.slotPrices[slotTime];
            if (price !== undefined) return Number(price);
        }
        return turf ? (turf.pricePerHour || turf.price || 1200) : 1200;
    };

    const calculateSelectedTotal = () => {
        return selectedSlots.reduce((sum, slot) => sum + getSlotPrice(slot), 0);
    };

    return (
        <div className="pt-24 pb-20 max-w-7xl mx-auto px-4">
            {/* Back Button */}
            <button
                onClick={() => navigate(-1)}
                className="mb-6 flex items-center text-text-secondary hover:text-primary transition-colors group font-bold"
            >
                <ChevronLeft size={20} className="mr-1 group-hover:-translate-x-1 transition-transform" />
                {t.backToSearch}
            </button>

            {loading ? (
                <div className="flex justify-center py-20 text-text-secondary">Loading...</div>
            ) : turf && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Left Content - Images & Info */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Image Carousel */}
                        <div className="relative h-[400px] md:h-[500px] rounded-[16px] overflow-hidden group shadow-[0_10px_25px_rgba(0,0,0,0.08)]">
                            <img
                                src={turf.images[activeImageIndex]}
                                className="w-full h-full object-cover transition-all duration-500"
                                alt={turf.name}
                            />

                            {/* Carousel Controls */}
                            <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 flex justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => setActiveImageIndex(prev => (prev > 0 ? prev - 1 : turf.images.length - 1))}
                                    className="w-12 h-12 rounded-full glass flex items-center justify-center hover:bg-white/20 transition-all"
                                >
                                    <ChevronLeft size={24} />
                                </button>
                                <button
                                    onClick={() => setActiveImageIndex(prev => (prev < turf.images.length - 1 ? prev + 1 : 0))}
                                    className="w-12 h-12 rounded-full glass flex items-center justify-center hover:bg-white/20 transition-all"
                                >
                                    <ChevronRight size={24} />
                                </button>
                            </div>

                            {/* Carousel Indicators */}
                            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-2">
                                {turf.images.map((_: any, idx: number) => (
                                    <button
                                        key={idx}
                                        onClick={() => setActiveImageIndex(idx)}
                                        className={`w-2 h-2 rounded-full transition-all ${idx === activeImageIndex ? 'w-8 bg-primary' : 'bg-white/40'}`}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Turf Info */}
                        <div>
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                                <h1 className="text-4xl font-black tracking-tighter italic text-text-heading">{turf.name}</h1>
                                <div className="flex items-center space-x-4">
                                    <div className="flex items-center text-yellow-600">
                                        <Star fill="currentColor" size={20} />
                                        <span className="ml-1 font-bold text-lg text-text-primary">{turf.rating}</span>
                                        <span className="ml-1 text-text-secondary font-bold">({turf.reviews} {t.reviewsLabel})</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center text-text-secondary mb-8 font-bold">
                                <MapPin size={18} className="mr-2 text-primary" />
                                <span>{turf.location}</span>
                            </div>

                            <div className="space-y-6">
                                <h3 className="text-xl font-bold text-text-heading">{t.aboutTurf}</h3>
                                <p className="text-text-primary leading-relaxed text-lg font-medium">
                                    {turf.description}
                                </p>
                            </div>

                            {/* Amenities */}
                            <div className="pt-8 border-t border-gray-100 space-y-6">
                                <h3 className="text-xl font-bold text-text-heading">{t.amenitiesLabel}</h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {turf.amenities.map((amenity: any, idx: number) => (
                                        <div key={idx} className="flex items-center p-4 rounded-[12px] bg-white border border-gray-100 shadow-sm">
                                            <span className="text-primary mr-3">{amenity.icon}</span>
                                            <span className="text-sm font-bold text-text-primary">{t[amenity.name as keyof typeof t] || amenity.name}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Reviews Section */}
                            <div className="pt-8 border-t border-gray-100 space-y-6">
                                <h3 className="text-xl font-bold text-text-heading flex items-center">
                                    <Star className="text-yellow-500 mr-2" size={24} fill="currentColor" />
                                    User Reviews ({reviews.length})
                                </h3>

                                {/* Submit Review Form */}
                                {currentUser && !hasUserReviewed && (
                                    <form onSubmit={handleReviewSubmit} className="bg-gray-50 p-6 rounded-xl border border-gray-100 mb-6">
                                        <h4 className="font-bold mb-4">Leave a Review</h4>
                                        <div className="flex items-center space-x-2 mb-4">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <button
                                                    type="button"
                                                    key={star}
                                                    onClick={() => setUserRating(star)}
                                                    className="text-yellow-500 transition-transform hover:scale-110"
                                                >
                                                    <Star size={24} fill={userRating >= star ? "currentColor" : "none"} />
                                                </button>
                                            ))}
                                        </div>
                                        <textarea
                                            value={userComment}
                                            onChange={(e) => setUserComment(e.target.value)}
                                            placeholder="What did you think of this turf?"
                                            className="w-full p-3 rounded-lg border border-gray-200 mb-4 focus:outline-primary font-medium"
                                            rows={3}
                                            required
                                        />
                                        <button
                                            type="submit"
                                            disabled={submittingReview}
                                            className="bg-primary px-6 py-2 rounded-full font-bold shadow-sm hover:bg-primary-dark transition-colors disabled:opacity-50 text-black"
                                        >
                                            {submittingReview ? 'Submitting...' : 'Submit Review'}
                                        </button>
                                    </form>
                                )}

                                {currentUser && hasUserReviewed && (
                                    <div className="bg-primary/5 text-primary p-4 rounded-xl border border-primary/20 text-sm font-bold">
                                        You have already reviewed this turf. Thanks for your feedback!
                                    </div>
                                )}

                                {!currentUser && (
                                    <button onClick={() => setIsAuthModalOpen(true)} className="text-primary font-bold hover:underline">
                                        Log in to leave a review
                                    </button>
                                )}

                                {/* Reviews List */}
                                <div className="space-y-4">
                                    {reviews.length > 0 ? (
                                        reviews.map((review) => (
                                            <div key={review.id} className="p-4 bg-white border border-gray-100 rounded-xl shadow-sm">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div className="font-bold">{review.user?.name || "Anonymous"}</div>
                                                    <div className="flex">
                                                        {[...Array(5)].map((_, i) => (
                                                            <Star key={i} size={14} className={i < review.rating ? "text-yellow-500" : "text-gray-300"} fill={i < review.rating ? "currentColor" : "none"} />
                                                        ))}
                                                    </div>
                                                </div>
                                                <p className="text-text-secondary text-sm font-medium">{review.comment}</p>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-text-secondary italic">No reviews yet. Be the first to review!</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Content - Booking Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-28 bg-white p-8 rounded-[16px] shadow-[0_10px_25px_rgba(0,0,0,0.08)]">
                            <div className="flex items-baseline justify-between mb-8">
                                <span className="text-2xl font-black text-primary italic">
                                    {turf.slotPrices && Object.keys(turf.slotPrices).length > 0
                                        ? `Starting from ₹${Math.min(...Object.values(turf.slotPrices).map(p => Number(p)))}`
                                        : `₹${turf.pricePerHour || turf.price}`
                                    }
                                </span>
                                <span className="text-text-secondary font-bold">{t.perHour}</span>
                            </div>

                            {/* Date Selection */}
                            <div className="space-y-4 mb-8">
                                <label className="text-sm font-black text-text-description uppercase tracking-widest flex items-center">
                                    <CalendarIcon size={16} className="mr-2" />
                                    {t.selectDate}
                                </label>
                                <input
                                    type="date"
                                    value={selectedDate}
                                    onChange={(e) => setSelectedDate(e.target.value)}
                                    min={today}
                                    className="w-full bg-white border border-gray-100 rounded-[12px] px-6 py-4 text-text-primary focus:border-primary outline-none transition-colors font-bold shadow-sm"
                                />
                            </div>

                            {/* Slot Selection */}
                            <div className="space-y-4 mb-8">
                                <label className="text-sm font-black text-text-description uppercase tracking-widest flex items-center">
                                    <Clock size={16} className="mr-2" />
                                    {t.selectSlot}
                                </label>
                                <div className="grid grid-cols-1 gap-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                    {dynamicSlots.map((slot: { time: string; status: string }, idx: number) => (
                                        <button
                                            key={idx}
                                            disabled={slot.status === 'booked' || slot.status === 'blocked'}
                                            onClick={() => toggleSlot(slot.time)}
                                            className={`w-full px-6 py-4 rounded-xl text-sm font-bold border transition-all flex justify-between items-center group ${slot.status === 'booked'
                                                ? 'bg-slate-800 border-slate-700 text-slate-400 cursor-not-allowed line-through opacity-70'
                                                : slot.status === 'blocked'
                                                    ? 'bg-rose-50 border-rose-200 text-rose-700 cursor-not-allowed line-through opacity-90'
                                                    : selectedSlots.includes(slot.time)
                                                        ? 'bg-primary border-primary text-black'
                                                        : 'bg-white border-gray-100 text-text-primary hover:border-primary/50 shadow-sm mb-1'
                                                }`}
                                        >
                                            <div className="flex flex-col items-start text-left">
                                                <span className="text-sm font-bold">{slot.time}</span>
                                                {slot.status === 'available' && (
                                                    <span className={`text-xs mt-0.5 ${selectedSlots.includes(slot.time) ? 'text-black/70' : 'text-primary'}`}>
                                                        ₹{getSlotPrice(slot.time)}
                                                    </span>
                                                )}
                                            </div>
                                            {selectedSlots.includes(slot.time) && (
                                                <div className="flex items-center space-x-2 bg-black/10 px-3 py-1 rounded-full">
                                                    <Timer size={14} className="animate-pulse" />
                                                    <span className="text-xs font-black">{formatTimer(slotTimers[slot.time])}</span>
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Total Price Breakdown */}
                            {selectedSlots.length > 0 && (
                                <div className="space-y-3 mb-8 p-4 rounded-[12px] bg-primary/5 border border-primary/10 animate-fade-in">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-text-secondary font-bold">{t.rentalFee} ({selectedSlots.length} {selectedSlots.length > 1 ? t.slots : t.slot})</span>
                                        <span className="text-text-primary font-black">₹{calculateSelectedTotal()}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-text-secondary font-bold">{t.serviceFee}</span>
                                        <span className="text-text-primary font-black">₹50</span>
                                    </div>
                                    <div className="pt-3 border-t border-primary/10 flex justify-between font-bold text-lg">
                                        <span className="text-text-primary">{t.total}</span>
                                        <span className="text-primary italic font-black">₹{calculateSelectedTotal() + 50}</span>
                                    </div>
                                </div>
                            )}

                            <button
                                disabled={selectedSlots.length === 0}
                                onClick={handleBook}
                                className="w-full py-5 bg-primary disabled:bg-gray-100 disabled:text-gray-400 hover:bg-primary-dark text-black font-black rounded-3xl transition-all shadow-lg shadow-primary/20 active:scale-[0.98]"
                            >
                                {t.bookButton} {selectedSlots.length > 0 ? `${selectedSlots.length} ${selectedSlots.length > 1 ? t.slots : t.slot}` : t.slot}
                            </button>

                            <p className="mt-4 text-center text-xs text-gray-500 font-bold">
                                {t.slotsHeldMsg}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            <AuthModal
                isOpen={isAuthModalOpen}
                onClose={() => setIsAuthModalOpen(false)}
                onSuccess={() => {
                    setIsAuthModalOpen(false);
                    // Automatically proceed to checkout after successful login
                    navigate('/checkout', { state: { turfId: id, slots: selectedSlots, date: selectedDate } });
                }}
            />
        </div>
    );
};

export default TurfDetail;

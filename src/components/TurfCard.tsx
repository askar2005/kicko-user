import React from 'react';
import { MapPin, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../hooks/useTranslation';

interface TurfCardProps {
    id: string;
    name: string;
    location: string;
    price: number;
    rating: number;
    image: string;
    available: boolean;
    distance?: number;
}

const TurfCard: React.FC<TurfCardProps> = ({ id, name, location, price, rating, image, available, distance }) => {
    const t = useTranslation();
    return (
        <div className="group bg-white rounded-[16px] overflow-hidden transition-all duration-500 hover:-translate-y-2 shadow-[0_10px_25px_rgba(0,0,0,0.08)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.12)]">
            {/* Image Container */}
            <div className="relative h-56 overflow-hidden">
                <img
                    src={image}
                    alt={name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute top-4 right-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase border ${available ? "bg-primary/20 text-text-title border-primary/30" : "bg-red-500/20 text-red-700 border-red-500/30"
                        }`}>
                        {available ? t.available : t.booked}
                    </span>
                </div>
            </div>

            {/* Content */}
            <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold text-text-heading group-hover:text-primary transition-colors">{name}</h3>
                    <div className="flex items-center text-yellow-600">
                        <Star size={16} fill="currentColor" />
                        <span className="ml-1 text-sm font-bold text-text-primary">{rating}</span>
                    </div>
                </div>

                <div className="flex items-center justify-between text-text-secondary text-sm mb-4">
                    <div className="flex items-center">
                        <MapPin size={14} className="mr-1" />
                        <span>{location}</span>
                    </div>
                    {distance !== undefined && distance !== null && (
                        <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold">
                            {distance.toFixed(1)} km away
                        </span>
                    )}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div>
                        <span className="text-primary text-xl font-extrabold">₹{price}</span>
                        <span className="text-text-secondary text-xs ml-1 font-medium">{t.perHr}</span>
                    </div>
                    <Link
                        to={`/turf/${id}`}
                        className="px-5 py-2 bg-primary hover:bg-primary-dark text-text-primary font-bold rounded-xl transition-all active:scale-95 shadow-sm"
                    >
                        {t.bookNow}
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default TurfCard;

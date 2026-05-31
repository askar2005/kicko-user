import React from 'react';

interface AdCardProps {
    adSlot?: string;
    adClient?: string;
    adFormat?: string;
    className?: string;
}

const AdCard: React.FC<AdCardProps> = ({ className = "" }) => {
    return (
        <div className={`flex justify-center w-full px-4 ${className}`}>
            <div className="bg-[#f8fafc] border border-gray-100 rounded-[16px] shadow-sm overflow-hidden flex items-center justify-center text-text-description font-black uppercase tracking-widest text-xs
                w-full max-w-[900px] h-48 md:h-64">
                Sponsored Promotion
            </div>
        </div>
    );
};

export default AdCard;

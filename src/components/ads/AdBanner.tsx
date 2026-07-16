import React from 'react';

interface AdBannerProps {
    adSlot?: string;
    adClient?: string;
    adFormat?: string;
    className?: string;
}

const AdBanner: React.FC<AdBannerProps> = ({ className = "" }) => {
    return (
        <div className={`flex justify-center w-full px-4 ${className}`}>
            <div className="bg-[#f8fafc] border border-gray-100 rounded-[12px] shadow-sm overflow-hidden flex items-center justify-center text-text-description font-black uppercase tracking-widest text-[10px]
                w-full max-w-[320px] h-[100px] 
                md:max-w-none md:w-[728px] md:h-[90px] 
                lg:w-[970px] lg:h-[90px]">
                Advertisement
            </div>
        </div>
    );
};

export default AdBanner;


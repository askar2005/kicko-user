import React from 'react';

interface AdFooterProps {
    adSlot?: string;
    adClient?: string;
    adFormat?: string;
    className?: string;
}

const AdFooter: React.FC<AdFooterProps> = ({ className = "" }) => {
    return (
        <div className={`flex justify-center w-full px-4 ${className}`}>
            <div className="bg-[#f8fafc] border border-gray-100 rounded-[12px] shadow-sm overflow-hidden flex items-center justify-center text-text-description font-black uppercase tracking-widest text-xs
                w-full max-w-[970px] py-8 px-6">
                Ad Space
            </div>
        </div>
    );
};

export default AdFooter;

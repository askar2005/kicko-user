import React from 'react';
import { Mail, CheckCircle, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../../../hooks/useTranslation';

const EmailVerification: React.FC = () => {
    const t = useTranslation();
    const navigate = useNavigate();

    return (
        <div className="space-y-6 text-center">
            <div className="mb-8">
                <h2 className="text-3xl font-black tracking-tighter italic text-text-heading">{t.verifyEmail.split(' ')[0]} <span className="text-primary italic">{t.verifyEmail.split(' ')[1]}</span></h2>
                <p className="text-text-secondary mt-2 font-bold">{t.almostThere} {t.verificationLinkSentMsg}</p>
            </div>

            <div className="py-8 space-y-8">
                <div className="w-24 h-24 bg-primary/10 rounded-[16px] flex items-center justify-center mx-auto border border-primary/20 relative shadow-sm">
                    <Mail size={40} className="text-primary" />
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-primary rounded-full flex items-center justify-center border-4 border-white shadow-xl">
                        <CheckCircle size={16} className="text-black" />
                    </div>
                </div>

                <div className="space-y-4">
                    <p className="text-text-primary font-bold">
                        {t.clickLinkToVerify}
                    </p>
                    <div className="p-4 rounded-[12px] bg-primary/5 border border-primary/10 text-sm text-text-description font-bold">
                        {t.didNotReceiveEmail} <button className="text-primary font-black hover:underline">{t.resendEmail}</button>
                    </div>
                </div>

                <button
                    onClick={() => navigate('/login')}
                    className="w-full py-5 bg-primary hover:bg-primary-dark text-black font-black rounded-[12px] transition-all shadow-lg shadow-primary/20 flex items-center justify-center group"
                >
                    {t.backToSignIn}
                    <ArrowRight size={20} className="ml-2 transition-transform group-hover:translate-x-1" />
                </button>
            </div>
        </div>
    );
};

export default EmailVerification;

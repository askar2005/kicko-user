import React from 'react';
import { useTranslation } from '../hooks/useTranslation';

const AboutUs: React.FC = () => {
    const t = useTranslation();
    return (
        <div className="pt-32 pb-20 max-w-4xl mx-auto px-4 prose prose-slate">
            <h1 className="text-4xl font-black italic mb-8 text-text-heading">{t.aboutUsLabel} <span className="text-primary">KICKO</span></h1>
            <p className="text-text-primary text-lg leading-relaxed font-bold">
                {t.aboutKICKODesc}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-12">
                <div className="bg-white p-8 rounded-[16px] shadow-[0_10px_25px_rgba(0,0,0,0.08)]">
                    <h3 className="text-primary font-black italic text-xl mb-4 uppercase tracking-tighter">{t.ourVision}</h3>
                    <p className="text-sm text-text-secondary font-bold">{t.ourVisionDesc}</p>
                </div>
                <div className="bg-white p-8 rounded-[16px] shadow-[0_10px_25px_rgba(0,0,0,0.08)]">
                    <h3 className="text-primary font-black italic text-xl mb-4 uppercase tracking-tighter">{t.ourValues}</h3>
                    <p className="text-sm text-text-secondary font-bold">{t.ourValuesDesc}</p>
                </div>
            </div>
        </div>
    );
};

export const PrivacyPolicy: React.FC = () => {
    const t = useTranslation();
    return (
        <div className="pt-32 pb-20 max-w-4xl mx-auto px-4 prose prose-slate text-text-primary">
            <h1 className="text-4xl font-black italic mb-8 text-text-heading">{t.privacyPolicyLabel}</h1>
            <p className="text-text-secondary font-bold">{t.lastUpdated}</p>
            <div className="space-y-8 mt-10">
                <section>
                    <h3 className="text-xl font-black mb-4 text-text-heading italic tracking-tighter">{t.infoCollection}</h3>
                    <p className="text-text-description text-sm font-bold">{t.infoCollectionDesc}</p>
                </section>
                <section>
                    <h3 className="text-xl font-black mb-4 text-text-heading italic tracking-tighter">{t.useOfInfo}</h3>
                    <p className="text-text-description text-sm font-bold">{t.useOfInfoDesc}</p>
                </section>
            </div>
        </div>
    );
};

export const TermsConditions: React.FC = () => {
    const t = useTranslation();
    return (
        <div className="pt-32 pb-20 max-w-4xl mx-auto px-4 prose prose-slate text-text-primary">
            <h1 className="text-4xl font-black italic mb-8 text-text-heading">{t.termsConditionsLabel}</h1>
            <p className="text-text-secondary font-bold">{t.welcomeKICKO}</p>
            <div className="space-y-8 mt-10">
                <section>
                    <h3 className="text-xl font-black mb-4 text-text-heading italic tracking-tighter">{t.bookingRules}</h3>
                    <p className="text-text-description text-sm font-bold">{t.bookingRulesDesc}</p>
                </section>
                <section>
                    <h3 className="text-xl font-black mb-4 text-text-heading italic tracking-tighter">{t.cancellationPolicyLabel}</h3>
                    <p className="text-text-description text-sm font-bold">{t.cancellationPolicyDesc}</p>
                </section>
            </div>
        </div>
    );
};

export default AboutUs;

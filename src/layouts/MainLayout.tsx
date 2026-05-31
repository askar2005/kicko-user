import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useTranslation } from '../hooks/useTranslation';

const MainLayout: React.FC = () => {
    const t = useTranslation();
    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-grow">
                <Outlet />
            </main>
            <footer className="bg-white/50 py-12 border-t border-green-100">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-8 text-sm text-text-description font-black uppercase tracking-widest">
                        <div className="flex space-x-8">
                            <Link to="/about" className="hover:text-primary transition-colors">{t.aboutUsLabel}</Link>
                            <Link to="/privacy" className="hover:text-primary transition-colors">{t.privacyPolicyLabel}</Link>
                            <Link to="/terms" className="hover:text-primary transition-colors">{t.termsConditionsLabel}</Link>
                        </div>
                        <div className="text-2xl font-black text-primary italic tracking-tighter">KICKO</div>
                    </div>
                    <p className="text-center text-text-secondary text-xs font-bold tracking-wide">&copy; {new Date().getFullYear()} KICKO. {t.builtForSports}</p>
                </div>
            </footer>
        </div>
    );
};

export default MainLayout;

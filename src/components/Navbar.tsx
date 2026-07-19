import React, { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { Bell, Menu, X, LogOut, Settings as SettingsIcon } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useTranslation } from '../hooks/useTranslation';
import AuthModal from './auth/AuthModal';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

const Navbar: React.FC = () => {
    const t = useTranslation();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [user, setUser] = useState<any>(null);
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const syncUser = () => {
            const storedUser = localStorage.getItem('kicko_user');
            if (storedUser) {
                try {
                    setUser(JSON.parse(storedUser));
                } catch {
                    localStorage.removeItem('kicko_user');
                    setUser(null);
                }
            } else {
                setUser(null);
            }
        };

        syncUser();
        window.addEventListener('focus', syncUser);
        window.addEventListener('storage', syncUser);

        return () => {
            window.removeEventListener('focus', syncUser);
            window.removeEventListener('storage', syncUser);
        };
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('kicko_user');
        setUser(null);
        navigate('/');
    };

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { name: t.home, path: '/' },
        { name: t.myBookings, path: '/bookings' },
    ];

    const isActive = (path: string) => location.pathname === path;

    return (
        <nav className={cn(
            "fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-4 md:px-8 py-4",
            isScrolled ? "bg-white/90 backdrop-blur-lg border-b border-green-100 shadow-sm" : "bg-transparent"
        )}>
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                {/* Logo and Badge */}
                <div className="flex items-center space-x-6">
                    <Link to="/" className="text-2xl font-black text-primary tracking-tighter italic">
                        KICKO
                    </Link>
                    <div className="hidden md:flex items-center space-x-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-text-heading">
                        <span className="w-2 h-2 bg-primary rounded-full animate-ping" />
                        <span className="text-xs font-bold tracking-widest uppercase italic">{t.liveBooking}</span>
                    </div>
                </div>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center space-x-8">
                    {navLinks.map((link) => (
                        <Link
                            key={link.path}
                            to={link.path}
                            className={cn(
                                "text-sm font-bold transition-colors hover:text-primary",
                                isActive(link.path) ? "text-primary" : "text-text-primary"
                            )}
                        >
                            {link.name}
                        </Link>
                    ))}
                    <div className="flex items-center space-x-5 pl-4 border-l border-gray-200">
                        {user ? (
                            <>
                                <span className="text-sm font-bold text-text-primary mr-2 hidden md:block">
                                    Hi, {user.name.split(' ')[0]}
                                </span>
                                <Link to="/notifications" className="text-text-heading hover:text-primary relative group">
                                    <Bell size={20} />
                                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full border-2 border-white" />
                                </Link>
                                <Link to="/settings" className="text-text-heading hover:text-primary relative group" title="Settings">
                                    <SettingsIcon size={20} />
                                </Link>
                                <button 
                                    onClick={handleLogout} 
                                    title="Logout"
                                    className="flex items-center space-x-2 text-text-primary hover:text-red-500 group"
                                >
                                    <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20 group-hover:border-red-500/40 transition-colors">
                                        <LogOut size={16} className="text-red-500" />
                                    </div>
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={() => setIsAuthModalOpen(true)}
                                className="text-sm font-black text-black bg-primary px-5 py-2 rounded-full hover:bg-primary-dark transition-colors shadow-sm"
                            >
                                Sign In
                            </button>
                        )}
                    </div>
                </div>
                {/* Mobile Toggle */}
                <button
                    className="md:hidden text-text-heading min-h-[44px] min-w-[44px] flex items-center justify-center"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                    {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className="md:hidden absolute top-full left-4 right-4 bg-white rounded-[16px] border border-gray-100 px-4 py-6 flex flex-col space-y-4 shadow-[0_10px_25px_rgba(0,0,0,0.15)] mt-2 max-h-[calc(100vh-6rem)] overflow-y-auto">
                    {navLinks.map((link) => (
                        <Link
                            key={link.path}
                            to={link.path}
                            className={cn(
                                "text-lg font-bold min-h-[44px] flex items-center",
                                isActive(link.path) ? "text-primary" : "text-text-primary"
                            )}
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            {link.name}
                        </Link>
                    ))}
                    <div className="pt-4 border-t border-gray-100 flex flex-col space-y-4">
                        {user && (
                            <div className="text-sm font-bold text-text-secondary px-1">Hi, {user.name.split(' ')[0]}</div>
                        )}
                        <Link
                            to="/notifications"
                            className="flex items-center space-x-3 text-text-primary font-bold min-h-[44px]"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            <Bell size={20} className="text-primary" />
                            <span>{t.notifications}</span>
                        </Link>
                        <Link
                            to="/settings"
                            className="flex items-center space-x-3 text-text-primary font-bold min-h-[44px]"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            <SettingsIcon size={20} className="text-primary" />
                            <span>Settings & Profile</span>
                        </Link>
                        {user ? (
                            <button
                                onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }}
                                className="flex items-center space-x-3 text-red-500 font-bold min-h-[44px]"
                            >
                                <LogOut size={20} />
                                <span>Logout</span>
                            </button>
                        ) : (
                            <button
                                onClick={() => { setIsAuthModalOpen(true); setIsMobileMenuOpen(false); }}
                                className="text-sm font-black text-black bg-primary px-5 py-3 rounded-full hover:bg-primary-dark transition-colors shadow-sm min-h-[44px]"
                            >
                                Sign In
                            </button>
                        )}
                    </div>
                </div>
            )}
            <AuthModal 
                isOpen={isAuthModalOpen} 
                onClose={() => setIsAuthModalOpen(false)} 
                onSuccess={(userData) => setUser(userData)}
            />
        </nav>
    );
};

export default Navbar;




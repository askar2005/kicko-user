import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '../hooks/useTranslation';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="bg-white rounded-[16px] w-full max-w-md overflow-hidden shadow-[0_10px_25px_rgba(0,0,0,0.1)] relative z-10"
                    >
                        <div className="px-8 pt-8 flex items-center justify-between">
                            <h3 className="text-2xl font-black italic tracking-tighter text-text-heading">{title}</h3>
                            <button onClick={onClose} className="p-2 hover:bg-white/50 rounded-full transition-colors text-text-secondary">
                                <X size={24} />
                            </button>
                        </div>
                        <div className="p-8">
                            {children}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

interface EditProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    userData: { name: string; email: string; phone: string };
    onSave: (data: { name: string; email: string; phone: string }) => Promise<void>;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({ isOpen, onClose, userData, onSave }) => {
    const t = useTranslation();
    const [name, setName] = useState(userData.name);
    const [email, setEmail] = useState(userData.email);
    const [phone, setPhone] = useState(userData.phone);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [hasBeenReset, setHasBeenReset] = useState(false);

    useEffect(() => {
        if (isOpen && !hasBeenReset) {
            setName(userData.name);
            setEmail(userData.email);
            setPhone(userData.phone);
            setHasBeenReset(true);
        }
        if (!isOpen) {
            setHasBeenReset(false);
            setSuccess(false);
            setError(null);
        }
    }, [isOpen, userData, hasBeenReset]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await onSave({ name, email, phone });
            setSuccess(true);
            setTimeout(() => {
                setSuccess(false);
                onClose();
            }, 2000);
        } catch (error: any) {
            console.error(error);
            setError(error.message || "Failed to update profile");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={t.editProfile}>
            {success ? (
                <div className="text-center py-8">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle2 className="text-primary" size={40} />
                    </div>
                    <p className="font-bold text-text-primary">{t.profileUpdated}</p>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <div className="p-4 bg-red-50 rounded-2xl flex items-center text-red-500 text-sm font-bold border border-red-100">
                            <AlertCircle size={18} className="mr-2" />
                            {error}
                        </div>
                    )}
                    <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-text-description ml-1">{t.fullName}</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-white border border-gray-100 rounded-[12px] px-6 py-4 outline-none focus:border-primary transition-colors font-bold text-text-primary shadow-sm"
                            placeholder={t.namePlaceholder}
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-text-description ml-1">{t.emailAddress}</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-white border border-gray-100 rounded-[12px] px-6 py-4 outline-none focus:border-primary transition-colors font-bold text-text-primary shadow-sm"
                            placeholder={t.emailPlaceholder}
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-text-description ml-1">{t.phoneNumber}</label>
                        <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="w-full bg-white border border-gray-100 rounded-[12px] px-6 py-4 outline-none focus:border-primary transition-colors font-bold text-text-primary shadow-sm"
                            placeholder={t.phonePlaceholder}
                        />
                    </div>
                    <button
                        disabled={loading}
                        className="w-full mt-6 py-4 bg-primary hover:bg-primary-dark text-text-primary font-black rounded-2xl transition-all shadow-lg shadow-primary/20 flex items-center justify-center"
                    >
                        {loading ? <div className="w-6 h-6 border-2 border-text-primary border-t-transparent rounded-full animate-spin" /> : t.saveChanges}
                    </button>
                </form>
            )}
        </Modal>
    );
};

interface PasswordModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUpdate: (current: string, newPass: string) => Promise<void>;
}

export const PasswordModal: React.FC<PasswordModalProps> = ({ isOpen, onClose, onUpdate }) => {
    const t = useTranslation();
    const [current, setCurrent] = useState('');
    const [newPass, setNewPass] = useState('');
    const [confirm, setConfirm] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPass !== confirm) {
            setError("Passwords don't match");
            return;
        }
        setLoading(true);
        setError(null);
        try {
            await onUpdate(current, newPass);
            setSuccess(true);
            setTimeout(() => {
                setSuccess(false);
                onClose();
            }, 2000);
        } catch (err: any) {
            setError(err.message || "Failed to update password");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={t.security}>
            {success ? (
                <div className="text-center py-8">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle2 className="text-primary" size={40} />
                    </div>
                    <p className="font-bold text-text-primary">{t.passwordChanged}</p>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <div className="p-4 bg-red-50 rounded-2xl flex items-center text-red-500 text-sm font-bold border border-red-100">
                            <AlertCircle size={18} className="mr-2" />
                            {error}
                        </div>
                    )}
                    <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-text-description ml-1">{t.currentPassword}</label>
                        <input
                            type="password"
                            value={current}
                            onChange={(e) => setCurrent(e.target.value)}
                            className="w-full bg-white border border-gray-100 rounded-2xl px-6 py-4 outline-none focus:border-primary transition-colors text-text-primary"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-text-description ml-1">{t.newPassLabel}</label>
                        <input
                            type="password"
                            value={newPass}
                            onChange={(e) => setNewPass(e.target.value)}
                            className="w-full bg-white border border-gray-100 rounded-2xl px-6 py-4 outline-none focus:border-primary transition-colors text-text-primary"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-text-description ml-1">{t.confirmNewPass}</label>
                        <input
                            type="password"
                            value={confirm}
                            onChange={(e) => setConfirm(e.target.value)}
                            className="w-full bg-white border border-gray-100 rounded-[12px] px-6 py-4 outline-none focus:border-primary transition-colors text-text-primary shadow-sm"
                        />
                    </div>
                    <button
                        disabled={loading}
                        className="w-full mt-6 py-4 bg-primary hover:bg-primary-dark text-black font-black rounded-2xl transition-all shadow-lg shadow-primary/20 flex items-center justify-center"
                    >
                        {loading ? <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin" /> : t.updatePasswordButton}
                    </button>
                </form>
            )}
        </Modal>
    );
};

interface LanguageModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentLang: string;
    onSelect: (lang: string) => void;
}

export const LanguageModal: React.FC<LanguageModalProps> = ({ isOpen, onClose, currentLang, onSelect }) => {
    const t = useTranslation();
    const languages = [
        { code: 'en', name: 'English (US)', flag: '🇺🇸' },
        { code: 'ta', name: 'Tamil (தமிழ்)', flag: '🇮🇳' },
    ];

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={t.language}>
            <div className="space-y-3">
                {languages.map((lang) => (
                    <button
                        key={lang.code}
                        onClick={() => {
                            onSelect(lang.code);
                            onClose();
                        }}
                        className={`w-full p-6 rounded-2xl border transition-all flex items-center justify-between group ${currentLang === lang.code ? 'bg-primary/5 border-primary' : 'bg-gray-50 border-gray-100 hover:bg-white hover:border-primary/50'
                            }`}
                    >
                        <div className="flex items-center space-x-4">
                            <span className="text-2xl">{lang.flag}</span>
                            <span className={`font-bold ${currentLang === lang.code ? 'text-text-primary' : 'text-text-secondary'}`}>{lang.name}</span>
                        </div>
                        {currentLang === lang.code && <CheckCircle2 className="text-primary" size={20} />}
                    </button>
                ))}
            </div>
        </Modal>
    );
};

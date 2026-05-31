import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff, ArrowRight, CheckCircle } from 'lucide-react';
import { useTranslation } from '../../../hooks/useTranslation';

const ResetPassword: React.FC = () => {
    const t = useTranslation();
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            setIsSuccess(true);
        }, 1500);
    };

    return (
        <div className="space-y-6">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-black tracking-tighter italic text-text-heading">{t.newPassword.split(' ')[0]} <span className="text-primary italic">{t.newPassword.split(' ')[1]}</span></h2>
                <p className="text-text-secondary mt-2 font-bold">{t.resetPasswordSubtitle}</p>
            </div>

            {!isSuccess ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-xs font-black text-text-description uppercase tracking-widest ml-1">{t.newPassword}</label>
                        <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-text-description group-focus-within:text-primary transition-colors" size={20} />
                            <input
                                type={showPassword ? "text" : "password"}
                                required
                                placeholder="••••••••"
                                className="w-full bg-white border border-gray-100 rounded-[12px] py-4 pl-12 pr-12 focus:border-primary outline-none transition-all placeholder:text-text-description font-bold text-text-primary shadow-sm"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-text-description hover:text-primary transition-colors"
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-black text-text-description uppercase tracking-widest ml-1">{t.confirmPasswordLabel}</label>
                        <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-text-description group-focus-within:text-primary transition-colors" size={20} />
                            <input
                                type={showPassword ? "text" : "password"}
                                required
                                placeholder="••••••••"
                                className="w-full bg-white border border-gray-100 rounded-[12px] py-4 pl-12 pr-12 focus:border-primary outline-none transition-all placeholder:text-text-description font-bold text-text-primary shadow-sm"
                            />
                        </div>
                    </div>

                    <button
                        disabled={isLoading}
                        className="w-full py-5 bg-primary hover:bg-primary-dark text-black font-black rounded-[12px] transition-all shadow-lg shadow-primary/20 flex items-center justify-center group active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                    >
                        {isLoading ? (
                            <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <>
                                {t.updatePassword}
                                <ArrowRight size={20} className="ml-2 transition-transform group-hover:translate-x-1" />
                            </>
                        )}
                    </button>
                </form>
            ) : (
                <div className="text-center py-8 space-y-6">
                    <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary border border-primary/20">
                        <CheckCircle size={32} />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-xl font-black text-text-heading italic tracking-tighter">{t.successLabel}</h3>
                        <p className="text-text-secondary text-sm font-bold">{t.pwdUpdateSuccess}</p>
                    </div>
                    <button
                        onClick={() => navigate('/login')}
                        className="w-full py-4 bg-primary hover:bg-primary-dark text-black font-black rounded-[12px] transition-all"
                    >
                        {t.signInNow}
                    </button>
                </div>
            )}
        </div>
    );
};

export default ResetPassword;

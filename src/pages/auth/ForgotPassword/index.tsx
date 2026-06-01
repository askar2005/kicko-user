import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowRight, ChevronLeft, CheckCircle } from 'lucide-react';
import { useTranslation } from '../../../hooks/useTranslation';

const ForgotPassword: React.FC = () => {
    const t = useTranslation();
    const [isLoading, setIsLoading] = useState(false);
    const [step, setStep] = useState<'email' | 'reset' | 'success'>('email');
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);
        try {
            const res = await fetch('http://localhost:5000/api/auth/forgot-password/send-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, role: 'customer' })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to send OTP');
            setStep('reset');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);
        try {
            const res = await fetch('http://localhost:5000/api/auth/forgot-password/reset', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp, newPassword, role: 'customer' })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to reset password');
            setStep('success');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-black tracking-tighter italic text-text-heading">{t.resetPassword.split(' ')[0]} <span className="text-primary italic">{t.resetPassword.split(' ')[1]}</span></h2>
                <p className="text-text-secondary mt-2 font-bold">{step === 'email' ? t.enterEmailToReset : step === 'reset' ? 'Enter the OTP and your new password' : t.pwdUpdateSuccess}</p>
            </div>

            {step === 'email' && (
                <form onSubmit={handleSendOtp} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs font-black text-text-description uppercase tracking-widest ml-1">{t.emailAddress}</label>
                        <div className="relative group">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-text-description group-focus-within:text-primary transition-colors" size={20} />
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="name@example.com"
                                className="w-full bg-white border border-gray-100 rounded-[12px] py-4 pl-12 pr-4 focus:border-primary outline-none transition-all placeholder:text-text-description font-bold text-text-primary shadow-sm"
                            />
                        </div>
                    </div>
                    {error && <p className="text-red-500 text-sm font-bold text-center">{error}</p>}
                    <button
                        disabled={isLoading}
                        className="w-full py-5 bg-primary hover:bg-primary-dark text-black font-black rounded-[12px] transition-all shadow-lg shadow-primary/20 flex items-center justify-center group active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <>
                                {t.sendResetLink}
                                <ArrowRight size={20} className="ml-2 transition-transform group-hover:translate-x-1" />
                            </>
                        )}
                    </button>
                </form>
            )}

            {step === 'reset' && (
                <form onSubmit={handleResetPassword} className="space-y-4">
                    <p className="text-sm font-bold text-center text-text-secondary mb-4">We've sent a 4-digit code to <span className="text-text-primary">{email}</span>.</p>

                    <div className="space-y-2">
                        <label className="text-xs font-black text-text-description uppercase tracking-widest ml-1">Verification Code (OTP)</label>
                        <div className="relative group">
                            <input
                                type="text"
                                required
                                maxLength={4}
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                placeholder="1234"
                                className="w-full bg-white border border-gray-100 rounded-[12px] py-4 px-4 focus:border-primary outline-none transition-all placeholder:text-text-description font-bold text-center text-text-primary shadow-sm text-xl tracking-widest"
                            />
                        </div>
                    </div>

                    <div className="space-y-2 mt-4">
                        <label className="text-xs font-black text-text-description uppercase tracking-widest ml-1">{t.newPassword}</label>
                        <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-text-description group-focus-within:text-primary transition-colors" size={20} />
                            <input
                                type={showPassword ? "text" : "password"}
                                required
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
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

                    {error && <p className="text-red-500 text-sm font-bold text-center">{error}</p>}

                    <button
                        disabled={isLoading}
                        className="w-full py-5 bg-primary hover:bg-primary-dark text-black font-black rounded-[12px] transition-all shadow-lg shadow-primary/20 flex items-center justify-center group active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed mt-6"
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

                    <button
                        type="button"
                        onClick={() => setStep('email')}
                        className="w-full text-center text-sm font-bold text-text-secondary hover:text-primary transition-colors mt-2"
                    >
                        Back to Email
                    </button>
                </form>
            )}

            {step === 'success' && (
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
                        className="w-full py-4 bg-primary hover:bg-primary-dark text-black font-black rounded-[12px] transition-all shadow-lg shadow-primary/20"
                    >
                        {t.signInNow}
                    </button>
                </div>
            )}

            {step === 'email' && (
                <div className="text-center pt-4">
                    <Link to="/login" className="text-text-secondary text-sm font-bold flex items-center justify-center hover:text-primary transition-colors">
                        <ChevronLeft size={16} className="mr-1" />
                        {t.backToSignIn}
                    </Link>
                </div>
            )}
        </div>
    );
};

export default ForgotPassword;

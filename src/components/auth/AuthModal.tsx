import React, { useState } from 'react';
import { X, Mail, Lock, User, ArrowRight } from 'lucide-react';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (user: any) => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [otpStep, setOtpStep] = useState(false);
    const [otp, setOtp] = useState(['', '', '', '']);
    
    // Forgot Password states
    const [forgotStep, setForgotStep] = useState<'none' | 'email' | 'reset'>('none');
    const [forgotOtp, setForgotOtp] = useState(['', '', '', '']);
    const [newPassword, setNewPassword] = useState('');

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isLogin) {
                const res = await fetch('http://localhost:5000/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password }),
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.error || 'Authentication failed');
                localStorage.setItem('kicko_user', JSON.stringify(data));
                onSuccess(data);
                onClose();
            } else {
                // Register: Send OTP
                const res = await fetch('http://localhost:5000/api/auth/send-otp', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, name }),
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.error || 'Failed to send OTP');
                setOtpStep(true);
            }
        } catch (err: any) {
            setError(err.message || 'Could not connect to server.');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async () => {
        setError('');
        setLoading(true);
        try {
            const enteredOtp = otp.join('');
            const verifyRes = await fetch('http://localhost:5000/api/auth/verify-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp: enteredOtp }),
            });
            const verifyData = await verifyRes.json();
            if (!verifyRes.ok) throw new Error(verifyData.error || 'Invalid OTP');

            const regRes = await fetch('http://localhost:5000/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password }),
            });
            const regData = await regRes.json();
            if (!regRes.ok) throw new Error(regData.error || 'Registration failed');

            localStorage.setItem('kicko_user', JSON.stringify(regData));
            onSuccess(regData);
            onClose();
        } catch (err: any) {
            setError(err.message || 'Verification failed');
        } finally {
            setLoading(false);
        }
    };

    const handleSendForgotOtp = async () => {
        setError('');
        if (!email.trim()) {
            setError('Please enter your email');
            return;
        }
        setLoading(true);
        try {
            const res = await fetch('http://localhost:5000/api/auth/forgot-password/send-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, role: 'customer' }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to send OTP');
            setForgotStep('reset');
        } catch (err: any) {
            setError(err.message || 'Could not send OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async () => {
        setError('');
        const enteredOtp = forgotOtp.join('');
        if (enteredOtp.length < 4 || !newPassword.trim()) {
            setError('Please fill all details');
            return;
        }
        setLoading(true);
        try {
            const res = await fetch('http://localhost:5000/api/auth/forgot-password/reset', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp: enteredOtp, newPassword, role: 'customer' }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to reset password');
            
            // Success
            setForgotStep('none');
            setIsLogin(true);
            setPassword('');
            setError('Password reset successfully. Please login.');
        } catch (err: any) {
            setError(err.message || 'Failed to reset password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl relative">
                {/* Header */}
                <div className="bg-primary p-6 text-center relative">
                    <button 
                        onClick={onClose}
                        className="absolute right-4 top-4 p-2 bg-black/10 hover:bg-black/20 rounded-full transition-colors"
                    >
                        <X size={20} className="text-black" />
                    </button>
                    <h2 className="text-3xl font-black italic tracking-tighter text-black uppercase">
                        {forgotStep !== 'none' ? 'Reset Password' : (isLogin ? 'Welcome Back!' : 'Join Kicko')}
                    </h2>
                    <p className="text-black/80 font-bold mt-1">
                        {forgotStep === 'email' ? 'Enter your email to receive a reset code' :
                         forgotStep === 'reset' ? 'Enter the verification code and new password' :
                         (isLogin ? 'Login to book your favorite turf' : 'Create an account to start playing')}
                    </p>
                </div>

                {/* Form */}
                {forgotStep === 'email' ? (
                    <div className="p-8 space-y-5">
                        {error && (
                            <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm font-bold border border-red-100">
                                {error}
                            </div>
                        )}
                        <div className="space-y-2">
                            <label className="text-xs font-black text-text-description uppercase tracking-widest">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                <input 
                                    type="email" 
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="you@example.com"
                                    className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 pl-12 pr-4 text-text-primary focus:border-primary focus:bg-white outline-none transition-all font-bold"
                                />
                            </div>
                        </div>
                        <button 
                            type="button" 
                            onClick={handleSendForgotOtp}
                            disabled={loading}
                            className="w-full py-4 bg-primary hover:bg-primary-dark text-black font-black rounded-xl transition-all flex items-center justify-center disabled:opacity-50 mt-4 shadow-lg shadow-primary/20"
                        >
                            {loading ? 'Sending...' : 'Send Reset Code'}
                        </button>
                        <button 
                            type="button"
                            onClick={() => setForgotStep('none')}
                            className="w-full text-text-secondary hover:text-primary font-bold text-sm mt-4 text-center"
                        >
                            Back to Login
                        </button>
                    </div>
                ) : forgotStep === 'reset' ? (
                    <div className="p-8 space-y-5 text-center">
                        <p className="text-text-secondary text-sm">We've sent a code to <span className="font-black">{email}</span></p>
                        <div className="flex justify-center gap-3 mt-4">
                            {forgotOtp.map((digit, idx) => (
                                <input
                                    key={idx}
                                    id={`forgot-otp-${idx}`}
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={1}
                                    className="w-12 h-14 rounded-xl bg-gray-50 border border-gray-100 text-text-primary text-2xl font-black text-center outline-none focus:border-primary transition-all shadow-sm"
                                    value={digit}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        if (val.length > 1) return;
                                        const newOtp = [...forgotOtp];
                                        newOtp[idx] = val;
                                        setForgotOtp(newOtp);
                                        if (val && idx < 3) document.getElementById(`forgot-otp-${idx + 1}`)?.focus();
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Backspace' && !forgotOtp[idx] && idx > 0) {
                                            document.getElementById(`forgot-otp-${idx - 1}`)?.focus();
                                        }
                                    }}
                                />
                            ))}
                        </div>
                        <div className="space-y-2 mt-6 text-left">
                            <label className="text-xs font-black text-text-description uppercase tracking-widest">New Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                <input 
                                    type="password" 
                                    required
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="Enter new password"
                                    className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 pl-12 pr-4 text-text-primary focus:border-primary focus:bg-white outline-none transition-all font-bold"
                                />
                            </div>
                        </div>
                        {error && <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm font-bold border border-red-100 mt-4 text-left">{error}</div>}
                        <button 
                            type="button"
                            onClick={handleResetPassword}
                            disabled={loading || forgotOtp.some(d => !d)}
                            className="w-full py-4 bg-primary hover:bg-primary-dark text-black font-black rounded-xl transition-all disabled:opacity-50 mt-6 shadow-lg shadow-primary/20"
                        >
                            {loading ? 'Resetting...' : 'Reset Password'}
                        </button>
                        <button 
                            type="button"
                            onClick={() => setForgotStep('email')}
                            className="text-text-secondary hover:text-primary font-bold text-sm mt-4"
                        >
                            Back
                        </button>
                    </div>
                ) : otpStep ? (
                    <div className="p-8 space-y-5 text-center">
                        <h3 className="font-bold text-lg text-text-primary">Verify your Email</h3>
                        <p className="text-text-secondary text-sm">We've sent a code to <span className="font-black">{email}</span></p>
                        <div className="flex justify-center gap-3 mt-4">
                            {otp.map((digit, idx) => (
                                <input
                                    key={idx}
                                    id={`modal-otp-${idx}`}
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={1}
                                    className="w-12 h-14 rounded-xl bg-gray-50 border border-gray-100 text-text-primary text-2xl font-black text-center outline-none focus:border-primary transition-all shadow-sm"
                                    value={digit}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        if (val.length > 1) return;
                                        const newOtp = [...otp];
                                        newOtp[idx] = val;
                                        setOtp(newOtp);
                                        if (val && idx < 3) document.getElementById(`modal-otp-${idx + 1}`)?.focus();
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Backspace' && !otp[idx] && idx > 0) {
                                            document.getElementById(`modal-otp-${idx - 1}`)?.focus();
                                        }
                                    }}
                                />
                            ))}
                        </div>
                        {error && <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm font-bold border border-red-100 mt-4">{error}</div>}
                        <button 
                            type="button"
                            onClick={handleVerifyOtp}
                            disabled={loading || otp.some(d => !d)}
                            className="w-full py-4 bg-primary hover:bg-primary-dark text-black font-black rounded-xl transition-all disabled:opacity-50 mt-6 shadow-lg shadow-primary/20"
                        >
                            {loading ? 'Verifying...' : 'Verify & Join'}
                        </button>
                        <button 
                            type="button"
                            onClick={() => setOtpStep(false)}
                            className="text-text-secondary hover:text-primary font-bold text-sm mt-4"
                        >
                            Back to Registration
                        </button>
                    </div>
                ) : (
                    <>
                        <form onSubmit={handleSubmit} className="p-8 space-y-5">
                            {error && (
                                <div className={`p-3 rounded-xl text-sm font-bold border ${error.includes('successfully') ? 'bg-green-50 text-green-600 border-green-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
                                    {error}
                                </div>
                            )}

                            {!isLogin && (
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-text-description uppercase tracking-widest">Full Name</label>
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                        <input 
                                            type="text" 
                                            required
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            placeholder="John Doe"
                                            className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 pl-12 pr-4 text-text-primary focus:border-primary focus:bg-white outline-none transition-all font-bold"
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="text-xs font-black text-text-description uppercase tracking-widest">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                    <input 
                                        type="email" 
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="you@example.com"
                                        className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 pl-12 pr-4 text-text-primary focus:border-primary focus:bg-white outline-none transition-all font-bold"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <label className="text-xs font-black text-text-description uppercase tracking-widest">Password</label>
                                    {isLogin && (
                                        <button 
                                            type="button" 
                                            onClick={() => setForgotStep('email')} 
                                            className="text-xs font-bold text-primary hover:underline"
                                        >
                                            Forgot Password?
                                        </button>
                                    )}
                                </div>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                    <input 
                                        type="password" 
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 pl-12 pr-4 text-text-primary focus:border-primary focus:bg-white outline-none transition-all font-bold"
                                    />
                                </div>
                            </div>

                            <button 
                                type="submit" 
                                disabled={loading}
                                className="w-full py-4 bg-primary hover:bg-primary-dark text-black font-black rounded-xl transition-all flex items-center justify-center group disabled:opacity-50 mt-4 shadow-lg shadow-primary/20"
                            >
                                {loading ? 'Please wait...' : (isLogin ? 'Login' : 'Create Account')}
                                {!loading && <ArrowRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />}
                            </button>
                        </form>

                        {/* Footer Toggle */}
                        <div className="border-t border-gray-100 p-6 text-center bg-gray-50">
                            <p className="text-text-secondary font-bold">
                                {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
                                <button 
                                    type="button"
                                    onClick={() => {
                                        setIsLogin(!isLogin);
                                        setError('');
                                    }}
                                    className="text-primary hover:underline font-black"
                                >
                                    {isLogin ? 'Sign up here' : 'Login here'}
                                </button>
                            </p>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default AuthModal;

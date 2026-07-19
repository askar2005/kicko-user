import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useTranslation } from '../../../hooks/useTranslation';

const Login: React.FC = () => {
    const t = useTranslation();
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!email.trim() || !password.trim()) {
            setError('Email and password are required.');
            return;
        }

        setIsLoading(true);
        try {
            const res = await fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            const data = await res.json().catch(() => ({}));

            if (!res.ok) throw new Error(data.error || 'Authentication failed');
            if (!data.token || !data.id) throw new Error('Login response is missing authentication details');

            localStorage.setItem('kicko_user', JSON.stringify(data));
            localStorage.removeItem('current-user');
            localStorage.removeItem('user-logged-in');
            navigate('/', { replace: true });
        } catch (err: any) {
            setError(err.message || 'Could not login. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-black tracking-tighter italic text-text-heading">{t.welcomeBack.split(' ')[0]} <span className="text-primary italic">{t.welcomeBack.split(' ')[1]}</span></h2>
                <p className="text-text-secondary mt-2 font-bold">{t.loginManageDesc}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                    <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm font-bold border border-red-100">
                        {error}
                    </div>
                )}

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

                <div className="space-y-2">
                    <label className="text-xs font-black text-text-description uppercase tracking-widest ml-1">{t.passwordLabel}</label>
                    <div className="relative group">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-text-description group-focus-within:text-primary transition-colors" size={20} />
                        <input
                            type={showPassword ? 'text' : 'password'}
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Password"
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

                <div className="flex justify-end">
                    <Link to="/forgot-password" className="text-xs font-bold text-primary hover:underline">
                        {t.forgotPasswordQuestion}
                    </Link>
                </div>

                <button
                    disabled={isLoading}
                    className="w-full py-5 bg-primary hover:bg-primary-dark text-black font-black rounded-[12px] transition-all shadow-lg shadow-primary/20 flex items-center justify-center group active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                >
                    {isLoading ? (
                        <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    ) : (
                        <>
                            {t.signIn}
                            <ArrowRight size={20} className="ml-2 transition-transform group-hover:translate-x-1" />
                        </>
                    )}
                </button>
            </form>

            <div className="text-center pt-4">
                <p className="text-text-secondary text-sm font-bold">
                    {t.dontHaveAccount} {' '}
                    <Link to="/register" className="text-primary font-black hover:underline">{t.createAccount}</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;

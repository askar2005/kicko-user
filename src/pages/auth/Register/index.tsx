import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, ShieldCheck } from 'lucide-react';
import { useTranslation } from '../../../hooks/useTranslation';

const Register: React.FC = () => {
    const t = useTranslation();
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!name || !email || !password) {
            alert("Please fill all fields");
            return;
        }

        if (password.length < 8) {
            alert("Password must be at least 8 characters");
            return;
        }

        setIsLoading(true);

        try {
            const res = await fetch("http://localhost:5000/api/auth/send-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, name })
            });
            const data = await res.json();
            
            if (!res.ok) throw new Error(data.error || "Failed to send OTP");
            
            // Store user details for when OTP verification passes
            localStorage.setItem("signup-user", JSON.stringify({
                name,
                email,
                password
            }));

            navigate('/otp-verification');
        } catch (error: any) {
            alert(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-black tracking-tighter italic text-text-heading">{t.createAccount.split(' ')[0]} <span className="text-primary italic">{t.createAccount.split(' ')[1]}</span></h2>
                <p className="text-text-secondary mt-2 font-bold">{t.joinKICKODesc}</p>
            </div>

            <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                    <label className="text-xs font-black text-text-description uppercase tracking-widest ml-1">{t.fullName}</label>
                    <div className="relative group">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-text-description group-focus-within:text-primary transition-colors" size={20} />
                        <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder={t.namePlaceholder}
                            className="w-full bg-white border border-gray-100 rounded-[12px] py-4 pl-12 pr-4 focus:border-primary outline-none transition-all placeholder:text-text-description font-bold text-text-primary shadow-sm"
                        />
                    </div>
                </div>

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
                            type={showPassword ? "text" : "password"}
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder={t.pwdPlaceholder}
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

                <div className="flex items-center space-x-2 pt-2 px-1">
                    <div className="w-5 h-5 rounded border border-primary/20 bg-primary/5 flex items-center justify-center">
                        <ShieldCheck size={14} className="text-primary" />
                    </div>
                    <p className="text-[10px] text-text-description leading-tight font-bold">
                        {t.agreeTo}<span onClick={() => navigate('/terms')} className="text-primary hover:underline cursor-pointer font-black">{t.termsOfService}</span>{t.andLabel}<span onClick={() => navigate('/privacy')} className="text-primary hover:underline cursor-pointer font-black">{t.privacyPolicy}</span>.
                    </p>
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-5 bg-primary hover:bg-primary-dark text-black font-black rounded-[12px] transition-all shadow-lg shadow-primary/20 flex items-center justify-center group active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                >
                    {isLoading ? (
                        <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    ) : (
                        <>
                            {t.signUp}
                            <ArrowRight size={20} className="ml-2 transition-transform group-hover:translate-x-1" />
                        </>
                    )}
                </button>
            </form>

            <div className="text-center pt-4">
                <p className="text-text-secondary text-sm font-bold">
                    {t.alreadyHaveAccount} {' '}
                    <Link to="/login" className="text-primary font-black hover:underline">{t.signIn}</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;

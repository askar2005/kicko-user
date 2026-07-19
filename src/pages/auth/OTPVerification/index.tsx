import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, RefreshCcw } from 'lucide-react';
import { useTranslation } from '../../../hooks/useTranslation';

const OTPVerification: React.FC = () => {
    const t = useTranslation();
    const [otp, setOtp] = useState(['', '', '', '']);
    const [isLoading, setIsLoading] = useState(false);
    const [timer, setTimer] = useState(59);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        const interval = setInterval(() => {
            setTimer((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const handleChange = (index: number, value: string) => {
        if (value.length > 1) return;
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Auto focus next
        if (value !== '' && index < 3) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && otp[index] === '' && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const enteredOtp = otp.join('');
        const storedUserStr = localStorage.getItem("signup-user");

        if (!storedUserStr) {
            alert("Session expired. Please register again.");
            navigate('/register');
            return;
        }

        try {
            const storedUser = JSON.parse(storedUserStr);

            // 1. Verify OTP
            const verifyRes = await fetch("http://localhost:5000/api/auth/verify-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: storedUser.email, otp: enteredOtp })
            });
            const verifyData = await verifyRes.json();

            if (!verifyRes.ok) throw new Error(verifyData.error || "Failed to verify OTP");

            // 2. Register User in Database
            const regRes = await fetch("http://localhost:5000/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: storedUser.name,
                    email: storedUser.email,
                    password: storedUser.password
                })
            });
            const regData = await regRes.json();

            if (!regRes.ok) throw new Error(regData.error || "Registration failed");

            // 3. Success! Store the same auth object used by the rest of the user app.
            localStorage.setItem("kicko_user", JSON.stringify(regData));
            localStorage.removeItem("user-logged-in");
            localStorage.removeItem("current-user");

            // Clean up
            localStorage.removeItem("signup-user");

            navigate('/', { replace: true });
        } catch (error: any) {
            alert(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleResend = async () => {
        setTimer(59);
        const storedUserStr = localStorage.getItem("signup-user");
        if (!storedUserStr) return;
        const storedUser = JSON.parse(storedUserStr);

        try {
            const res = await fetch("http://localhost:5000/api/auth/send-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: storedUser.email, name: storedUser.name })
            });
            if (res.ok) alert("New OTP sent to your email!");
            else alert("Failed to resend OTP");
        } catch (e) {
            alert("Network error");
        }
    };

    return (
        <div className="space-y-6">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-black tracking-tighter italic text-text-heading">{t.verifyEmail.split(' ')[0]} <span className="text-primary italic">{t.verifyEmail.split(' ')[1]}</span></h2>
                <p className="text-text-secondary mt-2 font-bold">{t.otpSentMsg}</p>
            </div>

            <form onSubmit={handleVerify} className="space-y-8">
                <div className="flex justify-center space-x-2 md:space-x-4">
                    {otp.map((digit, idx) => (
                        <input
                            key={idx}
                            ref={el => { inputRefs.current[idx] = el; }}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleChange(idx, e.target.value)}
                            onKeyDown={(e) => handleKeyDown(idx, e)}
                            className="w-10 h-14 md:w-16 md:h-20 bg-white border border-gray-100 shadow-sm rounded-[12px] text-2xl md:text-3xl font-black text-center text-primary focus:border-primary outline-none transition-all"
                        />
                    ))}
                </div>

                <div className="text-center">
                    <button
                        type="button"
                        onClick={handleResend}
                        disabled={timer > 0}
                        className="flex items-center justify-center mx-auto text-sm font-black text-text-description hover:text-primary transition-colors disabled:opacity-50"
                    >
                        <RefreshCcw size={16} className="mr-2" />
                        {t.resendCode} {timer > 0 ? `(${timer}s)` : ''}
                    </button>
                </div>

                <button
                    disabled={isLoading || otp.some(d => d === '')}
                    className="w-full py-5 bg-primary hover:bg-primary-dark text-black font-black rounded-[12px] transition-all shadow-lg shadow-primary/20 flex items-center justify-center group active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                >
                    {isLoading ? (
                        <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    ) : (
                        <>
                            {t.verifyAndProceed}
                            <ArrowRight size={20} className="ml-2 transition-transform group-hover:translate-x-1" />
                        </>
                    )}
                </button>
            </form>
        </div>
    );
};

export default OTPVerification;



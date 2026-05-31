import React from 'react';
import { Outlet, Link } from 'react-router-dom';

const AuthLayout: React.FC = () => {
    return (
        <div className="min-h-screen bg-transparent flex flex-col justify-center items-center p-4">
            <div className="mb-8">
                <Link to="/" className="text-5xl font-black text-primary tracking-tighter italic">KICKO</Link>
            </div>
            <div className="w-full max-w-md bg-white p-8 rounded-[16px] shadow-[0_10px_40px_rgba(0,0,0,0.12)]">
                <Outlet />
            </div>
        </div>
    );
};

export default AuthLayout;

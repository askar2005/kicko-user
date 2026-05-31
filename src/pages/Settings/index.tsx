import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings as SettingsIcon, Mail, Phone, ShieldCheck, FileText, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

const Settings: React.FC = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('kicko_user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        } else {
            navigate('/');
        }
    }, [navigate]);

    if (!user) return null;

    return (
        <div className="pt-24 pb-20 max-w-3xl mx-auto px-4">
            <div className="flex items-center mb-8">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mr-4">
                    <SettingsIcon size={24} className="text-primary" />
                </div>
                <h1 className="text-3xl font-black italic tracking-tighter text-text-heading">Settings</h1>
            </div>

            <div className="space-y-8">
                {/* Profile Section */}
                <motion.section 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="bg-white rounded-[24px] border border-gray-100 p-6 shadow-sm"
                >
                    <h2 className="text-[10px] uppercase tracking-widest font-black text-text-description mb-6">Profile Details</h2>
                    
                    <div className="space-y-6">
                        <div className="flex items-center p-4 bg-gray-50 rounded-2xl">
                            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mr-4 text-xl font-black text-primary">
                                {user.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <p className="text-xs font-black text-text-description uppercase tracking-widest">Full Name</p>
                                <p className="text-lg font-bold text-text-heading">{user.name}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-center space-x-3 p-4 border border-gray-100 rounded-2xl">
                                <Mail className="text-text-secondary" size={20} />
                                <div>
                                    <p className="text-[10px] font-black text-text-description uppercase tracking-widest">Email</p>
                                    <p className="font-bold text-text-primary text-sm">{user.email}</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3 p-4 border border-gray-100 rounded-2xl">
                                <Phone className="text-text-secondary" size={20} />
                                <div>
                                    <p className="text-[10px] font-black text-text-description uppercase tracking-widest">Phone</p>
                                    <p className="font-bold text-text-primary text-sm">{user.mobile || '+91 98765 43210'}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.section>

                {/* Terms and Policies Section */}
                <motion.section 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white rounded-[24px] border border-gray-100 p-6 shadow-sm"
                >
                    <h2 className="text-[10px] uppercase tracking-widest font-black text-text-description mb-4">Legal & Policies</h2>
                    
                    <div className="space-y-2">
                        <details className="group border border-gray-100 rounded-2xl bg-gray-50 overflow-hidden cursor-pointer">
                            <summary className="flex items-center justify-between p-4 font-bold text-text-heading list-none">
                                <div className="flex items-center space-x-3">
                                    <FileText size={18} className="text-primary" />
                                    <span>Terms and Conditions</span>
                                </div>
                                <ChevronRight size={18} className="text-text-secondary group-open:rotate-90 transition-transform" />
                            </summary>
                            <div className="p-4 pt-0 text-sm text-text-secondary font-bold leading-relaxed border-t border-gray-100 bg-white">
                                By using Kicko, you agree to abide by the turf rules. You are responsible for any damages caused to the turf during your booked time slot. Kicko acts as a platform to connect you with turf owners.
                            </div>
                        </details>

                        <details className="group border border-gray-100 rounded-2xl bg-gray-50 overflow-hidden cursor-pointer">
                            <summary className="flex items-center justify-between p-4 font-bold text-text-heading list-none">
                                <div className="flex items-center space-x-3">
                                    <ShieldCheck size={18} className="text-primary" />
                                    <span>Cancellation & Refund Policy</span>
                                </div>
                                <ChevronRight size={18} className="text-text-secondary group-open:rotate-90 transition-transform" />
                            </summary>
                            <div className="p-4 pt-0 text-sm text-text-secondary font-bold leading-relaxed border-t border-gray-100 bg-white">
                                Cancellations made 24 hours prior to the booked slot will receive a 100% refund (excluding convenience fees). Cancellations made within 24 hours are non-refundable. Refunds will be processed to the original payment method within 5-7 business days.
                            </div>
                        </details>
                    </div>
                </motion.section>
            </div>
        </div>
    );
};

export default Settings;

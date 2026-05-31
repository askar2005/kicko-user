import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { chatbotResponses } from '../chatbotResponses';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
    id: string;
    text: string;
    sender: 'user' | 'bot';
    timestamp: Date;
}

const KickoChatbot: React.FC = () => {
    const { language } = useLanguage();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const responses = chatbotResponses[language as keyof typeof chatbotResponses] || chatbotResponses.en;

    useEffect(() => {
        // Initial greeting
        if (messages.length === 0) {
            setMessages([{
                id: '1',
                text: responses.greeting,
                sender: 'bot',
                timestamp: new Date()
            }]);
        }
    }, [language]); // Re-greet or update if language changes and no interaction yet? 
    // Actually the prompt says "The chatbot should automatically switch response language. No page refresh required."
    // This implies existing messages might stay or the bot's logic updates.

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = () => {
        if (!inputValue.trim()) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            text: inputValue,
            sender: 'user',
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMsg]);
        setInputValue('');

        // Simple bot logic
        setTimeout(() => {
            let botReply = "I can help you with booking turfs, payments, and checking bookings.";
            const text = inputValue.toLowerCase();

            if (text.includes('book') || text.includes('booking') || text.includes('reserve turf')) {
                botReply = "Sure! Opening the turf booking page.";
                setTimeout(() => { navigate('/'); setIsOpen(false); }, 1500);
            } else if (text.includes('payment') || text.includes('pay') || text.includes('how to pay')) {
                botReply = "Opening the payment page.";
                setTimeout(() => { navigate('/checkout'); setIsOpen(false); }, 1500);
            } else if (text.includes('my bookings') || text.includes('booking history') || text.includes('my booking') || text.includes('show bookings')) {
                botReply = "Here are your bookings.";
                setTimeout(() => { navigate('/bookings'); setIsOpen(false); }, 1500);
            } else if (text.includes('profile') || text.includes('account') || text.includes('my profile') || text.includes('settings')) {
                botReply = "Opening your profile settings.";
                setTimeout(() => { navigate('/profile'); setIsOpen(false); }, 1500);
            }

            const botMsg: Message = {
                id: (Date.now() + 1).toString(),
                text: botReply,
                sender: 'bot',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, botMsg]);
        }, 600);
    };

    return (
        <>
            {/* Floating Chat Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-5 right-5 w-14 h-14 bg-primary text-text-primary rounded-full shadow-lg z-[9999] flex items-center justify-center hover:scale-110 transition-transform active:scale-95 border-4 border-white"
                aria-label="Chat with AI Assistant"
            >
                {isOpen ? <X size={28} /> : <MessageCircle size={28} />}
            </button>

            {/* Chat Window Panel */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="fixed bottom-24 right-5 w-[350px] h-[500px] bg-white rounded-3xl shadow-2xl z-[9999] flex flex-col overflow-hidden border border-gray-100"
                    >
                        {/* Header */}
                        <div className="bg-primary p-4 flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                                    <Bot size={24} className="text-text-primary" />
                                </div>
                                <div>
                                    <h3 className="text-text-primary font-black text-sm italic tracking-tighter">Kicko AI Assistant</h3>
                                    <span className="text-[10px] text-text-primary/70 uppercase font-black tracking-widest">Always Online</span>
                                </div>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="text-text-primary/70 hover:text-text-primary">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Message List */}
                        <div className="flex-grow overflow-y-auto p-4 space-y-4 bg-gray-50/50">
                            {messages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-[80%] p-3 rounded-2xl text-sm font-bold shadow-sm ${msg.sender === 'user'
                                                ? 'bg-primary text-text-primary rounded-tr-none'
                                                : 'bg-white text-text-primary border border-gray-100 rounded-tl-none'
                                            }`}
                                    >
                                        {msg.text}
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Field */}
                        <div className="p-4 bg-white border-t border-gray-100">
                            <div className="relative flex items-center">
                                <input
                                    type="text"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                    placeholder={language === 'ta' ? 'செய்தியைத் தட்டச்சு செய்க...' : 'Type a message...'}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 pr-12 text-sm font-bold text-text-primary focus:outline-none focus:border-primary transition-colors"
                                />
                                <button
                                    onClick={handleSend}
                                    className="absolute right-2 p-2 text-primary hover:text-primary-dark transition-colors"
                                >
                                    <Send size={20} />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default KickoChatbot;

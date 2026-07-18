import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { MessageSquare, X, Send, Bot, Sparkles } from 'lucide-react';

interface Message {
    id: string;
    text: string;
    sender: 'ai' | 'user';
    isTyping?: boolean;
}

const AIAssistant: React.FC = () => {
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputText, setInputText] = useState('');
    const [turfs, setTurfs] = useState<any[]>([]);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const shouldHideAssistant = ['/checkout', '/payment-options', '/payment-success'].includes(location.pathname);

    // Fetch approved turfs for AI to recommend
    useEffect(() => {
        const fetchTurfs = async () => {
            try {
                const res = await fetch('http://localhost:5000/api/turfs?status=APPROVED');
                if (res.ok) {
                    const data = await res.json();
                    setTurfs(data);
                }
            } catch (e) {
                console.error('AI could not fetch turfs', e);
            }
        };
        fetchTurfs();
    }, []);

    // Initial greeting
    useEffect(() => {
        if (isOpen && messages.length === 0) {
            setMessages([
                {
                    id: Date.now().toString(),
                    text: "Vanakkam nanba! Naan dhaan KickoBot. Virudhunagar district la best turf theda naan ready! Enna area la play panna poringa? (e.g., Sivakasi, Rajapalayam, Aruppukkottai)",
                    sender: 'ai',
                }
            ]);
        }
    }, [isOpen, messages.length]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = () => {
        if (!inputText.trim()) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            text: inputText,
            sender: 'user',
        };

        setMessages(prev => [...prev, userMsg]);
        setInputText('');

        const aiTypingMsgId = (Date.now() + 1).toString();
        setMessages(prev => [...prev, { id: aiTypingMsgId, text: '...', sender: 'ai', isTyping: true }]);

        setTimeout(() => {
            const aiResponse = generateAIResponse(userMsg.text);
            setMessages(prev =>
                prev.map(msg => msg.id === aiTypingMsgId ? { ...msg, text: aiResponse, isTyping: false } : msg)
            );
        }, 600);
    };

    const getTurfRating = (turf: any) => {
        if (!turf.reviews || turf.reviews.length === 0) return 0;
        const total = turf.reviews.reduce((acc: number, r: any) => acc + r.rating, 0);
        return total / turf.reviews.length;
    };

    const generateAIResponse = (input: string): string => {
        const lowerInput = input.toLowerCase();
        const virudhunagarCities = ['virudhunagar', 'sivakasi', 'rajapalayam', 'aruppukkottai', 'sattur', 'srivilliputhur', 'kariapatti', 'vathirairuppu', 'thiruthangal', 'seithur'];
        let detectedCity = virudhunagarCities.find(c => lowerInput.includes(c));

        if (!detectedCity) {
            const foundTurfLoc = turfs.find(t => lowerInput.includes(t.location.toLowerCase().split(',')[0]));
            if (foundTurfLoc) detectedCity = foundTurfLoc.location.toLowerCase().split(',')[0];
        }

        if (detectedCity) {
            const cityTurfs = turfs.filter(t => t.location.toLowerCase().includes(detectedCity!));

            if (cityTurfs.length > 0) {
                const highestRated = cityTurfs.reduce((prev, current) => {
                    return (getTurfRating(prev) > getTurfRating(current)) ? prev : current;
                });

                const rating = getTurfRating(highestRated);
                const ratingStr = rating > 0 ? `${rating.toFixed(1)}/5` : '(Pudhu turf, innum rating varala!)';

                return `Semma! ${detectedCity.charAt(0).toUpperCase() + detectedCity.slice(1)} area la oru top turf irukku nanba. **${highestRated.name}** dhaan adhu!<br><br>**Turf Details:**<br>Location: ${highestRated.location}<br>Price: Rs.${highestRated.pricePerHour}/hr<br>Rating: ${ratingStr}<br><br>Kandippa poi vilaiyadu, mass ah irukkum!`;
            } else {
                return `Acho! ${detectedCity.charAt(0).toUpperCase() + detectedCity.slice(1)} la innum namma Kicko turf varala nanba. Seekiram kondu vandhuduvom! Vera area try pandriya?`;
            }
        }

        if (lowerInput.includes('cheap') || lowerInput.includes('budget') || lowerInput.includes('kammi')) {
            if (turfs.length === 0) return 'En database empty ah irukku boss... Admin innum turfs add pannalaya?';
            const cheapest = [...turfs].sort((a, b) => a.pricePerHour - b.pricePerHour)[0];
            return `Budget la thedriya? Kavalaye venam! **${cheapest.name}** in ${cheapest.location} is perfect for you. Price just Rs.${cheapest.pricePerHour}/hr thaan!`;
        }

        if (lowerInput.includes('best') || lowerInput.includes('good') || lowerInput.includes('top') || lowerInput.includes('super')) {
            if (turfs.length === 0) return 'Ippo entha turfs um illaye... Konjam wait pannunga.';
            return `Best turf venuma? Ithu dhaan namma Virudhunagar district oda top choice! **${turfs[0].name}** - condition vera level la irukkum. Book it before it's gone!`;
        }

        const fallbacks = [
            'Puriyala nanba! Enakku Sivakasi, Rajapalayam, Virudhunagar nu unga area pera sonna thaan puriyum. Try again!',
            'Football aadi evlo naal aachu? Enna area la turf thedringa nu sollunga, udane details tharren!',
            'Yow, naan oru paavamana bot ya. Tanglish la simple ah unga city name mattum type pannunga paarpom!',
            'Beep boop! Entha area nu marupadiyum sollunga?'
        ];
        return fallbacks[Math.floor(Math.random() * fallbacks.length)];
    };

    if (shouldHideAssistant) return null;

    return (
        <div className="fixed bottom-6 right-4 sm:right-6 left-4 sm:left-auto z-50 flex flex-col items-end pointer-events-none">
            {/* Chat Window */}
            {isOpen && (
                <div className="mb-4 w-full sm:w-96 bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200 animate-fade-in-up flex flex-col h-[min(500px,calc(100vh-8rem))] pointer-events-auto">
                    {/* Header */}
                    <div className="bg-primary p-4 flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <div className="bg-white p-2 rounded-full">
                                <Bot size={20} className="text-primary" />
                            </div>
                            <div>
                                <h3 className="font-black italic text-black">KickoBot AI</h3>
                                <p className="text-xs font-bold text-black/70 flex items-center">
                                    <Sparkles size={10} className="mr-1" /> Very Fast & Curious
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="p-2 bg-black/10 hover:bg-black/20 rounded-full transition-colors"
                        >
                            <X size={16} className="text-black" />
                        </button>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[80%] rounded-2xl p-3 text-sm font-medium ${msg.sender === 'user'
                                        ? 'bg-black text-white rounded-tr-sm'
                                        : 'bg-white border border-gray-100 text-gray-800 rounded-tl-sm shadow-sm'
                                        }`}
                                    dangerouslySetInnerHTML={{ __html: msg.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}
                                />
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-4 bg-white border-t border-gray-100">
                        <form
                            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                            className="flex items-center space-x-2"
                        >
                            <input
                                type="text"
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                placeholder="Ask me anything..."
                                className="flex-1 bg-gray-50 border border-gray-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-primary font-medium"
                            />
                            <button
                                type="submit"
                                disabled={!inputText.trim()}
                                className="p-2 bg-primary text-black rounded-full hover:bg-primary-dark disabled:opacity-50 transition-colors"
                            >
                                <Send size={18} />
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Toggle Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="w-14 h-14 bg-primary text-black rounded-full shadow-lg flex items-center justify-center hover:scale-105 transition-transform animate-bounce-slow border-2 border-white pointer-events-auto"
                >
                    <MessageSquare size={24} />
                </button>
            )}
        </div>
    );
};

export default AIAssistant;

import React, { useState, useEffect } from 'react';
import { X, Trophy, Shield, User as UserIcon, Users, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';

interface TournamentRegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  tournament: {
    id: string;
    name: string;
    sport: string;
    turf?: {
      name: string;
      location?: string;
      city?: string;
    };
    playersPerTeam: number;
    substitutePlayers: number;
    registrationType: string;
    registrationFee: number;
    paymentRequired: boolean;
  };
  onSuccess: () => void;
}

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '');

const loadRazorpayScript = () => {
  return new Promise<boolean>((resolve) => {
    if ((window as any).Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.id = 'razorpay-checkout-js';
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export default function TournamentRegisterModal({
  isOpen,
  onClose,
  tournament,
  onSuccess,
}: TournamentRegisterModalProps) {
  const [currentUser, setCurrentUser] = useState<any>(null);

  const [teamName, setTeamName] = useState('');
  const [captainName, setCaptainName] = useState('');
  const [captainPhone, setCaptainPhone] = useState('');
  const [captainEmail, setCaptainEmail] = useState('');

  const [players, setPlayers] = useState<string[]>([]);
  const [substitutes, setSubstitutes] = useState<string[]>([]);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<any | null>(null);

  useEffect(() => {
    if (isOpen && tournament) {
      const stored = localStorage.getItem('kicko_user');
      if (stored) {
        try {
          const u = JSON.parse(stored);
          setCurrentUser(u);
          setCaptainName(u.name || '');
          setCaptainEmail(u.email || '');
          setCaptainPhone(u.phone || '');
        } catch (e) {}
      }

      // Initialize player inputs based on tournament rules
      const initialPlayers = Array(tournament.playersPerTeam || 7).fill('');
      // Prefill player 1 with captain name
      if (stored) {
        try {
          const u = JSON.parse(stored);
          if (u.name) initialPlayers[0] = u.name;
        } catch (e) {}
      }
      setPlayers(initialPlayers);

      const initialSubs = Array(tournament.substitutePlayers || 0).fill('');
      setSubstitutes(initialSubs);

      setSuccessData(null);
      setError(null);
    }
  }, [isOpen, tournament]);

  if (!isOpen) return null;

  const getAuthToken = () => {
    if (currentUser && currentUser.token) return currentUser.token;
    const stored = localStorage.getItem('kicko_user');
    if (stored) {
      try {
        const u = JSON.parse(stored);
        return u.token || '';
      } catch (e) {}
    }
    return '';
  };

  const handlePlayerChange = (index: number, val: string) => {
    const updated = [...players];
    updated[index] = val;
    setPlayers(updated);
  };

  const handleSubstituteChange = (index: number, val: string) => {
    const updated = [...substitutes];
    updated[index] = val;
    setSubstitutes(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const token = getAuthToken();
    if (!token) {
      setError('Please log in to your Kicko account before registering for a tournament.');
      return;
    }

    if (tournament.registrationType === 'Team Registration' && !teamName.trim()) {
      setError('Team Name is required.');
      return;
    }

    if (!captainName.trim() || !captainPhone.trim()) {
      setError('Captain Name and Phone Number are required.');
      return;
    }

    const filledPlayers = players.map((p) => p.trim()).filter(Boolean);
    if (filledPlayers.length !== tournament.playersPerTeam) {
      setError(`Please provide all ${tournament.playersPerTeam} main player names.`);
      return;
    }

    setSubmitting(true);

    try {
      // 1. Submit Registration API
      const res = await fetch(`${API_BASE_URL}/api/tournaments/${tournament.id}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          teamName: teamName.trim(),
          captainName: captainName.trim(),
          captainPhone: captainPhone.trim(),
          captainEmail: captainEmail.trim(),
          players: filledPlayers,
          substitutes: substitutes.map((s) => s.trim()).filter(Boolean),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to register for tournament');
      }

      if (data.paymentRequired && data.order) {
        // 2. Paid Tournament: Trigger Razorpay Checkout
        const scriptLoaded = await loadRazorpayScript();
        if (!scriptLoaded) {
          throw new Error('Could not load Razorpay Payment Gateway. Check internet connection.');
        }

        const options = {
          key: data.keyId,
          amount: data.order.amount,
          currency: data.order.currency,
          name: 'Kicko Tournament Registration',
          description: `Entry fee for ${tournament.name}`,
          order_id: data.order.id,
          prefill: {
            name: captainName,
            email: captainEmail,
            contact: captainPhone,
          },
          theme: {
            color: '#10B981',
          },
          handler: async (response: any) => {
            try {
              // 3. Verify Payment API
              const verifyRes = await fetch(`${API_BASE_URL}/api/tournaments/payment/verify`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  registrationId: data.registrationId,
                }),
              });

              const verifyData = await verifyRes.json();
              if (verifyRes.ok) {
                setSuccessData({
                  registrationId: data.registrationId,
                  teamName: teamName || captainName,
                  amount: tournament.registrationFee,
                  status: 'Confirmed',
                  paymentStatus: 'Paid',
                });
                onSuccess();
              } else {
                setError(verifyData.error || 'Payment verification failed');
              }
            } catch (err: any) {
              setError(err.message || 'Error verifying payment');
            } finally {
              setSubmitting(false);
            }
          },
          modal: {
            ondismiss: () => {
              setSubmitting(false);
            },
          },
        };

        const razorpayInstance = new (window as any).Razorpay(options);
        razorpayInstance.open();
      } else {
        // Free Tournament Confirmation
        setSuccessData({
          registrationId: data.registration?.registrationId || 'KICKO-T-FREE',
          teamName: teamName || captainName,
          amount: 0,
          status: 'Confirmed',
          paymentStatus: 'Free Entry',
        });
        onSuccess();
        setSubmitting(false);
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed');
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 text-white rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden my-6">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Trophy size={20} />
            </div>
            <div>
              <h2 className="text-xl font-black italic tracking-tight text-white">Tournament Registration</h2>
              <p className="text-xs text-gray-400">{tournament.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Content */}
        {successData ? (
          <div className="p-8 text-center space-y-6">
            <div className="w-20 h-20 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center text-emerald-400 mx-auto animate-bounce">
              <CheckCircle size={44} />
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-black italic text-white">🎉 REGISTRATION CONFIRMED!</h3>
              <p className="text-sm text-gray-400">
                Your team entry has been successfully submitted and confirmed.
              </p>
            </div>

            {/* Receipt Box */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 text-left space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-xs text-gray-400">Registration ID</span>
                <span className="text-sm font-mono font-bold text-emerald-400">{successData.registrationId}</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-xs text-gray-400">Team / Participant</span>
                <span className="text-sm font-bold text-white">{successData.teamName}</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-xs text-gray-400">Tournament</span>
                <span className="text-sm font-bold text-white">{tournament.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">Payment Status</span>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {successData.paymentStatus} ({successData.amount > 0 ? `₹${successData.amount}` : 'FREE'})
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full py-3.5 rounded-full bg-primary text-black font-black text-sm uppercase tracking-wider hover:bg-emerald-400 transition-colors shadow-lg"
            >
              Done & Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
            {error && (
              <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center space-x-3 text-red-400 text-xs font-semibold">
                <AlertCircle size={18} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Section 1: Team Details */}
            {tournament.registrationType === 'Team Registration' && (
              <div className="space-y-3">
                <label className="block text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center space-x-1.5">
                  <Shield size={14} />
                  <span>Team Name *</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Thunder Warriors FC"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>
            )}

            {/* Section 2: Captain Contact Info */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center space-x-1.5">
                <UserIcon size={14} />
                <span>Captain / Contact Details *</span>
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <input
                    type="text"
                    placeholder="Captain Name *"
                    value={captainName}
                    onChange={(e) => setCaptainName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
                <div>
                  <input
                    type="tel"
                    placeholder="Phone Number *"
                    value={captainPhone}
                    onChange={(e) => setCaptainPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <input
                    type="email"
                    placeholder="Email Address"
                    value={captainEmail}
                    onChange={(e) => setCaptainEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Dynamic Main Player Roster */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center justify-between">
                <span className="flex items-center space-x-1.5">
                  <Users size={14} />
                  <span>Main Squad Roster ({tournament.playersPerTeam} Players) *</span>
                </span>
                <span className="text-gray-400 font-normal">All fields required</span>
              </label>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {players.map((playerVal, idx) => (
                  <div key={idx} className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-primary">
                      #{idx + 1}
                    </span>
                    <input
                      type="text"
                      placeholder={`Player ${idx + 1} Full Name *`}
                      value={playerVal}
                      onChange={(e) => handlePlayerChange(idx, e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                      required
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Section 4: Dynamic Substitute Roster */}
            {tournament.substitutePlayers > 0 && (
              <div className="space-y-3">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center space-x-1.5">
                  <Users size={14} />
                  <span>Substitute Players (Optional, Max {tournament.substitutePlayers})</span>
                </label>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {substitutes.map((subVal, idx) => (
                    <div key={idx} className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-500">
                        Sub {idx + 1}
                      </span>
                      <input
                        type="text"
                        placeholder={`Substitute ${idx + 1} Name`}
                        value={subVal}
                        onChange={(e) => handleSubstituteChange(idx, e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-14 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Entry Fee & Checkout Summary */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <span className="text-xs text-gray-400 font-medium block">Total Payable Fee</span>
                <span className="text-lg font-black text-emerald-400">
                  {tournament.paymentRequired && tournament.registrationFee > 0
                    ? `₹${tournament.registrationFee.toLocaleString()}`
                    : 'FREE REGISTRATION'}
                </span>
              </div>
              <span className="text-xs text-gray-500 italic">
                {tournament.paymentRequired ? 'Secured by Razorpay' : 'Instant Confirmation'}
              </span>
            </div>

            {/* Modal Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 rounded-full bg-primary hover:bg-emerald-400 text-black font-black text-sm uppercase tracking-wider transition-colors shadow-lg shadow-emerald-500/20 flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {submitting ? (
                  <span>Processing...</span>
                ) : (
                  <>
                    <span>
                      {tournament.paymentRequired && tournament.registrationFee > 0
                        ? `Pay ₹${tournament.registrationFee.toLocaleString()} & Confirm Registration`
                        : 'Confirm Free Registration'}
                    </span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

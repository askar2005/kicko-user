import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, Calendar, MapPin, CheckCircle, Clock, DollarSign, ChevronLeft, ArrowRight } from 'lucide-react';

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '');

export default function MyTournamentsPage() {
  const navigate = useNavigate();
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMyRegistrations = async () => {
      setLoading(true);
      setError(null);

      const storedUser = localStorage.getItem('kicko_user');
      if (!storedUser) {
        setLoading(false);
        setError('Please log in to view your tournament registrations.');
        return;
      }

      try {
        const u = JSON.parse(storedUser);
        const token = u.token;

        const res = await fetch(`${API_BASE_URL}/api/tournaments/my-registrations`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.ok) {
          const data = await res.json();
          setRegistrations(data);
        } else {
          const errData = await res.json();
          setError(errData.error || 'Failed to load registrations');
        }
      } catch (err: any) {
        setError(err.message || 'Error connecting to server');
      } finally {
        setLoading(false);
      }
    };

    fetchMyRegistrations();
  }, []);

  const parsePlayers = (str?: string) => {
    if (!str) return [];
    try {
      const parsed = JSON.parse(str);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-20 px-4 md:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('/tournaments')}
          className="inline-flex items-center space-x-2 text-xs font-bold text-gray-400 hover:text-white transition-colors"
        >
          <ChevronLeft size={16} />
          <span>Back to All Tournaments</span>
        </button>

        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <h1 className="text-3xl font-black italic tracking-tight text-white flex items-center space-x-3">
              <Trophy size={28} className="text-primary" />
              <span>MY TOURNAMENT REGISTRATIONS</span>
            </h1>
            <p className="text-sm text-gray-400 font-medium mt-1">
              View your confirmed team entries, payment receipts, and match rosters
            </p>
          </div>
        </div>

        {/* Content List */}
        {loading ? (
          <div className="py-20 text-center text-gray-400 text-sm">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            Loading your registrations...
          </div>
        ) : error ? (
          <div className="p-8 rounded-3xl bg-slate-900/60 border border-slate-800 text-center space-y-4">
            <p className="text-red-400 font-bold text-sm">{error}</p>
            <button
              onClick={() => navigate('/tournaments')}
              className="px-6 py-2.5 rounded-full bg-primary text-black font-black text-xs uppercase tracking-wider"
            >
              Browse Tournaments
            </button>
          </div>
        ) : registrations.length === 0 ? (
          <div className="py-20 text-center space-y-4 bg-slate-900/40 rounded-3xl border border-slate-800">
            <Trophy size={48} className="mx-auto text-gray-600" />
            <div className="text-gray-300 font-bold text-lg">No Registrations Found</div>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              You haven't registered for any tournaments yet. Join a tournament and compete!
            </p>
            <button
              onClick={() => navigate('/tournaments')}
              className="px-6 py-3 rounded-full bg-primary text-black font-black text-xs uppercase tracking-wider hover:bg-emerald-400 transition-colors inline-flex items-center space-x-2 shadow-lg"
            >
              <span>Explore Active Tournaments</span>
              <ArrowRight size={16} />
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {registrations.map((reg) => {
              const tour = reg.tournament;
              const players = parsePlayers(reg.players);

              return (
                <div
                  key={reg.id}
                  className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-xl hover:border-slate-700 transition-all"
                >
                  {/* Top Bar: Reg Code & Status Badges */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                    <div className="flex items-center space-x-3">
                      <span className="text-xs font-mono px-3 py-1 rounded-lg bg-slate-950 text-emerald-400 font-bold border border-slate-800">
                        {reg.registrationId}
                      </span>
                      <span className="text-xs text-gray-400">
                        Registered on {new Date(reg.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="flex items-center space-x-3">
                      {/* Payment Status */}
                      <span
                        className={`text-xs px-3 py-1 rounded-full font-bold flex items-center space-x-1 border ${
                          reg.paymentStatus === 'PAID'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : reg.paymentStatus === 'FREE'
                            ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        }`}
                      >
                        <DollarSign size={12} />
                        <span>{reg.paymentStatus}</span>
                      </span>

                      {/* Registration Status */}
                      <span
                        className={`text-xs px-3 py-1 rounded-full font-bold flex items-center space-x-1 border ${
                          reg.registrationStatus === 'CONFIRMED'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : reg.registrationStatus === 'REJECTED'
                            ? 'bg-red-500/10 text-red-400 border-red-500/20'
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        }`}
                      >
                        {reg.registrationStatus === 'CONFIRMED' ? (
                          <CheckCircle size={12} />
                        ) : (
                          <Clock size={12} />
                        )}
                        <span>{reg.registrationStatus}</span>
                      </span>
                    </div>
                  </div>

                  {/* Tournament Info Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <span className="text-xs font-bold text-primary uppercase tracking-wider">
                        {tour?.sport} Tournament
                      </span>
                      <h3
                        onClick={() => navigate(`/tournaments/${tour?.id}`)}
                        className="text-2xl font-black italic text-white hover:text-primary transition-colors cursor-pointer mt-1"
                      >
                        {tour?.name}
                      </h3>
                      <div className="flex items-center space-x-2 text-xs text-gray-400 mt-2">
                        <MapPin size={14} className="text-primary shrink-0" />
                        <span>{tour?.turf?.name} ({tour?.turf?.city || 'Venue'})</span>
                      </div>
                      <div className="flex items-center space-x-2 text-xs text-gray-400 mt-1">
                        <Calendar size={14} className="text-primary shrink-0" />
                        <span>Dates: {tour?.startDate} to {tour?.endDate}</span>
                      </div>
                    </div>

                    <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-400">Registered Team:</span>
                        <span className="font-bold text-white text-sm">{reg.teamName || reg.captainName}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-400">Team Captain:</span>
                        <span className="font-semibold text-gray-200">{reg.captainName} ({reg.captainPhone})</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-400">Entry Amount:</span>
                        <span className="font-black text-emerald-400">
                          {reg.amount > 0 ? `₹${reg.amount}` : 'FREE'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Roster Preview */}
                  {players.length > 0 && (
                    <div className="border-t border-slate-800 pt-4 space-y-2">
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
                        Registered Squad Roster ({players.length} Players)
                      </span>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {players.map((p: string, idx: number) => (
                          <div key={idx} className="text-xs bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-gray-300">
                            <span className="text-primary font-bold mr-1">#{idx + 1}</span> {p}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

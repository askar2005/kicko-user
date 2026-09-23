import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Award, ChevronLeft, Phone, FileText, AlertCircle, Clock } from 'lucide-react';
import TournamentRegisterModal from '../TournamentRegisterModal';

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '');

export default function TournamentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [tournament, setTournament] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

  const fetchTournamentDetail = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/tournaments/${id}`);
      if (res.ok) {
        const data = await res.json();
        setTournament(data);
      } else {
        const errData = await res.json();
        setError(errData.error || 'Tournament not found');
      }
    } catch (err: any) {
      setError(err.message || 'Error connecting to backend');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTournamentDetail();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white pt-32 pb-16 flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <span className="text-gray-400 text-sm">Loading tournament details...</span>
      </div>
    );
  }

  if (error || !tournament) {
    return (
      <div className="min-h-screen bg-black text-white pt-32 pb-16 px-4">
        <div className="max-w-xl mx-auto text-center space-y-6 bg-slate-900/60 border border-slate-800 p-8 rounded-3xl">
          <AlertCircle size={48} className="mx-auto text-red-500" />
          <h2 className="text-2xl font-black italic">{error || 'Tournament Not Found'}</h2>
          <button
            onClick={() => navigate('/tournaments')}
            className="px-6 py-3 rounded-full bg-primary text-black font-black text-sm uppercase tracking-wider hover:bg-emerald-400 transition-colors"
          >
            Back to Tournaments
          </button>
        </div>
      </div>
    );
  }

  const regCount = tournament._count?.registrations || 0;
  const isFull = regCount >= tournament.maxTeams;
  const isOpen = tournament.status === 'Registration Open' && !isFull;

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

        {/* Hero Banner Poster */}
        <div className="relative rounded-3xl overflow-hidden border border-slate-800 bg-slate-900 shadow-2xl">
          <div className="relative h-64 md:h-96 w-full">
            <img
              src={
                tournament.bannerUrl ||
                'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=1200&auto=format&fit=crop'
              }
              alt={tournament.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />

            {/* Top Overlay Badges */}
            <div className="absolute top-6 left-6 right-6 flex items-center justify-between">
              <span className="px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-primary text-black shadow-lg">
                ⚽ {tournament.sport}
              </span>
              <span
                className={`px-4 py-1.5 rounded-full text-xs font-bold shadow-lg ${
                  tournament.status === 'Registration Open'
                    ? 'bg-emerald-500 text-black'
                    : 'bg-slate-800 text-gray-300'
                }`}
              >
                {tournament.status}
              </span>
            </div>

            {/* Bottom Title Overlay */}
            <div className="absolute bottom-6 left-6 right-6 space-y-2">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">
                Format: {tournament.tournamentType} • {tournament.registrationType}
              </span>
              <h1 className="text-3xl md:text-5xl font-black italic tracking-tight text-white">
                {tournament.name}
              </h1>
              <p className="text-sm text-gray-300 flex items-center space-x-2 font-medium">
                <MapPin size={16} className="text-primary shrink-0" />
                <span>
                  {tournament.turf?.name} {tournament.turf?.location ? `• ${tournament.turf.location}` : ''}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Key Info Metrics Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-1">
            <span className="text-xs text-gray-400 font-medium block">Entry Fee</span>
            <span className="text-xl md:text-2xl font-black text-primary block">
              {tournament.registrationFee > 0 ? `₹${tournament.registrationFee.toLocaleString()}` : 'FREE'}
            </span>
            <span className="text-[11px] text-gray-500 block">
              {tournament.paymentRequired ? 'Per Team' : 'No Payment'}
            </span>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-1">
            <span className="text-xs text-gray-400 font-medium block">Champion Prize</span>
            <span className="text-xl md:text-2xl font-black text-amber-400 block truncate">
              {tournament.firstPrize || 'Trophy'}
            </span>
            <span className="text-[11px] text-gray-500 block">1st Place Reward</span>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-1">
            <span className="text-xs text-gray-400 font-medium block">Team Capacity</span>
            <span className="text-xl md:text-2xl font-black text-white block">
              {regCount} / {tournament.maxTeams}
            </span>
            <span className="text-[11px] text-emerald-400 font-semibold block">
              {tournament.playersPerTeam} Players / Team
            </span>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-1">
            <span className="text-xs text-gray-400 font-medium block">Tournament Dates</span>
            <span className="text-sm md:text-base font-bold text-white block">
              {tournament.startDate}
            </span>
            <span className="text-[11px] text-gray-500 block">
              Reg Ends: {tournament.registrationEndDate}
            </span>
          </div>
        </div>

        {/* Main Content Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left Column (Details, Prizes, Rules) */}
          <div className="md:col-span-2 space-y-8">
            {/* Description */}
            {tournament.description && (
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-3">
                <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wider">About Tournament</h3>
                <p className="text-sm text-gray-300 leading-relaxed font-normal whitespace-pre-line">
                  {tournament.description}
                </p>
              </div>
            )}

            {/* Prize Details */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
              <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider flex items-center space-x-2">
                <Award size={18} />
                <span>Prize Pool & Rewards</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {tournament.firstPrize && (
                  <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4">
                    <span className="text-xs text-amber-400 font-bold block">🥇 1st Place / Champions</span>
                    <span className="text-lg font-black text-white block mt-1">{tournament.firstPrize}</span>
                  </div>
                )}
                {tournament.secondPrize && (
                  <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4">
                    <span className="text-xs text-gray-400 font-bold block">🥈 2nd Place / Runners-up</span>
                    <span className="text-base font-bold text-white block mt-1">{tournament.secondPrize}</span>
                  </div>
                )}
                {tournament.thirdPrize && (
                  <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4">
                    <span className="text-xs text-gray-400 font-bold block">🥉 3rd Place</span>
                    <span className="text-base font-bold text-white block mt-1">{tournament.thirdPrize}</span>
                  </div>
                )}
                {tournament.mvpPrize && (
                  <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4">
                    <span className="text-xs text-emerald-400 font-bold block">⭐ Best Player / MVP</span>
                    <span className="text-base font-bold text-white block mt-1">{tournament.mvpPrize}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Rules & Guidelines */}
            {tournament.rules && (
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-3">
                <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wider flex items-center space-x-2">
                  <FileText size={18} />
                  <span>Rules & Guidelines</span>
                </h3>
                <div className="text-xs text-gray-300 leading-relaxed font-medium whitespace-pre-line bg-slate-950 p-4 rounded-2xl border border-slate-800">
                  {tournament.rules}
                </div>
              </div>
            )}
          </div>

          {/* Right Column (Venue, Timings, Contacts & Registration CTA) */}
          <div className="space-y-6">
            {/* Registration Action Box */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-2xl sticky top-28">
              <div className="space-y-2">
                <span className="text-xs text-gray-400 font-medium block">Registration Status</span>
                <div className="flex items-center justify-between">
                  <span className="text-xl font-black text-white italic">
                    {tournament.registrationFee > 0 ? `₹${tournament.registrationFee.toLocaleString()}` : 'FREE'}
                  </span>
                  <span className="text-xs font-bold text-emerald-400">
                    {tournament.maxTeams - regCount} Slots Available
                  </span>
                </div>
              </div>

              {isOpen ? (
                <button
                  onClick={() => setIsRegisterModalOpen(true)}
                  className="w-full py-4 rounded-full bg-primary hover:bg-emerald-400 text-black font-black text-sm uppercase tracking-wider transition-colors shadow-lg shadow-emerald-500/20"
                >
                  Register Now
                </button>
              ) : isFull ? (
                <button
                  disabled
                  className="w-full py-4 rounded-full bg-slate-800 text-amber-400 font-bold text-sm uppercase tracking-wider cursor-not-allowed border border-slate-700"
                >
                  Registration Full
                </button>
              ) : (
                <button
                  disabled
                  className="w-full py-4 rounded-full bg-slate-800 text-gray-400 font-bold text-sm uppercase tracking-wider cursor-not-allowed border border-slate-700"
                >
                  {tournament.status}
                </button>
              )}

              {/* Venue & Time Summary */}
              <div className="border-t border-slate-800 pt-4 space-y-3 text-xs">
                <div className="flex items-start space-x-3 text-gray-300">
                  <MapPin size={16} className="text-primary shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-white block">{tournament.turf?.name}</span>
                    <span className="text-gray-400 block">{tournament.turf?.location}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-3 text-gray-300">
                  <Clock size={16} className="text-primary shrink-0" />
                  <div>
                    <span className="font-bold text-white block">
                      Start: {tournament.matchStartTime || '09:00 AM'}
                    </span>
                    <span className="text-gray-400 block">
                      Reporting: {tournament.reportingTime || '08:30 AM'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Organizers Contact Box */}
              <div className="border-t border-slate-800 pt-4 space-y-3">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
                  Organizers Contact
                </span>
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3.5 space-y-2 text-xs">
                  <div className="font-bold text-white">{tournament.contactName}</div>
                  <a
                    href={`tel:${tournament.contactPhone}`}
                    className="flex items-center space-x-2 text-emerald-400 hover:underline font-semibold"
                  >
                    <Phone size={14} />
                    <span>{tournament.contactPhone}</span>
                  </a>
                  {tournament.whatsappNumber && (
                    <a
                      href={`https://wa.me/${tournament.whatsappNumber.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center space-x-2 text-emerald-400 hover:underline font-semibold"
                    >
                      <Phone size={14} />
                      <span>WhatsApp Organizers</span>
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Registration Modal */}
      {tournament && (
        <TournamentRegisterModal
          isOpen={isRegisterModalOpen}
          onClose={() => setIsRegisterModalOpen(false)}
          tournament={tournament}
          onSuccess={fetchTournamentDetail}
        />
      )}
    </div>
  );
}

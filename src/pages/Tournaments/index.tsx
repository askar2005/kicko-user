import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, MapPin, Users, Award, Search, ArrowRight, ShieldCheck } from 'lucide-react';

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '');

export default function TournamentsPage() {
  const navigate = useNavigate();
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedSport, setSelectedSport] = useState<string>('All');
  const [search, setSearch] = useState<string>('');

  const sportsList = ['All', 'Football', 'Cricket', 'Badminton', 'Volleyball', 'Basketball', 'Tennis'];

  useEffect(() => {
    const fetchTournaments = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE_URL}/api/tournaments`);
        if (res.ok) {
          const data = await res.json();
          setTournaments(data);
        } else {
          const errData = await res.json();
          setError(errData.error || 'Failed to load tournaments');
        }
      } catch (err: any) {
        setError(err.message || 'Error connecting to backend server');
      } finally {
        setLoading(false);
      }
    };

    fetchTournaments();
  }, []);

  const filteredTournaments = tournaments.filter((t) => {
    const matchesSport = selectedSport === 'All' || t.sport.toLowerCase() === selectedSport.toLowerCase();
    const matchesSearch =
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.turf?.name?.toLowerCase().includes(search.toLowerCase()) ||
      t.turf?.city?.toLowerCase().includes(search.toLowerCase());
    return matchesSport && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-16 px-4 md:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header / Hero */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/20 p-8 rounded-3xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

          <div className="space-y-3 relative z-10 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider">
              <Trophy size={14} />
              <span>Kicko Championship Hub</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-black tracking-tight italic">
              LIVE & UPCOMING <span className="text-primary">TOURNAMENTS</span>
            </h1>
            <p className="text-sm md:text-base text-gray-400 font-medium">
              Register your team, showcase your skills, and compete for championship trophies and big cash prize pools!
            </p>
          </div>

          <div className="relative z-10 shrink-0">
            <button
              onClick={() => navigate('/my-tournaments')}
              className="px-6 py-3 rounded-full bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm transition-all border border-slate-700 shadow-lg flex items-center space-x-2"
            >
              <ShieldCheck size={18} className="text-primary" />
              <span>My Tournament Registrations</span>
            </button>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-slate-900/60 border border-slate-800/80 p-4 rounded-2xl backdrop-blur-md">
          {/* Sports Pills */}
          <div className="flex items-center space-x-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
            {sportsList.map((sport) => (
              <button
                key={sport}
                onClick={() => setSelectedSport(sport)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                  selectedSport === sport
                    ? 'bg-primary text-black shadow-md shadow-primary/20'
                    : 'bg-slate-800/80 text-gray-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                {sport}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="relative w-full md:w-80 shrink-0">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search tournament name, turf, or city..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-full pl-10 pr-4 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-primary transition-colors"
            />
          </div>
        </div>

        {/* Grid List */}
        {loading ? (
          <div className="py-20 text-center text-gray-400 text-sm">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            Loading tournaments...
          </div>
        ) : error ? (
          <div className="p-6 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
            {error}
          </div>
        ) : filteredTournaments.length === 0 ? (
          <div className="py-20 text-center space-y-4 bg-slate-900/40 rounded-3xl border border-slate-800">
            <Trophy size={48} className="mx-auto text-gray-600" />
            <div className="text-gray-400 font-bold text-lg">No Tournaments Found</div>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              There are currently no active tournaments matching your filter criteria. Check back soon!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTournaments.map((t) => {
              const regCount = t._count?.registrations || 0;
              const progressPct = Math.min(100, Math.round((regCount / t.maxTeams) * 100));

              return (
                <div
                  key={t.id}
                  onClick={() => navigate(`/tournaments/${t.id}`)}
                  className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden hover:border-emerald-500/50 transition-all duration-300 group cursor-pointer flex flex-col justify-between shadow-xl"
                >
                  {/* Banner Image / Poster */}
                  <div className="relative h-48 bg-slate-950 overflow-hidden">
                    <img
                      src={
                        t.bannerUrl ||
                        'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&auto=format&fit=crop'
                      }
                      alt={t.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />

                    {/* Status Pill */}
                    <div className="absolute top-4 left-4 flex items-center space-x-2">
                      <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-emerald-500 text-black shadow-lg">
                        {t.status}
                      </span>
                      <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-black/60 backdrop-blur-md text-white border border-white/20">
                        ⚽ {t.sport}
                      </span>
                    </div>

                    {/* Format Tag */}
                    <div className="absolute bottom-3 left-4 text-xs font-semibold text-gray-300">
                      Format: <span className="text-emerald-400 font-bold">{t.tournamentType}</span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-6 space-y-4">
                    <div>
                      <h3 className="text-xl font-black text-white group-hover:text-primary transition-colors line-clamp-1 italic">
                        {t.name}
                      </h3>
                      <div className="flex items-center space-x-1.5 text-xs text-gray-400 mt-1">
                        <MapPin size={14} className="text-primary shrink-0" />
                        <span className="truncate">{t.turf?.name || 'Turf Venue'} ({t.turf?.city || 'Location'})</span>
                      </div>
                    </div>

                    {/* Dates & Entry Fee */}
                    <div className="grid grid-cols-2 gap-3 pt-1 text-xs">
                      <div className="bg-slate-950 border border-slate-800 rounded-xl p-3">
                        <span className="text-gray-400 font-medium block">Dates</span>
                        <span className="text-white font-bold block mt-0.5">
                          {t.startDate}
                        </span>
                      </div>
                      <div className="bg-slate-950 border border-slate-800 rounded-xl p-3">
                        <span className="text-gray-400 font-medium block">Entry Fee</span>
                        <span className="text-primary font-bold block mt-0.5">
                          {t.registrationFee > 0 ? `₹${t.registrationFee.toLocaleString()}` : 'FREE'}
                        </span>
                      </div>
                    </div>

                    {/* Champion Prize Banner */}
                    {t.firstPrize && (
                      <div className="flex items-center space-x-2 text-xs bg-amber-500/10 border border-amber-500/20 text-amber-300 rounded-xl px-3.5 py-2.5">
                        <Award size={16} className="text-amber-400 shrink-0" />
                        <span className="font-bold truncate">1st Prize: {t.firstPrize}</span>
                      </div>
                    )}

                    {/* Capacity Progress Bar */}
                    <div className="space-y-1.5 pt-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-400 font-medium flex items-center space-x-1">
                          <Users size={14} className="text-primary" />
                          <span>Teams Registered</span>
                        </span>
                        <span className="font-bold text-white">
                          {regCount} / {t.maxTeams}
                        </span>
                      </div>
                      <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                        <div
                          className="bg-primary h-full rounded-full transition-all duration-300"
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Card Action */}
                  <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/50 flex items-center justify-between">
                    <span className="text-xs text-gray-400 font-semibold">
                      {t.registrationType}
                    </span>
                    <span className="text-xs font-bold text-primary group-hover:translate-x-1 transition-transform flex items-center space-x-1">
                      <span>View Details</span>
                      <ArrowRight size={14} />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, ArrowRight, ChevronDown } from 'lucide-react';
import TurfCard from '../../components/TurfCard';
import AdBanner from '../../components/ads/AdBanner';
import AdCard from '../../components/ads/AdCard';
import AdFooter from '../../components/ads/AdFooter';
import { useTranslation } from '../../hooks/useTranslation';

// MOCK_TURFS removed to use backend data

const VIRUDHUNAGAR_CITIES = [
    "Virudhunagar", "Sivakasi", "Rajapalayam", "Aruppukkottai",
    "Sattur", "Srivilliputhur", "Kariapatti", "Vathirairuppu",
    "Thiruthangal", "Seithur"
];

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '');
const resolveUploadUrl = (path: string) => `${API_BASE_URL}${path}`;

const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return d;
};

const isLocationMatch = (turf: any, selectedLoc: string) => {
    if (!selectedLoc) return false;
    const sel = selectedLoc.toLowerCase().trim();
    const turfCity = (turf.city || "").toLowerCase().trim();
    const turfLoc = (turf.location || "").toLowerCase().trim();
    const turfArea = (turf.area || "").toLowerCase().trim();

    // Exact city match
    if (turfCity === sel) return true;

    // Substring match in location or area
    if (turfLoc.includes(sel) || turfArea.includes(sel)) return true;

    // Fuzzy match: first 5 characters match
    if (sel.length >= 5 && turfCity.length >= 5) {
        if (sel.substring(0, 5) === turfCity.substring(0, 5)) {
            return true;
        }
    }

    return false;
};

const mapTurfForCard = (turf: any) => {
    let imageUrl = 'https://images.unsplash.com/photo-1529900948633-14664539659a?w=800&auto=format&fit=crop';
    try {
        if (turf.images) {
            const parsed = typeof turf.images === 'string' ? JSON.parse(turf.images) : turf.images;
            if (Array.isArray(parsed) && parsed.length > 0) {
                const img = parsed[0];
                imageUrl = img.startsWith('/uploads') ? resolveUploadUrl(img) : img;
            }
        }
    } catch (e) {
        console.error("Failed to parse turf images in Home:", e);
    }

    return {
        id: turf.id,
        name: turf.name,
        location: turf.location,
        price: turf.pricePerHour || 1200,
        rating: 4.8,
        image: imageUrl,
        available: true,
        city: turf.city,
        area: turf.area,
        latitude: turf.latitude,
        longitude: turf.longitude,
        sportType: turf.sportType
    };
};

const Home: React.FC = () => {
    const t = useTranslation();
    const navigate = useNavigate();
    const [selectedLocation, setSelectedLocation] = React.useState('');
    const [searchQuery, setSearchQuery] = React.useState('');
    const [isDetecting, setIsDetecting] = React.useState(false);
    const [turfs, setTurfs] = React.useState<any[]>([]);
    const [filteredTurfs, setFilteredTurfs] = React.useState<any[]>([]);
    const [selectedSport, setSelectedSport] = React.useState('');
    const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
    const [userCoords, setUserCoords] = React.useState<{ latitude: number; longitude: number } | null>(null);

    const turfsAroundLocation = React.useMemo(() => {
        if (!selectedLocation) return [];

        let result = turfs;

        // Apply general location matching
        if (userCoords) {
            result = result
                .map(t => {
                    if (t.latitude !== null && t.longitude !== null && t.latitude !== undefined && t.longitude !== undefined) {
                        const dist = getDistance(userCoords.latitude, userCoords.longitude, t.latitude, t.longitude);
                        return { ...t, distance: dist };
                    }
                    return { ...t, distance: null };
                })
                .filter(t => (t.distance !== null && t.distance <= 60) || isLocationMatch(t, selectedLocation))
                .sort((a, b) => {
                    const distA = a.distance === null ? 999999 : a.distance;
                    const distB = b.distance === null ? 999999 : b.distance;
                    return distA - distB;
                });
        } else {
            result = result.filter(t => isLocationMatch(t, selectedLocation));
        }

        // Apply search query filter if user typed something
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(t =>
                t.name.toLowerCase().includes(query) ||
                t.location.toLowerCase().includes(query)
            );
        }

        // Apply selected sport category if selected
        if (selectedSport) {
            const sport = selectedSport.toLowerCase();
            result = result.filter(t =>
                (t.sportType && t.sportType.toLowerCase().includes(sport)) ||
                t.name.toLowerCase().includes(sport)
            );
        }

        return result;
    }, [selectedLocation, userCoords, turfs, searchQuery, selectedSport]);

    const fetchApprovedTurfs = React.useCallback(async () => {
        try {
            const response = await fetch('http://localhost:5000/api/turfs?status=APPROVED');
            if (response.ok) {
                const data = await response.json();
                const mappedData = data.map(mapTurfForCard);
                setTurfs(mappedData);
                setFilteredTurfs(mappedData);
            }
        } catch (error) {
            console.error("Failed to fetch turfs:", error);
        }
    }, []);

    React.useEffect(() => {
        fetchApprovedTurfs();

        const handleVisibilityChange = () => {
            if (!document.hidden) {
                fetchApprovedTurfs();
            }
        };

        window.addEventListener('focus', fetchApprovedTurfs);
        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            window.removeEventListener('focus', fetchApprovedTurfs);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [fetchApprovedTurfs]);

    const handleLocationAction = async (value: string) => {
        if (value === 'use-location') {
            if (!navigator.geolocation) {
                alert(t.geoNotSupported);
                setSelectedLocation('');
                setUserCoords(null);
                return;
            }

            setIsDetecting(true);
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    try {
                        const { latitude, longitude } = position.coords;
                        setUserCoords({ latitude, longitude });
                        const response = await fetch(
                            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10`
                        );
                        const data = await response.json();
                        const city = data.address.city || data.address.town || data.address.village || data.address.state_district;

                        if (city) {
                            setSelectedLocation(city);
                        } else {
                            alert(t.unableToDetectCity);
                            setSelectedLocation('');
                            setUserCoords(null);
                        }
                    } catch (error) {
                        console.error("Error fetching location:", error);
                        alert(t.unableToDetectLocation);
                        setSelectedLocation('');
                        setUserCoords(null);
                    } finally {
                        setIsDetecting(false);
                    }
                },
                (error) => {
                    console.error("Geolocation error:", error);
                    alert(t.unableToDetectLocation);
                    setSelectedLocation('');
                    setUserCoords(null);
                    setIsDetecting(false);
                }
            );
        } else {
            setSelectedLocation(value);
            setUserCoords(null);
        }
    };

    return (
        <div className="pb-20">
            {/* Hero Section */}
            <section className="relative min-h-screen py-24 flex items-center justify-center overflow-hidden">
                {/* Animated Background */}
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/50 to-white z-10" />
                    <img
                        src="https://images.unsplash.com/photo-1529900948633-14664539659a?w=1600&auto=format&fit=crop"
                        className="w-full h-full object-cover scale-105 animate-pulse-slow"
                        alt="Hero Background"
                    />
                </div>

                <div className="relative z-20 max-w-7xl mx-auto px-4 text-center">
                    <h1 className="text-6xl md:text-8xl font-black mb-6 tracking-tighter italic animate-fade-in-up delay-100 text-text-heading mt-10">
                        {t.heroTitleStart}<span className="text-primary italic">{t.heroTitleHighlight}</span>{t.heroTitleEnd}
                    </h1>

                    <p className="text-xl text-text-secondary max-w-2xl mx-auto mb-10 animate-fade-in-up delay-200 font-bold">
                        {t.heroSubtitle}
                    </p>

                    {/* Search Card */}
                    <div className="max-w-4xl mx-auto bg-white p-3 rounded-[16px] shadow-[0_10px_25px_rgba(0,0,0,0.08)] animate-fade-in-up delay-300 border border-gray-100">
                        <div className="flex flex-col md:flex-row items-center gap-3">
                            <div className="flex-1 flex items-center px-6 py-4 bg-white rounded-3xl border border-gray-100 group focus-within:border-primary transition-colors shadow-sm">
                                <Search size={20} className="text-text-label group-focus-within:text-primary transition-colors" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder={t.searchPlaceholder}
                                    className="bg-transparent border-none outline-none w-full ml-3 text-text-primary placeholder-text-secondary font-medium"
                                />
                            </div>

                            {/* Custom Location Selector */}
                            <div className="flex-1 w-full relative">
                                <button
                                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                    className="w-full flex items-center justify-between px-6 py-4 bg-white rounded-3xl border border-gray-100 group hover:border-primary focus:outline-none transition-all duration-200 shadow-sm"
                                >
                                    <div className="flex items-center">
                                        <MapPin size={20} className="text-text-label group-hover:text-primary transition-colors" />
                                        <span className="ml-3 text-text-primary font-bold">
                                            {isDetecting
                                                ? t.detecting
                                                : selectedLocation
                                                    ? VIRUDHUNAGAR_CITIES.find(c => c.toLowerCase() === selectedLocation) || selectedLocation
                                                    : t.selectLocation}
                                        </span>
                                    </div>
                                    <ChevronDown size={18} className={`text-text-label transition-transform duration-200 ${isDropdownOpen ? 'rotate-180 text-primary' : ''}`} />
                                </button>

                                {isDropdownOpen && (
                                    <>
                                        {/* Backdrop to close dropdown on click outside */}
                                        <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)} />

                                        {/* Dropdown Menu */}
                                        <div className="absolute right-0 left-0 bottom-full mb-2 bg-white rounded-2xl border border-gray-100 shadow-xl z-50 py-2 max-h-60 overflow-y-auto animate-fade-in-up duration-200">
                                            {/* Use current location option */}
                                            <button
                                                onClick={() => {
                                                    handleLocationAction('use-location');
                                                    setIsDropdownOpen(false);
                                                }}
                                                className="w-full px-5 py-3 text-left font-bold text-primary hover:bg-primary/5 flex items-center border-b border-gray-50 transition-colors"
                                            >
                                                <span className="w-2 h-2 bg-primary rounded-full mr-3 animate-pulse" />
                                                {t.useCurrentLocation}
                                            </button>

                                            {/* Cities List */}
                                            {VIRUDHUNAGAR_CITIES.map(city => (
                                                <button
                                                    key={city}
                                                    onClick={() => {
                                                        handleLocationAction(city.toLowerCase());
                                                        setIsDropdownOpen(false);
                                                    }}
                                                    className={`w-full px-5 py-3 text-left font-semibold text-text-primary transition-colors flex items-center justify-between ${selectedLocation === city.toLowerCase()
                                                        ? 'bg-primary/10 text-primary font-black'
                                                        : 'hover:bg-gray-50'
                                                        }`}
                                                >
                                                    <span>{city}</span>
                                                    {selectedLocation === city.toLowerCase() && (
                                                        <span className="w-1.5 h-1.5 bg-primary rounded-full" />
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>

                            <button
                                onClick={() => {
                                    let result = turfs;
                                    if (selectedLocation && selectedLocation !== 'use-location') {
                                        result = result.filter(t => t.location.toLowerCase().includes(selectedLocation.toLowerCase()));
                                    }
                                    if (searchQuery) {
                                        result = result.filter(t => t.name.toLowerCase().includes(searchQuery.toLowerCase()));
                                    }
                                    setFilteredTurfs(result);
                                }}
                                className="w-full md:w-auto px-10 py-4 bg-primary hover:bg-primary-dark text-text-primary font-black rounded-3xl transition-all flex items-center justify-center group active:scale-95 shadow-lg shadow-primary/20"
                            >
                                {t.findTurf}
                                <ArrowRight size={20} className="ml-2 transition-transform group-hover:translate-x-1" />
                            </button>
                        </div>
                    </div>

                    {/* Map Section */}
                    {selectedLocation && selectedLocation !== 'use-location' && (
                        <div className="max-w-4xl mx-auto mt-6 bg-white p-2 rounded-[16px] shadow-[0_10px_25px_rgba(0,0,0,0.08)] animate-fade-in-up delay-300 border border-gray-100 overflow-hidden h-64">
                            <iframe
                                title="Location Map"
                                width="100%"
                                height="100%"
                                frameBorder="0"
                                scrolling="no"
                                marginHeight={0}
                                marginWidth={0}
                                src={`https://maps.google.com/maps?q=${selectedLocation},Virudhunagar&t=&z=13&ie=UTF8&iwloc=&output=embed`}
                                className="rounded-[12px]"
                            />
                        </div>
                    )}

                    {/* Ad Placement 1 */}
                    <AdBanner className="mt-12 animate-fade-in-up delay-400" />
                </div>
            </section>

            {/* Turfs Around Your Location Section */}
            {selectedLocation && (
                <section className="max-w-7xl mx-auto px-4 mt-12 relative z-30 animate-fade-in-up">
                    <div className="flex items-center justify-between mb-10">
                        <div>
                            <h2 className="text-3xl font-black italic tracking-tighter text-text-heading">
                                {t.turfsAroundYourLocationStart}
                                <span className="text-primary">
                                    {VIRUDHUNAGAR_CITIES.find(c => c.toLowerCase() === selectedLocation.toLowerCase()) || selectedLocation}
                                </span>
                            </h2>
                            <p className="text-text-secondary mt-1 font-bold">{t.turfsAroundYourLocationSubtitle}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {turfsAroundLocation.length > 0 ? (
                            turfsAroundLocation.map((turf) => (
                                <TurfCard key={`local-${turf.id}`} {...turf} />
                            ))
                        ) : (
                            <div className="col-span-3 text-center py-12 bg-white rounded-[24px] border border-gray-100 shadow-[0_10px_25px_rgba(0,0,0,0.03)] px-6">
                                <MapPin size={48} className="mx-auto text-primary/40 mb-4 animate-bounce" />
                                <p className="text-text-secondary font-bold text-lg">
                                    {t.noTurfsFoundInLocation}
                                </p>
                            </div>
                        )}
                    </div>
                </section>
            )}

            {/* Turf Grid Section */}
            <section id="turf-grid" className="max-w-7xl mx-auto px-4 mt-12 relative z-30">
                <div className="flex items-center justify-between mb-10">
                    <div>
                        <h2 className="text-3xl font-black italic tracking-tighter text-text-heading">{t.popularTurfsStart}<span className="text-primary">{t.popularTurfsHighlight}</span></h2>
                        <p className="text-text-secondary mt-1 font-bold">{t.popularSubtitle}</p>
                    </div>
                    <button
                        onClick={() => navigate('/all-turfs')}
                        className="text-primary font-bold flex items-center hover:underline group"
                    >
                        {t.viewAll}
                        <ArrowRight size={18} className="ml-1 transition-transform group-hover:translate-x-1" />
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredTurfs.length > 0 ? (
                        <>
                            {filteredTurfs.slice(0, 3).map((turf) => (
                                <TurfCard key={turf.id} {...turf} />
                            ))}

                            {/* Ad Placement 2 - Mid Content (After 3rd card) */}
                            {filteredTurfs.length > 0 && (
                                <div className="col-span-1 md:col-span-2 lg:col-span-3 py-4">
                                    <AdCard className="animate-fade-in" />
                                </div>
                            )}

                            {filteredTurfs.slice(3, 6).map((turf) => (
                                <TurfCard key={turf.id} {...turf} />
                            ))}
                        </>
                    ) : (
                        <div className="col-span-3 text-center py-10 text-text-secondary font-bold">
                            No approved turfs found. (Is backend running and are there approved turfs?)
                        </div>
                    )}
                </div>
            </section>

            {/* Sports Categories Section */}
            <section className="max-w-7xl mx-auto px-4 mt-20 relative z-30">
                <div className="mb-10 text-center">
                    <h2 className="text-3xl font-black italic tracking-tighter text-text-heading">Explore by <span className="text-primary">Sport</span></h2>
                    <p className="text-text-secondary mt-1 font-bold">Find the perfect turf for your favorite game</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Cricket */}
                    <button
                        onClick={() => {
                            setSelectedSport('Cricket');
                            const filtered = turfs.filter(t =>
                                t.name.toLowerCase().includes('cricket') ||
                                t.location.toLowerCase().includes('cricket')
                            );
                            setFilteredTurfs(filtered.length > 0 ? filtered : turfs);
                            setTimeout(() => document.getElementById('turf-grid')?.scrollIntoView({ behavior: 'smooth' }), 100);
                        }}
                        className={`group relative h-64 rounded-3xl overflow-hidden shadow-lg transition-all border-4 ${selectedSport === 'Cricket' ? 'border-primary' : 'border-transparent'}`}
                    >
                        <img src="https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=800&auto=format&fit=crop" alt="Cricket" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex items-end p-6">
                            <h3 className="text-3xl font-black text-white italic tracking-tighter group-hover:text-primary transition-colors">CRICKET</h3>
                        </div>
                    </button>

                    {/* Football */}
                    <button
                        onClick={() => {
                            setSelectedSport('Football');
                            const filtered = turfs.filter(t =>
                                t.name.toLowerCase().includes('football') ||
                                t.name.toLowerCase().includes('arena') ||
                                t.name.toLowerCase().includes('kick') ||
                                t.name.toLowerCase().includes('fc')
                            );
                            setFilteredTurfs(filtered.length > 0 ? filtered : turfs);
                            setTimeout(() => document.getElementById('turf-grid')?.scrollIntoView({ behavior: 'smooth' }), 100);
                        }}
                        className={`group relative h-64 rounded-3xl overflow-hidden shadow-lg transition-all border-4 ${selectedSport === 'Football' ? 'border-primary' : 'border-transparent'}`}
                    >
                        <img src="https://images.unsplash.com/photo-1518605368461-1e1e1142502c?w=800&auto=format&fit=crop" alt="Football" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex items-end p-6">
                            <h3 className="text-3xl font-black text-white italic tracking-tighter group-hover:text-primary transition-colors">FOOTBALL</h3>
                        </div>
                    </button>

                    {/* Badminton */}
                    <button
                        onClick={() => {
                            setSelectedSport('Badminton');
                            const filtered = turfs.filter(t =>
                                t.name.toLowerCase().includes('badminton') ||
                                t.name.toLowerCase().includes('court') ||
                                t.name.toLowerCase().includes('shuttle')
                            );
                            setFilteredTurfs(filtered.length > 0 ? filtered : turfs);
                            setTimeout(() => document.getElementById('turf-grid')?.scrollIntoView({ behavior: 'smooth' }), 100);
                        }}
                        className={`group relative h-64 rounded-3xl overflow-hidden shadow-lg transition-all border-4 ${selectedSport === 'Badminton' ? 'border-primary' : 'border-transparent'}`}
                    >
                        <img src="https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800&auto=format&fit=crop" alt="Badminton" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex items-end p-6">
                            <h3 className="text-3xl font-black text-white italic tracking-tighter group-hover:text-primary transition-colors">BADMINTON</h3>
                        </div>
                    </button>
                </div>
            </section>

            {/* Ad Placement 3 - Bottom Page */}
            <section className="max-w-7xl mx-auto px-4 mt-20">
                <AdFooter className="animate-fade-in" />
            </section>
        </div>
    );
};

export default Home;

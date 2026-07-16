import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Search, MapPin } from 'lucide-react';
import TurfCard from '../../components/TurfCard';

const VIRUDHUNAGAR_CITIES = [
    "Virudhunagar", "Sivakasi", "Rajapalayam", "Aruppukkottai",
    "Sattur", "Srivilliputhur", "Kariapatti", "Vathirairuppu",
    "Thiruthangal", "Seithur"
];

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '');
const resolveUploadUrl = (path: string) => `${API_BASE_URL}${path}`;

const isLocationMatch = (turf: any, selectedLoc: string) => {
    if (!selectedLoc) return false;
    const sel = selectedLoc.toLowerCase().trim();
    const turfCity = (turf.city || '').toLowerCase().trim();
    const turfLoc = (turf.location || '').toLowerCase().trim();
    const turfArea = (turf.area || '').toLowerCase().trim();

    if (turfCity === sel) return true;
    if (turfLoc.includes(sel) || turfArea.includes(sel)) return true;
    if (sel.length >= 5 && turfCity.length >= 5) {
        return sel.substring(0, 5) === turfCity.substring(0, 5);
    }

    return false;
};

const AllTurfs: React.FC = () => {
    const navigate = useNavigate();

    const [searchQuery, setSearchQuery] = React.useState('');
    const [selectedLocation, setSelectedLocation] = React.useState('');

    const [turfs, setTurfs] = React.useState<any[]>([]);
    const [filteredTurfs, setFilteredTurfs] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchTurfs = async () => {
            setLoading(true);
            try {
                const response = await fetch('http://localhost:5000/api/turfs?status=APPROVED');
                if (response.ok) {
                    const data = await response.json();
                    const mappedData = data.map((turf: any) => {
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
                            console.error("Failed to parse turf images in AllTurfs:", e);
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
                    });
                    setTurfs(mappedData);
                    setFilteredTurfs(mappedData);
                }
            } catch (error) {
                console.error("Failed to fetch turfs:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchTurfs();
    }, []);

    React.useEffect(() => {
        let result = turfs;
        if (selectedLocation) {
            result = result.filter(t => isLocationMatch(t, selectedLocation));
        }
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(t =>
                t.name.toLowerCase().includes(query) ||
                t.location.toLowerCase().includes(query)
            );
        }
        setFilteredTurfs(result);
    }, [searchQuery, selectedLocation, turfs]);

    return (
        <div className="pt-24 pb-20 max-w-7xl mx-auto px-4 min-h-screen overflow-x-hidden">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
                <div className="flex items-center min-w-0">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors mr-2 text-text-secondary shrink-0 min-h-[44px] min-w-[44px] flex items-center justify-center"
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <div className="min-w-0">
                        <h1 className="text-2xl sm:text-3xl font-black italic tracking-tighter text-text-heading">All <span className="text-primary">Turfs</span></h1>
                        <p className="text-text-secondary mt-1 font-bold text-sm sm:text-base">Discover {filteredTurfs.length} turfs across the district</p>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
                    <div className="flex items-center px-4 py-2.5 bg-white rounded-xl border border-gray-100 shadow-sm focus-within:border-primary transition-colors w-full sm:w-auto min-h-[44px]">
                        <Search size={18} className="text-gray-400 shrink-0" />
                        <input
                            type="text"
                            placeholder="Search by name..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-transparent border-none outline-none ml-2 text-text-primary text-sm font-medium w-full min-w-0"
                        />
                    </div>
                    <div className="flex items-center px-4 py-2.5 bg-white rounded-xl border border-gray-100 shadow-sm focus-within:border-primary transition-colors w-full sm:w-auto min-h-[44px]">
                        <MapPin size={18} className="text-gray-400 shrink-0" />
                        <select
                            value={selectedLocation}
                            onChange={(e) => setSelectedLocation(e.target.value)}
                            className="bg-transparent border-none outline-none ml-2 text-text-primary text-sm font-medium w-full cursor-pointer appearance-none min-w-0"
                        >
                            <option value="">All Locations</option>
                            {VIRUDHUNAGAR_CITIES.map(city => (
                                <option key={city} value={city.toLowerCase()}>{city}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Grid */}
            {loading ? (
                <div className="flex justify-center items-center py-20 text-text-secondary font-bold">Loading turfs...</div>
            ) : filteredTurfs.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                    {filteredTurfs.map((turf) => (
                        <TurfCard key={turf.id} {...turf} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 text-text-secondary font-bold bg-gray-50 rounded-2xl border border-gray-100 px-4">
                    No turfs found matching your criteria.
                </div>
            )}
        </div>
    );
};

export default AllTurfs;

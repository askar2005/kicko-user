import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Search, MapPin } from 'lucide-react';
import TurfCard from '../../components/TurfCard';

const VIRUDHUNAGAR_CITIES = [
    "Virudhunagar", "Sivakasi", "Rajapalayam", "Aruppukkottai",
    "Sattur", "Srivilliputhur", "Kariapatti", "Vathirairuppu",
    "Thiruthangal", "Seithur"
];

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
                                    imageUrl = img.startsWith('/uploads') ? `http://https://aqua-mandrill-716221.hostingersite.com${img}` : img;
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
                            available: true
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
            result = result.filter(t => t.location.toLowerCase().includes(selectedLocation.toLowerCase()));
        }
        if (searchQuery) {
            result = result.filter(t => t.name.toLowerCase().includes(searchQuery.toLowerCase()));
        }
        setFilteredTurfs(result);
    }, [searchQuery, selectedLocation, turfs]);

    return (
        <div className="pt-24 pb-20 max-w-7xl mx-auto px-4 min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
                <div className="flex items-center">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors mr-2 text-text-secondary"
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <div>
                        <h1 className="text-3xl font-black italic tracking-tighter text-text-heading">All <span className="text-primary">Turfs</span></h1>
                        <p className="text-text-secondary mt-1 font-bold">Discover {filteredTurfs.length} turfs across the district</p>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                    <div className="flex items-center px-4 py-2.5 bg-white rounded-xl border border-gray-100 shadow-sm focus-within:border-primary transition-colors w-full sm:w-auto">
                        <Search size={18} className="text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by name..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-transparent border-none outline-none ml-2 text-text-primary text-sm font-medium w-full"
                        />
                    </div>
                    <div className="flex items-center px-4 py-2.5 bg-white rounded-xl border border-gray-100 shadow-sm focus-within:border-primary transition-colors w-full sm:w-auto">
                        <MapPin size={18} className="text-gray-400" />
                        <select
                            value={selectedLocation}
                            onChange={(e) => setSelectedLocation(e.target.value)}
                            className="bg-transparent border-none outline-none ml-2 text-text-primary text-sm font-medium w-full cursor-pointer appearance-none"
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredTurfs.map((turf) => (
                        <TurfCard key={turf.id} {...turf} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 text-text-secondary font-bold bg-gray-50 rounded-2xl border border-gray-100">
                    No turfs found matching your criteria.
                </div>
            )}
        </div>
    );
};

export default AllTurfs;

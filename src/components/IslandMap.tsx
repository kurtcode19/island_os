import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Navigation, BookOpen, Crosshair, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Fix for default marker icons in Leaflet with React
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

// Custom Marker Data
const locations = [
  {
    id: 'white-island',
    name: 'White Island',
    coords: [9.2500, 124.6500] as [number, number],
    description: 'A pristine sandbar with a stunning view of Mt. Hibok-Hibok.',
    image: 'https://picsum.photos/seed/whiteisland/400/300',
    bookingUrl: '#book-white-island',
    googleMapsUrl: 'https://www.google.com/maps/dir/?api=1&destination=White+Island+Camiguin',
  },
  {
    id: 'sunken-cemetery',
    name: 'Sunken Cemetery',
    coords: [9.2044, 124.6333] as [number, number],
    description: 'A historic landmark marked by a large cross in the sea.',
    image: 'https://picsum.photos/seed/sunkencemetery/400/300',
    bookingUrl: '#book-sunken-cemetery',
    googleMapsUrl: 'https://www.google.com/maps/dir/?api=1&destination=Sunken+Cemetery+Camiguin',
  },
  {
    id: 'katibawasan-falls',
    name: 'Katibawasan Falls',
    coords: [9.2133, 124.7333] as [number, number],
    description: 'A 250-foot waterfall surrounded by lush greenery.',
    image: 'https://picsum.photos/seed/katibawasan/400/300',
    bookingUrl: '#book-katibawasan',
    googleMapsUrl: 'https://www.google.com/maps/dir/?api=1&destination=Katibawasan+Falls+Camiguin',
  },
  {
    id: 'ardent-springs',
    name: 'Ardent Hot Springs',
    coords: [9.1833, 124.7167] as [number, number],
    description: 'Natural hot springs perfect for relaxation.',
    image: 'https://picsum.photos/seed/ardent/400/300',
    bookingUrl: '#book-ardent',
    googleMapsUrl: 'https://www.google.com/maps/dir/?api=1&destination=Ardent+Hot+Springs+Camiguin',
  },
  {
    id: 'mantigue-island',
    name: 'Mantigue Island',
    coords: [9.1667, 124.8167] as [number, number],
    description: 'A nature park with white sand beaches and coral reefs.',
    image: 'https://picsum.photos/seed/mantigue/400/300',
    bookingUrl: '#book-mantigue',
    googleMapsUrl: 'https://www.google.com/maps/dir/?api=1&destination=Mantigue+Island+Camiguin',
  },
];

// Component to handle "Locate Me" functionality
function LocationMarker({ userPos, setUserPos }: { userPos: [number, number] | null, setUserPos: (pos: [number, number]) => void }) {
  const map = useMap();

  useEffect(() => {
    if (userPos) {
      map.flyTo(userPos, 14);
    }
  }, [userPos, map]);

  return userPos === null ? null : (
    <Marker position={userPos}>
      <Popup>You are here</Popup>
    </Marker>
  );
}

const IslandMap: React.FC = () => {
  const [selectedLocation, setSelectedLocation] = useState<typeof locations[0] | null>(null);
  const [userPos, setUserPos] = useState<[number, number] | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  const camiguinCenter: [number, number] = [9.1725, 124.7358];

  const handleLocateMe = () => {
    setIsLocating(true);
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserPos([position.coords.latitude, position.coords.longitude]);
        setIsLocating(false);
      },
      () => {
        alert('Unable to retrieve your location');
        setIsLocating(false);
      }
    );
  };

  return (
    <div className="flex flex-col lg:flex-row h-full w-full overflow-hidden bg-island-cream">
      {/* Map Section */}
      <div className="relative w-full h-[60vh] lg:h-full lg:flex-1 order-1 lg:order-2">
        <MapContainer
          center={camiguinCenter}
          zoom={11}
          scrollWheelZoom={true}
          className="h-full w-full z-0"
        >
          {/* Custom Map Style: CartoDB Voyager (Clean and Ocean-Blue friendly) */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          />

          {locations.map((loc) => (
            <Marker
              key={loc.id}
              position={loc.coords}
              eventHandlers={{
                click: () => setSelectedLocation(loc),
              }}
            >
              <Popup className="custom-popup">
                <div className="p-1">
                  <h3 className="font-bold text-island-volcanic">{loc.name}</h3>
                  <p className="text-xs text-gray-600 mb-2">{loc.description}</p>
                  <button
                    onClick={() => setSelectedLocation(loc)}
                    className="text-island-emerald text-xs font-semibold flex items-center gap-1"
                  >
                    View Details <ExternalLink size={12} />
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}

          <LocationMarker userPos={userPos} setUserPos={setUserPos} />
        </MapContainer>

        {/* Locate Me Button */}
        <button
          onClick={handleLocateMe}
          disabled={isLocating}
          className="absolute top-4 right-4 z-[1000] p-3 glass rounded-full text-island-volcanic hover:text-island-emerald transition-colors shadow-lg"
          title="Locate Me"
        >
          <Crosshair size={24} className={isLocating ? 'animate-spin' : ''} />
        </button>

        {/* Bottom Sheet / Detail Card (Mobile & Desktop Overlay) */}
        <AnimatePresence>
          {selectedLocation && (
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute bottom-0 left-0 right-0 z-[1001] p-4 lg:p-6"
            >
              <div className="glass rounded-3xl p-4 lg:p-6 max-w-2xl mx-auto shadow-2xl overflow-hidden relative">
                <button
                  onClick={() => setSelectedLocation(null)}
                  className="absolute top-4 right-4 p-2 rounded-full bg-black/10 hover:bg-black/20 transition-colors z-10"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                <div className="flex flex-col md:flex-row gap-4 lg:gap-6">
                  <div className="w-full md:w-1/3 h-40 md:h-auto rounded-2xl overflow-hidden">
                    <img
                      src={selectedLocation.image}
                      alt={selectedLocation.name}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-island-volcanic mb-2">{selectedLocation.name}</h2>
                      <p className="text-gray-600 text-sm lg:text-base mb-4">
                        {selectedLocation.description}
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <a
                        href={selectedLocation.bookingUrl}
                        className="flex-1 bg-island-emerald text-white py-3 px-4 rounded-xl font-semibold text-center flex items-center justify-center gap-2 hover:bg-island-emerald/90 transition-colors"
                      >
                        <BookOpen size={18} />
                        Book Now
                      </a>
                      <a
                        href={selectedLocation.googleMapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 bg-island-volcanic text-white py-3 px-4 rounded-xl font-semibold text-center flex items-center justify-center gap-2 hover:bg-island-volcanic/90 transition-colors"
                      >
                        <Navigation size={18} />
                        Directions
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Locations List (Desktop Sidebar) */}
      <div className="w-full lg:w-96 h-auto lg:h-full bg-white/50 backdrop-blur-md border-r border-white/20 p-6 order-2 lg:order-1 overflow-y-auto no-scrollbar">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-island-volcanic mb-2">Camiguin Island</h1>
          <p className="text-gray-500 text-sm">Explore the "Island Born of Fire"</p>
        </div>

        <div className="space-y-4">
          {locations.map((loc) => (
            <motion.div
              key={loc.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedLocation(loc)}
              className={`p-4 rounded-2xl cursor-pointer transition-all ${
                selectedLocation?.id === loc.id
                  ? 'bg-island-emerald text-white shadow-lg'
                  : 'bg-white hover:bg-gray-50 text-island-volcanic shadow-sm'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${selectedLocation?.id === loc.id ? 'bg-white/20' : 'bg-island-emerald/10'}`}>
                  <MapPin size={20} className={selectedLocation?.id === loc.id ? 'text-white' : 'text-island-emerald'} />
                </div>
                <div>
                  <h3 className="font-bold">{loc.name}</h3>
                  <p className={`text-xs ${selectedLocation?.id === loc.id ? 'text-white/80' : 'text-gray-500'}`}>
                    Click to view on map
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-12 p-6 rounded-3xl island-gradient text-white">
          <h4 className="font-bold mb-2">Tourist Guide</h4>
          <p className="text-xs opacity-90 mb-4">
            Camiguin is best explored by motorbike or multicab. Don't forget to try the Lanzones!
          </p>
          <button className="w-full py-2 bg-white/20 backdrop-blur-sm rounded-xl text-xs font-semibold hover:bg-white/30 transition-colors">
            Download Offline Map
          </button>
        </div>
      </div>
    </div>
  );
};

export default IslandMap;

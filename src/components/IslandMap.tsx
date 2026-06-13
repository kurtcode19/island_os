import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Navigation, BookOpen, Crosshair, ExternalLink, Sparkles, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Fix for default marker icons in Leaflet with CDN links
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

L.Marker.prototype.options.icon = DefaultIcon;

// Custom Marker Data (Localized to Catarman)
const locations = [
  {
    id: 'sunken-cemetery',
    name: 'Sunken Cemetery',
    coords: [9.2014, 124.6675] as [number, number],
    description: 'A historic landmark marked by a large cross in the sea, perfect for snorkeling and sunset views.',
    image: 'https://img.atlasobscura.com/CmlPBCqrdngS4DE4q_DDyDdVYBjhcSTHrsI9PUEbvkQ/rs:fill:780:520:1/g:ce/q:81/sm:1/scp:1/ar:1/aHR0cHM6Ly9hdGxh/cy1kZXYuczMuYW1h/em9uYXdzLmNvbS91/cGxvYWRzL3BsYWNl/X2ltYWdlcy85OTA0/ZjhlMDJiMGM0ODM5/NWJfU3Vua2VuX0Nl/bWV0ZXJ5LF9DYXRh/cm1hbixfQ2FtaWd1/aW4uanBn.jpg',
    bookingUrl: '#book-sunken-cemetery',
    googleMapsUrl: 'https://www.google.com/maps/dir/?api=1&destination=Sunken+Cemetery+Catarman',
  },
  {
    id: 'church-ruins',
    name: 'Old Spanish Church Ruins',
    coords: [9.2123, 124.6543] as [number, number],
    description: 'The ruins of the Gui-ob Church, destroyed during the 1871 volcanic eruption.',
    image: 'https://files01.pna.gov.ph/source/2024/05/06/camiguin-old-church-ruins-05032024jb.jpg',
    bookingUrl: '#book-church-ruins',
    googleMapsUrl: 'https://www.google.com/maps/dir/?api=1&destination=Old+Church+Ruins+Catarman',
  },
  {
    id: 'tuasan-falls',
    name: 'Tuasan Falls',
    coords: [9.1833, 124.6667] as [number, number],
    description: 'A pristine and powerful waterfall nestled in Catarman\'s lush jungle.',
    image: 'https://thefroggyadventures.com/wp-content/uploads/2024/10/tuasan-falls-camiguin.jpg',
    bookingUrl: '#book-tuasan',
    googleMapsUrl: 'https://www.google.com/maps/dir/?api=1&destination=Tuasan+Falls+Catarman',
  },
  {
    id: 'soda-park',
    name: 'Bura Soda Water Park',
    coords: [9.1800, 124.6700] as [number, number],
    description: 'Unique cold spring with bubbling soda-like water.',
    image: 'https://www.lanzonescabana.com/custom/domain_4/image_files/sitemgr_photo_21.png',
    bookingUrl: '#book-soda-park',
    googleMapsUrl: 'https://www.google.com/maps/dir/?api=1&destination=Bura+Soda+Water+Park+Catarman',
  },
  {
    id: 'sto-nino',
    name: 'Sto. Niño Cold Spring',
    coords: [9.1700, 124.6500] as [number, number],
    description: 'Natural cold spring pool perfect for a refreshing dip.',
    image: 'https://i0.wp.com/www.thepoortraveler.net/wp-content/uploads/2012/04/sto-nino-cold-spring-camiguin.jpg',
    bookingUrl: '#book-sto-nino',
    googleMapsUrl: 'https://www.google.com/maps/dir/?api=1&destination=Sto.+Nino+Cold+Spring+Catarman',
  },
];

// Component to handle "Locate Me" functionality
function LocationMarker({ userPos }: { userPos: [number, number] | null }) {
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

  const catarmanCenter: [number, number] = [9.2014, 124.6675];

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
    <div className="flex flex-col lg:flex-row h-full w-full overflow-hidden bg-[#F0FDF4] selection:bg-island-emerald/20">
      {/* Map Section */}
      <div className="relative w-full h-[65vh] lg:h-full lg:flex-1 order-1 lg:order-2">
        <MapContainer
          center={catarmanCenter}
          zoom={13}
          scrollWheelZoom={true}
          className="h-full w-full z-0"
        >
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
                <div className="p-3 min-w-[150px]">
                  <h3 className="font-black text-island-volcanic text-sm mb-1 tracking-tight">{loc.name}</h3>
                  <button
                    onClick={() => setSelectedLocation(loc)}
                    className="text-island-emerald text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 mt-2"
                  >
                    View Node <ExternalLink size={10} strokeWidth={3} />
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}

          <LocationMarker userPos={userPos} />
        </MapContainer>

        {/* Locate Me Button */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={handleLocateMe}
          disabled={isLocating}
          className="absolute top-8 right-8 z-[1000] w-14 h-14 bg-white/90 backdrop-blur-xl rounded-full flex items-center justify-center text-island-volcanic hover:text-island-emerald transition-all shadow-2xl border border-emerald-50"
          title="Locate Me"
        >
          <Crosshair size={28} strokeWidth={2.5} className={isLocating ? 'animate-spin text-island-emerald' : ''} />
        </motion.button>

        {/* Bottom Sheet / Detail Card */}
        <AnimatePresence>
          {selectedLocation && (
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute bottom-0 left-0 right-0 z-[1001] p-6 lg:p-10"
            >
              <div className="bg-white rounded-[3.5rem] p-6 lg:p-10 max-w-2xl mx-auto shadow-[0_50px_100px_-20px_rgba(2,44,34,0.4)] border-2 border-emerald-50 overflow-hidden relative">
                <button
                  onClick={() => setSelectedLocation(null)}
                  className="absolute top-8 right-8 p-3 bg-emerald-50 rounded-full text-island-green hover:text-island-coral active:scale-90 transition-all z-10 shadow-sm"
                >
                  <X size={24} strokeWidth={3} />
                </button>

                <div className="flex flex-col md:flex-row gap-8 lg:gap-10">
                  <div className="w-full md:w-2/5 h-48 md:h-auto rounded-[2.5rem] overflow-hidden shadow-xl">
                    <img
                      src={selectedLocation.image}
                      alt={selectedLocation.name}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="flex-1 flex flex-col justify-between py-2">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-[0.4em] text-island-emerald mb-3 block">Heritage Node</span>
                      <h2 className="text-4xl font-black text-island-volcanic tracking-tighter mb-4 leading-none">{selectedLocation.name}</h2>
                      <p className="text-island-green/60 text-base font-medium leading-relaxed mb-8">
                        {selectedLocation.description}
                      </p>
                    </div>
                    <div className="flex gap-4">
                      <a
                        href={selectedLocation.bookingUrl}
                        className="btn-primary flex-1 h-14 rounded-2xl"
                      >
                        <BookOpen size={20} strokeWidth={2.5} />
                        Reserve
                      </a>
                      <a
                        href={selectedLocation.googleMapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-volcanic flex-1 h-14 rounded-2xl"
                      >
                        <Navigation size={20} strokeWidth={2.5} />
                        Route
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
      <div className="w-full lg:w-[450px] h-auto lg:h-full bg-white/80 backdrop-blur-3xl border-r border-emerald-50 p-10 order-2 lg:order-1 overflow-y-auto no-scrollbar shadow-2xl relative z-10">
        <header className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 forest-gradient rounded-xl flex items-center justify-center text-white shadow-lg">
              <Sparkles size={20} strokeWidth={2.5} />
            </div>
            <h1 className="text-3xl font-black text-island-volcanic tracking-tighter">Catarman Nodes.</h1>
          </div>
          <p className="text-island-green/50 font-semibold text-sm">Explore the "Emerald Island" pilot test.</p>
        </header>

        <div className="space-y-5">
          {locations.map((loc) => (
            <motion.div
              key={loc.id}
              whileHover={{ scale: 1.02, x: 5 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedLocation(loc)}
              className={`p-6 rounded-[2.5rem] cursor-pointer transition-all border-2 ${
                selectedLocation?.id === loc.id
                  ? 'emerald-gradient text-white border-transparent shadow-2xl shadow-island-emerald/30'
                  : 'bg-white border-slate-100 hover:border-emerald-200 text-island-volcanic shadow-sm hover:shadow-xl'
              }`}
            >
              <div className="flex items-center gap-5">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${
                  selectedLocation?.id === loc.id ? 'bg-white/20' : 'bg-emerald-50'
                }`}>
                  <MapPin size={24} strokeWidth={3} className={selectedLocation?.id === loc.id ? 'text-white' : 'text-island-emerald'} />
                </div>
                <div>
                  <h3 className="font-black text-lg tracking-tight leading-none mb-1.5">{loc.name}</h3>
                  <p className={`text-[10px] font-black uppercase tracking-widest ${
                    selectedLocation?.id === loc.id ? 'text-white/70' : 'text-slate-400'
                  }`}>
                    {selectedLocation?.id === loc.id ? 'Node Active' : 'Click to manifest'}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-20 forest-gradient p-10 rounded-[3.5rem] text-white shadow-3xl border border-white/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 opacity-10 pointer-events-none">
            <Sparkles size={150} className="translate-x-10 -translate-y-10" />
          </div>
          <h4 className="text-xl font-black mb-3 tracking-tighter leading-none">Operational Guide.</h4>
          <p className="text-emerald-100/60 font-medium text-sm mb-10 leading-relaxed italic">
            "Navigate the Catarman nodes via the local tricycle network for full immersion."
          </p>
          <button className="w-full py-5 bg-white/10 backdrop-blur-xl hover:bg-white/20 border-2 border-white/20 rounded-2xl text-xs font-black uppercase tracking-[0.2em] transition-all">
            Download Manifest
          </button>
        </div>
      </div>
    </div>
  );
};

export default IslandMap;

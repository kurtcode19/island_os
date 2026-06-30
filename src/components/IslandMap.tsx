import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { toast } from 'sonner';
import { UilMapMarker as MapPin, UilNavigator as Navigation, UilBookOpen as BookOpen, UilCrosshair as Crosshair, UilExternalLinkAlt as ExternalLink, UilStar as Sparkles, UilTimes as X, UilClock as Clock, UilShoppingBag as ShoppingBag, UilStore as Store, UilStar as Star, UilPhone as Phone } from '@/icons';
import { motion, AnimatePresence } from 'motion/react';

const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

L.Marker.prototype.options.icon = DefaultIcon;

const ShopIcon = L.divIcon({
  className: 'custom-shop-icon',
  html: '<div style="background:#10b981;width:36px;height:36px;border-radius:12px;display:flex;align-items:center;justify-content:center;border:3px solid white;box-shadow:0 2px 12px rgba(16,185,129,0.4);color:white;font-size:16px;font-weight:bold">₱</div>',
  iconSize: [36, 36],
  iconAnchor: [18, 18],
});

const locations = [
  {
    id: 'sunken-cemetery',
    name: 'Sunken Cemetery',
    coords: [9.2014, 124.6675] as [number, number],
    description: 'A historic landmark marked by a large cross in the sea, perfect for snorkeling and sunset views.',
    image: '/images/hero-sunken.png',
    bookingUrl: '#book-sunken-cemetery',
    googleMapsUrl: 'https://www.google.com/maps/dir/?api=1&destination=Sunken+Cemetery+Catarman',
    openSchedule: 'Open daily, 6:00 AM - 6:00 PM',
  },
  {
    id: 'church-ruins',
    name: 'Old Spanish Church Ruins',
    coords: [9.2123, 124.6543] as [number, number],
    description: 'The ruins of the Gui-ob Church, destroyed during the 1871 volcanic eruption.',
    image: '/images/old-spanish-church-ruins-big-tree.jpg',
    bookingUrl: '#book-church-ruins',
    googleMapsUrl: 'https://www.google.com/maps/dir/?api=1&destination=Old+Church+Ruins+Catarman',
    openSchedule: 'Open daily, 8:00 AM - 5:00 PM',
  },
  {
    id: 'tuasan-falls',
    name: 'Tuasan Falls',
    coords: [9.1833, 124.6667] as [number, number],
    description: 'A pristine and powerful waterfall nestled in Catarman\'s lush jungle.',
    image: '/images/tuasan.jpg',
    bookingUrl: '#book-tuasan',
    googleMapsUrl: 'https://www.google.com/maps/dir/?api=1&destination=Tuasan+Falls+Catarman',
    openSchedule: 'Open daily, 7:00 AM - 5:00 PM',
  },
  {
    id: 'soda-park',
    name: 'Bura Soda Water Park',
    coords: [9.1800, 124.6700] as [number, number],
    description: 'Unique cold spring with bubbling soda-like water.',
    image: '/images/borasoda.png',
    bookingUrl: '#book-soda-park',
    googleMapsUrl: 'https://www.google.com/maps/dir/?api=1&destination=Bura+Soda+Water+Park+Catarman',
    openSchedule: 'Open daily, 8:00 AM - 7:00 PM',
  },
  {
    id: 'sto-nino',
    name: 'Sto. Niño Cold Spring',
    coords: [9.1700, 124.6500] as [number, number],
    description: 'Natural cold spring pool perfect for a refreshing dip.',
    image: '/images/sto.nino.jpg',
    bookingUrl: '#book-sto-nino',
    googleMapsUrl: 'https://www.google.com/maps/dir/?api=1&destination=Sto.+Nino+Cold+Spring+Catarman',
    openSchedule: 'Open daily, 7:00 AM - 6:00 PM',
  },
];

interface MapShop {
  id: number;
  name: string;
  category: string;
  rating: number;
  coords: [number, number];
  description: string;
  image: string;
  availTime?: string;
  contact?: string;
}

const shopLocations: MapShop[] = [
  {
    id: 2,
    name: "Municipal Public Market",
    category: "Market",
    rating: 4.5,
    image: "/images/DigiPay-1.png",
    description: "Fresh produce and local street food.",
    coords: [9.1960, 124.6700],
    availTime: "6:00 AM - 7:00 PM daily",
    contact: "0917-123-4567",
  },
  {
    id: 3,
    name: "Catarman Souvenir Hub",
    category: "Souvenirs",
    rating: 4.2,
    image: "/images/hero-sunken.png",
    description: "Local handicrafts, t-shirts, and souvenir items.",
    coords: [9.2000, 124.6650],
    availTime: "8:00 AM - 6:00 PM daily",
    contact: "0918-765-4321",
  },
  {
    id: 4,
    name: "Island Eats Café",
    category: "Food & Beverage",
    rating: 4.7,
    image: "/images/explore-bg.jpg",
    description: "Local café serving Camiguin coffee and homemade pastries.",
    coords: [9.2050, 124.6720],
    availTime: "7:00 AM - 9:00 PM daily",
    contact: "0919-555-1212",
  },
];

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
  const [selectedShop, setSelectedShop] = useState<MapShop | null>(null);
  const [userPos, setUserPos] = useState<[number, number] | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [mapFilter, setMapFilter] = useState<'attractions' | 'shops'>('attractions');
  const [showList, setShowList] = useState(false);

  const catarmanCenter: [number, number] = [9.2014, 124.6675];

  const handleLocateMe = () => {
    setIsLocating(true);
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserPos([position.coords.latitude, position.coords.longitude]);
        setIsLocating(false);
        toast.success('Location found');
      },
      () => {
        toast.error('Unable to retrieve your location');
        setIsLocating(false);
      }
    );
  };

  const closeDetail = () => {
    setSelectedLocation(null);
    setSelectedShop(null);
  };

  const filteredLocations = mapFilter === 'attractions' ? locations : shopLocations;

  return (
    <div className="flex flex-col lg:flex-row h-full w-full overflow-hidden bg-[#F0FDF4] selection:bg-island-emerald/20">
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
                click: () => { setSelectedLocation(loc); setSelectedShop(null); },
              }}
            >
              <Popup className="custom-popup">
                <div className="p-3 min-w-[150px]">
                  <h3 className="font-black text-island-volcanic text-sm mb-1 tracking-tight">{loc.name}</h3>
                  <button
                    onClick={() => setSelectedLocation(loc)}
                    className="text-island-emerald text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 mt-2"
                  >
                    View Details <ExternalLink size="10" />
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}

          {shopLocations.map((shop) => (
            <Marker
              key={`shop-${shop.id}`}
              position={shop.coords}
              icon={ShopIcon}
              eventHandlers={{
                click: () => { setSelectedShop(shop); setSelectedLocation(null); },
              }}
            >
              <Popup className="custom-popup">
                <div className="p-3 min-w-[150px]">
                  <div className="flex items-center gap-2 mb-1">
                    <Store size="12" className="text-island-emerald" />
                    <h3 className="font-black text-island-volcanic text-sm tracking-tight">{shop.name}</h3>
                  </div>
                  <p className="text-[10px] text-slate-400 font-semibold">{shop.category} · ★ {shop.rating}</p>
                  <button
                    onClick={() => setSelectedShop(shop)}
                    className="text-island-emerald text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 mt-2"
                  >
                    View Shop <ExternalLink size="10" />
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}

          <LocationMarker userPos={userPos} />
        </MapContainer>

        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={handleLocateMe}
          disabled={isLocating}
          className="absolute top-8 right-8 z-[1000] w-14 h-14 bg-white/90 backdrop-blur-xl rounded-full flex items-center justify-center text-island-volcanic hover:text-island-emerald transition-all shadow-2xl border border-emerald-50"
          title="Locate Me"
        >
          <Crosshair size="28" className={isLocating ? 'animate-spin text-island-emerald' : ''} />
        </motion.button>

        <div className="lg:hidden absolute top-8 left-8 z-[1000] flex gap-2">
          <button onClick={() => { setMapFilter('attractions'); setSelectedLocation(null); setSelectedShop(null); }}
            className={`px-5 py-2.5 rounded-full text-xs font-bold tracking-tight backdrop-blur-xl shadow-2xl border transition-all ${
              mapFilter === 'attractions' ? 'bg-island-volcanic text-white border-island-volcanic' : 'bg-white/90 text-slate-500 border-white/20'
            }`}>
            Attractions
          </button>
          <button onClick={() => { setMapFilter('shops'); setSelectedLocation(null); setSelectedShop(null); }}
            className={`px-5 py-2.5 rounded-full text-xs font-bold tracking-tight backdrop-blur-xl shadow-2xl border transition-all ${
              mapFilter === 'shops' ? 'bg-island-volcanic text-white border-island-volcanic' : 'bg-white/90 text-slate-500 border-white/20'
            }`}>
            Shops
          </button>
        </div>

        <button onClick={() => setShowList(!showList)}
          className="lg:hidden absolute bottom-8 left-8 z-[1000] px-5 py-3 bg-white/90 backdrop-blur-xl rounded-full text-xs font-bold tracking-tight text-island-volcanic shadow-2xl border border-white/20 flex items-center gap-2">
          <MapPin size="16" />
          {filteredLocations.length} {mapFilter === 'attractions' ? 'Sites' : 'Shops'}
        </button>

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
                  onClick={closeDetail}
                  className="absolute top-8 right-8 p-3 bg-emerald-50 rounded-full text-island-green hover:text-island-coral active:scale-90 transition-all z-10 shadow-sm"
                >
                  <X size="24" />
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
                      <span className="text-[10px] font-black uppercase tracking-[0.4em] text-island-emerald mb-3 block">Heritage Site</span>
                      <h2 className="text-4xl font-black text-island-volcanic tracking-tighter mb-4 leading-none">{selectedLocation.name}</h2>
                      <p className="text-island-green/60 text-base font-medium leading-relaxed mb-4">
                        {selectedLocation.description}
                      </p>
                      <div className="flex items-center gap-2 mb-6 text-sm font-semibold text-island-sunset bg-amber-50 p-3 rounded-2xl border border-amber-100">
                        <Clock size="16" />
                        <span>{selectedLocation.openSchedule}</span>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <a
                        href={selectedLocation.bookingUrl}
                        className="btn-primary flex-1 h-14 rounded-2xl"
                      >
                        <BookOpen size="20" />
                        Reserve
                      </a>
                      <a
                        href={selectedLocation.googleMapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-volcanic flex-1 h-14 rounded-2xl"
                      >
                        <Navigation size="20" />
                        Route
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {selectedShop && (
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute bottom-0 left-0 right-0 z-[1001] p-6 lg:p-10"
            >
              <div className="bg-white rounded-[3.5rem] p-6 lg:p-10 max-w-2xl mx-auto shadow-[0_50px_100px_-20px_rgba(2,44,34,0.4)] border-2 border-emerald-50 overflow-hidden relative">
                <button
                  onClick={closeDetail}
                  className="absolute top-8 right-8 p-3 bg-emerald-50 rounded-full text-island-green hover:text-island-coral active:scale-90 transition-all z-10 shadow-sm"
                >
                  <X size="24" />
                </button>

                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-island-emerald/10 rounded-xl flex items-center justify-center">
                    <Store size="20" className="text-island-emerald" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-island-emerald">Local Shop</span>
                </div>
                <h2 className="text-3xl font-black text-island-volcanic tracking-tighter mb-2 leading-none">{selectedShop.name}</h2>
                <div className="flex items-center gap-4 text-xs text-slate-400 font-semibold mb-4">
                  <span className="flex items-center gap-1"><Star size="12" className="text-island-emerald" /> {selectedShop.rating}</span>
                  {selectedShop.availTime && <span className="flex items-center gap-1"><Clock size="12" /> {selectedShop.availTime}</span>}
                  {selectedShop.contact && <span className="flex items-center gap-1"><Phone size="12" /> {selectedShop.contact}</span>}
                </div>
                <p className="text-island-green/60 text-sm font-medium leading-relaxed mb-6">{selectedShop.description}</p>
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(selectedShop.name)}+Catarman`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary w-full h-14 rounded-2xl"
                >
                  <Navigation size="20" />
                  Get Directions
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="hidden lg:block w-[450px] h-full bg-white/80 backdrop-blur-3xl border-r border-emerald-50 p-10 order-2 lg:order-1 overflow-y-auto no-scrollbar shadow-2xl relative z-10">
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 forest-gradient rounded-xl flex items-center justify-center text-white shadow-lg">
              <Sparkles size="20" />
            </div>
            <h1 className="text-3xl font-black text-island-volcanic tracking-tighter">Catarman Places.</h1>
          </div>
          <p className="text-island-green/50 font-semibold text-sm">Explore the "Emerald Island" pilot test.</p>
        </header>

        <div className="flex gap-2 mb-8 bg-slate-50 p-1 rounded-2xl border border-slate-100">
          <button
            onClick={() => { setMapFilter('attractions'); setSelectedLocation(null); setSelectedShop(null); }}
            className={`flex-1 py-3 rounded-xl text-xs font-bold tracking-tight transition-all ${
              mapFilter === 'attractions' ? 'bg-white text-island-volcanic shadow-sm' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            Attractions
          </button>
          <button
            onClick={() => { setMapFilter('shops'); setSelectedLocation(null); setSelectedShop(null); }}
            className={`flex-1 py-3 rounded-xl text-xs font-bold tracking-tight transition-all ${
              mapFilter === 'shops' ? 'bg-white text-island-volcanic shadow-sm' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            Shops
          </button>
        </div>

        <div className="space-y-4">
          {filteredLocations === locations ? (
            locations.map((loc) => (
              <motion.div
                key={loc.id}
                whileHover={{ scale: 1.02, x: 5 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => { setSelectedLocation(loc); setSelectedShop(null); }}
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
                    <MapPin size="24" className={selectedLocation?.id === loc.id ? 'text-white' : 'text-island-emerald'} />
                  </div>
                  <div>
                    <h3 className="font-black text-lg tracking-tight leading-none mb-1.5">{loc.name}</h3>
                    <p className={`text-[10px] font-black uppercase tracking-widest ${
                      selectedLocation?.id === loc.id ? 'text-white/70' : 'text-slate-400'
                    }`}>
                      {selectedLocation?.id === loc.id ? 'Selected' : 'Select'}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            shopLocations.map((shop) => (
              <motion.div
                key={`shop-${shop.id}`}
                whileHover={{ scale: 1.02, x: 5 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => { setSelectedShop(shop); setSelectedLocation(null); }}
                className={`p-6 rounded-[2.5rem] cursor-pointer transition-all border-2 ${
                  selectedShop?.id === shop.id
                    ? 'emerald-gradient text-white border-transparent shadow-2xl shadow-island-emerald/30'
                    : 'bg-white border-slate-100 hover:border-emerald-200 text-island-volcanic shadow-sm hover:shadow-xl'
                }`}
              >
                <div className="flex items-center gap-5">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${
                    selectedShop?.id === shop.id ? 'bg-white/20' : 'bg-emerald-50'
                  }`}>
                    <ShoppingBag size="24" className={selectedShop?.id === shop.id ? 'text-white' : 'text-island-emerald'} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-black text-lg tracking-tight leading-none mb-1">{shop.name}</h3>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-black uppercase tracking-widest ${
                        selectedShop?.id === shop.id ? 'text-white/70' : 'text-slate-400'
                      }`}>
                        {shop.category}
                      </span>
                      <span className={`text-[10px] font-semibold ${
                        selectedShop?.id === shop.id ? 'text-white/50' : 'text-slate-300'
                      }`}>
                        ★ {shop.rating}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>

        <div className="mt-10 forest-gradient p-8 rounded-[3.5rem] text-white shadow-3xl border border-white/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 opacity-10 pointer-events-none">
            <Sparkles size="150" className="translate-x-10 -translate-y-10" />
          </div>
          <h4 className="text-xl font-black mb-3 tracking-tighter leading-none">Operational Guide.</h4>
          <p className="text-emerald-100/60 font-medium text-sm mb-8 leading-relaxed italic">
            "Get around Catarman by tricycle."
          </p>
          <button className="w-full py-5 bg-white/10 backdrop-blur-xl hover:bg-white/20 border-2 border-white/20 rounded-2xl text-xs font-black uppercase tracking-[0.2em] transition-all">
            Download Manifest
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showList && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="lg:hidden fixed inset-x-0 bottom-0 z-[1002] p-4 pb-24"
          >
            <div className="bg-white/95 backdrop-blur-2xl rounded-[2.5rem] p-5 max-h-[50vh] overflow-y-auto no-scrollbar shadow-2xl border border-white/20">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-black text-island-volcanic uppercase tracking-widest">
                  {mapFilter === 'attractions' ? 'Attractions' : 'Shops'} ({filteredLocations.length})
                </span>
                <button onClick={() => setShowList(false)} className="p-2 bg-slate-100 rounded-full">
                  <X size="16" />
                </button>
              </div>
              <div className="space-y-2">
                {filteredLocations === locations ? (
                  locations.map((loc) => (
                    <button key={loc.id} onClick={() => { setSelectedLocation(loc); setSelectedShop(null); setShowList(false); }}
                      className={`w-full text-left p-4 rounded-2xl transition-all flex items-center gap-4 ${
                        selectedLocation?.id === loc.id ? 'emerald-gradient text-white' : 'bg-slate-50 text-island-volcanic'
                      }`}>
                      <MapPin size="20" />
                      <div>
                        <p className="font-bold text-sm tracking-tight">{loc.name}</p>
                        <p className="text-[10px] font-semibold opacity-60">{loc.description.slice(0, 40)}...</p>
                      </div>
                    </button>
                  ))
                ) : (
                  shopLocations.map((shop) => (
                    <button key={shop.id} onClick={() => { setSelectedShop(shop); setSelectedLocation(null); setShowList(false); }}
                      className={`w-full text-left p-4 rounded-2xl transition-all flex items-center gap-4 ${
                        selectedShop?.id === shop.id ? 'emerald-gradient text-white' : 'bg-slate-50 text-island-volcanic'
                      }`}>
                      <ShoppingBag size="20" />
                      <div>
                        <p className="font-bold text-sm tracking-tight">{shop.name}</p>
                        <p className="text-[10px] font-semibold opacity-60">{shop.category} · ★ {shop.rating}</p>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default IslandMap;

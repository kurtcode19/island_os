import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingBag, Store, Search, MapPin, Star, Sparkles, Clock, Phone, Package, CheckCircle2, Plus, Minus, X, ShoppingCart, CreditCard } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { toast } from 'sonner';

interface ShopProduct {
  id: string;
  name: string;
  price: number;
  image: string;
  status: 'Available' | 'Out of Stock';
  category: string;
}

interface Shop {
  id: number;
  name: string;
  category: string;
  rating: number;
  image: string;
  description: string;
  availTime?: string;
  contact?: string;
  products: ShopProduct[];
}

const shops: Shop[] = [
  {
    id: 2,
    name: "Municipal Public Market",
    category: "Market",
    rating: 4.5,
    image: "/images/DigiPay-1.png",
    description: "Fresh produce and local street food node.",
    availTime: "6:00 AM - 7:00 PM daily",
    contact: "0917-123-4567",
    products: [
      { id: 'prod-1', name: 'Fresh Lanzones (per kg)', price: 120, image: '/images/DigiPay-1.png', status: 'Available', category: 'Fresh Produce' },
      { id: 'prod-2', name: 'Dried Squid (pack)', price: 180, image: '/images/DigiPay-1.png', status: 'Available', category: 'Dried Goods' },
      { id: 'prod-3', name: 'Pastel de Camiguin (box)', price: 250, image: '/images/DigiPay-1.png', status: 'Out of Stock', category: 'Baked Goods' },
      { id: 'prod-4', name: 'Camiguin Coffee (250g)', price: 200, image: '/images/DigiPay-1.png', status: 'Available', category: 'Beverages' },
    ]
  },
  {
    id: 3,
    name: "Catarman Souvenir Hub",
    category: "Souvenirs",
    rating: 4.2,
    image: "/images/hero-sunken.png",
    description: "Local handicrafts, t-shirts, and souvenir items.",
    availTime: "8:00 AM - 6:00 PM daily",
    contact: "0918-765-4321",
    products: [
      { id: 'prod-5', name: 'Camiguin T-Shirt', price: 350, image: '/images/hero-sunken.png', status: 'Available', category: 'Apparel' },
      { id: 'prod-6', name: 'Keychain Set (5 pcs)', price: 100, image: '/images/hero-sunken.png', status: 'Available', category: 'Souvenirs' },
      { id: 'prod-7', name: 'Shell Craft Decoration', price: 450, image: '/images/hero-sunken.png', status: 'Available', category: 'Handicrafts' },
    ]
  },
  {
    id: 4,
    name: "Island Eats Café",
    category: "Food & Beverage",
    rating: 4.7,
    image: "/images/explore-bg.jpg",
    description: "Local café serving Camiguin coffee and homemade pastries.",
    availTime: "7:00 AM - 9:00 PM daily",
    contact: "0919-555-1212",
    products: [
      { id: 'prod-8', name: 'Barista Coffee', price: 90, image: '/images/explore-bg.jpg', status: 'Available', category: 'Beverages' },
      { id: 'prod-9', name: 'Pastel Bundle (3 pcs)', price: 150, image: '/images/explore-bg.jpg', status: 'Available', category: 'Food' },
      { id: 'prod-10', name: 'Camiguin Burger', price: 180, image: '/images/explore-bg.jpg', status: 'Available', category: 'Food' },
    ]
  },
];

export default function ShopsView() {
  const { user, login } = useAuth();
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
  const [orderQuantities, setOrderQuantities] = useState<{[key: string]: number}>({});
  const [orderType, setOrderType] = useState<'walk-in' | 'delivery'>('walk-in');
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [orderStatus, setOrderStatus] = useState<'idle' | 'loading' | 'success'>('idle');

  const handleQuantityChange = (productId: string, delta: number) => {
    setOrderQuantities(prev => ({
      ...prev,
      [productId]: Math.max(0, (prev[productId] || 0) + delta)
    }));
  };

  const handlePlaceOrder = async () => {
    if (!user) { login(); return; }

    const selectedProducts = Object.entries(orderQuantities).filter(([_, qty]) => qty > 0);
    if (selectedProducts.length === 0) {
      toast.error('Please select at least one item');
      return;
    }

    setOrderStatus('loading');
    const items = selectedProducts.map(([prodId, qty]) => {
      const product = selectedShop?.products.find(p => p.id === prodId);
      return { productId: prodId, name: product?.name || '', qty, price: (product?.price || 0) * qty };
    });

    const total = items.reduce((sum, item) => sum + item.price, 0);

    try {
      await addDoc(collection(db, 'bookings'), {
        touristUid: user.uid,
        touristName: user.displayName || 'Anonymous',
        serviceType: 'shop',
        businessId: `shop-${selectedShop?.id}`,
        serviceName: selectedShop?.name,
        date: new Date().toISOString(),
        items,
        total,
        orderType,
        status: 'pending',
        paymentStatus: 'UNPAID',
        createdAt: serverTimestamp(),
      });
      setOrderStatus('success');
      toast.success('Order placed!');
      setTimeout(() => {
        setShowOrderForm(false);
        setOrderStatus('idle');
        setOrderQuantities({});
      }, 2000);
    } catch (error) {
      setOrderStatus('idle');
      handleFirestoreError(error, OperationType.CREATE, 'bookings');
    }
  };

  return (
    <div className="min-h-screen bg-[#F0FDF4] pb-40 selection:bg-island-emerald/20">
      <div className="max-w-7xl mx-auto px-6 py-20">
        <header className="mb-16">
          <span className="text-xs font-bold text-island-emerald tracking-wider mb-3 block">Local Shops</span>
          <h1 className="text-6xl font-black text-island-volcanic tracking-tighter">Verified <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-island-emerald to-island-volcanic">Marketplace.</span></h1>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {shops.map((shop) => (
            <motion.div
              key={shop.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              onClick={() => setSelectedShop(shop)}
              className="bg-white rounded-[3.5rem] overflow-hidden border-2 border-slate-100 shadow-xl hover:shadow-2xl transition-all duration-500 group p-5 cursor-pointer"
            >
              <div className="aspect-[4/3] rounded-[2.5rem] overflow-hidden relative mb-8">
                <img 
                  src={shop.image} 
                  alt={shop.name} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-6 right-6 px-4 py-1.5 bg-white/95 backdrop-blur-xl rounded-full text-[10px] font-bold text-island-volcanic tracking-wider shadow-lg border border-slate-100">
                  {shop.category}
                </div>
              </div>
              <div className="px-4 pb-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-2xl font-black text-island-volcanic tracking-tighter">{shop.name}</h3>
                  <div className="flex items-center gap-1.5 text-island-emerald font-black text-sm">
                    <Star size={16} fill="currentColor" />
                    {shop.rating}
                  </div>
                </div>
                {shop.availTime && (
                  <div className="flex items-center gap-2 text-xs text-slate-400 font-semibold mb-2">
                    <Clock size={12} /> {shop.availTime}
                  </div>
                )}
                {shop.contact && (
                  <div className="flex items-center gap-2 text-xs text-slate-400 font-semibold mb-4">
                    <Phone size={12} /> {shop.contact}
                  </div>
                )}
                <p className="text-slate-500 font-medium text-sm mb-6 leading-relaxed">{shop.description}</p>
                <div className="flex gap-3">
                  <button
                    onClick={(e) => { e.stopPropagation(); setSelectedShop(shop); }}
                    className="btn-volcanic flex-1 py-4 rounded-2xl text-[10px]"
                  >
                    <Store size={16} strokeWidth={3} />
                    View Shop
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Shop Detail / Order Modal */}
      <AnimatePresence>
        {selectedShop && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
            <div className="absolute inset-0 bg-island-volcanic/60 backdrop-blur-sm" onClick={() => setSelectedShop(null)} />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              className="relative w-full max-w-3xl bg-white rounded-[2.5rem] overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-white z-10 px-8 pt-8 pb-4 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-black text-island-volcanic tracking-tighter">{selectedShop.name}</h3>
                  <div className="flex items-center gap-4 text-xs text-slate-400 font-semibold mt-1">
                    <span className="flex items-center gap-1"><Clock size={12} /> {selectedShop.availTime}</span>
                    <span className="flex items-center gap-1"><Phone size={12} /> {selectedShop.contact}</span>
                  </div>
                </div>
                <button onClick={() => setSelectedShop(null)} className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-500 hover:bg-island-green hover:text-white transition-all">
                  <X size={18} strokeWidth={3} />
                </button>
              </div>

              <div className="px-8 pt-6 pb-10">
                <p className="text-sm text-slate-500 font-medium mb-8">{selectedShop.description}</p>

                <h4 className="text-sm font-bold text-island-green mb-4 flex items-center gap-2">
                  <Package size={16} /> Products
                </h4>

                <div className="space-y-3 mb-8">
                  {selectedShop.products.map((product) => (
                    <div key={product.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-semibold text-slate-700">{product.name}</span>
                          <span className={`px-2 py-0.5 rounded-full text-[8px] font-bold tracking-wider ${
                            product.status === 'Available' ? 'bg-island-emerald/10 text-island-emerald' : 'bg-rose-50 text-island-coral'
                          }`}>
                            {product.status}
                          </span>
                        </div>
                        <span className="text-xs text-slate-400 font-medium">{product.category}</span>
                      </div>
                      <div className="flex items-center gap-6">
                        <span className="text-lg font-black text-island-volcanic tracking-tighter">₱{product.price}</span>
                        {product.status === 'Available' && (
                          <div className="flex items-center gap-2">
                            <button onClick={() => handleQuantityChange(product.id, -1)}
                              className="w-7 h-7 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-island-green hover:text-white transition-all">
                              <Minus size={12} strokeWidth={3} />
                            </button>
                            <span className="w-5 text-center text-sm font-bold text-island-green">{orderQuantities[product.id] || 0}</span>
                            <button onClick={() => handleQuantityChange(product.id, 1)}
                              className="w-7 h-7 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-island-green hover:text-white transition-all">
                              <Plus size={12} strokeWidth={3} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order Type Selection */}
                <div className="flex gap-3 mb-8">
                  <button onClick={() => setOrderType('walk-in')}
                    className={`flex-1 py-4 rounded-2xl text-xs font-bold transition-all ${
                      orderType === 'walk-in' ? 'bg-island-green text-white shadow-lg' : 'bg-slate-50 text-slate-400 border border-slate-100'
                    }`}>
                    Walk-in / Dine-in
                  </button>
                  <button onClick={() => setOrderType('delivery')}
                    className={`flex-1 py-4 rounded-2xl text-xs font-bold transition-all ${
                      orderType === 'delivery' ? 'bg-island-green text-white shadow-lg' : 'bg-slate-50 text-slate-400 border border-slate-100'
                    }`}>
                    Delivery
                  </button>
                </div>

                {/* Total & Order */}
                <div className="flex items-center justify-between p-6 bg-island-green/5 rounded-2xl border border-island-green/10 mb-6">
                  <div>
                    <span className="text-xs text-slate-400 font-semibold">Total</span>
                    <span className="text-2xl font-black text-island-green block">₱{Object.entries(orderQuantities)
                      .filter(([_, qty]) => qty > 0)
                      .reduce((sum, [prodId, qty]) => {
                        const product = selectedShop.products.find(p => p.id === prodId);
                        return sum + (product?.price || 0) * qty;
                      }, 0).toLocaleString()}</span>
                  </div>
                  <button onClick={handlePlaceOrder}
                    disabled={orderStatus === 'loading' || orderStatus === 'success'}
                    className="btn-primary px-8 py-4 rounded-2xl text-xs"
                  >
                    {orderStatus === 'success' ? <><CheckCircle2 size={18} /> Placed!</> : <><ShoppingCart size={18} /> Place Order</>}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

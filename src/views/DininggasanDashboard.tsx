import { useEffect, useState, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { collection, query, where, onSnapshot, doc, getDoc, deleteDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import {
  UilChartBar, UilCalendar, UilSignOutAlt, UilBuilding, UilArrowUpRight,
  UilUsersAlt, UilCreditCard, UilBedDouble, UilCheckCircle, UilTimes, UilTrashAlt, UilInfoCircle, UilPlus, UilSearch,
  UilSetting, UilBookOpen, UilDollarSign, UilFileAlt, UilThumbsUp, UilChartPie, UilShieldCheck
} from '@/icons';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import ReviewsModule from '../components/business/ReviewsModule';
import {
  DashboardSection, RoomsSection, ExpensesSection, RatesSection,
  PerformanceSection, SettingsSection, GuideSection, FaqSection, HelpSection, AdminsSection
} from '../components/admin/AdminSections';
import { DININGGASAN_ROOM_COUNT } from '../data/dininggasanData';
import {
  stayRange, pickFreeRoomNumber, subscribeOccupancy, writeOccupancy,
  setOccupancyStatus, removeOccupancy, backfillRoomAssignments, dayKey,
} from '../lib/roomAssignment';

const BUSINESS_ID = 'dininggasan-catarman';
const TOTAL_ROOMS = DININGGASAN_ROOM_COUNT;
const ADMIN_EMAIL = 'kurtmier123@gmail.com';

const sidebarItems = [
  { icon: UilChartBar, label: 'Dashboard', section: 'dashboard' },
  { icon: UilBedDouble, label: 'Bookings', section: 'bookings' },
  { icon: UilBuilding, label: 'Room Management', section: 'rooms' },
  { icon: UilDollarSign, label: 'Expenses', section: 'expenses' },
  { icon: UilFileAlt, label: 'Rate Calculator', section: 'rates' },
  { icon: UilThumbsUp, label: 'Reviews & Ratings', section: 'reviews' },
  { icon: UilChartPie, label: 'Performance', section: 'performance' },
  { icon: UilShieldCheck, label: 'Admins', section: 'admins' },
  { icon: UilBookOpen, label: 'User Guide', section: 'guide' },
  { icon: UilFileAlt, label: 'FAQ', section: 'faq' },
  { icon: UilFileAlt, label: 'Help Center', section: 'help' },
  { icon: UilSetting, label: 'Settings', section: 'settings' },
];

export default function DininggasanDashboard() {
  const { logout, user, profile, loading: authLoading, login } = useAuth();
  const location = useLocation();
  const [businessName, setBusinessName] = useState('Dininggasan');
  const [roomTypes, setRoomTypes] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('bookings');
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [extensionDays, setExtensionDays] = useState(1);
  const [additionalCharge, setAdditionalCharge] = useState('');
  const [chargeDescription, setChargeDescription] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [selectedDate, setSelectedDate] = useState(() => dayKey(new Date()));
  const [occupancy, setOccupancy] = useState<any[]>([]);

  useEffect(() => {
    return subscribeOccupancy(setOccupancy);
  }, []);

  const rooms = Array.from({ length: TOTAL_ROOMS }, (_, i) => ({
    id: i + 1,
    number: String(i + 1).padStart(2, '0'),
  }));

  const getRoomStatus = (roomId: number, checkDate?: string) => {
    const dateToCheck = checkDate || selectedDate;
    const roomNumber = String(roomId).padStart(2, '0');
    const booking = bookings.find(b => {
      if (b.roomNumber !== roomNumber) return false;
      if (b.status === 'cancelled') return false;
      const range = stayRange(b);
      if (!range) return false;
      return dateToCheck >= range.start && dateToCheck < range.end;
    });

    if (!booking) return { status: 'available', color: 'bg-gray-300' };
    if (booking.status === 'confirmed' || booking.status === 'checked_in') return { status: 'booked', color: 'bg-green-500' };
    if (booking.status === 'pending') return { status: 'pending', color: 'bg-yellow-500' };
    return { status: 'available', color: 'bg-gray-300' };
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Delete this booking?')) return;
    try {
      await deleteDoc(doc(db, 'bookings', id));
      await removeOccupancy(id);
      toast.success('Booking deleted');
      if (selectedBooking?.id === id) setSelectedBooking(null);
    } catch(err) {
      toast.error('Failed to delete');
    }
  };

  const handleConfirm = async (id: string) => {
    // selectedBooking is patched optimistically by the payment handlers, list may lag a snapshot
    const booking = selectedBooking?.id === id ? selectedBooking : bookings.find(b => b.id === id);
    if (booking?.paymentStatus !== 'VERIFIED') {
      toast.error('Verify the payment before confirming');
      return;
    }
    try {
      const patch: any = { status: 'confirmed' };
      if (
        booking &&
        booking.businessId === BUSINESS_ID &&
        booking.serviceType === 'stay' &&
        booking.bookingCategory !== 'event' &&
        booking.status !== 'cancelled'
      ) {
        const range = stayRange(booking);
        if (range) {
          const roomNumber = booking.roomNumber
            || pickFreeRoomNumber(occupancy, range.start, range.end);
          if (roomNumber) {
            patch.roomNumber = roomNumber;
            await writeOccupancy(id, {
              businessId: BUSINESS_ID,
              roomNumber,
              start: range.start,
              end: range.end,
              status: 'confirmed',
              touristUid: booking.touristUid || '',
            });
          }
        }
      }
      await updateDoc(doc(db, 'bookings', id), patch);
      if (patch.roomNumber) setSelectedBooking((prev: any) => prev?.id === id ? { ...prev, ...patch } : prev);
      toast.success(patch.roomNumber ? `Confirmed · Room ${patch.roomNumber}` : 'Booking confirmed');
    } catch(err) {
      toast.error('Failed to confirm');
    }
  };

  const backfilledRef = useRef(false);
  useEffect(() => {
    if (loading || backfilledRef.current || bookings.length === 0) return;
    backfilledRef.current = true;
    backfillRoomAssignments(bookings).catch(() => {});
  }, [loading, bookings]);

  const handleVerifyPayment = async (id: string) => {
    try {
      await updateDoc(doc(db, 'bookings', id), {
        paymentStatus: 'VERIFIED',
        verifiedAt: serverTimestamp(),
      });
      setSelectedBooking((prev: any) => prev ? { ...prev, paymentStatus: 'VERIFIED' } : prev);
      toast.success('Payment verified');
    } catch(err) {
      toast.error('Failed to verify payment');
    }
  };

  const handleMarkPaid = async (id: string) => {
    try {
      await updateDoc(doc(db, 'bookings', id), {
        paymentStatus: 'PAID',
        paidAt: serverTimestamp(),
      });
      setSelectedBooking((prev: any) => prev ? { ...prev, paymentStatus: 'PAID' } : prev);
      toast.success('Payment marked as received');
    } catch(err) {
      toast.error('Failed to mark payment');
    }
  };

  const handleCheckedOut = async (id: string) => {
    if (!window.confirm('Mark this booking as checked out? The record is kept and the room is freed.')) return;
    try {
      await updateDoc(doc(db, 'bookings', id), {
        status: 'checked_out',
        checkedOutAt: serverTimestamp(),
      });
      await removeOccupancy(id);
      setSelectedBooking((prev: any) => prev?.id === id ? { ...prev, status: 'checked_out' } : prev);
      toast.success('Guest checked out');
    } catch(err) {
      toast.error('Failed to check out');
    }
  };

  const formatDateTs = (ts: any) => {
    if (!ts?.toDate) return '—';
    return ts.toDate().toLocaleString();
  };

  const handleExtend = async (id: string) => {
    if (extensionDays < 1) {
      toast.error('Enter valid extension days');
      return;
    }
    try {
      const booking = selectedBooking;
      const currentCheckOut = booking.checkOutTimestamp?.toDate?.() || new Date(booking.date?.split(' - ')[1]);
      const newCheckOut = new Date(currentCheckOut);
      newCheckOut.setDate(newCheckOut.getDate() + extensionDays);
      
      const roomPrice = roomTypes[0]?.basePrice || 3800;
      const extensionCharge = roomPrice * extensionDays;
      
      await updateDoc(doc(db, 'bookings', id), {
        checkOutTimestamp: newCheckOut,
        extensionDays: (booking.extensionDays || 0) + extensionDays,
        extensionCharges: (booking.extensionCharges || 0) + extensionCharge,
        amount: (booking.amount || 0) + extensionCharge,
        totalPrice: (booking.totalPrice || 0) + extensionCharge,
        updatedAt: serverTimestamp()
      });
      toast.success(`Extended by ${extensionDays} day(s). Charge: ₱${extensionCharge.toLocaleString()}`);
      setExtensionDays(1);
      setSelectedBooking(null);
    } catch(err) {
      toast.error('Failed to extend stay');
    }
  };

  const handleAddCharge = async (id: string) => {
    if (!additionalCharge || !chargeDescription) {
      toast.error('Enter charge amount and description');
      return;
    }
    try {
      const charge = parseFloat(additionalCharge);
      if (isNaN(charge) || charge <= 0) {
        toast.error('Invalid charge amount');
        return;
      }
      
      const booking = selectedBooking;
      const charges = booking.additionalCharges || [];
      charges.push({
        amount: charge,
        description: chargeDescription,
        addedAt: new Date().toISOString()
      });

      const totalAdditional = charges.reduce((sum: number, c: any) => sum + c.amount, 0);
      
      await updateDoc(doc(db, 'bookings', id), {
        additionalCharges: charges,
        totalAdditionalCharges: totalAdditional,
        totalPrice: (booking.totalPrice || booking.amount || 0) + totalAdditional,
        updatedAt: serverTimestamp()
      });
      toast.success(`Charge added: ₱${charge.toLocaleString()}`);
      setAdditionalCharge('');
      setChargeDescription('');
      setSelectedBooking(null);
    } catch(err) {
      toast.error('Failed to add charge');
    }
  };

  useEffect(() => {
    (async () => {
      const bizDoc = await getDoc(doc(db, 'businesses', BUSINESS_ID));
      if (bizDoc.exists()) {
        setBusinessName(bizDoc.data().name || 'Dininggasan');
        setRoomTypes(bizDoc.data().roomTypes || []);
      }
    })();
  }, []);

  useEffect(() => {
    const q = query(collection(db, 'bookings'), where('businessId', '==', BUSINESS_ID));
    const unsub = onSnapshot(q, (snap) => {
      let data = snap.docs.map(d => ({ id: d.id, ...d.data() } as any));
      data.sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));
      setBookings(data);
      setLoading(false);
      snap.docChanges().forEach(c => {
        if (c.type === 'added') {
          const d = c.doc.data() as any;
          toast.success(`New booking: ${d.serviceName || 'Service'} from ${d.touristName || 'Guest'}`);
        }
      });
    }, (error) => {
      console.error("Booking load error:", error);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const bookedRooms = bookings.filter(b => b.status === 'confirmed' || b.status === 'checked_in').length;
  const pendingRooms = bookings.filter(b => b.status === 'pending').length;
  const cancelledRooms = bookings.filter(b => b.status === 'cancelled').length;
  const totalRevenue = bookings.filter(b => b.paymentStatus === 'PAID' || b.paymentStatus === 'VERIFIED').reduce((s, b) => s + (b.amount || 0), 0);

  const filteredBookings = bookings.filter(b => {
    const matchesSearch = b.touristName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          b.roomNumber?.includes(searchTerm) ||
                          b.contactNumber?.includes(searchTerm);
    const matchesStatus = filterStatus === 'all' || b.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const sortedBookings = [...filteredBookings].sort((a, b) => {
    if (sortBy === 'date') return new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime();
    if (sortBy === 'guest') return (a.touristName || '').localeCompare(b.touristName || '');
    if (sortBy === 'room') return (a.roomNumber || '').localeCompare(b.roomNumber || '');
    return 0;
  });

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'confirmed': return 'bg-blue-100 text-blue-700';
      case 'checked_in': return 'bg-green-100 text-green-700';
      case 'checked_out': return 'bg-purple-100 text-purple-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const isAdmin = !!user && (
    user.email === ADMIN_EMAIL ||
    profile?.role === 'LGU' ||
    (profile?.role === 'BUSINESS' && profile?.businessId === BUSINESS_ID)
  );

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-slate-700" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl border border-gray-200 p-10 max-w-md w-full text-center">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center mx-auto mb-4">
            <UilBuilding className="text-white" size="24" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Admin sign-in required</h1>
          <p className="text-sm text-gray-500 mb-6">Sign in with an authorized account to manage Dininggasan.</p>
          <button
            onClick={login}
            className="px-6 py-3 bg-slate-700 text-white rounded-lg text-sm font-medium hover:bg-slate-800"
          >
            Sign in with Google
          </button>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl border border-gray-200 p-10 max-w-md w-full text-center">
          <h1 className="text-xl font-bold text-gray-900 mb-2">No access</h1>
          <p className="text-sm text-gray-500 mb-6">
            This account is not authorized for the Dininggasan admin panel.
          </p>
          <button onClick={logout} className="px-6 py-3 bg-slate-700 text-white rounded-lg text-sm font-medium hover:bg-slate-800">
            Sign out
          </button>
        </div>
      </div>
    );
  }

  const renderSection = () => {
    switch (activeSection) {
      case 'dashboard': return <DashboardSection bookings={bookings} />;
      case 'rooms': return (
        <RoomsSection
          bookings={bookings}
          getRoomStatus={getRoomStatus}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
        />
      );
      case 'expenses': return <ExpensesSection />;
      case 'rates': return <RatesSection />;
      case 'reviews': return <div className="bg-white rounded-xl border border-gray-200 p-6"><ReviewsModule businessId={BUSINESS_ID} /></div>;
      case 'performance': return <PerformanceSection bookings={bookings} />;
      case 'admins': return <AdminsSection />;
      case 'guide': return <GuideSection />;
      case 'faq': return <FaqSection />;
      case 'help': return <HelpSection />;
      case 'settings': return <SettingsSection />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center">
              <UilBuilding className="text-white" size="20" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">{businessName}</h1>
              <p className="text-xs text-gray-500">Hotel Management System</p>
            </div>
          </div>
          <button onClick={logout} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <UilSignOutAlt size="20" className="text-gray-600" />
          </button>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 min-h-screen sticky top-16">
          <nav className="p-4 space-y-2">
            {sidebarItems.map((item) => (
              <button
                key={item.section}
                onClick={() => setActiveSection(item.section)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-sm transition-all ${
                  activeSection === item.section
                    ? 'bg-slate-700 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <item.icon size="18" />
                {item.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {activeSection === 'bookings' ? (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Bookings</h2>
                <p className="text-gray-600">Manage reservations, cancellations, and booking activity</p>
              </div>

              {/* Room Status Grid */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Room Status</h3>
                  <div className="flex items-center gap-3">
                    <label className="text-sm font-medium text-gray-700">Check Availability:</label>
                    <input 
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
                    />
                    <button
                      onClick={() => {
                        const today = new Date();
                        setSelectedDate(today.toISOString().split('T')[0]);
                      }}
                      className="px-3 py-2 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      Today
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-3">
                  {rooms.map((room) => {
                    const roomStatus = getRoomStatus(room.id, selectedDate);
                    return (
                      <button
                        key={room.id}
                        className={`p-4 rounded-lg font-bold text-white transition-all hover:scale-105 ${roomStatus.color}`}
                        title={`Room ${room.number} - ${roomStatus.status}`}
                      >
                        {room.number}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Stats Summary */}
              <div className="grid grid-cols-4 gap-4">
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                  <p className="text-xs text-gray-500 font-semibold mb-2">Booked Rooms</p>
                  <p className="text-2xl font-bold text-green-600">{bookedRooms}</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                  <p className="text-xs text-gray-500 font-semibold mb-2">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">{pendingRooms}</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                  <p className="text-xs text-gray-500 font-semibold mb-2">Cancelled</p>
                  <p className="text-2xl font-bold text-red-600">{cancelledRooms}</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                  <p className="text-xs text-gray-500 font-semibold mb-2">Total Revenue</p>
                  <p className="text-2xl font-bold text-blue-600">₱{(totalRevenue / 1000).toFixed(1)}k</p>
                </div>
              </div>

              {/* Toolbar */}
              <div className="flex gap-4 flex-wrap">
                <div className="flex-1 min-w-64 relative">
                  <UilSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size="18" />
                  <input 
                    type="text"
                    placeholder="Search by guest, room, or contact..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
                  />
                </div>
                <select 
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-2.5 border border-gray-200 rounded-lg bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-500"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="checked_in">Checked In</option>
                  <option value="checked_out">Checked Out</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2.5 border border-gray-200 rounded-lg bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-500"
                >
                  <option value="date">Sort by Date</option>
                  <option value="guest">Sort by Guest</option>
                  <option value="room">Sort by Room</option>
                </select>
                <button className="px-6 py-2.5 bg-slate-700 hover:bg-slate-800 text-white rounded-lg font-medium text-sm transition-colors flex items-center gap-2">
                  <UilPlus size="18" />
                  Add Booking
                </button>
              </div>

              {/* Booking Table */}
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Guest Name</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Room</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Guests</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Check In</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Check Out</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Booked</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Contact</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Country</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">ID Number</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {loading ? (
                        <tr>
                          <td colSpan={11} className="px-6 py-12 text-center text-gray-500">Loading...</td>
                        </tr>
                      ) : sortedBookings.length === 0 ? (
                        <tr>
                          <td colSpan={11} className="px-6 py-12 text-center text-gray-500">No bookings found</td>
                        </tr>
                      ) : (
                        sortedBookings.map((booking) => (
                          <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 text-sm font-medium text-gray-900">{booking.touristName || 'N/A'}</td>
                            <td className="px-6 py-4 text-sm text-gray-600">{booking.roomNumber || 'N/A'}</td>
                            <td className="px-6 py-4 text-sm text-gray-600">{booking.adults || 'N/A'}</td>
                            <td className="px-6 py-4 text-sm text-gray-600">{booking.date?.split(' - ')[0] || 'N/A'}</td>
                            <td className="px-6 py-4 text-sm text-gray-600">{booking.date?.split(' - ')[1] || 'N/A'}</td>
                            <td className="px-6 py-4 text-sm text-gray-600">{formatDateTs(booking.createdAt)}</td>
                            <td className="px-6 py-4 text-sm text-gray-600">{booking.contactNumber || 'N/A'}</td>
                            <td className="px-6 py-4 text-sm text-gray-600">{booking.country || 'N/A'}</td>
                            <td className="px-6 py-4 text-sm text-gray-600">{booking.idNumber || 'N/A'}</td>
                            <td className="px-6 py-4 text-sm">
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(booking.status)}`}>
                                {booking.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm">
                              <button 
                                onClick={() => setSelectedBooking(booking)}
                                className="text-blue-600 hover:text-blue-700 font-medium text-xs"
                              >
                                View
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            renderSection()
          )}
        </main>
      </div>

      {/* Detail Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Booking Management</h3>
              <button onClick={() => setSelectedBooking(null)} className="text-gray-400 hover:text-gray-600">
                <UilTimes size="20" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 font-semibold mb-1">Guest</p>
                  <p className="font-semibold text-gray-900">{selectedBooking.touristName || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-semibold mb-1">Room</p>
                  <p className="font-semibold text-gray-900">{selectedBooking.roomNumber || 'N/A'}</p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 space-y-3 border border-gray-200">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Check-in to Check-out</span>
                  <span className="font-semibold text-gray-900">{selectedBooking.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Base Amount</span>
                  <span className="font-semibold text-gray-900">₱{(selectedBooking.amount || 0).toLocaleString()}</span>
                </div>
                {selectedBooking.extensionCharges > 0 && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Extension Charges</span>
                    <span className="font-semibold text-amber-600">+₱{selectedBooking.extensionCharges.toLocaleString()}</span>
                  </div>
                )}
                {selectedBooking.totalAdditionalCharges > 0 && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Additional Charges</span>
                    <span className="font-semibold text-red-600">+₱{selectedBooking.totalAdditionalCharges.toLocaleString()}</span>
                  </div>
                )}
                <div className="border-t border-gray-200 pt-3 flex justify-between">
                  <span className="text-sm font-semibold text-gray-900">Total Price</span>
                  <span className="text-lg font-bold text-gray-900">₱{(selectedBooking.totalPrice || selectedBooking.amount || 0).toLocaleString()}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 font-semibold mb-2">Status</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(selectedBooking.status)}`}>
                    {selectedBooking.status}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-semibold mb-2">Payment</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                    selectedBooking.paymentStatus === 'VERIFIED' ? 'bg-emerald-100 text-emerald-700'
                    : selectedBooking.paymentStatus === 'PAID' ? 'bg-green-100 text-green-700'
                    : selectedBooking.paymentStatus === 'REFUNDED' ? 'bg-gray-100 text-gray-600'
                    : 'bg-amber-100 text-amber-700'
                  }`}>
                    {selectedBooking.paymentStatus || 'UNPAID'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 font-semibold mb-1">Booked (createdAt)</p>
                  <p className="text-sm text-gray-900">{formatDateTs(selectedBooking.createdAt)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-semibold mb-1">Booking ID (audit)</p>
                  <p className="text-sm text-gray-900 font-mono break-all">{selectedBooking.id}</p>
                </div>
              </div>

              {selectedBooking.paymentStatus === 'PAID' && (
                <div className="border border-emerald-200 bg-emerald-50 rounded-xl p-4">
                  <p className="text-sm font-semibold text-emerald-900 mb-3">Payment Received — Verify</p>
                  <button
                    onClick={() => handleVerifyPayment(selectedBooking.id)}
                    className="w-full px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm transition-all flex items-center justify-center gap-2">
                    <UilCheckCircle size="16" />
                    Verify Payment
                  </button>
                </div>
              )}

              {selectedBooking.additionalCharges && selectedBooking.additionalCharges.length > 0 && (
                <div className="border border-gray-200 rounded-xl p-4">
                  <p className="text-sm font-semibold text-gray-900 mb-3">Charges Added</p>
                  <div className="space-y-2">
                    {selectedBooking.additionalCharges.map((charge: any, idx: number) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span className="text-gray-600">{charge.description}</span>
                        <span className="font-semibold text-gray-900">₱{charge.amount.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedBooking.status === 'pending' && (
                <div className={`rounded-xl p-4 space-y-3 border ${
                  selectedBooking.paymentStatus === 'VERIFIED' ? 'border-amber-200 bg-amber-50' : 'border-gray-200 bg-gray-50'
                }`}>
                  <p className="text-sm font-semibold text-amber-900">Confirm Booking</p>
                  {selectedBooking.paymentStatus === 'VERIFIED' ? (
                    <button 
                      onClick={() => handleConfirm(selectedBooking.id)}
                      className="w-full px-4 py-2.5 rounded-lg bg-green-600 hover:bg-green-700 text-white font-medium text-sm transition-all">
                      Confirm & Proceed
                    </button>
                  ) : (
                    <>
                      <p className="text-xs text-gray-600">Payment must be verified before this booking can be confirmed.</p>
                      {(selectedBooking.paymentStatus || 'UNPAID') === 'UNPAID' && (
                        <button 
                          onClick={() => handleMarkPaid(selectedBooking.id)}
                          className="w-full px-4 py-2.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-medium text-sm transition-all flex items-center justify-center gap-2">
                          <UilDollarSign size="16" />
                          Mark as Paid
                        </button>
                      )}
                      {selectedBooking.paymentStatus === 'PAID' && (
                        <p className="text-xs font-semibold text-amber-700">Payment received — use “Verify Payment” above to unlock confirming.</p>
                      )}
                    </>
                  )}
                </div>
              )}

              {(selectedBooking.status === 'confirmed' || selectedBooking.status === 'checked_in') && (
                <div className="border border-purple-200 bg-purple-50 rounded-xl p-4">
                  <p className="text-sm font-semibold text-purple-900 mb-3">Close this stay (keeps the record)</p>
                  <button 
                    onClick={() => handleCheckedOut(selectedBooking.id)}
                    className="w-full px-4 py-2.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-medium text-sm transition-all flex items-center justify-center gap-2">
                    <UilSignOutAlt size="16" />
                    Mark as Checked Out
                  </button>
                </div>
              )}

              {selectedBooking.status !== 'departed' && selectedBooking.status !== 'checked_out' && selectedBooking.serviceType === 'stay' && (
                <div className="border border-blue-200 bg-blue-50 rounded-xl p-4 space-y-3">
                  <p className="text-sm font-semibold text-blue-900">Extend Stay</p>
                  <div className="flex items-end gap-2">
                    <div className="flex-1">
                      <label className="text-xs text-gray-600 font-semibold mb-1 block">Days to Add</label>
                      <input 
                        type="number" 
                        min="1" 
                        value={extensionDays}
                        onChange={(e) => setExtensionDays(parseInt(e.target.value) || 1)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="text-sm font-semibold text-blue-900">
                      +₱{((roomTypes[0]?.basePrice || 3800) * extensionDays).toLocaleString()}
                    </div>
                  </div>
                  <button 
                    onClick={() => handleExtend(selectedBooking.id)}
                    className="w-full px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm transition-all">
                    Extend Stay
                  </button>
                </div>
              )}

              <div className="border border-red-200 bg-red-50 rounded-xl p-4 space-y-3">
                <p className="text-sm font-semibold text-red-900">Add Charge</p>
                <div className="space-y-2">
                  <input 
                    type="text"
                    placeholder="e.g., Late checkout fee, Damage charge"
                    value={chargeDescription}
                    onChange={(e) => setChargeDescription(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                  <input 
                    type="number"
                    placeholder="Amount (₱)"
                    value={additionalCharge}
                    onChange={(e) => setAdditionalCharge(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
                <button 
                  onClick={() => handleAddCharge(selectedBooking.id)}
                  className="w-full px-4 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium text-sm transition-all">
                  Add Charge
                </button>
              </div>

              <div className="border-t border-gray-200 pt-4 flex gap-3">
                <button 
                  onClick={() => setSelectedBooking(null)}
                  className="flex-1 px-4 py-2.5 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 font-medium text-sm transition-all">
                  Close
                </button>
                <button 
                  onClick={(e) => { handleDelete(selectedBooking.id, e as any); setSelectedBooking(null); }}
                  className="flex-1 px-4 py-2.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 font-medium text-sm transition-all flex items-center justify-center gap-2">
                  <UilTrashAlt size="16" />
                  Delete
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

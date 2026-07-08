import { useState, useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { 
  UilSearch as Search, 
  UilFilter as Filter, 
  UilDownloadAlt as Download, 
  UilEllipsisV as MoreVertical, 
  UilCheckCircle as CheckCircle2, 
  UilTimesCircle as XCircle, 
  UilClock as Clock,
  UilCalendar as Calendar,
  UilUser as User,
  UilEnvelopeAlt as Mail,
  UilArrowUpRight as ArrowUpRight,
  UilAngleRightB as ChevronRight,
  UilSignInAlt as LogIn,
  UilSignOutAlt as LogOut,
  UilInfoCircle as Eye,
  UilTimes as X
} from '@/icons';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  doc, 
  updateDoc,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../firebase';
import { useAuth } from '../../context/AuthContext';
import { getPilotConfig, type PilotConfig } from '../../lib/pilotService';
import { approveRefund, rejectRefund } from '../../lib/refundService';

export default function BookingsModule() {
  const { profile } = useAuth();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [pilotConfig, setPilotConfig] = useState<PilotConfig | null>(null);
  const [activeTab, setActiveTab] = useState<'bookings' | 'refunds' | 'events'>('bookings');
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);

  useEffect(() => {
    getPilotConfig().then(setPilotConfig);
  }, []);

  const effectiveBusinessId = useMemo(() => {
    if (pilotConfig?.enabled && pilotConfig.businessId) return pilotConfig.businessId;
    return profile?.businessId;
  }, [pilotConfig, profile?.businessId]);

  useEffect(() => {
    if (!effectiveBusinessId) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'bookings'),
      where('businessId', '==', effectiveBusinessId)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const bookingsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setBookings(bookingsData);
      setLoading(false);
    }, (error) => {
      setLoading(false);
      handleFirestoreError(error, OperationType.LIST, 'bookings');
    });

    return () => unsubscribe();
  }, [profile?.businessId]);

  const handleUpdateStatus = async (bookingId: string, newStatus: string) => {
    try {
      const bookingRef = doc(db, 'bookings', bookingId);
      const updates: any = { status: newStatus };
      if (newStatus === 'checked_in') updates.checkedInAt = serverTimestamp();
      if (newStatus === 'departed') updates.departedAt = serverTimestamp();
      await updateDoc(bookingRef, updates);
      toast.success(`Booking ${newStatus}`);
    } catch (error) {
      console.error("Error updating booking status:", error);
      toast.error('Failed to update status');
    }
  };

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = 
      (booking.touristName || booking.guestName)?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.serviceName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || booking.status?.toLowerCase() === filterStatus.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-island-emerald"></div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-3xl font-serif font-bold text-island-green mb-2 italic">Manage <span className="not-italic text-island-emerald">Bookings</span></h2>
          <p className="text-slate-500 font-light">View and manage your guest reservations in real-time.</p>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <div className="flex gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
            <button
              onClick={() => setActiveTab('bookings')}
              className={`px-6 py-2.5 rounded-xl text-[10px] font-bold tracking-wider transition-all ${
                activeTab === 'bookings' ? 'bg-white text-island-volcanic shadow-sm' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              All Bookings
            </button>
            <button
              onClick={() => setActiveTab('events')}
              className={`px-6 py-2.5 rounded-xl text-[10px] font-bold tracking-wider transition-all ${
                activeTab === 'events' ? 'bg-white text-island-volcanic shadow-sm' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              Event Inquiries
            </button>
            <button
              onClick={() => setActiveTab('refunds')}
              className={`px-6 py-2.5 rounded-xl text-[10px] font-bold tracking-wider transition-all ${
                activeTab === 'refunds' ? 'bg-white text-island-volcanic shadow-sm' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              Refund Requests
            </button>
          </div>
          <button
            onClick={() => {
              const headers = ['Guest Name', 'Email', 'Service', 'Type', 'Date', 'Amount', 'Status', 'Payment'];
              const rows = filteredBookings.map(b => [
                b.touristName || b.guestName || '',
                b.touristEmail || b.guestEmail || '',
                b.serviceName || '',
                b.serviceType || '',
                b.date || '',
                b.amount || 0,
                b.status || '',
                b.paymentStatus || '',
              ]);
              const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
              const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `bookings_export_${new Date().toISOString().slice(0, 10)}.csv`;
              a.click();
              URL.revokeObjectURL(url);
              toast.success('Bookings CSV exported');
            }}
            className="flex-1 md:flex-none px-6 py-3 bg-white border border-slate-100 rounded-2xl text-slate-600 hover:bg-slate-50 font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-2"
          >
            <Download size="18" /> Export CSV
          </button>
        </div>
      </div>

      {activeTab === 'events' ? (
        <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-10 border-b border-slate-50">
            <h3 className="text-lg font-bold text-island-green">Event Inquiries</h3>
            <p className="text-xs text-slate-400 mt-1">View and manage event venue booking inquiries.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left bg-slate-50/50">
                  <th className="px-10 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Guest</th>
                  <th className="px-10 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Venue</th>
                  <th className="px-10 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Event Type</th>
                  <th className="px-10 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pax</th>
                  <th className="px-10 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="px-10 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {bookings.filter(b => b.bookingCategory === 'event').length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-10 py-12 text-center text-slate-400 italic">
                      No event inquiries yet.
                    </td>
                  </tr>
                ) : (
                  bookings.filter(b => b.bookingCategory === 'event').map((booking) => (
                    <tr key={booking.id} className="group hover:bg-slate-50/50 transition-all">
                      <td className="px-10 py-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-island-ocean/10 flex items-center justify-center text-island-ocean font-bold">
                            {(booking.touristName || booking.guestName)?.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-island-green">{booking.touristName || booking.guestName}</p>
                            <p className="text-xs text-slate-400">{booking.touristEmail || booking.guestEmail}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-10 py-6">
                        <p className="text-sm font-bold text-island-green">{booking.eventVenueId || booking.serviceName}</p>
                      </td>
                      <td className="px-10 py-6">
                        <span className="text-xs font-semibold text-slate-600 capitalize">{booking.eventType || 'N/A'}</span>
                      </td>
                      <td className="px-10 py-6">
                        <span className="text-sm font-bold text-island-green">{booking.expectedPax || '-'}</span>
                      </td>
                      <td className="px-10 py-6">
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-2 w-fit ${
                          booking.status === 'confirmed' ? 'bg-island-emerald/10 text-island-emerald' : 
                          booking.status === 'cancelled' ? 'bg-island-coral/10 text-island-coral' : 
                          'bg-island-ocean/10 text-island-ocean'
                        }`}>
                          {booking.status === 'confirmed' ? <CheckCircle2 size="12" /> : 
                           booking.status === 'cancelled' ? <XCircle size="12" /> : 
                           <Clock size="12" />}
                          {booking.status}
                        </span>
                      </td>
                      <td className="px-10 py-6 text-right">
                        <div className="flex justify-end gap-2">
                          {booking.status === 'pending' && (
                            <>
                              <button 
                                onClick={() => handleUpdateStatus(booking.id, 'confirmed')}
                                className="p-2 text-island-emerald hover:bg-island-emerald/10 rounded-xl transition-all"
                                title="Confirm Event"
                              >
                                <CheckCircle2 size="20" />
                              </button>
                              <button 
                                onClick={() => handleUpdateStatus(booking.id, 'cancelled')}
                                className="p-2 text-island-coral hover:bg-island-coral/10 rounded-xl transition-all"
                                title="Decline Event"
                              >
                                <XCircle size="20" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : activeTab === 'refunds' ? (
        <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-10 border-b border-slate-50">
            <h3 className="text-lg font-bold text-island-green">Pending Refund Requests</h3>
            <p className="text-xs text-slate-400 mt-1">Review and process cancellation refund requests.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left bg-slate-50/50">
                  <th className="px-10 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Guest</th>
                  <th className="px-10 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Service</th>
                  <th className="px-10 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Amount</th>
                  <th className="px-10 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="px-10 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {bookings.filter(b => b.refundStatus === 'pending').length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-10 py-12 text-center text-slate-400 italic">
                      No pending refund requests.
                    </td>
                  </tr>
                ) : (
                  bookings.filter(b => b.refundStatus === 'pending').map((booking) => (
                    <tr key={booking.id} className="group hover:bg-slate-50/50 transition-all">
                      <td className="px-10 py-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-island-coral/10 flex items-center justify-center text-island-coral font-bold">
                            {(booking.touristName || booking.guestName)?.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-island-green">{booking.touristName || booking.guestName}</p>
                            <p className="text-xs text-slate-400">{booking.touristEmail || booking.guestEmail}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-10 py-6">
                        <p className="text-sm font-bold text-island-green">{booking.serviceName}</p>
                        <p className="text-xs text-slate-400 capitalize">{booking.serviceType}</p>
                      </td>
                      <td className="px-10 py-6">
                        <p className="text-sm font-bold text-island-green">₱{booking.amount?.toLocaleString()}</p>
                      </td>
                      <td className="px-10 py-6">
                        <span className="px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-2 w-fit bg-amber-50 text-amber-700 border border-amber-100">
                          <Clock size="12" />
                          Refund Pending
                        </span>
                      </td>
                      <td className="px-10 py-6 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => approveRefund(booking.id)}
                            className="p-2 text-island-emerald hover:bg-island-emerald/10 rounded-xl transition-all"
                            title="Approve Refund"
                          >
                            <CheckCircle2 size="20" />
                          </button>
                          <button
                            onClick={() => rejectRefund(booking.id)}
                            className="p-2 text-island-coral hover:bg-island-coral/10 rounded-xl transition-all"
                            title="Reject Refund"
                          >
                            <XCircle size="20" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-10 border-b border-slate-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="relative flex-1 w-full md:max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size="18" />
              <input 
                type="text" 
                placeholder="Search by guest or service..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-island-emerald/5 transition-all w-full"
              />
            </div>
            <div className="flex gap-4">
              <select 
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-6 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-slate-600 outline-none focus:ring-4 focus:ring-island-emerald/5 transition-all font-bold text-sm"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="checked_in">Checked In</option>
                <option value="cancelled">Cancelled</option>
                <option value="departed">Departed</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left bg-slate-50/50">
                  <th className="px-10 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Guest</th>
                  <th className="px-10 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Service</th>
                  <th className="px-10 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Date</th>
                  <th className="px-10 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Amount</th>
                  <th className="px-10 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="px-10 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredBookings.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-10 py-12 text-center text-slate-400 italic">
                      No bookings found matching your criteria.
                    </td>
                  </tr>
                ) : (
                  filteredBookings.map((booking) => (
                    <tr key={booking.id} className="group hover:bg-slate-50/50 transition-all">
                      <td className="px-10 py-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-island-emerald/10 flex items-center justify-center text-island-emerald font-bold">
                            {(booking.touristName || booking.guestName)?.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-island-green">{booking.touristName || booking.guestName}</p>
                            <p className="text-xs text-slate-400">{booking.touristEmail || booking.guestEmail}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-10 py-6">
                        <p className="text-sm font-bold text-island-green">{booking.serviceName}</p>
                        <p className="text-xs text-slate-400 capitalize">{booking.serviceType}</p>
                      </td>
                      <td className="px-10 py-6">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Calendar size="14" className="text-island-emerald" />
                          {booking.date}
                        </div>
                      </td>
                      <td className="px-10 py-6">
                        <p className="text-sm font-bold text-island-green">₱{booking.amount?.toLocaleString()}</p>
                      </td>
                      <td className="px-10 py-6">
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-2 w-fit ${
                          booking.status === 'confirmed' ? 'bg-island-emerald/10 text-island-emerald' : 
                          booking.status === 'cancelled' ? 'bg-island-coral/10 text-island-coral' : 
                          'bg-island-ocean/10 text-island-ocean'
                        }`}>
                          {booking.status === 'confirmed' ? <CheckCircle2 size="12" /> : 
                           booking.status === 'cancelled' ? <XCircle size="12" /> : 
                           <Clock size="12" />}
                          {booking.status}
                        </span>
                      </td>
                      <td className="px-10 py-6 text-right">
                        <div className="flex justify-end gap-2">
                          {booking.status === 'pending' && (
                            <>
                              <button 
                                onClick={() => handleUpdateStatus(booking.id, 'confirmed')}
                                className="p-2 text-island-emerald hover:bg-island-emerald/10 rounded-xl transition-all"
                                title="Confirm Booking"
                              >
                                <CheckCircle2 size="20" />
                              </button>
                              <button 
                                onClick={() => handleUpdateStatus(booking.id, 'cancelled')}
                                className="p-2 text-island-coral hover:bg-island-coral/10 rounded-xl transition-all"
                                title="Cancel Booking"
                              >
                                <XCircle size="20" />
                              </button>
                            </>
                          )}
                          {booking.status === 'confirmed' && (
                            <>
                              <button 
                                onClick={() => handleUpdateStatus(booking.id, 'checked_in')}
                                className="p-2 text-island-emerald hover:bg-island-emerald/10 rounded-xl transition-all"
                                title="Check In"
                              >
                                <LogIn size="20" />
                              </button>
                            </>
                          )}
                          {booking.status === 'checked_in' && (
                            <button 
                              onClick={() => handleUpdateStatus(booking.id, 'departed')}
                              className="p-2 text-island-ocean hover:bg-island-ocean/10 rounded-xl transition-all"
                              title="Mark Departed"
                            >
                              <LogOut size="20" />
                            </button>
                          )}
                          <button 
                            onClick={() => setSelectedBooking(booking)}
                            className="p-2 text-slate-400 hover:bg-slate-100 rounded-xl transition-all"
                            title="View Details"
                          >
                            <Eye size="20" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {/* Booking Detail Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-island-volcanic/60 backdrop-blur-sm" onClick={() => setSelectedBooking(null)} />
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative w-full max-w-lg bg-white rounded-[2.5rem] p-8 shadow-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-island-volcanic">Booking Details</h3>
              <button onClick={() => setSelectedBooking(null)} className="w-8 h-8 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 hover:text-island-coral transition-all">
                <X size="16" />
              </button>
            </div>

            <div className="space-y-5">
              <div className="flex items-center gap-4 p-5 bg-stone-50 rounded-2xl">
                <div className="w-12 h-12 rounded-full bg-island-emerald/10 flex items-center justify-center text-island-emerald font-bold text-lg">
                  {(selectedBooking.touristName || selectedBooking.guestName)?.charAt(0)}
                </div>
                <div>
                  <p className="text-lg font-bold text-island-volcanic">{selectedBooking.touristName || selectedBooking.guestName}</p>
                  <p className="text-xs text-slate-500">{selectedBooking.touristEmail || selectedBooking.guestEmail}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-island-emerald/5 rounded-2xl">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Service</p>
                  <p className="text-sm font-bold text-island-volcanic">{selectedBooking.serviceName}</p>
                  <p className="text-[10px] text-slate-400 capitalize">{selectedBooking.serviceType}</p>
                </div>
                <div className="p-4 bg-island-emerald/5 rounded-2xl">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Amount</p>
                  <p className="text-sm font-bold text-island-volcanic">₱{selectedBooking.amount?.toLocaleString()}</p>
                  <p className="text-[10px] text-slate-400">{selectedBooking.paymentStatus}</p>
                </div>
              </div>

              {selectedBooking.date && (
                <div className="p-4 bg-stone-50 rounded-2xl flex items-center gap-3">
                  <Calendar size="18" className="text-island-emerald" />
                  <div>
                    <p className="text-xs font-bold text-slate-500">Booking Dates</p>
                    <p className="text-sm font-bold text-island-volcanic">{selectedBooking.date}</p>
                  </div>
                </div>
              )}

              {selectedBooking.purposeOfVisit && (
                <div className="p-4 bg-stone-50 rounded-2xl flex items-center gap-3">
                  <User size="18" className="text-island-emerald" />
                  <div>
                    <p className="text-xs font-bold text-slate-500">Purpose of Visit</p>
                    <p className="text-sm font-bold text-island-volcanic capitalize">{selectedBooking.purposeOfVisit}</p>
                  </div>
                </div>
              )}

              {selectedBooking.addons && selectedBooking.addons.length > 0 && (
                <div className="p-4 bg-stone-50 rounded-2xl">
                  <p className="text-xs font-bold text-slate-500 mb-2">Add-ons</p>
                  <div className="space-y-1">
                    {selectedBooking.addons.map((a: any, i: number) => (
                      <div key={i} className="flex justify-between text-sm">
                        <span className="text-slate-700">{a.name}</span>
                        <span className="font-bold text-island-green">+₱{a.price?.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between p-4 bg-stone-50 rounded-2xl">
                <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-2 ${
                  selectedBooking.status === 'confirmed' ? 'bg-island-emerald/10 text-island-emerald' : 
                  selectedBooking.status === 'cancelled' ? 'bg-island-coral/10 text-island-coral' : 
                  'bg-island-ocean/10 text-island-ocean'
                }`}>
                  {selectedBooking.status === 'confirmed' ? <CheckCircle2 size="12" /> : 
                   selectedBooking.status === 'cancelled' ? <XCircle size="12" /> : 
                   <Clock size="12" />}
                  {selectedBooking.status}
                </span>
                <span className="text-xs text-slate-400 font-semibold">
                  ID: {selectedBooking.id?.slice(-8).toUpperCase()}
                </span>
              </div>

              <div className="flex gap-3">
                {selectedBooking.status === 'pending' && (
                  <>
                    <button onClick={() => { handleUpdateStatus(selectedBooking.id, 'confirmed'); setSelectedBooking(null); }}
                      className="flex-1 bg-island-emerald text-white py-4 rounded-2xl font-bold text-xs tracking-wider hover:bg-island-green transition-all flex items-center justify-center gap-2">
                      <CheckCircle2 size="18" /> Confirm
                    </button>
                    <button onClick={() => { handleUpdateStatus(selectedBooking.id, 'cancelled'); setSelectedBooking(null); }}
                      className="flex-1 bg-island-coral text-white py-4 rounded-2xl font-bold text-xs tracking-wider hover:bg-rose-700 transition-all flex items-center justify-center gap-2">
                      <XCircle size="18" /> Cancel
                    </button>
                  </>
                )}
                {selectedBooking.status === 'confirmed' && (
                  <button onClick={() => { handleUpdateStatus(selectedBooking.id, 'checked_in'); setSelectedBooking(null); }}
                    className="flex-1 bg-island-emerald text-white py-4 rounded-2xl font-bold text-xs tracking-wider hover:bg-island-green transition-all flex items-center justify-center gap-2">
                    <LogIn size="18" /> Check In
                  </button>
                )}
                {selectedBooking.status === 'checked_in' && (
                  <button onClick={() => { handleUpdateStatus(selectedBooking.id, 'departed'); setSelectedBooking(null); }}
                    className="flex-1 bg-island-ocean text-white py-4 rounded-2xl font-bold text-xs tracking-wider hover:bg-blue-700 transition-all flex items-center justify-center gap-2">
                    <LogOut size="18" /> Mark Departed
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}

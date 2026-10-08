import { useState, useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import { UilTimes, UilPlus } from '@/icons';
import { toast } from 'sonner';
import { db, handleFirestoreError, OperationType, Timestamp } from '../../firebase';
import { collection, addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import { DININGGASAN_BUSINESS_ID, DININGGASAN_ROOM_COUNT } from '../../data/dininggasanData';
import { stayRange, overlaps, pickFreeRoomNumber, writeOccupancy } from '../../lib/roomAssignment';

interface AddBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookings: any[];
  occupancy: any[];
}

export default function AddBookingModal({ isOpen, onClose, bookings, occupancy }: AddBookingModalProps) {
  const [step, setStep] = useState<'mode' | 'autoAssign' | 'manual'>('mode');
  const [guestName, setGuestName] = useState('');
  const [email, setEmail] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [selectedRoom, setSelectedRoom] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [roomTypes, setRoomTypes] = useState<any[]>([]);

  useEffect(() => {
    const loadRoomTypes = async () => {
      try {
        const snap = await getDoc(doc(db, 'businesses', DININGGASAN_BUSINESS_ID));
        if (snap.exists()) {
          setRoomTypes(snap.data().roomTypes || []);
        }
      } catch (e) {
        console.error('Failed to load room types', e);
      }
    };
    loadRoomTypes();
  }, []);

  const dayKey = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

  const getAvailableRooms = () => {
    if (!checkIn || !checkOut) return [];
    const rooms: { number: string; available: boolean }[] = [];
    for (let i = 1; i <= DININGGASAN_ROOM_COUNT; i++) {
      const roomNum = String(i).padStart(2, '0');
      const conflict = bookings.find(b => {
        if (b.roomNumber !== roomNum) return false;
        if (b.status === 'cancelled') return false;
        const range = stayRange(b);
        if (!range) return false;
        return overlaps(checkIn, checkOut, range.start, range.end);
      });
      rooms.push({ number: roomNum, available: !conflict });
    }
    return rooms;
  };

  const suggestedRoom = useMemo(() => {
    if (!checkIn || !checkOut) return null;
    return pickFreeRoomNumber(occupancy, checkIn, checkOut, DININGGASAN_ROOM_COUNT);
  }, [checkIn, checkOut, occupancy]);

  const availableRooms = getAvailableRooms();
  const roomPrice = roomTypes.length > 0 ? roomTypes[0].basePrice : 3800;
  const nights = checkIn && checkOut ? Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24)) : 0;
  const totalAmount = nights * roomPrice;

  const handleAutoAssign = async () => {
    if (!guestName || !email || !checkIn || !checkOut || !suggestedRoom) {
      toast.error('Please fill in all required fields');
      return;
    }
    if (new Date(checkIn) >= new Date(checkOut)) {
      toast.error('Check-out must be after check-in');
      return;
    }
    setLoading(true);
    try {
      const bookingData = {
        touristName: guestName,
        touristEmail: email,
        contactNumber,
        roomNumber: suggestedRoom,
        adults,
        children,
        date: `${checkIn} - ${checkOut}`,
        checkInTimestamp: Timestamp.fromDate(new Date(checkIn)),
        checkOutTimestamp: Timestamp.fromDate(new Date(checkOut)),
        amount: totalAmount,
        status: 'pending',
        paymentStatus: 'UNPAID',
        businessId: DININGGASAN_BUSINESS_ID,
        serviceType: 'stay',
        serviceName: 'Room Booking',
        createdAt: serverTimestamp(),
      };
      const bookingRef = await addDoc(collection(db, 'bookings'), bookingData);
      await writeOccupancy(bookingRef.id, {
        businessId: DININGGASAN_BUSINESS_ID,
        roomNumber: suggestedRoom,
        start: checkIn,
        end: checkOut,
        status: 'pending',
        touristUid: 'admin-created',
      });
      toast.success(`Booking created! Room ${suggestedRoom} assigned to ${guestName}.`);
      onClose();
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, 'bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleManualSelect = async () => {
    if (!guestName || !email || !checkIn || !checkOut || !selectedRoom) {
      toast.error('Please fill in all required fields and select a room');
      return;
    }
    if (new Date(checkIn) >= new Date(checkOut)) {
      toast.error('Check-out must be after check-in');
      return;
    }
    setLoading(true);
    try {
      const bookingData = {
        touristName: guestName,
        touristEmail: email,
        contactNumber,
        roomNumber: selectedRoom,
        adults,
        children,
        date: `${checkIn} - ${checkOut}`,
        checkInTimestamp: Timestamp.fromDate(new Date(checkIn)),
        checkOutTimestamp: Timestamp.fromDate(new Date(checkOut)),
        amount: totalAmount,
        status: 'pending',
        paymentStatus: 'UNPAID',
        businessId: DININGGASAN_BUSINESS_ID,
        serviceType: 'stay',
        serviceName: 'Room Booking',
        createdAt: serverTimestamp(),
      };
      const bookingRef = await addDoc(collection(db, 'bookings'), bookingData);
      await writeOccupancy(bookingRef.id, {
        businessId: DININGGASAN_BUSINESS_ID,
        roomNumber: selectedRoom,
        start: checkIn,
        end: checkOut,
        status: 'pending',
        touristUid: 'admin-created',
      });
      toast.success(`Booking created! Room ${selectedRoom} assigned to ${guestName}.`);
      onClose();
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, 'bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep('mode');
    setGuestName('');
    setEmail('');
    setContactNumber('');
    setCheckIn('');
    setCheckOut('');
    setAdults(1);
    setChildren(0);
    setSelectedRoom('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 text-lg">Create Manual Booking</h3>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
            <UilTimes size="20" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {step === 'mode' && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-gray-900">Select Booking Mode</h2>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setStep('autoAssign')}
                  className="p-6 border border-gray-200 rounded-xl hover:border-slate-700 hover:bg-slate-50 transition-all text-left"
                >
                  <div className="font-semibold text-gray-900 mb-2">Auto-Assign</div>
                  <div className="text-sm text-gray-600">We'll find the best available room for the dates</div>
                </button>
                <button
                  onClick={() => setStep('manual')}
                  className="p-6 border border-gray-200 rounded-xl hover:border-slate-700 hover:bg-slate-50 transition-all text-left"
                >
                  <div className="font-semibold text-gray-900 mb-2">Manual Select</div>
                  <div className="text-sm text-gray-600">Choose a specific room from available options</div>
                </button>
              </div>
            </div>
          )}

          {(step === 'autoAssign' || step === 'manual') && (
            <div className="space-y-4">
              <button
                onClick={() => setStep('mode')}
                className="text-sm text-slate-600 hover:text-slate-900 font-medium"
              >
                ← Back to Mode Selection
              </button>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-2">Guest Name *</label>
                    <input
                      type="text"
                      value={guestName}
                      onChange={e => setGuestName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-2">Email *</label>
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-2">Contact Number</label>
                  <input
                    type="tel"
                    value={contactNumber}
                    onChange={e => setContactNumber(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
                    placeholder="+63 9XX XXX XXXX"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-2">Check-in *</label>
                    <input
                      type="date"
                      value={checkIn}
                      onChange={e => setCheckIn(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-2">Check-out *</label>
                    <input
                      type="date"
                      value={checkOut}
                      onChange={e => setCheckOut(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-2">Adults</label>
                    <input
                      type="number"
                      value={adults}
                      onChange={e => setAdults(Math.max(1, Number(e.target.value)))}
                      min="1"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-2">Children</label>
                    <input
                      type="number"
                      value={children}
                      onChange={e => setChildren(Math.max(0, Number(e.target.value)))}
                      min="0"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
                    />
                  </div>
                </div>

                {step === 'autoAssign' && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-800">
                      <span className="font-semibold">Suggested Room:</span> {suggestedRoom ? `Room ${suggestedRoom}` : 'No rooms available for these dates'}
                    </p>
                  </div>
                )}

                {step === 'manual' && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-2">Select Room *</label>
                    <div className="grid grid-cols-6 gap-2 max-h-48 overflow-y-auto p-3 border border-gray-200 rounded-lg bg-gray-50">
                      {availableRooms.map(room => (
                        <button
                          key={room.number}
                          onClick={() => setSelectedRoom(room.number)}
                          disabled={!room.available}
                          className={`py-2 rounded-lg font-medium text-sm transition-all ${
                            selectedRoom === room.number
                              ? 'bg-slate-700 text-white'
                              : room.available
                              ? 'bg-white border border-gray-200 hover:border-slate-700 text-gray-900'
                              : 'bg-red-100 text-red-600 cursor-not-allowed opacity-50'
                          }`}
                        >
                          {room.number}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {nights > 0 && (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">{nights} night(s) × ₱{roomPrice.toLocaleString()}</span>
                      <span className="font-semibold text-gray-900">₱{totalAmount.toLocaleString()}</span>
                    </div>
                    <div className="border-t border-gray-200 pt-2 flex justify-between">
                      <span className="font-semibold text-gray-900">Total</span>
                      <span className="font-bold text-lg text-gray-900">₱{totalAmount.toLocaleString()}</span>
                    </div>
                  </div>
                )}

                <button
                  onClick={step === 'autoAssign' ? handleAutoAssign : handleManualSelect}
                  disabled={loading || (step === 'autoAssign' && !suggestedRoom) || (step === 'manual' && !selectedRoom)}
                  className="w-full px-6 py-3 bg-slate-700 hover:bg-slate-800 text-white rounded-lg font-medium text-sm flex items-center justify-center gap-2 disabled:opacity-50 transition-colors"
                >
                  <UilPlus size="16" /> {loading ? 'Creating...' : 'Create Booking'}
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

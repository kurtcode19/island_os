import { useState } from 'react';
import DatePicker from 'react-datepicker';
import { UilCalendar, UilUsersAlt, UilMinus, UilPlus } from '@/icons';
import 'react-datepicker/dist/react-datepicker.css';

interface DateGuestPickerProps {
  onDateChange: (date: string) => void;
  onGuestsChange: (guests: number) => void;
  defaultGuests?: number;
}

export default function DateGuestPicker({ onDateChange, onGuestsChange, defaultGuests = 1 }: DateGuestPickerProps) {
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [guests, setGuests] = useState(defaultGuests);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showGuestSelector, setShowGuestSelector] = useState(false);

  const handleDateChange = (date: Date | null) => {
    setStartDate(date);
    setShowDatePicker(false);
    if (date) {
      onDateChange(date.toISOString().split('T')[0]);
    }
  };

  const updateGuests = (delta: number) => {
    const next = Math.max(1, Math.min(20, guests + delta));
    setGuests(next);
    onGuestsChange(next);
  };

  return (
    <div className="flex gap-3">
      <div className="relative flex-1">
        <button
          onClick={() => setShowDatePicker(!showDatePicker)}
          className="w-full flex items-center gap-2 px-5 py-4 bg-white border-2 border-slate-100 rounded-2xl text-sm font-semibold text-slate-600 hover:border-island-emerald/30 transition-all"
        >
          <UilCalendar size="18" className="text-island-emerald" />
          {startDate ? startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Select date'}
        </button>
        {showDatePicker && (
          <div className="absolute top-full left-0 mt-2 z-50 shadow-2xl rounded-2xl overflow-hidden border border-slate-100" onClick={(e) => e.stopPropagation()}>
            <DatePicker
              selected={startDate}
              onChange={handleDateChange}
              inline
              minDate={new Date()}
              calendarClassName="!border-0 !font-sans"
            />
          </div>
        )}
      </div>

      <div className="relative">
        <button
          onClick={() => setShowGuestSelector(!showGuestSelector)}
          className="flex items-center gap-2 px-5 py-4 bg-white border-2 border-slate-100 rounded-2xl text-sm font-semibold text-slate-600 hover:border-island-emerald/30 transition-all"
        >
          <UilUsersAlt size="18" className="text-island-emerald" />
          {guests} {guests === 1 ? 'Guest' : 'Guests'}
        </button>
        {showGuestSelector && (
          <div className="absolute top-full right-0 mt-2 z-50 bg-white rounded-2xl shadow-2xl border border-slate-100 p-6 w-48"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-6">
              <button
                onClick={() => updateGuests(-1)}
                disabled={guests <= 1}
                className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-500 hover:bg-island-emerald/10 hover:text-island-emerald transition-all disabled:opacity-30"
              >
                <UilMinus size="18" />
              </button>
              <span className="text-2xl font-black text-island-volcanic">{guests}</span>
              <button
                onClick={() => updateGuests(1)}
                disabled={guests >= 20}
                className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-500 hover:bg-island-emerald/10 hover:text-island-emerald transition-all disabled:opacity-30"
              >
                <UilPlus size="18" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

import { useMemo } from 'react';

interface PriceCalculatorProps {
  basePrice: number;
  nights: number;
  addons: { id: string; name: string; price: number }[];
  taxRate?: number;
  serviceFee?: number;
}

export default function PriceCalculator({ basePrice, nights, addons, taxRate = 12, serviceFee = 0 }: PriceCalculatorProps) {
  const breakdown = useMemo(() => {
    const roomTotal = basePrice * nights;
    const addonsTotal = addons.reduce((sum, a) => sum + a.price, 0);
    const subtotal = roomTotal + addonsTotal;
    const tax = subtotal * (taxRate / 100);
    const total = subtotal + tax + serviceFee;
    return { roomTotal, addonsTotal, subtotal, tax, serviceFee, total };
  }, [basePrice, nights, addons, taxRate, serviceFee]);

  return (
    <div className="bg-island-green/5 rounded-2xl p-5 border border-island-green/10 space-y-3">
      <div className="flex justify-between text-sm text-slate-600">
        <span>₱{basePrice.toLocaleString()} x {nights} night{nights > 1 ? 's' : ''}</span>
        <span className="font-semibold">₱{breakdown.roomTotal.toLocaleString()}</span>
      </div>
      {breakdown.addonsTotal > 0 && (
        <div className="flex justify-between text-sm text-slate-600">
          <span>Add-ons</span>
          <span className="font-semibold">+ ₱{breakdown.addonsTotal.toLocaleString()}</span>
        </div>
      )}
      <div className="flex justify-between text-xs text-slate-400">
        <span>Subtotal</span>
        <span>₱{breakdown.subtotal.toLocaleString()}</span>
      </div>
      <div className="flex justify-between text-xs text-slate-400">
        <span>Tax ({taxRate}%)</span>
        <span>₱{breakdown.tax.toLocaleString()}</span>
      </div>
      {breakdown.serviceFee > 0 && (
        <div className="flex justify-between text-xs text-slate-400">
          <span>Service fee</span>
          <span>₱{breakdown.serviceFee.toLocaleString()}</span>
        </div>
      )}
      <div className="border-t border-island-green/10 pt-3 flex justify-between items-center">
        <span className="text-base font-bold text-island-green">Total</span>
        <span className="text-xl font-black text-island-green">₱{breakdown.total.toLocaleString()}</span>
      </div>
    </div>
  );
}

interface StripePaymentModalProps {
  bookingId: string;
  bookingName: string;
  amount: number;
  onClose: () => void;
  onSuccess: (bookingId: string) => void;
}

export default function StripePaymentModal(_props: StripePaymentModalProps) {
  return null;
}

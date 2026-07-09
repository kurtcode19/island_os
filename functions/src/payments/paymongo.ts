import { onRequest } from 'firebase-functions/v2/https';
import { defineSecret } from 'firebase-functions/params';
import { db, PAYMONGO_SECRET_KEY, PLATFORM_FEE, Timestamp } from '../config';

const paymongoSecret = defineSecret('PAYMONGO_SECRET_KEY');

async function getAuth() {
  const admin = await import('firebase-admin');
  return admin.auth();
}

async function paymongoApi(path: string, method: string = 'GET', body?: any) {
  const res = await fetch(`https://api.paymongo.com/v1${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${Buffer.from(PAYMONGO_SECRET_KEY + ':').toString('base64')}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const err: any = await res.json();
    throw new Error(err.errors?.[0]?.detail || 'PayMongo API error');
  }
  return res.json() as any;
}

export const createPaymongoPayment = onRequest(
  { secrets: [paymongoSecret], cors: true },
  async (req, res) => {
    if (req.method !== 'POST') {
      res.status(405).json({ error: 'Method not allowed' });
      return;
    }

    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const token = authHeader.split('Bearer ')[1];
    try {
      const authInstance = await getAuth();
      const decodedToken = await authInstance.verifyIdToken(token);
      const { bookingId } = req.body;
      if (!bookingId) {
        res.status(400).json({ error: 'bookingId required' });
        return;
      }

      const bookingRef = db.collection('bookings').doc(bookingId);
      const bookingSnap = await bookingRef.get();
      if (!bookingSnap.exists) {
        res.status(404).json({ error: 'Booking not found' });
        return;
      }

      const booking = bookingSnap.data()!;
      if (booking.touristUid !== decodedToken.uid) {
        res.status(403).json({ error: 'Forbidden' });
        return;
      }
      if (booking.paymentStatus === 'PAID') {
        res.status(400).json({ error: 'Booking already paid' });
        return;
      }

      const amount = booking.totalPrice || booking.amount || 0;
      if (amount <= 0) {
        res.status(400).json({ error: 'Invalid amount' });
        return;
      }

      const result = await paymongoApi('/checkout_sessions', 'POST', {
        data: {
          attributes: {
            billing: {
              name: booking.touristName || 'Tourist',
              email: booking.touristEmail || '',
            },
            line_items: [{
              name: booking.serviceName || 'Booking',
              amount: Math.round(amount * 100),
              currency: 'PHP',
              quantity: 1,
            }],
            payment_method_types: ['gcash', 'grab_pay', 'card', 'paymaya'],
            success_url: `${req.headers.origin || 'https://islandos.web.app'}/my-bookings?payment=success`,
            fail_url: `${req.headers.origin || 'https://islandos.web.app'}/my-bookings?payment=failed`,
            metadata: {
              bookingId,
              touristUid: decodedToken.uid,
            },
          },
        },
      });

      const sessionId = result.data.id;
      const checkoutUrl = result.data.attributes.checkout_url;

      await bookingRef.update({
        paymongoSessionId: sessionId,
        paymentMethod: 'paymongo',
      });

      res.json({ checkoutUrl, sessionId });
    } catch (error: any) {
      console.error('createPaymongoPayment error:', error);
      res.status(500).json({ error: error.message });
    }
  }
);

export const paymongoWebhook = onRequest(
  { secrets: [paymongoSecret], cors: false },
  async (req, res) => {
    try {
      const event = req.body;
      if (!event?.data?.attributes?.type) {
        res.status(400).json({ error: 'Invalid payload' });
        return;
      }

      const eventType = event.data.attributes.type;
      const resource = event.data.attributes.data;

      if (eventType === 'checkout_session.payment.paid') {
        const attrs = resource.attributes || resource;
        const metadata = attrs.metadata || {};
        const bookingId = metadata.bookingId;

        if (bookingId) {
          await db.collection('bookings').doc(bookingId).update({
            paymentStatus: 'PAID',
            status: 'confirmed',
            ticketCode: generateTicketCode(),
            confirmedAt: Timestamp.now(),
            paymongoPaymentId: attrs.payment_intent_id || attrs.id,
          });
          await db.collection('audit_logs').add({
            actorUid: metadata.touristUid || 'system',
            actorName: 'PayMongo Webhook',
            action: 'payment.confirmed',
            resource: 'bookings',
            resourceId: bookingId,
            details: `Payment confirmed via PayMongo`,
            timestamp: Timestamp.now(),
          });
        }
      }

      res.json({ received: true });
    } catch (error: any) {
      console.error('paymongoWebhook error:', error);
      res.status(500).send(`Webhook Error: ${error.message}`);
    }
  }
);

function generateTicketCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

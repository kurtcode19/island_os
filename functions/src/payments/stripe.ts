import { onRequest } from 'firebase-functions/v2/https';
import { defineSecret } from 'firebase-functions/params';
import Stripe from 'stripe';
import { db, STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, PLATFORM_FEE, Timestamp, FieldValue } from '../config';

const stripeSecret = defineSecret('STRIPE_SECRET_KEY');
const stripeWebhookSecret = defineSecret('STRIPE_WEBHOOK_SECRET');

function getStripe(): Stripe {
  return new Stripe(STRIPE_SECRET_KEY, { apiVersion: '2025-02-24.acacia' });
}

export const createPaymentIntent = onRequest(
  { secrets: [stripeSecret], cors: true },
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
      const decodedToken = await getAuth().verifyIdToken(token);
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

      const stripe = getStripe();
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100),
        currency: 'php',
        metadata: {
          bookingId,
          touristUid: decodedToken.uid,
          businessId: booking.businessId || '',
        },
        automatic_payment_methods: { enabled: true },
      });

      await bookingRef.update({
        paymentIntentId: paymentIntent.id,
        paymentMethod: 'stripe',
      });

      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error: any) {
      console.error('createPaymentIntent error:', error);
      res.status(500).json({ error: error.message });
    }
  }
);

function getAuth() {
  return require('firebase-admin').auth();
}

export const stripeWebhook = onRequest(
  { secrets: [stripeWebhookSecret], cors: false },
  async (req, res) => {
    const sig = req.headers['stripe-signature'] as string;
    if (!sig) {
      res.status(400).send('Missing stripe-signature');
      return;
    }

    const stripe = getStripe();
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(req.rawBody, sig, STRIPE_WEBHOOK_SECRET);
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      res.status(400).send(`Webhook Error: ${err.message}`);
      return;
    }

    try {
      switch (event.type) {
        case 'payment_intent.succeeded': {
          const pi = event.data.object as Stripe.PaymentIntent;
          const bookingId = pi.metadata.bookingId;
          if (bookingId) {
            await db.collection('bookings').doc(bookingId).update({
              paymentStatus: 'PAID',
              status: 'confirmed',
              ticketCode: generateTicketCode(),
              confirmedAt: Timestamp.now(),
              stripePaymentIntentId: pi.id,
            });
            await db.collection('audit_logs').add({
              actorUid: pi.metadata.touristUid || 'system',
              actorName: 'Stripe Webhook',
              action: 'payment.confirmed',
              resource: 'bookings',
              resourceId: bookingId,
              details: `Payment of ₱${(pi.amount / 100).toLocaleString()} confirmed via Stripe`,
              timestamp: Timestamp.now(),
            });
          }
          break;
        }
        case 'charge.refunded': {
          const charge = event.data.object as Stripe.Charge;
          const piId = charge.payment_intent as string;
          if (piId) {
            const snapshot = await db.collection('bookings')
              .where('stripePaymentIntentId', '==', piId)
              .limit(1)
              .get();
            if (!snapshot.empty) {
              const bookingDoc = snapshot.docs[0];
              await bookingDoc.ref.update({
                refundStatus: 'approved',
                paymentStatus: 'REFUNDED',
                refundedAt: Timestamp.now(),
              });
            }
          }
          break;
        }
        case 'payment_intent.payment_failed': {
          const failedPi = event.data.object as Stripe.PaymentIntent;
          console.error('Payment failed for:', failedPi.id, failedPi.last_payment_error);
          break;
        }
      }
      res.json({ received: true });
    } catch (error: any) {
      console.error('Webhook handler error:', error);
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

export const createStripeConnectAccountLink = onRequest(
  { secrets: [stripeSecret], cors: true },
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
      const decodedToken = await getAuth().verifyIdToken(token);
      const { businessId } = req.body;
      if (!businessId) {
        res.status(400).json({ error: 'businessId required' });
        return;
      }

      const businessDoc = await db.collection('businesses').doc(businessId).get();
      if (!businessDoc.exists) {
        res.status(404).json({ error: 'Business not found' });
        return;
      }
      const business = businessDoc.data()!;
      if (business.ownerUid !== decodedToken.uid) {
        res.status(403).json({ error: 'Forbidden' });
        return;
      }

      const stripe = getStripe();
      let accountId = business.stripeAccountId;

      if (!accountId) {
        const account = await stripe.accounts.create({
          type: 'express',
          country: 'PH',
          email: decodedToken.email || business.contact,
          business_type: 'individual',
          capabilities: {
            transfers: { requested: true },
          },
          business_profile: {
            name: business.name,
            url: `https://islandos.web.app/business/${businessId}`,
          },
        });
        accountId = account.id;
        await businessDoc.ref.update({ stripeAccountId: accountId });
      }

      const accountLink = await stripe.accountLinks.create({
        account: accountId,
        refresh_url: `${req.headers.origin || 'https://islandos.web.app'}/business/settings`,
        return_url: `${req.headers.origin || 'https://islandos.web.app'}/business/settings?onboarding=complete`,
        type: 'account_onboarding',
      });

      res.json({ url: accountLink.url, accountId });
    } catch (error: any) {
      console.error('createStripeConnectAccountLink error:', error);
      res.status(500).json({ error: error.message });
    }
  }
);

export const createStripeLoginLink = onRequest(
  { secrets: [stripeSecret], cors: true },
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
      const decodedToken = await getAuth().verifyIdToken(token);
      const { businessId } = req.body;
      if (!businessId) {
        res.status(400).json({ error: 'businessId required' });
        return;
      }
      const businessDoc = await db.collection('businesses').doc(businessId).get();
      if (!businessDoc.exists) {
        res.status(404).json({ error: 'Business not found' });
        return;
      }
      const business = businessDoc.data()!;
      if (business.ownerUid !== decodedToken.uid && decodedToken.role !== 'LGU') {
        res.status(403).json({ error: 'Forbidden' });
        return;
      }
      if (!business.stripeAccountId) {
        res.status(400).json({ error: 'No Stripe account linked' });
        return;
      }
      const stripe = getStripe();
      const loginLink = await stripe.accounts.createLoginLink(business.stripeAccountId);
      res.json({ url: loginLink.url });
    } catch (error: any) {
      console.error('createStripeLoginLink error:', error);
      res.status(500).json({ error: error.message });
    }
  }
);

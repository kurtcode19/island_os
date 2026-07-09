import { onRequest } from 'firebase-functions/v2/https';
import { defineSecret } from 'firebase-functions/params';
import { db, Timestamp } from '../config';
import Stripe from 'stripe';

const stripeSecret = defineSecret('STRIPE_SECRET_KEY');
const stripeWebhookSecret = defineSecret('STRIPE_WEBHOOK_SECRET');

function getStripe(): Stripe {
  return new Stripe(process.env.STRIPE_SECRET_KEY || '', { apiVersion: '2025-02-24.acacia' });
}

export const createSubscriptionCheckout = onRequest(
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
      const admin = await import('firebase-admin');
      const decodedToken = await admin.auth().verifyIdToken(token);
      const { priceId, businessId } = req.body;

      if (!priceId || !businessId) {
        res.status(400).json({ error: 'priceId and businessId required' });
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
      const session = await stripe.checkout.sessions.create({
        mode: 'subscription',
                payment_method_types: ['card'],
        line_items: [{ price: priceId, quantity: 1 }],
        client_reference_id: businessId,
        customer_email: decodedToken.email || business.contact,
        subscription_data: {
          metadata: { businessId },
        },
        success_url: `${req.headers.origin || 'https://islandos.web.app'}/business/settings?subscription=success`,
        cancel_url: `${req.headers.origin || 'https://islandos.web.app'}/business/settings?subscription=cancelled`,
      });

      res.json({ url: session.url, sessionId: session.id });
    } catch (error: any) {
      console.error('createSubscriptionCheckout error:', error);
      res.status(500).json({ error: error.message });
    }
  }
);

export const subscriptionWebhook = onRequest(
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
      event = stripe.webhooks.constructEvent(req.rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET || '');
    } catch (err: any) {
      res.status(400).send(`Webhook Error: ${err.message}`);
      return;
    }

    try {
      switch (event.type) {
        case 'checkout.session.completed': {
          const session = event.data.object as Stripe.Checkout.Session;
          const businessId = session.client_reference_id || session.metadata?.businessId;
          if (businessId && session.subscription) {
            const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
            await db.collection('businesses').doc(businessId).update({
              subscription: {
                tier: 'premium',
                stripeSubscriptionId: subscription.id,
                status: subscription.status === 'active' ? 'active' : 'inactive',
                currentPeriodEnd: Timestamp.fromDate(new Date(subscription.current_period_end * 1000)),
                currentPeriodStart: Timestamp.fromDate(new Date(subscription.current_period_start * 1000)),
              },
            });
          }
          break;
        }
        case 'customer.subscription.updated':
        case 'customer.subscription.deleted': {
          const subscription = event.data.object as Stripe.Subscription;
          const businessId = subscription.metadata.businessId;
          if (businessId) {
            const status = subscription.status === 'active' ? 'active'
              : subscription.status === 'past_due' ? 'past_due'
              : 'cancelled';
            await db.collection('businesses').doc(businessId).update({
              'subscription.status': status,
              'subscription.currentPeriodEnd': Timestamp.fromDate(new Date(subscription.current_period_end * 1000)),
              'subscription.currentPeriodStart': Timestamp.fromDate(new Date(subscription.current_period_start * 1000)),
            });
          }
          break;
        }
        case 'invoice.payment_failed': {
          const invoice = event.data.object as Stripe.Invoice;
          const businessId = (invoice as any).subscription_details?.metadata?.businessId
            || invoice.lines?.data?.[0]?.metadata?.businessId;
          if (businessId) {
            await db.collection('businesses').doc(businessId).update({
              'subscription.status': 'past_due',
            });
          }
          break;
        }
      }
      res.json({ received: true });
    } catch (error: any) {
      console.error('subscriptionWebhook error:', error);
      res.status(500).send(`Webhook Error: ${error.message}`);
    }
  }
);

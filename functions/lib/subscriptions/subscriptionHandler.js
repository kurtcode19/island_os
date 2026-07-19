"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.subscriptionWebhook = exports.createSubscriptionCheckout = void 0;
const https_1 = require("firebase-functions/v2/https");
const params_1 = require("firebase-functions/params");
const config_1 = require("../config");
const stripe_1 = __importDefault(require("stripe"));
const stripeSecret = (0, params_1.defineSecret)('STRIPE_SECRET_KEY');
const stripeWebhookSecret = (0, params_1.defineSecret)('STRIPE_WEBHOOK_SECRET');
function getStripe() {
    return new stripe_1.default(process.env.STRIPE_SECRET_KEY || '', { apiVersion: '2025-02-24.acacia' });
}
exports.createSubscriptionCheckout = (0, https_1.onRequest)({ secrets: [stripeSecret], cors: true }, async (req, res) => {
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
        const admin = await Promise.resolve().then(() => __importStar(require('firebase-admin')));
        const decodedToken = await admin.auth().verifyIdToken(token);
        const { priceId, businessId } = req.body;
        if (!priceId || !businessId) {
            res.status(400).json({ error: 'priceId and businessId required' });
            return;
        }
        const businessDoc = await config_1.db.collection('businesses').doc(businessId).get();
        if (!businessDoc.exists) {
            res.status(404).json({ error: 'Business not found' });
            return;
        }
        const business = businessDoc.data();
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
    }
    catch (error) {
        console.error('createSubscriptionCheckout error:', error);
        res.status(500).json({ error: error.message });
    }
});
exports.subscriptionWebhook = (0, https_1.onRequest)({ secrets: [stripeWebhookSecret], cors: false }, async (req, res) => {
    const sig = req.headers['stripe-signature'];
    if (!sig) {
        res.status(400).send('Missing stripe-signature');
        return;
    }
    const stripe = getStripe();
    let event;
    try {
        event = stripe.webhooks.constructEvent(req.rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET || '');
    }
    catch (err) {
        res.status(400).send(`Webhook Error: ${err.message}`);
        return;
    }
    try {
        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object;
                const businessId = session.client_reference_id || session.metadata?.businessId;
                if (businessId && session.subscription) {
                    const subscription = await stripe.subscriptions.retrieve(session.subscription);
                    await config_1.db.collection('businesses').doc(businessId).update({
                        subscription: {
                            tier: 'premium',
                            stripeSubscriptionId: subscription.id,
                            status: subscription.status === 'active' ? 'active' : 'inactive',
                            currentPeriodEnd: config_1.Timestamp.fromDate(new Date(subscription.current_period_end * 1000)),
                            currentPeriodStart: config_1.Timestamp.fromDate(new Date(subscription.current_period_start * 1000)),
                        },
                    });
                }
                break;
            }
            case 'customer.subscription.updated':
            case 'customer.subscription.deleted': {
                const subscription = event.data.object;
                const businessId = subscription.metadata.businessId;
                if (businessId) {
                    const status = subscription.status === 'active' ? 'active'
                        : subscription.status === 'past_due' ? 'past_due'
                            : 'cancelled';
                    await config_1.db.collection('businesses').doc(businessId).update({
                        'subscription.status': status,
                        'subscription.currentPeriodEnd': config_1.Timestamp.fromDate(new Date(subscription.current_period_end * 1000)),
                        'subscription.currentPeriodStart': config_1.Timestamp.fromDate(new Date(subscription.current_period_start * 1000)),
                    });
                }
                break;
            }
            case 'invoice.payment_failed': {
                const invoice = event.data.object;
                const businessId = invoice.subscription_details?.metadata?.businessId
                    || invoice.lines?.data?.[0]?.metadata?.businessId;
                if (businessId) {
                    await config_1.db.collection('businesses').doc(businessId).update({
                        'subscription.status': 'past_due',
                    });
                }
                break;
            }
        }
        res.json({ received: true });
    }
    catch (error) {
        console.error('subscriptionWebhook error:', error);
        res.status(500).send(`Webhook Error: ${error.message}`);
    }
});
//# sourceMappingURL=subscriptionHandler.js.map
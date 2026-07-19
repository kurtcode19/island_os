import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { UilUser as User, UilBell as Bell, UilShield as Shield, UilCreditCard as CreditCard, UilGlobe as Globe, UilSave as Save, UilCamera as Camera, UilAngleRightB as ChevronRight, UilBuilding as Building2, UilMapMarker as MapPin, UilPhone as Phone, UilEnvelopeAlt as Mail, UilTag as Tag, UilCheckCircle as CheckCircle2, UilTimes as X, UilExternalLinkAlt as ExternalLink, UilStar as Star, UilRefresh as RefreshCw } from '@/icons';
import { useAuth } from '../../context/AuthContext';
import { doc, getDoc, updateDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../firebase';
import { businesses as staticBusinesses } from '../../data/businesses';
import { BusinessType, BUSINESS_TYPE_CONFIGS } from '../../types';
import { toast } from 'sonner';
import { createStripeConnectAccountLink, createStripeLoginLink, createSubscriptionCheckout } from '../../lib/paymentUtils';

export default function SettingsModule() {
  const { profile } = useAuth();
  const [businessType, setBusinessType] = useState<BusinessType | null>(null);
  const [businessName, setBusinessName] = useState('');
  const [businessLocation, setBusinessLocation] = useState('');
  const [businessContact, setBusinessContact] = useState('');
  const [businessEmail, setBusinessEmail] = useState('');
  const [saving, setSaving] = useState(false);
  const [notifications, setNotifications] = useState({
    bookingAlerts: true,
    newReviews: true,
    checkInAlerts: true,
    weeklyDigest: false,
  });
  const [activeTab, setActiveTab] = useState('profile');
  const [stripeAccountId, setStripeAccountId] = useState<string | null>(null);
  const [subscriptionTier, setSubscriptionTier] = useState<'free' | 'premium'>('free');
  const [subscriptionStatus, setSubscriptionStatus] = useState<string>('active');
  const [commissionRate, setCommissionRate] = useState<number>(10);
  const [billingLoading, setBillingLoading] = useState<string | null>(null);
  const [discountPercent, setDiscountPercent] = useState(0);

  useEffect(() => {
    if (!profile?.businessId) return;
    const load = async () => {
      try {
        const bizDoc = await getDoc(doc(db, 'businesses', profile.businessId!));
        if (bizDoc.exists()) {
      const data = bizDoc.data();
      setBusinessType(data.businessType as BusinessType);
      setBusinessName(data.name || '');
      setBusinessLocation(data.address || '');
      setBusinessContact(data.contact || '');
      setBusinessEmail(data.email || profile?.email || '');
      if (data.notifications) setNotifications(data.notifications);
      setStripeAccountId(data.stripeAccountId || null);
      setCommissionRate(data.commissionRate ?? 10);
      setDiscountPercent(data.discountPercent ?? 0);
      if (data.subscription) {
        setSubscriptionTier(data.subscription.tier || 'free');
        setSubscriptionStatus(data.subscription.status || 'active');
      }
      return;
        }
      } catch {}
      const staticBiz = staticBusinesses.find(b => b.id === profile.businessId);
      if (staticBiz) {
        setBusinessType(staticBiz.businessType);
        setBusinessName(staticBiz.name);
        setBusinessLocation(staticBiz.location);
        setBusinessContact(staticBiz.contact);
        setBusinessEmail(profile?.email || '');
      }
    };
    load();
  }, [profile?.businessId]);

  const handleSave = async () => {
    if (!profile?.businessId) {
      toast.error('No business ID found');
      return;
    }
    setSaving(true);
    try {
      await updateDoc(doc(db, 'businesses', profile.businessId), {
        name: businessName,
        address: businessLocation,
        contact: businessContact,
        email: businessEmail,
        notifications,
        discountPercent,
        updatedAt: serverTimestamp(),
      });
      toast.success('Settings saved successfully');
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `businesses/${profile.businessId}`);
    } finally {
      setSaving(false);
    }
  };

  const config = businessType ? BUSINESS_TYPE_CONFIGS[businessType] : null;
  const initials = businessName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto space-y-12">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-island-volcanic tracking-tighter">{config?.label || 'Business'} <span className="text-island-emerald">Settings.</span></h2>
          <p className="text-slate-500 font-medium text-sm mt-1">Configure your {config?.label?.toLowerCase() || 'business'} profile and preferences</p>
        </div>
        <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-8 py-4 btn-primary rounded-2xl disabled:opacity-50">
          {saving ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
          ) : (
            <Save size="20" />
          )}
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
        <div className="space-y-4">
          {[
            { label: 'Profile', icon: User, id: 'profile' },
            { label: 'Notifications', icon: Bell, id: 'notifications' },
            { label: 'Security', icon: Shield, id: 'security' },
            { label: 'Billing', icon: CreditCard, id: 'billing' },
            { label: 'Integrations', icon: Globe, id: 'integrations' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between p-5 rounded-2xl transition-all font-black text-xs uppercase tracking-widest ${
                activeTab === item.id ? 'emerald-gradient text-white shadow-xl' : 'bg-white text-slate-400 hover:bg-emerald-50/50 border-2 border-slate-100'
              }`}
            >
              <div className="flex items-center gap-4">
                <item.icon size="20" />
                {item.label}
              </div>
              <ChevronRight size="16" className={activeTab === item.id ? 'opacity-100' : 'opacity-0'} />
            </button>
          ))}
        </div>

        <div className="md:col-span-2 space-y-10">
          {activeTab === 'profile' && (
            <>
              <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
                <h3 className="text-xl font-black text-island-volcanic tracking-tighter mb-8">Business Profile</h3>
                <div className="space-y-8">
                  <div className="flex items-center gap-8">
                    <div className="relative">
                      <div className="w-24 h-24 rounded-[2rem] bg-island-emerald/10 flex items-center justify-center text-island-emerald font-bold text-2xl border-4 border-white shadow-lg">
                        {initials}
                      </div>
                      <button className="absolute -bottom-2 -right-2 p-2.5 bg-island-emerald text-white rounded-xl shadow-md border-2 border-white hover:scale-110 transition-all">
                        <Camera size="16" />
                      </button>
                    </div>
                    <div>
                      <h4 className="text-lg font-black text-island-volcanic tracking-tighter">{businessName}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        {businessType && (
                          <span className="text-[10px] font-bold text-island-emerald bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                            {config?.label || businessType}
                          </span>
                        )}
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Since 2026</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                        <Building2 size="12" /> Business Name
                      </label>
                      <input type="text" value={businessName} onChange={e => setBusinessName(e.target.value)}
                        className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-island-emerald/5 transition-all font-bold text-island-green" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                        <Tag size="12" /> Business Type
                      </label>
                      <input type="text" value={config?.label || businessType || 'Business'} disabled
                        className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-island-green font-bold opacity-60 cursor-not-allowed" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                        <MapPin size="12" /> Location
                      </label>
                      <input type="text" value={businessLocation} onChange={e => setBusinessLocation(e.target.value)}
                        className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-island-emerald/5 transition-all font-bold text-island-green" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                        <Phone size="12" /> Contact
                      </label>
                      <input type="text" value={businessContact} onChange={e => setBusinessContact(e.target.value)}
                        className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-island-emerald/5 transition-all font-bold text-island-green" />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                        <Mail size="12" /> Contact Email
                      </label>
                      <input type="email" value={businessEmail} onChange={e => setBusinessEmail(e.target.value)}
                        className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-island-emerald/5 transition-all font-bold text-island-green" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
                <h3 className="text-xl font-black text-island-volcanic tracking-tighter mb-4">Dashboard Modules</h3>
                <p className="text-slate-500 font-medium text-sm mb-8">Active modules for your {config?.label?.toLowerCase() || 'business'} type</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {config?.modules.map(mod => (
                    <div key={mod} className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-island-emerald shadow-sm" />
                      <span className="text-xs font-bold text-island-green capitalize">{mod}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
                <h3 className="text-xl font-black text-island-volcanic tracking-tighter mb-8">Location Settings</h3>
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-6 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-white rounded-xl text-island-emerald shadow-sm">
                        <Globe size="20" />
                      </div>
                      <div>
                        <h4 className="font-bold text-island-green text-sm">Public Visibility</h4>
                        <p className="text-xs text-slate-400">Show your business on the island map.</p>
                      </div>
                    </div>
                    <div className="w-12 h-6 bg-island-emerald rounded-full relative cursor-pointer shadow-inner">
                      <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-md"></div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'notifications' && (
            <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
              <h3 className="text-xl font-black text-island-volcanic tracking-tighter mb-8">Notification Preferences</h3>
              <div className="space-y-6">
                {[
                  { key: 'bookingAlerts', label: 'Booking Alerts', desc: 'When a new booking is received' },
                  { key: 'newReviews', label: 'New Reviews', desc: 'When a guest submits a review' },
                  { key: 'checkInAlerts', label: 'Check-In Alerts', desc: 'When a guest checks in via QR' },
                  { key: 'weeklyDigest', label: 'Weekly Digest', desc: 'Weekly performance summary' },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between py-4">
                    <div>
                      <p className="text-sm font-bold text-island-volcanic">{item.label}</p>
                      <p className="text-xs text-slate-400 font-medium">{item.desc}</p>
                    </div>
                    <button
                      onClick={() => setNotifications(prev => ({ ...prev, [item.key]: !(prev as any)[item.key] }))}
                      className={`w-12 h-7 rounded-full relative cursor-pointer shadow-inner transition-colors ${
                        (notifications as any)[item.key] ? 'bg-island-emerald' : 'bg-slate-200'
                      }`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full absolute top-1 shadow-md transition-all ${
                        (notifications as any)[item.key] ? 'right-1' : 'left-1'
                      }`} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'billing' && (
            <div className="space-y-10">
              {/* Subscription Tier */}
              <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
                <h3 className="text-xl font-black text-island-volcanic tracking-tighter mb-6">Subscription Plan</h3>
                <div className={`p-8 rounded-3xl border-2 ${
                  subscriptionTier === 'premium'
                    ? 'bg-amber-50 border-amber-200'
                    : 'bg-stone-50 border-stone-200'
                }`}>
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        {subscriptionTier === 'premium' ? (
                          <Star size="24" className="text-amber-500" />
                        ) : (
                          <CreditCard size="24" className="text-slate-400" />
                        )}
                        <h4 className="text-2xl font-black text-island-volcanic tracking-tighter capitalize">
                          {subscriptionTier} Plan
                        </h4>
                      </div>
                      <p className="text-slate-500 text-sm font-medium">
                        {subscriptionTier === 'premium'
                          ? 'Lower commission rate, featured placement, and advanced analytics.'
                          : 'Standard commission rate with basic features.'}
                      </p>
                    </div>
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      subscriptionStatus === 'active'
                        ? 'bg-emerald-100 text-island-emerald'
                        : subscriptionStatus === 'past_due'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-slate-100 text-slate-500'
                    }`}>
                      {subscriptionStatus}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-6 mb-6">
                    <div className="p-5 bg-white rounded-2xl border border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Commission Rate</p>
                      <p className="text-2xl font-black text-island-volcanic">{commissionRate}%</p>
                    </div>
                    <div className="p-5 bg-white rounded-2xl border border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Payouts</p>
                      <p className="text-2xl font-black text-island-volcanic">{stripeAccountId ? 'Connected' : 'Not Setup'}</p>
                    </div>
                  </div>

                  {subscriptionTier === 'free' && (
                    <button
                      onClick={async () => {
                        if (!profile?.businessId) return;
                        setBillingLoading('subscription');
                        try {
                          const { url } = await createSubscriptionCheckout('price_premium_monthly', profile.businessId);
                          window.open(url, '_blank');
                        } catch (err: any) {
                          toast.error(err.message || 'Failed to create checkout');
                        } finally {
                          setBillingLoading(null);
                        }
                      }}
                      disabled={billingLoading === 'subscription'}
                      className="w-full bg-amber-500 text-white py-5 rounded-2xl font-bold text-sm hover:bg-amber-600 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                    >
                      {billingLoading === 'subscription' ? <RefreshCw size="20" className="animate-spin" /> : <Star size="20" />}
                      Upgrade to Premium
                    </button>
                  )}
                </div>
              </div>

              {/* Stripe Connect */}
              <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
                <h3 className="text-xl font-black text-island-volcanic tracking-tighter mb-6">Payout Settings</h3>
                <p className="text-slate-500 text-sm font-medium mb-8">
                  Connect your Stripe account to receive automated payouts from bookings.
                </p>

                <div className="p-8 rounded-3xl border-2 border-slate-100 bg-stone-50">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h4 className="text-lg font-bold text-island-volcanic mb-1">Stripe Connect</h4>
                      <p className="text-sm text-slate-500">
                        {stripeAccountId
                          ? 'Your Stripe account is connected. You can manage your payout details from the Stripe dashboard.'
                          : 'Link your bank account or GCash via Stripe to receive payouts.'}
                      </p>
                    </div>
                    {stripeAccountId && (
                      <span className="px-4 py-1.5 bg-emerald-100 text-island-emerald rounded-full text-[10px] font-bold uppercase tracking-wider">
                        Connected
                      </span>
                    )}
                  </div>

                  <div className="flex gap-4">
                    {!stripeAccountId ? (
                      <button
                        onClick={async () => {
                          if (!profile?.businessId) return;
                          setBillingLoading('connect');
                          try {
                            const { url } = await createStripeConnectAccountLink(profile.businessId);
                            window.open(url, '_blank');
                          } catch (err: any) {
                            toast.error(err.message || 'Failed to create Stripe account link');
                          } finally {
                            setBillingLoading(null);
                          }
                        }}
                        disabled={billingLoading === 'connect'}
                        className="flex-1 bg-island-emerald text-white py-5 rounded-2xl font-bold text-sm hover:bg-island-green active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                      >
                        {billingLoading === 'connect' ? <RefreshCw size="20" className="animate-spin" /> : <ExternalLink size="20" />}
                        Connect Stripe Account
                      </button>
                    ) : (
                      <button
                        onClick={async () => {
                          if (!profile?.businessId) return;
                          setBillingLoading('login');
                          try {
                            const { url } = await createStripeLoginLink(profile.businessId);
                            window.open(url, '_blank');
                          } catch (err: any) {
                            toast.error(err.message || 'Failed to open Stripe dashboard');
                          } finally {
                            setBillingLoading(null);
                          }
                        }}
                        disabled={billingLoading === 'login'}
                        className="flex-1 bg-island-emerald text-white py-5 rounded-2xl font-bold text-sm hover:bg-island-green active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                      >
                        {billingLoading === 'login' ? <RefreshCw size="20" className="animate-spin" /> : <ExternalLink size="20" />}
                        Open Stripe Dashboard
                      </button>
                    )}
                  </div>

                  <div className="mt-6 p-5 bg-white rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Commission Rate</p>
                    <p className="text-sm text-slate-600">
                      Your current commission rate is <strong className="text-island-volcanic">{commissionRate}%</strong>.
                      {subscriptionTier === 'premium'
                        ? ' Premium members enjoy a reduced rate.'
                        : ' Upgrade to Premium for a reduced rate.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Payout History */}
              <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
                <h3 className="text-xl font-black text-island-volcanic tracking-tighter mb-6">Payout History</h3>
                <p className="text-slate-500 text-sm font-medium mb-8">
                  Weekly payouts are processed every Monday. View your payout history below.
                </p>
                <div className="p-12 text-center bg-stone-50 rounded-3xl border border-slate-100">
                  <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                    <CreditCard size="24" className="text-slate-400" />
                  </div>
                  <h4 className="text-lg font-bold text-slate-400 mb-2">No Payouts Yet</h4>
                  <p className="text-sm text-slate-300">
                    Payouts will appear here once you have confirmed bookings with settled payments.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="bg-white p-16 rounded-[3rem] border border-slate-100 shadow-sm text-center">
              <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center mx-auto mb-6">
                <Shield size="24" className="text-slate-300" />
              </div>
              <h3 className="text-xl font-bold text-slate-400 mb-2 capitalize">Security Settings</h3>
              <p className="text-slate-300 text-sm">Coming soon in the next update.</p>
            </div>
          )}

          {activeTab === 'integrations' && (
            <div className="space-y-10">
              <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
                <h3 className="text-xl font-black text-island-volcanic tracking-tighter mb-6">Pass Discount</h3>
                <p className="text-slate-500 text-sm font-medium mb-8">
                  Offer a percentage discount to eSuroy Digital Pass holders. This discount will be visible on the Tourist Pass page.
                </p>
                <div className="flex items-center gap-4">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={discountPercent}
                    onChange={e => setDiscountPercent(Math.max(0, Math.min(100, parseInt(e.target.value) || 0)))}
                    className="w-24 p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-island-emerald/30 text-center text-xl font-black text-island-volcanic"
                  />
                  <span className="text-2xl font-black text-slate-300">%</span>
                  <span className="text-sm text-slate-500 font-medium">
                    {discountPercent > 0
                      ? `Pass holders save ${discountPercent}% at your business`
                      : 'No discount currently offered'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

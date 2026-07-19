import { useState } from 'react';
import { motion } from 'motion/react';
import { UilGlobe, UilSave } from '@/icons';
import { updateUserNationality } from '@/lib/profileService';
import { doc, updateDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../firebase';
import { toast } from 'sonner';

const COUNTRIES = [
  'Afghanistan', 'Albania', 'Algeria', 'Andorra', 'Angola', 'Antigua and Barbuda', 'Argentina', 'Armenia', 'Australia', 'Austria', 'Azerbaijan',
  'Bahamas', 'Bahrain', 'Bangladesh', 'Barbados', 'Belarus', 'Belgium', 'Belize', 'Benin', 'Bhutan', 'Bolivia', 'Bosnia and Herzegovina', 'Botswana', 'Brazil', 'Brunei', 'Bulgaria', 'Burkina Faso', 'Burundi',
  'Cabo Verde', 'Cambodia', 'Cameroon', 'Canada', 'Central African Republic', 'Chad', 'Chile', 'China', 'Colombia', 'Comoros', 'Congo', 'Costa Rica', "Côte d'Ivoire", 'Croatia', 'Cuba', 'Cyprus', 'Czech Republic',
  'Denmark', 'Djibouti', 'Dominica', 'Dominican Republic', 'DR Congo', 'Ecuador', 'Egypt', 'El Salvador', 'Equatorial Guinea', 'Eritrea', 'Estonia', 'Eswatini', 'Ethiopia',
  'Fiji', 'Finland', 'France',
  'Gabon', 'Gambia', 'Georgia', 'Germany', 'Ghana', 'Greece', 'Grenada', 'Guatemala', 'Guinea', 'Guinea-Bissau', 'Guyana',
  'Haiti', 'Honduras', 'Hungary',
  'Iceland', 'India', 'Indonesia', 'Iran', 'Iraq', 'Ireland', 'Israel', 'Italy',
  'Jamaica', 'Japan', 'Jordan',
  'Kazakhstan', 'Kenya', 'Kiribati', 'Kuwait', 'Kyrgyzstan',
  'Laos', 'Latvia', 'Lebanon', 'Lesotho', 'Liberia', 'Libya', 'Liechtenstein', 'Lithuania', 'Luxembourg',
  'Madagascar', 'Malawi', 'Malaysia', 'Maldives', 'Mali', 'Malta', 'Marshall Islands', 'Mauritania', 'Mauritius', 'Mexico', 'Micronesia', 'Moldova', 'Monaco', 'Mongolia', 'Montenegro', 'Morocco', 'Mozambique', 'Myanmar',
  'Namibia', 'Nauru', 'Nepal', 'Netherlands', 'New Zealand', 'Nicaragua', 'Niger', 'Nigeria', 'North Korea', 'North Macedonia', 'Norway',
  'Oman',
  'Pakistan', 'Palau', 'Palestine', 'Panama', 'Papua New Guinea', 'Paraguay', 'Peru', 'Philippines', 'Poland', 'Portugal',
  'Qatar',
  'Romania', 'Russia', 'Rwanda',
  'Saint Kitts and Nevis', 'Saint Lucia', 'Saint Vincent and the Grenadines', 'Samoa', 'San Marino', 'Sao Tome and Principe', 'Saudi Arabia', 'Senegal', 'Serbia', 'Seychelles', 'Sierra Leone', 'Singapore', 'Slovakia', 'Slovenia', 'Solomon Islands', 'Somalia', 'South Africa', 'South Korea', 'South Sudan', 'Spain', 'Sri Lanka', 'Sudan', 'Suriname', 'Sweden', 'Switzerland', 'Syria',
  'Taiwan', 'Tajikistan', 'Tanzania', 'Thailand', 'Timor-Leste', 'Togo', 'Tonga', 'Trinidad and Tobago', 'Tunisia', 'Turkey', 'Turkmenistan', 'Tuvalu',
  'Uganda', 'Ukraine', 'United Arab Emirates', 'United Kingdom', 'United States', 'Uruguay', 'Uzbekistan',
  'Vanuatu', 'Vatican City', 'Venezuela', 'Vietnam',
  'Yemen',
  'Zambia', 'Zimbabwe',
];

interface OnboardingModalProps {
  uid: string;
}

export default function OnboardingModal({ uid }: OnboardingModalProps) {
  const [nationality, setNationality] = useState('');
  const [consent, setConsent] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!nationality || !consent) return;
    setSaving(true);
    try {
      await updateUserNationality(uid, nationality);
      await updateDoc(doc(db, 'users', uid), {
        privacyConsent: true,
        privacyConsentAt: new Date().toISOString(),
      });
      toast.success('Welcome aboard!');
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${uid}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-island-volcanic">
      <motion.div
        initial={{ y: '100%', opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', damping: 30, stiffness: 200 }}
        className="w-full max-w-md mx-6"
      >
        <div className="bg-white rounded-[3rem] p-10 shadow-2xl border border-emerald-50">
          <div className="w-16 h-16 rounded-2xl forest-gradient flex items-center justify-center text-white shadow-2xl mx-auto mb-6">
            <UilGlobe size="32" />
          </div>

          <h2 className="text-3xl font-black text-island-volcanic tracking-tighter text-center mb-2">
            Welcome to <span className="text-island-emerald">eSuroy</span>
          </h2>
          <p className="text-sm text-slate-500 font-medium text-center mb-8">
            Tell us where you're from so we can personalize your experience.
          </p>

          <div className="space-y-1.5 mb-8">
            <label className="text-xs font-bold text-slate-500 block">Your Nationality</label>
            <input
              list="countries"
              value={nationality}
              onChange={(e) => setNationality(e.target.value)}
              placeholder="Select or type your country..."
              className="w-full px-5 py-4 bg-stone-50 border-2 border-stone-100 rounded-2xl outline-none focus:ring-4 focus:ring-island-emerald/5 focus:border-island-emerald/30 transition-all text-sm font-semibold text-slate-800"
            />
            <datalist id="countries">
              {COUNTRIES.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </div>

          <label className="flex items-start gap-3 mb-6 cursor-pointer">
            <input
              type="checkbox"
              checked={consent}
              onChange={e => setConsent(e.target.checked)}
              className="mt-1 w-4 h-4 shrink-0 rounded border-2 border-slate-300 text-island-emerald focus:ring-island-emerald/30"
            />
            <span className="text-xs text-slate-500 font-medium leading-relaxed">
              I agree to the processing of my personal data in accordance with the Data Privacy Act and eSuroy's Privacy Policy. I consent to the collection and use of my information for booking and travel purposes.
            </span>
          </label>

          <button
            onClick={handleSave}
            disabled={!nationality || !consent || saving}
            className="w-full bg-island-green text-white py-5 rounded-2xl font-bold text-sm shadow-xl shadow-island-green/20 hover:shadow-island-green/40 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <UilSave size="20" />
            {saving ? 'Saving...' : 'Save & Continue'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

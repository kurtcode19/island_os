import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../firebase';

export default function LguSettingsModule() {
  const [municipal, setMunicipal] = useState('Dininggasan');
  const [province, setProvince] = useState('Camiguin');
  const [notifications, setNotifications] = useState({
    bookingAlerts: true, safetyIncidents: true, portUpdates: true, weeklyReports: false,
  });
  const [compactMode, setCompactMode] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getDoc(doc(db, 'system', 'lgu_settings')).then(snap => {
      if (snap.exists()) {
        const d = snap.data();
        setMunicipal(d.municipal || 'Dininggasan');
        setProvince(d.province || 'Camiguin');
        if (d.notifications) setNotifications(d.notifications);
        setCompactMode(!!d.compactMode);
      }
    }).catch(() => {});
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, 'system', 'lgu_settings'), {
        municipal, province, notifications, compactMode, updatedAt: serverTimestamp(),
      }, { merge: true });
      toast.success('Settings saved successfully');
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, 'system/lgu_settings');
    } finally { setSaving(false); }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-3xl mx-auto space-y-10"
    >
      <div>
        <h2 className="text-2xl font-semibold text-black tracking-tight">Settings</h2>
        <p className="text-gray-400 text-sm">Manage municipal dashboard preferences.</p>
      </div>

      <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm space-y-6">
        <h3 className="text-lg font-semibold text-black tracking-tight">Profile</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] font-medium text-gray-400 uppercase tracking-wider block mb-2">Municipal</label>
            <input value={municipal} onChange={e => setMunicipal(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-100 text-sm font-medium text-black outline-none focus:ring-2 focus:ring-gray-200" />
          </div>
          <div>
            <label className="text-[10px] font-medium text-gray-400 uppercase tracking-wider block mb-2">Province</label>
            <input value={province} onChange={e => setProvince(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-100 text-sm font-medium text-black outline-none focus:ring-2 focus:ring-gray-200" />
          </div>
        </div>
      </div>

      <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm space-y-6">
        <h3 className="text-lg font-semibold text-black tracking-tight">Notifications</h3>
        <div className="space-y-4">
          {[
            { key: 'bookingAlerts', label: 'Booking Alerts', desc: 'New bookings and cancellations' },
            { key: 'safetyIncidents', label: 'Safety Incidents', desc: 'Emergency reports and health alerts' },
            { key: 'portUpdates', label: 'Port Updates', desc: 'Vessel arrivals and departures' },
            { key: 'weeklyReports', label: 'Weekly Reports', desc: 'Automated visitor statistics digest' },
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between py-3">
              <div>
                <p className="text-sm font-medium text-black">{item.label}</p>
                <p className="text-xs text-gray-400">{item.desc}</p>
              </div>
              <button
                onClick={() => setNotifications(prev => ({ ...prev, [item.key]: !prev[item.key as keyof typeof prev] }))}
                className={`w-11 h-6 rounded-full relative transition-colors ${notifications[item.key as keyof typeof notifications] ? 'bg-black' : 'bg-gray-200'}`}
              >
                <span className={`w-4 h-4 bg-white rounded-full absolute top-1 shadow-sm transition-all ${notifications[item.key as keyof typeof notifications] ? 'right-1' : 'left-1'}`} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm space-y-6">
        <h3 className="text-lg font-semibold text-black tracking-tight">Display</h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-black">Compact Mode</p>
            <p className="text-xs text-gray-400">Show more data in less space</p>
          </div>
          <button
            onClick={() => setCompactMode(v => !v)}
            className={`w-11 h-6 rounded-full relative transition-colors ${compactMode ? 'bg-black' : 'bg-gray-200'}`}
          >
            <span className={`w-4 h-4 bg-white rounded-full absolute top-1 shadow-sm transition-all ${compactMode ? 'right-1' : 'left-1'}`} />
          </button>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={save}
          disabled={saving}
          className="px-6 py-3 bg-black text-white rounded-xl font-medium text-sm hover:bg-gray-800 transition-all active:scale-95 disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </motion.div>
  );
}

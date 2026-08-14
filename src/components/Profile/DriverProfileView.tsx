import React, { useState } from 'react';
import {
  User,
  Truck,
  Bell,
  ShieldCheck,
  Phone,
  Mail,
  Award,
  Wrench,
  Fuel,
  Save,
  CheckCircle2,
  Clock,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  LogOut
} from 'lucide-react';
import { DriverProfile } from '../../types';

interface DriverProfileViewProps {
  driverProfile: DriverProfile;
  setDriverProfile: React.Dispatch<React.SetStateAction<DriverProfile>>;
  onLogout?: () => void;
}

export const DriverProfileView: React.FC<DriverProfileViewProps> = ({
  driverProfile,
  setDriverProfile,
  onLogout,
}) => {
  const [formData, setFormData] = useState({
    name: driverProfile.name,
    email: driverProfile.email,
    phone: driverProfile.phone,
    cdlNumber: driverProfile.cdlNumber,
    cdlState: driverProfile.cdlState,
    cdlExpiration: driverProfile.cdlExpiration,
  });

  const [truckData, setTruckData] = useState({
    unitNumber: driverProfile.assignedTruck.unitNumber,
    model: driverProfile.assignedTruck.model,
    truckType: driverProfile.assignedTruck.truckType,
    plateNumber: driverProfile.assignedTruck.plateNumber,
  });

  const [savedNotificationBanner, setSavedNotificationBanner] = useState(false);

  const handlePersonalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setDriverProfile((prev) => ({
      ...prev,
      ...formData,
      assignedTruck: {
        ...prev.assignedTruck,
        ...truckData,
      },
    }));
    setSavedNotificationBanner(true);
    setTimeout(() => setSavedNotificationBanner(false), 3000);
  };

  const toggleNotification = (key: keyof DriverProfile['notifications']) => {
    setDriverProfile((prev) => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: !prev.notifications[key],
      },
    }));
    setSavedNotificationBanner(true);
    setTimeout(() => setSavedNotificationBanner(false), 3000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 text-slate-800">
      
      {/* Header Banner */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-indigo-500 via-teal-500 to-amber-500" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-1">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-2xl bg-indigo-100 text-indigo-900 flex items-center justify-center font-black text-xl border border-indigo-200 shadow-sm">
              {driverProfile.name.split(' ').map((n) => n[0]).join('')}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl font-black text-slate-900">{driverProfile.name}</h1>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300">
                  VERIFIED DRIVER
                </span>
              </div>
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                Driver ID: {driverProfile.id} • CDL: {driverProfile.cdlNumber} ({driverProfile.cdlState})
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-4 bg-slate-50 px-4 py-3 rounded-2xl border border-slate-200/80 text-xs">
              <div className="text-center border-r border-slate-200 pr-4">
                <span className="block text-[10px] text-slate-500 font-semibold uppercase">Overall Rating</span>
                <span className="font-bold text-amber-600 text-sm">⭐ {driverProfile.overallRating} / 5.0</span>
              </div>
              <div className="text-center">
                <span className="block text-[10px] text-slate-500 font-semibold uppercase">Total Haul Miles</span>
                <span className="font-bold text-slate-900 text-sm">{driverProfile.totalMilesDriven.toLocaleString()} mi</span>
              </div>
            </div>

            {onLogout && (
              <button
                type="button"
                onClick={onLogout}
                className="flex items-center space-x-1.5 px-3.5 py-3 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 text-xs font-bold transition-all shadow-sm active:scale-95 shrink-0"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4 text-rose-600" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {savedNotificationBanner && (
        <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-2xl text-emerald-900 text-xs font-bold flex items-center space-x-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-700" />
          <span>Account settings and notification preferences successfully saved!</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Account Settings Form */}
        <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-6">
          
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <User className="w-5 h-5 text-indigo-600" />
              Personal Account Settings
            </h2>
            <p className="text-xs text-slate-500">Update contact info, CDL credential information, and truck specs.</p>
          </div>

          <form onSubmit={handlePersonalSubmit} className="space-y-4 text-xs">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-600 font-bold uppercase mb-1 text-[11px]">Driver Full Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-bold uppercase mb-1 text-[11px]">Phone Number *</label>
                <input
                  type="text"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-600 font-bold uppercase mb-1 text-[11px]">Email Address *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-bold uppercase mb-1 text-[11px]">CDL Expiration Date *</label>
                <input
                  type="date"
                  required
                  value={formData.cdlExpiration}
                  onChange={(e) => setFormData({ ...formData, cdlExpiration: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 space-y-4">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <Truck className="w-4 h-4 text-indigo-600" /> Assigned Vehicle & Trailer Specifications
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-600 font-bold uppercase mb-1 text-[11px]">Truck Unit Number</label>
                  <input
                    type="text"
                    value={truckData.unitNumber}
                    onChange={(e) => setTruckData({ ...truckData, unitNumber: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-bold uppercase mb-1 text-[11px]">Truck Model</label>
                  <input
                    type="text"
                    value={truckData.model}
                    onChange={(e) => setTruckData({ ...truckData, model: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-bold uppercase mb-1 text-[11px]">Trailer Type</label>
                <input
                  type="text"
                  value={truckData.truckType}
                  onChange={(e) => setTruckData({ ...truckData, truckType: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="flex items-center space-x-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl transition-all shadow-sm active:scale-95"
              >
                <Save className="w-4 h-4" />
                <span>Save Profile Changes</span>
              </button>
            </div>

          </form>

        </div>

        {/* Notifications & Vehicle Health Column */}
        <div className="space-y-6">
          
          {/* Notification Preferences Toggle Panel */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Bell className="w-5 h-5 text-indigo-600" />
              Notification Settings
            </h2>
            <p className="text-xs text-slate-500">Manage real-time dispatch alerts, route warnings, and issue notifications.</p>

            <div className="space-y-3 pt-2 text-xs">
              
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
                <div>
                  <p className="font-bold text-slate-900">SMS Delay & Issue Alerts</p>
                  <p className="text-[10px] text-slate-500">Receive SMS when dispatch updates ETA</p>
                </div>
                <button
                  type="button"
                  onClick={() => toggleNotification('smsIssueAlerts')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    driverProfile.notifications.smsIssueAlerts
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {driverProfile.notifications.smsIssueAlerts ? 'ON' : 'OFF'}
                </button>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
                <div>
                  <p className="font-bold text-slate-900">New Dispatch Offers</p>
                  <p className="text-[10px] text-slate-500">Push notifications for available loads</p>
                </div>
                <button
                  type="button"
                  onClick={() => toggleNotification('pushDispatchOffers')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    driverProfile.notifications.pushDispatchOffers
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {driverProfile.notifications.pushDispatchOffers ? 'ON' : 'OFF'}
                </button>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
                <div>
                  <p className="font-bold text-slate-900">Route Traffic & Weather</p>
                  <p className="text-[10px] text-slate-500">Live congestion alerts on route</p>
                </div>
                <button
                  type="button"
                  onClick={() => toggleNotification('routeTrafficUpdates')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    driverProfile.notifications.routeTrafficUpdates
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {driverProfile.notifications.routeTrafficUpdates ? 'ON' : 'OFF'}
                </button>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
                <div>
                  <p className="font-bold text-slate-900">HOS Shift Hour Reminders</p>
                  <p className="text-[10px] text-slate-500">Alerts when driving hours limit nears</p>
                </div>
                <button
                  type="button"
                  onClick={() => toggleNotification('shiftHourReminders')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    driverProfile.notifications.shiftHourReminders
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {driverProfile.notifications.shiftHourReminders ? 'ON' : 'OFF'}
                </button>
              </div>

            </div>
          </div>

          {/* Vehicle Telemetry Snapshot */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-3 text-xs">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <Fuel className="w-4 h-4 text-emerald-600" />
              Truck Telemetry & Health Snapshot
            </h3>

            <div className="space-y-2 pt-2">
              <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <span className="text-slate-600 font-medium">Diesel Fuel Level</span>
                <span className="font-bold text-emerald-700 font-mono">{driverProfile.assignedTruck.fuelLevelPercent}%</span>
              </div>
              <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <span className="text-slate-600 font-medium">DEF Fluid Level</span>
                <span className="font-bold text-indigo-700 font-mono">{driverProfile.assignedTruck.defLevelPercent}%</span>
              </div>
              <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <span className="text-slate-600 font-medium">Next Scheduled Maintenance</span>
                <span className="font-bold text-amber-700 font-mono">In {driverProfile.assignedTruck.nextServiceDueMiles} Miles</span>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

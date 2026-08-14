import React, { useState } from 'react';
import {
  Truck,
  MapPin,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Navigation,
  ShieldCheck,
  User,
  Phone,
  Thermometer,
  Weight,
  PlusCircle,
  TrendingUp,
  Check,
  ArrowRight,
  Info,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { Shipment, ShipmentStatus, TimelineEvent } from '../../types';

interface ActiveShipmentViewProps {
  shipment: Shipment | null;
  onUpdateStatus: (newStatus: ShipmentStatus, reason?: string) => void;
  onOpenIssueModal: () => void;
  onAddNote: (noteText: string) => void;
  onResolveIssue: (issueId: string, resolutionNotes: string) => void;
}

const STATUS_PROGRESSION: { status: ShipmentStatus; label: string; icon: string }[] = [
  { status: 'ARRIVED_PICKUP', label: '1. Arrived Pickup', icon: 'MapPin' },
  { status: 'LOADING', label: '2. Loading Freight', icon: 'Weight' },
  { status: 'IN_TRANSIT', label: '3. En Route / Driving', icon: 'Truck' },
  { status: 'ARRIVED_DELIVERY', label: '4. Arrived Delivery', icon: 'Navigation' },
  { status: 'UNLOADING', label: '5. Unloading Cargo', icon: 'Clock' },
  { status: 'DELIVERED', label: '6. Completed & Signed', icon: 'CheckCircle2' },
];

export const ActiveShipmentView: React.FC<ActiveShipmentViewProps> = ({
  shipment,
  onUpdateStatus,
  onOpenIssueModal,
  onAddNote,
  onResolveIssue,
}) => {
  const [customNoteText, setCustomNoteText] = useState('');
  const [resolvingIssueId, setResolvingIssueId] = useState<string | null>(null);
  const [resolutionInput, setResolutionInput] = useState('');

  if (!shipment) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 bg-slate-800 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-700">
          <Truck className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">No Active Shipment Assigned</h3>
        <p className="text-slate-400 text-sm max-w-md mx-auto mb-6">
          You currently do not have an active load en route. Go to the "Accept New Loads" panel to view available dispatch shipments.
        </p>
      </div>
    );
  }

  const handleNoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customNoteText.trim()) {
      onAddNote(customNoteText.trim());
      setCustomNoteText('');
    }
  };

  const handleResolveSubmit = (issueId: string) => {
    if (resolutionInput.trim()) {
      onResolveIssue(issueId, resolutionInput.trim());
      setResolvingIssueId(null);
      setResolutionInput('');
    }
  };

  const getStatusBadge = (status: ShipmentStatus) => {
    switch (status) {
      case 'IN_TRANSIT':
        return 'bg-emerald-100 text-emerald-900 border-emerald-300';
      case 'ARRIVED_PICKUP':
      case 'LOADING':
        return 'bg-blue-100 text-blue-900 border-blue-300';
      case 'DELAYED':
        return 'bg-rose-100 text-rose-900 border-rose-300 animate-pulse';
      case 'DELIVERED':
        return 'bg-emerald-600 text-white border-emerald-500';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  const activeIssues = shipment.issues.filter((i) => !i.resolved);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 text-slate-800">
      
      {/* Active Shipment Header Card (Main Details requested by user) */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all relative overflow-hidden">
        
        {/* Material pastel accent bar */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-indigo-500 via-teal-500 to-amber-500" />

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 pb-6 border-b border-slate-200/80 mt-1">
          
          {/* Main Identifiers */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200">
                ACTIVE SHIPMENT
              </span>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">{shipment.id}</h1>
              <span className={`text-xs font-bold px-3 py-1 rounded-full border ${getStatusBadge(shipment.status)}`}>
                {shipment.status.replace('_', ' ')}
              </span>
            </div>

            <p className="text-sm text-slate-600 font-medium">
              Cargo: <span className="text-slate-900 font-semibold">{shipment.cargoDescription}</span> ({shipment.cargoWeight})
            </p>
          </div>

          {/* Key Identifiers: Driver ID & Truck Type (Mandatory user requirement) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-amber-50/80 p-3.5 rounded-2xl border border-amber-200/80">
            <div>
              <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Driver ID</p>
              <p className="text-sm font-extrabold text-amber-900 font-mono flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-amber-700" />
                {shipment.driverId}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Driver Name</p>
              <p className="text-sm font-bold text-slate-900">{shipment.driverName}</p>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Truck Specs</p>
              <p className="text-sm font-bold text-slate-800 truncate flex items-center gap-1" title={shipment.truckType}>
                <Truck className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                {shipment.truckType}
              </p>
            </div>
          </div>

        </div>

        {/* Pickup Location & Time vs Delivery Location & ETA Grid (Mandatory user requirement) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
          
          {/* Pickup Card */}
          <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-2xl p-4 relative flex flex-col justify-between">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-2">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs border border-emerald-300">
                  <MapPin className="w-4 h-4 text-emerald-700" />
                </div>
                <div>
                  <span className="text-[10px] font-extrabold tracking-wider uppercase text-emerald-800">PICKUP LOCATION</span>
                  <h3 className="text-base font-bold text-slate-900 leading-tight">{shipment.pickupLocation.facilityName}</h3>
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-600 font-medium mb-3">{shipment.pickupLocation.address}, {shipment.pickupLocation.cityState}</p>

            <div className="pt-3 border-t border-emerald-200/80 flex items-center justify-between text-xs">
              <span className="text-slate-600 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-emerald-600" />
                Scheduled Pickup:
              </span>
              <span className="font-bold text-slate-900">{shipment.pickupLocation.scheduledTime}</span>
            </div>
            {shipment.pickupLocation.actualTime && (
              <div className="mt-1 text-[11px] text-emerald-800 font-semibold text-right">
                ✓ Check-in: {shipment.pickupLocation.actualTime}
              </div>
            )}
          </div>

          {/* Delivery Card */}
          <div className="bg-indigo-50/60 border border-indigo-200/80 rounded-2xl p-4 relative flex flex-col justify-between">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-2">
                <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-800 flex items-center justify-center font-bold text-xs border border-indigo-300">
                  <Navigation className="w-4 h-4 text-indigo-700" />
                </div>
                <div>
                  <span className="text-[10px] font-extrabold tracking-wider uppercase text-indigo-800">DELIVERY LOCATION</span>
                  <h3 className="text-base font-bold text-slate-900 leading-tight">{shipment.deliveryLocation.facilityName}</h3>
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-600 font-medium mb-3">{shipment.deliveryLocation.address}, {shipment.deliveryLocation.cityState}</p>

            <div className="pt-3 border-t border-indigo-200/80 flex items-center justify-between text-xs">
              <span className="text-slate-600 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-indigo-600" />
                Estimated Arrival (ETA):
              </span>
              <span className="font-black text-indigo-900 text-sm">
                {shipment.deliveryLocation.updatedEta || shipment.deliveryLocation.scheduledEta}
              </span>
            </div>
            {shipment.deliveryLocation.updatedEta && (
              <div className="mt-1 text-[11px] text-indigo-800 font-semibold text-right flex items-center justify-end gap-1">
                <Info className="w-3 h-3 text-indigo-600" /> Adjusted based on logged driver updates
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Driver Real-Time Actions & Status Progression (Effortless Driver Controls) */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-4">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/80">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Truck className="w-5 h-5 text-indigo-600" />
              Driver Status Control & Incident Logging
            </h2>
            <p className="text-xs text-slate-500">
              Update shipment status with one click or log transit issues effortlessly.
            </p>
          </div>

          <button
            id="report-issue-btn"
            onClick={onOpenIssueModal}
            className="flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 text-xs font-bold transition-all shadow-sm active:scale-95"
          >
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            <span>Report Issue / Delay</span>
          </button>
        </div>

        {/* Quick Driver Status Buttons */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
            Quick Driver Status Update
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
            {STATUS_PROGRESSION.map((item) => {
              const isCurrent = shipment.status === item.status;
              return (
                <button
                  key={item.status}
                  id={`status-btn-${item.status}`}
                  onClick={() => onUpdateStatus(item.status)}
                  className={`px-3 py-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center space-y-1 ${
                    isCurrent
                      ? 'bg-indigo-600 text-white border-indigo-500 font-extrabold shadow-md scale-[1.02]'
                      : 'bg-slate-50 text-slate-700 border-slate-200/90 hover:bg-slate-100/80 hover:border-slate-300'
                  }`}
                >
                  <span className="text-xs line-clamp-1">{item.label}</span>
                  {isCurrent && <span className="text-[10px] font-bold uppercase tracking-wider opacity-90">Current</span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Reported Issues List */}
        {activeIssues.length > 0 && (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between text-rose-900 text-xs font-bold uppercase tracking-wider">
              <span className="flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-rose-600 animate-pulse" />
                Active Unresolved Delay Issues ({activeIssues.length})
              </span>
            </div>

            <div className="space-y-3">
              {activeIssues.map((issue) => (
                <div key={issue.id} className="bg-white p-3.5 rounded-xl border border-rose-200/80 shadow-sm space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-rose-900">{issue.title}</span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200">
                          {issue.severity} SEVERITY
                        </span>
                      </div>
                      <p className="text-xs text-slate-700 mt-1">{issue.description}</p>
                      <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-2">
                        <span>📍 {issue.location}</span>
                        <span>•</span>
                        <span>⏱ +{issue.estimatedDelayMinutes}m delay</span>
                        <span>•</span>
                        <span>{issue.timestamp}</span>
                      </p>
                    </div>

                    <button
                      onClick={() => setResolvingIssueId(resolvingIssueId === issue.id ? null : issue.id)}
                      className="px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold rounded-lg border border-emerald-200 transition-colors"
                    >
                      {resolvingIssueId === issue.id ? 'Cancel' : 'Mark Resolved'}
                    </button>
                  </div>

                  {/* Resolve input expansion */}
                  {resolvingIssueId === issue.id && (
                    <div className="pt-2 border-t border-slate-200 flex items-center space-x-2">
                      <input
                        type="text"
                        value={resolutionInput}
                        onChange={(e) => setResolutionInput(e.target.value)}
                        placeholder="Resolution notes (e.g. Traffic cleared, resumed speed)"
                        className="flex-1 bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
                      />
                      <button
                        onClick={() => handleResolveSubmit(issue.id)}
                        className="px-3 py-1.5 bg-emerald-600 text-white font-bold text-xs rounded-lg hover:bg-emerald-700"
                      >
                        Confirm Resolved
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Route & Progress Visualizer */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Navigation className="w-5 h-5 text-indigo-600" />
            Live Route & Distance Tracker
          </h2>
          <div className="text-xs font-bold text-slate-600">
            {shipment.remainingDistanceMiles} miles remaining / {shipment.totalDistanceMiles} miles total
          </div>
        </div>

        {/* Progress Bar */}
        <div>
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
            <span>Progress: <strong className="text-indigo-600 font-bold">{shipment.currentProgressPercent}%</strong></span>
            <span>Current Speed: <strong className="text-slate-900 font-bold">{shipment.currentSpeedMph || 62} MPH</strong></span>
          </div>
          <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-teal-500 rounded-full transition-all duration-500"
              style={{ width: `${shipment.currentProgressPercent}%` }}
            />
          </div>
        </div>

        {/* Waypoints Visual Steps */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
          {shipment.waypoints.map((wp, index) => (
            <div
              key={index}
              className={`p-3.5 rounded-2xl border relative transition-all ${
                wp.completed
                  ? 'bg-teal-50/80 border-teal-200/90 text-slate-900'
                  : 'bg-slate-50 border-slate-200/80 text-slate-500'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase ${
                  wp.completed ? 'bg-teal-100 text-teal-900' : 'bg-slate-200 text-slate-700'
                }`}>
                  {wp.type}
                </span>
                {wp.completed && <CheckCircle2 className="w-4 h-4 text-teal-600" />}
              </div>
              <p className="text-xs font-bold text-slate-900 line-clamp-1">{wp.name}</p>
              <p className="text-[11px] text-slate-600 mt-1">ETA/Arr: {wp.actualArrival || wp.estimatedArrival}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Shipment Timeline & Quick Driver Notes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Timeline Log */}
        <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-600" />
            Live Shipment Event Timeline
          </h2>

          <div className="space-y-4 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
            {shipment.timeline.map((event) => (
              <div key={event.id} className="relative pl-8 space-y-0.5">
                <div className="absolute left-1.5 top-1.5 w-3 h-3 rounded-full bg-indigo-600 ring-4 ring-indigo-50" />
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900">{event.title}</h4>
                  <span className="text-[10px] text-slate-500 font-medium">{event.timestamp}</span>
                </div>
                <p className="text-xs text-slate-600">{event.description}</p>
                <div className="flex items-center space-x-2 text-[10px] text-slate-500 mt-1">
                  <span>📍 {event.location}</span>
                  <span>•</span>
                  <span className="font-semibold text-indigo-700">{event.author} UPDATE</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Driver Note Log Input */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-1">
              <FileText className="w-5 h-5 text-indigo-600" />
              Add Driver Note
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              Log informal notes like rest break updates, weather comments, or fuel stops.
            </p>

            <form onSubmit={handleNoteSubmit} className="space-y-3">
              <textarea
                rows={4}
                value={customNoteText}
                onChange={(e) => setCustomNoteText(e.target.value)}
                placeholder="Type note (e.g., 'Stopped for 30m required break at Pilot Travel Center, truck operating normally')..."
                className="w-full bg-slate-50 border border-slate-300 rounded-2xl p-3 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
              <button
                type="submit"
                className="w-full py-2.5 bg-indigo-50 hover:bg-indigo-100/80 text-indigo-800 font-bold text-xs rounded-xl border border-indigo-200/80 transition-colors flex items-center justify-center space-x-2"
              >
                <PlusCircle className="w-4 h-4 text-indigo-600" />
                <span>Log Driver Note to Timeline</span>
              </button>
            </form>
          </div>

          <div className="pt-4 border-t border-slate-200/80 text-[11px] text-slate-500 space-y-1">
            <p className="font-semibold text-slate-700">Cargo Temperature Requirement:</p>
            <p className="text-indigo-900 font-mono font-bold">{shipment.temperatureRequirement || 'Standard Dry Freight'}</p>
            <p className="pt-1">BOL Number: <strong className="text-slate-900">{shipment.bolNumber}</strong></p>
          </div>
        </div>

      </div>

    </div>
  );
};

import React, { useState } from 'react';
import {
  History,
  Search,
  CheckCircle2,
  AlertTriangle,
  FileText,
  DollarSign,
  TrendingUp,
  MapPin,
  Calendar,
  Star,
  Award,
  ChevronRight,
  X,
  Clock,
  ShieldCheck
} from 'lucide-react';
import { Shipment } from '../../types';

interface ShipmentHistoryViewProps {
  history: Shipment[];
}

export const ShipmentHistoryView: React.FC<ShipmentHistoryViewProps> = ({ history }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);

  const filteredHistory = history.filter((item) => {
    const term = searchTerm.toLowerCase();
    return (
      item.id.toLowerCase().includes(term) ||
      item.cargoDescription.toLowerCase().includes(term) ||
      item.pickupLocation.cityState.toLowerCase().includes(term) ||
      item.deliveryLocation.cityState.toLowerCase().includes(term) ||
      item.bolNumber.toLowerCase().includes(term)
    );
  });

  const totalMiles = history.reduce((acc, curr) => acc + curr.totalDistanceMiles, 0);
  const totalEarnings = history.reduce((acc, curr) => acc + curr.payoutAmount, 0);
  const shipmentsWithIssuesCount = history.filter((h) => h.issues.length > 0).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 text-slate-800">
      
      {/* Header Banner */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-indigo-500 via-teal-500 to-amber-500" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-1">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200">
                DRIVER COMPLETED RECORDS
              </span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Shipment History & Proof of Deliveries</h1>
            <p className="text-xs text-slate-500">
              Review completed haul logs, receiver signatures, Bill of Lading (BOL) records, and payout summaries.
            </p>
          </div>
        </div>

        {/* Analytics Summary Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-200/80">
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
            <p className="text-[10px] font-semibold text-slate-500 uppercase">Total Completed</p>
            <p className="text-lg font-black text-slate-900">{history.length} Hauls</p>
          </div>
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
            <p className="text-[10px] font-semibold text-slate-500 uppercase">Total Haul Mileage</p>
            <p className="text-lg font-black text-indigo-900 font-mono">{totalMiles.toLocaleString()} Miles</p>
          </div>
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
            <p className="text-[10px] font-semibold text-slate-500 uppercase">Total Earnings</p>
            <p className="text-lg font-black text-emerald-700 font-mono">${totalEarnings.toLocaleString()}</p>
          </div>
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
            <p className="text-[10px] font-semibold text-slate-500 uppercase">On-Time Performance</p>
            <p className="text-lg font-black text-emerald-700 font-mono">100%</p>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search history by Shipment ID (e.g. SHP-88102), BOL #, location, or cargo..."
            className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-500"
          />
        </div>
      </div>

      {/* History Records Table / Cards */}
      <div className="bg-white border border-slate-200/80 rounded-3xl shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs font-bold text-slate-700">
          <span>Past Completed Shipments ({filteredHistory.length})</span>
          <span className="text-slate-500 font-normal">Click any row to view Proof of Delivery details</span>
        </div>

        <div className="divide-y divide-slate-100">
          {filteredHistory.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedShipment(item)}
              className="p-4 hover:bg-indigo-50/40 transition-colors cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 group"
            >
              
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-mono font-bold text-indigo-900 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                    {item.id}
                  </span>
                  <span className="text-xs font-bold text-emerald-800 flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> DELIVERED
                  </span>
                  {item.issues.length > 0 && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-200">
                      {item.issues.length} Incident Resolved
                    </span>
                  )}
                </div>

                <p className="text-sm font-bold text-slate-900">
                  {item.pickupLocation.cityState} → {item.deliveryLocation.cityState}
                </p>

                <p className="text-xs text-slate-500">
                  Cargo: <span className="text-slate-800 font-medium">{item.cargoDescription}</span> • BOL: <span className="font-mono text-slate-700 font-semibold">{item.bolNumber}</span>
                </p>
              </div>

              <div className="flex items-center justify-between md:justify-end space-x-6 text-xs">
                <div className="text-right">
                  <p className="text-sm font-black text-emerald-700 font-mono">${item.payoutAmount.toLocaleString()}</p>
                  <p className="text-[10px] text-slate-500">{item.totalDistanceMiles} miles</p>
                </div>

                <div className="text-right text-slate-500">
                  <p className="text-[11px] font-semibold text-slate-900">{item.completedAt || '2026-08-05'}</p>
                  <p className="text-[10px]">Signed by {item.podDetails?.receivedByPerson?.split(' ')[0] || 'Receiver'}</p>
                </div>

                <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-indigo-600 transition-colors" />
              </div>

            </div>
          ))}
        </div>
      </div>

      {/* Shipment Detail Modal */}
      {selectedShipment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-2xl shadow-2xl text-slate-800 overflow-hidden my-8 animate-in fade-in zoom-in-95">
            
            <div className="p-6 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">{selectedShipment.id}</span>
                  <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">COMPLETED</span>
                </div>
                <h2 className="text-lg font-bold text-slate-900 mt-1">Proof of Delivery & BOL Details</h2>
              </div>

              <button
                onClick={() => setSelectedShipment(null)}
                className="p-2 text-slate-400 hover:text-slate-800 rounded-xl hover:bg-slate-200/60"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              
              {/* Route Summary */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex justify-between">
                  <div>
                    <span className="text-[10px] text-emerald-800 font-bold uppercase">Pickup</span>
                    <p className="text-sm font-bold text-slate-900">{selectedShipment.pickupLocation.facilityName}</p>
                    <p className="text-slate-500">{selectedShipment.pickupLocation.cityState}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-indigo-800 font-bold uppercase">Delivery</span>
                    <p className="text-sm font-bold text-slate-900">{selectedShipment.deliveryLocation.facilityName}</p>
                    <p className="text-slate-500">{selectedShipment.deliveryLocation.cityState}</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 flex justify-between font-mono text-slate-700">
                  <span>Distance: {selectedShipment.totalDistanceMiles} Miles</span>
                  <span className="text-emerald-700 font-black">Payout: ${selectedShipment.payoutAmount}</span>
                </div>
              </div>

              {/* Proof of Delivery Details */}
              {selectedShipment.podDetails && (
                <div className="bg-emerald-50/60 border border-emerald-200 p-4 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-900 flex items-center gap-1">
                      <ShieldCheck className="w-4 h-4 text-emerald-700" /> Receiver Proof of Delivery (POD)
                    </span>
                    <div className="flex items-center text-amber-500">
                      {[...Array(selectedShipment.podDetails.rating || 5)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                      ))}
                    </div>
                  </div>

                  <p className="text-slate-700">
                    Received & Stamped by: <strong className="text-slate-900">{selectedShipment.podDetails.receivedByPerson}</strong>
                  </p>
                  <p className="text-slate-500">Signed timestamp: {selectedShipment.podDetails.signatureTimestamp}</p>
                  {selectedShipment.podDetails.notes && (
                    <p className="text-slate-700 italic bg-white p-2 rounded-xl border border-emerald-200">
                      "{selectedShipment.podDetails.notes}"
                    </p>
                  )}
                </div>
              )}

              {/* Issues Logged in past */}
              {selectedShipment.issues.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-bold text-slate-800">Logged Incidents During Haul:</h4>
                  {selectedShipment.issues.map((issue) => (
                    <div key={issue.id} className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                      <div className="flex justify-between font-bold text-indigo-900">
                        <span>{issue.title}</span>
                        <span className="text-[10px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">RESOLVED</span>
                      </div>
                      <p className="text-slate-600 text-[11px]">{issue.description}</p>
                      {issue.resolutionNotes && (
                        <p className="text-emerald-800 text-[10px] font-semibold">Resolution: {issue.resolutionNotes}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div className="pt-3 border-t border-slate-200 flex justify-end">
                <button
                  onClick={() => setSelectedShipment(null)}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-sm"
                >
                  Close Record
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
};

import React, { useState } from 'react';
import {
  PackageCheck,
  Search,
  Filter,
  DollarSign,
  MapPin,
  Calendar,
  Clock,
  Truck,
  Weight,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Info
} from 'lucide-react';
import { AvailableLoad } from '../../types';

interface AcceptLoadsViewProps {
  availableLoads: AvailableLoad[];
  onAcceptLoad: (load: AvailableLoad, scheduledPickupTime: string) => void;
}

export const AcceptLoadsView: React.FC<AcceptLoadsViewProps> = ({
  availableLoads,
  onAcceptLoad,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUrgency, setSelectedUrgency] = useState<string>('ALL');
  const [selectedTruckType, setSelectedTruckType] = useState<string>('ALL');
  
  // Selected load modal state
  const [selectedLoad, setSelectedLoad] = useState<AvailableLoad | null>(null);
  const [scheduledPickupInput, setScheduledPickupInput] = useState<string>('');
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [lastAcceptedLoadId, setLastAcceptedLoadId] = useState<string | null>(null);

  const filteredLoads = availableLoads.filter((load) => {
    const matchesSearch =
      load.originCity.toLowerCase().includes(searchTerm.toLowerCase()) ||
      load.destinationCity.toLowerCase().includes(searchTerm.toLowerCase()) ||
      load.cargoType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      load.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesUrgency =
      selectedUrgency === 'ALL' || load.urgency === selectedUrgency;

    const matchesTruck =
      selectedTruckType === 'ALL' ||
      load.truckTypeRequired.toLowerCase().includes(selectedTruckType.toLowerCase());

    return matchesSearch && matchesUrgency && matchesTruck;
  });

  const handleOpenLoadModal = (load: AvailableLoad) => {
    setSelectedLoad(load);
    setScheduledPickupInput(load.pickupWindowStart);
  };

  const handleConfirmAccept = () => {
    if (selectedLoad) {
      onAcceptLoad(selectedLoad, scheduledPickupInput || selectedLoad.pickupWindowStart);
      setLastAcceptedLoadId(selectedLoad.id);
      setSelectedLoad(null);
      setIsSuccessModalOpen(true);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 text-slate-800">
      
      {/* Header Banner */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-indigo-500 via-teal-500 to-amber-500" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-1">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200">
                DISPATCH MARKETPLACE
              </span>
              <span className="text-xs text-slate-500 font-mono font-medium">
                {availableLoads.length} Available Future Shipments
              </span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Accept New Transport Shipments</h1>
            <p className="text-xs text-slate-500">
              Select available loads, review payout rates per mile, and schedule future pickup slots.
            </p>
          </div>

          <div className="flex items-center space-x-3 bg-emerald-50/80 px-4 py-2.5 rounded-2xl border border-emerald-200">
            <TrendingUp className="w-5 h-5 text-emerald-700" />
            <div>
              <p className="text-[10px] text-slate-500 font-semibold uppercase">Avg Payout Rate</p>
              <p className="text-sm font-black text-emerald-900">$5.28 / mile</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters & Search Controls */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          
          {/* Search Bar */}
          <div className="sm:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by city (e.g. Atlanta, Jacksonville) or cargo type..."
              className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-500"
            />
          </div>

          {/* Urgency Filter */}
          <div>
            <select
              value={selectedUrgency}
              onChange={(e) => setSelectedUrgency(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-indigo-500"
            >
              <option value="ALL">All Rate Types</option>
              <option value="HIGH_PAY">💰 High Pay Rates ($6+/mi)</option>
              <option value="URGENT">⚡ Urgent Dispatch</option>
              <option value="NORMAL">Standard Dispatch</option>
            </select>
          </div>

          {/* Truck Type Filter */}
          <div>
            <select
              value={selectedTruckType}
              onChange={(e) => setSelectedTruckType(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-indigo-500"
            >
              <option value="ALL">All Truck Trailers</option>
              <option value="Refrigerated">53' Refrigerated</option>
              <option value="Dry Van">53' Dry Van</option>
              <option value="Flatbed">Flatbed / Step Deck</option>
            </select>
          </div>

        </div>
      </div>

      {/* Available Loads Grid */}
      {filteredLoads.length === 0 ? (
        <div className="bg-white border border-slate-200/80 rounded-3xl p-12 text-center text-slate-500 shadow-sm">
          <PackageCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-base font-bold text-slate-900 mb-1">No matching load offers found</p>
          <p className="text-xs text-slate-500">Try adjusting your search criteria or resetting filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredLoads.map((load) => (
            <div
              key={load.id}
              className="bg-white border border-slate-200/80 hover:border-indigo-300 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
            >
              <div>
                
                {/* Header info */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-mono font-bold text-indigo-900 bg-indigo-50 px-2.5 py-0.5 rounded-lg border border-indigo-200">
                      {load.id}
                    </span>
                    {load.urgency === 'HIGH_PAY' && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300">
                        HIGH PAY (${load.ratePerMileUsd}/mi)
                      </span>
                    )}
                    {load.urgency === 'URGENT' && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-900 border border-rose-300 animate-pulse">
                        URGENT
                      </span>
                    )}
                  </div>

                  <div className="text-right">
                    <span className="text-xl font-black text-emerald-700">${load.payoutUsd.toLocaleString()}</span>
                    <span className="block text-[10px] text-slate-500 font-mono font-medium">${load.ratePerMileUsd}/mi</span>
                  </div>
                </div>

                {/* Route Cities */}
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 mb-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                      <span className="text-sm font-bold text-slate-900">{load.originCity}</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400" />
                    <div className="flex items-center space-x-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                      <span className="text-sm font-bold text-slate-900">{load.destinationCity}</span>
                    </div>
                  </div>
                  <div className="text-[11px] text-slate-500 flex justify-between font-medium pt-1 border-t border-slate-200">
                    <span>{load.originFacility}</span>
                    <span className="font-bold text-slate-700">{load.distanceMiles} Miles</span>
                  </div>
                </div>

                {/* Cargo Specifications */}
                <div className="grid grid-cols-2 gap-2 text-xs text-slate-700">
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    <span className="block text-[10px] text-slate-500 uppercase font-semibold">Cargo</span>
                    <span className="font-bold text-slate-900 line-clamp-1">{load.cargoType}</span>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    <span className="block text-[10px] text-slate-500 uppercase font-semibold">Weight & Trailer</span>
                    <span className="font-semibold text-slate-800 line-clamp-1">
                      {load.weightLbs.toLocaleString()} lbs • {load.truckTypeRequired}
                    </span>
                  </div>
                </div>

              </div>

              {/* Action Button */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <div className="text-[11px] text-slate-500 flex items-center gap-1 font-medium">
                  <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Pickup: {load.pickupWindowStart}</span>
                </div>

                <button
                  id={`accept-load-${load.id}`}
                  onClick={() => handleOpenLoadModal(load)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-sm transition-all flex items-center space-x-1.5 active:scale-95"
                >
                  <span>Review & Accept</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Accept & Schedule Modal */}
      {selectedLoad && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-xl shadow-2xl text-slate-800 overflow-hidden my-8 animate-in fade-in zoom-in-95">
            
            <div className="p-6 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">{selectedLoad.id}</span>
                <h2 className="text-lg font-bold text-slate-900 mt-1">Accept Transport Shipment</h2>
              </div>
              <div className="text-right">
                <p className="text-lg font-black text-emerald-700">${selectedLoad.payoutUsd.toLocaleString()}</p>
                <p className="text-[10px] text-slate-500 font-mono font-semibold">${selectedLoad.ratePerMileUsd}/mile</p>
              </div>
            </div>

            <div className="p-6 space-y-4 text-xs">
              
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-emerald-800 uppercase">Pickup Origin</span>
                    <p className="text-sm font-bold text-slate-900">{selectedLoad.originCity}</p>
                    <p className="text-slate-500">{selectedLoad.originFacility} ({selectedLoad.originAddress})</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-indigo-800 uppercase">Destination</span>
                    <p className="text-sm font-bold text-slate-900">{selectedLoad.destinationCity}</p>
                    <p className="text-slate-500">{selectedLoad.destinationFacility}</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 grid grid-cols-2 gap-2 text-slate-600">
                  <div>
                    <span className="text-slate-500">Distance:</span> <strong className="text-slate-900">{selectedLoad.distanceMiles} miles</strong>
                  </div>
                  <div>
                    <span className="text-slate-500">Cargo Weight:</span> <strong className="text-slate-900">{selectedLoad.weightLbs.toLocaleString()} lbs</strong>
                  </div>
                </div>
              </div>

              {/* Schedule Pickup Time */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Confirm Scheduled Pickup Arrival Slot *
                </label>
                <input
                  type="text"
                  value={scheduledPickupInput}
                  onChange={(e) => setScheduledPickupInput(e.target.value)}
                  placeholder="e.g. 2026-08-12 09:00 AM"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-indigo-500"
                />
              </div>

              {selectedLoad.specialInstructions && (
                <div className="bg-amber-50 border border-amber-200 p-3 rounded-2xl text-amber-900 space-y-1">
                  <p className="font-bold flex items-center gap-1">
                    <Info className="w-3.5 h-3.5 text-amber-700" /> Special Dispatch Instructions:
                  </p>
                  <p className="text-[11px] text-amber-800">{selectedLoad.specialInstructions}</p>
                </div>
              )}

              {/* Actions */}
              <div className="pt-4 flex items-center justify-end space-x-3 border-t border-slate-200">
                <button
                  onClick={() => setSelectedLoad(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:text-slate-900 font-bold"
                >
                  Cancel
                </button>
                <button
                  id="confirm-accept-load-btn"
                  onClick={handleConfirmAccept}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 text-white font-black text-sm hover:bg-indigo-700 shadow-md"
                >
                  Confirm & Schedule Load
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* Success Modal */}
      {isSuccessModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm p-4">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-md p-6 text-center shadow-2xl space-y-4">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-800 rounded-2xl flex items-center justify-center mx-auto border border-emerald-300">
              <CheckCircle2 className="w-8 h-8 text-emerald-700" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Shipment Successfully Accepted!</h3>
            <p className="text-xs text-slate-600">
              Shipment <strong className="text-indigo-700">{lastAcceptedLoadId}</strong> has been added to your transport route and dispatch queue.
            </p>
            <button
              onClick={() => setIsSuccessModalOpen(false)}
              className="w-full py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-sm"
            >
              Done
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

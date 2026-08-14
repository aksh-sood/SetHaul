import React, { useState } from 'react';
import {
  INITIAL_ACTIVE_SHIPMENT,
  INITIAL_AVAILABLE_LOADS,
  INITIAL_DRIVER_PROFILE,
  INITIAL_SHIPMENT_HISTORY
} from './data/mockData';
import { AvailableLoad, DriverProfile, IssueReport, Shipment, ShipmentStatus } from './types';
import { Header } from './components/Header';
import { ActiveShipmentView } from './components/ActiveShipment/ActiveShipmentView';
import { AcceptLoadsView } from './components/NewShipments/AcceptLoadsView';
import { ShipmentHistoryView } from './components/History/ShipmentHistoryView';
import { DriverProfileView } from './components/Profile/DriverProfileView';
import { IssueReportModal } from './components/IssueReportModal';
import { ChatbotWidget } from './components/Chatbot/ChatbotWidget';
import { LoginPage, DEMO_DRIVERS } from './components/Auth/LoginPage';

export default function App() {
  const [activeTab, setActiveTab] = useState<'active' | 'loads' | 'history' | 'profile'>('active');
  
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    // Check if user previously logged in
    const storedAuth = localStorage.getItem('fleetpulse_auth');
    return storedAuth === 'true';
  });

  // Application state
  const [driverProfile, setDriverProfile] = useState<DriverProfile>(() => {
    const storedDriverId = localStorage.getItem('fleetpulse_driver_id');
    if (storedDriverId) {
      const match = DEMO_DRIVERS.find((d) => d.id === storedDriverId);
      if (match) return match.profile;
    }
    return INITIAL_DRIVER_PROFILE;
  });

  const [activeShipment, setActiveShipment] = useState<Shipment | null>(INITIAL_ACTIVE_SHIPMENT);
  const [availableLoads, setAvailableLoads] = useState<AvailableLoad[]>(INITIAL_AVAILABLE_LOADS);
  const [shipmentHistory, setShipmentHistory] = useState<Shipment[]>(INITIAL_SHIPMENT_HISTORY);

  // Modal State
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);

  // Auth Handlers
  const handleLogin = (driverId: string, matchedProfile?: DriverProfile) => {
    localStorage.setItem('fleetpulse_auth', 'true');
    localStorage.setItem('fleetpulse_driver_id', driverId);

    if (matchedProfile) {
      setDriverProfile(matchedProfile);
    } else {
      setDriverProfile((prev) => ({
        ...prev,
        id: driverId,
        name: `Driver (${driverId})`,
      }));
    }

    setIsAuthenticated(true);
    setActiveTab('active');
  };

  const handleLogout = () => {
    localStorage.removeItem('fleetpulse_auth');
    setIsAuthenticated(false);
  };

  // 1. Status Update Handler
  const handleUpdateStatus = (newStatus: ShipmentStatus, reason?: string) => {
    if (!activeShipment) return;

    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const locationStr = activeShipment.currentLocationName;

    const newTimelineEvent = {
      id: `TL-${Date.now()}`,
      timestamp: nowStr,
      status: newStatus,
      title: `Status Changed: ${newStatus.replace('_', ' ')}`,
      description: reason || `Driver updated shipment status to ${newStatus.replace('_', ' ')}.`,
      location: locationStr,
      author: 'DRIVER' as const,
    };

    if (newStatus === 'DELIVERED') {
      // Complete shipment & move to history
      const completedShipment: Shipment = {
        ...activeShipment,
        status: 'DELIVERED',
        currentProgressPercent: 100,
        remainingDistanceMiles: 0,
        completedAt: `${new Date().toISOString().split('T')[0]} ${nowStr}`,
        timeline: [newTimelineEvent, ...activeShipment.timeline],
        podDetails: {
          receivedByPerson: 'Dock Manager (Electronically Confirmed)',
          signatureTimestamp: nowStr,
          notes: 'Deliveries verified and checked in by driver.',
          rating: 5,
        },
      };

      setShipmentHistory((prev) => [completedShipment, ...prev]);
      setActiveShipment(null);
      setActiveTab('history');
      return;
    }

    // Update current active shipment progress according to status
    let progress = activeShipment.currentProgressPercent;
    if (newStatus === 'ARRIVED_PICKUP') progress = 10;
    if (newStatus === 'LOADING') progress = 25;
    if (newStatus === 'IN_TRANSIT') progress = Math.max(35, progress);
    if (newStatus === 'ARRIVED_DELIVERY') progress = 90;
    if (newStatus === 'UNLOADING') progress = 95;

    setActiveShipment((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        status: newStatus,
        currentProgressPercent: progress,
        timeline: [newTimelineEvent, ...prev.timeline],
      };
    });
  };

  // 2. Submit Issue Handler
  const handleSubmitIssue = (issueData: Omit<IssueReport, 'id' | 'timestamp' | 'resolved'>) => {
    if (!activeShipment) return;

    const newIssueId = `ISS-${Date.now().toString().slice(-4)}`;
    const timestampStr = new Date().toLocaleString([], {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const newIssue: IssueReport = {
      ...issueData,
      id: newIssueId,
      timestamp: timestampStr,
      resolved: false,
    };

    // Calculate new ETA recommendation if delay was submitted
    const currentEta = activeShipment.deliveryLocation.updatedEta || activeShipment.deliveryLocation.scheduledEta;
    const adjustedEtaNote = `${currentEta} (+${issueData.estimatedDelayMinutes}m delay logged)`;

    const timelineEvent = {
      id: `TL-ISS-${Date.now()}`,
      timestamp: timestampStr,
      status: 'ISSUE_REPORTED' as const,
      title: `Issue Reported: ${issueData.title}`,
      description: issueData.description,
      location: issueData.location,
      author: 'DRIVER' as const,
      issueId: newIssueId,
    };

    setActiveShipment((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        status: issueData.severity === 'CRITICAL' || issueData.severity === 'HIGH' ? 'DELAYED' : prev.status,
        deliveryLocation: {
          ...prev.deliveryLocation,
          updatedEta: adjustedEtaNote,
        },
        issues: [newIssue, ...prev.issues],
        timeline: [timelineEvent, ...prev.timeline],
      };
    });
  };

  // 3. Add Custom Note Handler
  const handleAddNote = (noteText: string) => {
    if (!activeShipment) return;

    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const timelineEvent = {
      id: `TL-NOTE-${Date.now()}`,
      timestamp: nowStr,
      status: 'NOTE_ADDED' as const,
      title: 'Driver Route Note',
      description: noteText,
      location: activeShipment.currentLocationName,
      author: 'DRIVER' as const,
    };

    setActiveShipment((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        timeline: [timelineEvent, ...prev.timeline],
      };
    });
  };

  // 4. Resolve Issue Handler
  const handleResolveIssue = (issueId: string, resolutionNotes: string) => {
    if (!activeShipment) return;

    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setActiveShipment((prev) => {
      if (!prev) return null;
      
      const updatedIssues = prev.issues.map((i) => {
        if (i.id === issueId) {
          return {
            ...i,
            resolved: true,
            resolvedAt: nowStr,
            resolutionNotes,
          };
        }
        return i;
      });

      const timelineEvent = {
        id: `TL-RES-${Date.now()}`,
        timestamp: nowStr,
        status: 'ISSUE_RESOLVED' as const,
        title: 'Incident Resolved by Driver',
        description: resolutionNotes,
        location: prev.currentLocationName,
        author: 'DRIVER' as const,
      };

      const hasRemainingUnresolved = updatedIssues.some((i) => !i.resolved);

      return {
        ...prev,
        status: hasRemainingUnresolved ? 'DELAYED' : 'IN_TRANSIT',
        issues: updatedIssues,
        timeline: [timelineEvent, ...prev.timeline],
      };
    });
  };

  // 5. Accept Load Offer Handler
  const handleAcceptLoad = (load: AvailableLoad, scheduledPickupTime: string) => {
    // Remove load from available market
    setAvailableLoads((prev) => prev.filter((l) => l.id !== load.id));

    // If no active shipment exists, set this as the active shipment!
    if (!activeShipment) {
      const newActiveShipment: Shipment = {
        id: load.id.replace('LOAD', 'SHP'),
        driverId: driverProfile.id,
        driverName: driverProfile.name,
        truckType: driverProfile.assignedTruck.truckType,
        truckNumber: driverProfile.assignedTruck.unitNumber,
        licensePlate: driverProfile.assignedTruck.plateNumber,

        pickupLocation: {
          facilityName: load.originFacility,
          address: load.originAddress,
          cityState: load.originCity,
          contactPhone: '+1 (800) 555-0199',
          scheduledTime: scheduledPickupTime,
        },
        deliveryLocation: {
          facilityName: load.destinationFacility,
          address: load.destinationAddress,
          cityState: load.destinationCity,
          contactPhone: '+1 (800) 555-0200',
          scheduledEta: load.deliveryEta,
        },

        cargoDescription: load.cargoType,
        cargoWeight: `${load.weightLbs.toLocaleString()} lbs`,
        bolNumber: `BOL-${Math.floor(100000 + Math.random() * 900000)}`,
        payoutAmount: load.payoutUsd,

        totalDistanceMiles: load.distanceMiles,
        remainingDistanceMiles: load.distanceMiles,
        currentProgressPercent: 0,
        currentLocationName: load.originCity,

        status: 'DISPATCHED',
        waypoints: [
          {
            name: `${load.originFacility} (${load.originCity})`,
            type: 'PICKUP',
            address: load.originAddress,
            estimatedArrival: scheduledPickupTime,
            completed: false,
            coordinates: { lat: 33.749, lng: -84.388 },
          },
          {
            name: `${load.destinationFacility} (${load.destinationCity})`,
            type: 'DELIVERY',
            address: load.destinationAddress,
            estimatedArrival: load.deliveryEta,
            completed: false,
            coordinates: { lat: 30.332, lng: -81.655 },
          },
        ],
        issues: [],
        timeline: [
          {
            id: `TL-NEW-${Date.now()}`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            status: 'DISPATCHED',
            title: 'Shipment Accepted & Scheduled',
            description: `Driver accepted load ${load.id} for route from ${load.originCity} to ${load.destinationCity}.`,
            location: load.originCity,
            author: 'DRIVER',
          },
        ],
      };

      setActiveShipment(newActiveShipment);
      setActiveTab('active');
    }
  };

  const unresolvedCount = activeShipment ? activeShipment.issues.filter((i) => !i.resolved).length : 0;

  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans antialiased text-slate-800 flex flex-col selection:bg-amber-200 selection:text-amber-900">
      
      {/* Top Header & Navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        driverProfile={driverProfile}
        setDriverProfile={setDriverProfile}
        activeShipment={activeShipment}
        unresolvedIssuesCount={unresolvedCount}
        availableLoadsCount={availableLoads.length}
        onLogout={handleLogout}
      />

      {/* Main Panel View Content */}
      <main className="flex-1 pb-12">
        {activeTab === 'active' && (
          <ActiveShipmentView
            shipment={activeShipment}
            onUpdateStatus={handleUpdateStatus}
            onOpenIssueModal={() => setIsIssueModalOpen(true)}
            onAddNote={handleAddNote}
            onResolveIssue={handleResolveIssue}
          />
        )}

        {activeTab === 'loads' && (
          <AcceptLoadsView
            availableLoads={availableLoads}
            onAcceptLoad={handleAcceptLoad}
          />
        )}

        {activeTab === 'history' && (
          <ShipmentHistoryView history={shipmentHistory} />
        )}

        {activeTab === 'profile' && (
          <DriverProfileView
            driverProfile={driverProfile}
            setDriverProfile={setDriverProfile}
            onLogout={handleLogout}
          />
        )}
      </main>

      {/* Driver Issue Reporting Modal */}
      {activeShipment && (
        <IssueReportModal
          isOpen={isIssueModalOpen}
          onClose={() => setIsIssueModalOpen(false)}
          shipmentId={activeShipment.id}
          currentLocationName={activeShipment.currentLocationName}
          onSubmitIssue={handleSubmitIssue}
        />
      )}

      {/* Driver Floating Chatbot Co-Pilot */}
      <ChatbotWidget
        activeShipment={activeShipment}
        driverProfile={driverProfile}
        onSubmitIssue={handleSubmitIssue}
        onOpenIssueModal={() => setIsIssueModalOpen(true)}
      />

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200/80 py-4 text-center text-xs text-slate-500 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="font-medium">© 2026 FleetPulse Logistics Inc. • Driver Telemetry & Real-Time Tracking Platform</p>
          <div className="flex items-center space-x-4 text-[11px]">
            <span className="text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Dispatch Network Connected
            </span>
            <span className="text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full font-medium">HOS Safety Compliant</span>
          </div>
        </div>
      </footer>

    </div>
  );
}

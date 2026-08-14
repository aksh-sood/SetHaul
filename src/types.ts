export type ShipmentStatus = 
  | 'DISPATCHED'
  | 'ARRIVED_PICKUP'
  | 'LOADING'
  | 'IN_TRANSIT'
  | 'ARRIVED_DELIVERY'
  | 'UNLOADING'
  | 'DELIVERED'
  | 'DELAYED'
  | 'CANCELLED';

export type IssueCategory = 
  | 'TRAFFIC'
  | 'BREAKDOWN'
  | 'DOCK_DELAY'
  | 'WEATHER'
  | 'GATE_ACCESS'
  | 'INSPECTION'
  | 'CUSTOMER_UNAVAILABLE'
  | 'OTHER';

export type IssueSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface IssueReport {
  id: string;
  shipmentId: string;
  category: IssueCategory;
  title: string;
  description: string;
  severity: IssueSeverity;
  timestamp: string;
  location: string;
  photoUrl?: string;
  estimatedDelayMinutes: number;
  resolved: boolean;
  resolvedAt?: string;
  resolutionNotes?: string;
}

export interface TimelineEvent {
  id: string;
  timestamp: string;
  status: ShipmentStatus | 'ISSUE_REPORTED' | 'ISSUE_RESOLVED' | 'NOTE_ADDED';
  title: string;
  description: string;
  location: string;
  author: 'DRIVER' | 'DISPATCH' | 'SYSTEM';
  issueId?: string;
}

export interface Waypoint {
  name: string;
  type: 'PICKUP' | 'REST_STOP' | 'INSPECTION' | 'DELIVERY';
  address: string;
  estimatedArrival: string;
  actualArrival?: string;
  completed: boolean;
  coordinates: { lat: number; lng: number };
}

export interface Shipment {
  id: string; // e.g. SHP-89241
  driverId: string; // e.g. DRV-4029
  driverName: string;
  truckType: string; // e.g. 53' Refrigerated Semi
  truckNumber: string; // e.g. TRK-7082
  licensePlate: string; // e.g. 7X-4892
  
  // Locations
  pickupLocation: {
    facilityName: string;
    address: string;
    cityState: string;
    contactPhone: string;
    scheduledTime: string;
    actualTime?: string;
  };
  deliveryLocation: {
    facilityName: string;
    address: string;
    cityState: string;
    contactPhone: string;
    scheduledEta: string;
    updatedEta?: string;
  };

  // Cargo specs
  cargoDescription: string;
  cargoWeight: string; // e.g. 42,000 lbs
  temperatureRequirement?: string; // e.g. -10°F Cold Chain
  bolNumber: string; // Bill of Lading
  payoutAmount: number; // e.g. 2450

  // Route metrics
  totalDistanceMiles: number;
  remainingDistanceMiles: number;
  currentProgressPercent: number;
  currentSpeedMph?: number;
  currentLocationName: string;

  // Status & Issues
  status: ShipmentStatus;
  statusReason?: string;
  timeline: TimelineEvent[];
  issues: IssueReport[];
  waypoints: Waypoint[];

  // Proof of delivery for history
  podDetails?: {
    receivedByPerson?: string;
    signatureTimestamp?: string;
    notes?: string;
    rating?: number;
  };

  completedAt?: string;
}

export interface AvailableLoad {
  id: string;
  originCity: string;
  originFacility: string;
  originAddress: string;
  destinationCity: string;
  destinationFacility: string;
  destinationAddress: string;
  pickupWindowStart: string;
  pickupWindowEnd: string;
  deliveryEta: string;
  cargoType: string;
  weightLbs: number;
  truckTypeRequired: string;
  distanceMiles: number;
  payoutUsd: number;
  ratePerMileUsd: number;
  urgency: 'NORMAL' | 'URGENT' | 'HIGH_PAY';
  specialInstructions?: string;
}

export interface DriverProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  cdlNumber: string;
  cdlState: string;
  cdlExpiration: string;
  endorsements: string[];
  totalMilesDriven: number;
  onTimeDeliveryRate: number; // e.g. 98.4%
  overallRating: number; // e.g. 4.9
  dutyStatus: 'ON_DUTY' | 'DRIVING' | 'ON_BREAK' | 'OFF_DUTY';
  shiftHoursRemaining: number;
  
  // Truck Specs
  assignedTruck: {
    unitNumber: string;
    model: string; // e.g. 2024 Freightliner Cascadia
    truckType: string;
    plateNumber: string;
    fuelLevelPercent: number;
    defLevelPercent: number;
    lastServiceDate: string;
    nextServiceDueMiles: number;
    maxPayloadCapacityLbs: number;
    odometerMiles: number;
  };

  // Notification Preferences
  notifications: {
    smsIssueAlerts: boolean;
    pushDispatchOffers: boolean;
    routeTrafficUpdates: boolean;
    weatherWarnings: boolean;
    shiftHourReminders: boolean;
    emailWeeklySummaries: boolean;
  };
}

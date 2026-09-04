export type Role = "patient" | "asha" | "doctor" | "admin";

export type RiskLevel = "LOW" | "MODERATE" | "HIGH" | "EMERGENCY";

export interface Patient {
  id: string;
  healthId: string;
  name: string;
  age: number;
  gender: string;
  mobile: string;
  village: string;
  district: string;
  state: string;
  bloodGroup: string;
  emergencyContact: string;
  assignedWorker: string;
  risk: RiskLevel;
  createdAt: string;
  pendingSync?: boolean;
}

export interface Facility {
  id: string;
  name: string;
  type: "PHC" | "CHC" | "District Hospital" | "Specialist Hospital";
  distanceKm: number;
  doctors: number;
  services: string[];
  waitMinutes: number;
  emergency: boolean;
  x: number;
  y: number;
}

export interface Doctor {
  id: string;
  name: string;
  specialization: string;
  facility: string;
  languages: string[];
  experience: number;
  slots: string[];
  rating: number;
}

export interface Assessment {
  id: string;
  patientId: string;
  symptoms: string[];
  duration: string;
  severity: number;
  conditions: string[];
  risk: RiskLevel;
  score: number;
  action: string;
  facilityType: string;
  reasons: string[];
  createdAt: string;
}

export type ReferralStatus =
  | "Created"
  | "Accepted"
  | "Patient Traveling"
  | "Arrived"
  | "Treatment Started"
  | "Completed";

export interface Referral {
  id: string;
  patientId: string;
  patientName: string;
  fromFacility: string;
  toFacility: string;
  reason: string;
  priority: "Routine" | "Urgent" | "Emergency";
  notes: string;
  status: ReferralStatus;
  createdAt: string;
}

export interface Consultation {
  id: string;
  patientId: string;
  patientName: string;
  doctorName: string;
  date: string;
  slot: string;
  mode: "Video" | "In-person";
  status: "Scheduled" | "Completed";
  notes?: string;
  prescription?: string;
  followUp?: string;
}

export interface HealthRecord {
  id: string;
  patientId: string;
  type: "Consultation" | "Assessment" | "Prescription" | "Report" | "Referral" | "Follow-up";
  title: string;
  detail: string;
  date: string;
}

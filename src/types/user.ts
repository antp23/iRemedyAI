export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  dateOfBirth?: string;
  avatarUrl?: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export type UserRole = 'patient' | 'provider' | 'admin';

export interface UserProfile extends User {
  address?: Address;
  insuranceInfo?: InsuranceInfo;
  emergencyContact?: EmergencyContact;
  medicalHistory?: MedicalHistorySummary;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface InsuranceInfo {
  provider: string;
  policyNumber: string;
  groupNumber?: string;
  expirationDate: string;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  email?: string;
}

export interface MedicalHistorySummary {
  allergies: string[];
  medications: string[];
  conditions: string[];
  lastVisit?: string;
}

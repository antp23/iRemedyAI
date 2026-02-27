export interface Appointment {
  id: string;
  patientId: string;
  providerId: string;
  providerName: string;
  specialty: string;
  date: string;
  time: string;
  duration: number;
  status: AppointmentStatus;
  type: AppointmentType;
  reason: string;
  notes?: string;
  location?: AppointmentLocation;
  createdAt: string;
  updatedAt: string;
}

export type AppointmentStatus =
  | 'scheduled'
  | 'confirmed'
  | 'in-progress'
  | 'completed'
  | 'cancelled'
  | 'no-show';

export type AppointmentType = 'in-person' | 'telehealth' | 'phone';

export interface AppointmentLocation {
  name: string;
  address: string;
  room?: string;
}

export interface AppointmentSlot {
  date: string;
  time: string;
  available: boolean;
  providerId: string;
}

export interface CreateAppointmentPayload {
  providerId: string;
  date: string;
  time: string;
  type: AppointmentType;
  reason: string;
  notes?: string;
}

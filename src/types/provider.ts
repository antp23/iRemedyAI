export interface Provider {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  title: string;
  credentials: string[];
  specialty: ProviderSpecialty;
  subspecialties: string[];
  npi: string;
  licenseNumber: string;
  licenseState: string;
  bio: string;
  avatarUrl?: string;
  rating: number;
  reviewCount: number;
  acceptingNewPatients: boolean;
  languages: string[];
  insuranceAccepted: string[];
  locations: ProviderLocation[];
  availability: ProviderAvailability;
  telehealth: boolean;
  createdAt: string;
  updatedAt: string;
}

export type ProviderSpecialty =
  | 'general-practice'
  | 'internal-medicine'
  | 'family-medicine'
  | 'pediatrics'
  | 'cardiology'
  | 'dermatology'
  | 'endocrinology'
  | 'gastroenterology'
  | 'neurology'
  | 'oncology'
  | 'orthopedics'
  | 'psychiatry'
  | 'pulmonology'
  | 'rheumatology'
  | 'urology'
  | 'emergency-medicine'
  | 'pharmacy';

export interface ProviderLocation {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  fax?: string;
  isPrimary: boolean;
}

export interface ProviderAvailability {
  schedule: WeeklySchedule;
  nextAvailable: string;
  averageWaitDays: number;
}

export interface WeeklySchedule {
  monday: TimeSlot[];
  tuesday: TimeSlot[];
  wednesday: TimeSlot[];
  thursday: TimeSlot[];
  friday: TimeSlot[];
  saturday: TimeSlot[];
  sunday: TimeSlot[];
}

export interface TimeSlot {
  start: string;
  end: string;
}

export interface ProviderSearchParams {
  query?: string;
  specialty?: ProviderSpecialty;
  location?: string;
  radius?: number;
  telehealth?: boolean;
  acceptingNewPatients?: boolean;
  insurance?: string;
  language?: string;
  sortBy?: 'name' | 'rating' | 'distance' | 'availability';
  page?: number;
  pageSize?: number;
}

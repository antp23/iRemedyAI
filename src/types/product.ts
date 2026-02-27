export interface DrugProduct {
  id: string;
  ndc: string;
  name: string;
  brandName: string;
  genericName: string;
  labelerName: string;
  manufacturer: string;
  productType: ProductType;
  category: ProductCategory;
  schedule: DEASchedule;
  routeOfAdministration: RouteOfAdministration;
  dosageForm: string;
  strength: string;
  strengthUnit: string;
  packageSize: string;
  packageType: string;
  description: string;
  activeIngredients: ActiveIngredient[];
  inactiveIngredients: string[];
  indications: string[];
  contraindications: string[];
  warnings: string[];
  sideEffects: string[];
  interactions: DrugInteraction[];
  storageConditions: string;
  requiresPrescription: boolean;
  isControlled: boolean;
  isAvailable: boolean;
  price: number;
  currency: string;
  imageUrl?: string;
  fdaApprovalDate?: string;
  expirationDate?: string;
  lotNumber?: string;
  barcode?: string;
  createdAt: string;
  updatedAt: string;
}

export type ProductType =
  | 'prescription'
  | 'otc'
  | 'supplement'
  | 'medical-device'
  | 'compound';

export type ProductCategory =
  | 'analgesic'
  | 'antibiotic'
  | 'antiviral'
  | 'antifungal'
  | 'cardiovascular'
  | 'dermatological'
  | 'endocrine'
  | 'gastrointestinal'
  | 'immunological'
  | 'neurological'
  | 'oncological'
  | 'ophthalmic'
  | 'psychiatric'
  | 'respiratory'
  | 'musculoskeletal'
  | 'other';

export type DEASchedule = 'I' | 'II' | 'III' | 'IV' | 'V' | 'unscheduled';

export type RouteOfAdministration =
  | 'oral'
  | 'topical'
  | 'intravenous'
  | 'intramuscular'
  | 'subcutaneous'
  | 'inhalation'
  | 'rectal'
  | 'ophthalmic'
  | 'otic'
  | 'nasal'
  | 'transdermal'
  | 'sublingual';

export interface ActiveIngredient {
  name: string;
  strength: string;
  unit: string;
}

export interface DrugInteraction {
  drugName: string;
  severity: InteractionSeverity;
  description: string;
}

export type InteractionSeverity = 'minor' | 'moderate' | 'major' | 'contraindicated';

export interface ProductSearchParams {
  query?: string;
  category?: ProductCategory;
  productType?: ProductType;
  requiresPrescription?: boolean;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'name' | 'price' | 'relevance';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

export interface ProductInventory {
  productId: string;
  quantityOnHand: number;
  quantityReserved: number;
  reorderLevel: number;
  reorderQuantity: number;
  lastRestocked: string;
  expirationDate: string;
  warehouseLocation: string;
}

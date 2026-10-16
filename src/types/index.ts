export type Language = 'en' | 'te' | 'hi';

export type Screen =
  | 'LANGUAGE_SELECT'
  | 'HOME_MENU'
  | 'SERVICE_SELECT'
  | 'SUBCATEGORY_SELECT'
  | 'MATCH_RESULTS'
  | 'PROVIDER_HUB'
  | 'WORKER_REGISTER'
  | 'TRACTOR_REGISTER'
  | 'HARVESTER_REGISTER'
  | 'MINI_TRUCK_REGISTER'
  | 'PROVIDER_LOGIN'
  | 'PROVIDER_DASHBOARD'
  | 'REGISTRATION_CONFIRMATION';

export type MainServiceType = 'person' | 'tractor' | 'harvester' | 'mini_truck';

export interface CategoryItem {
  id: string;
  number: number;
  serviceType: MainServiceType;
  titleEn: string;
  titleTe: string;
  titleHi: string;
  descriptionEn: string;
  descriptionTe: string;
  descriptionHi: string;
  illustrationKey: string;
}

export interface Village {
  id: string;
  nameEn: string;
  nameTe: string;
  nameHi: string;
  districtEn: string;
  districtTe: string;
  districtHi: string;
  distanceFromBaseKm: number;
}

export interface KioskConfig {
  panchayatId: string;
  panchayatNameEn: string;
  panchayatNameTe: string;
  panchayatNameHi: string;
  districtEn: string;
  districtTe: string;
  districtHi: string;
}

export interface Worker {
  id: string;
  demoId: string;
  nameEn?: string;
  nameTe?: string;
  nameHi?: string;
  villageId: string;
  villageNameEn: string;
  villageNameTe: string;
  villageNameHi?: string;
  skills: string[]; // Subcategory IDs
  dailyWage?: number;
  experienceYears?: number;
  isActive?: boolean;
  availability?: 'IMMEDIATE' | 'TOMORROW' | 'NEXT_WEEK' | 'UNKNOWN' | 'UNAVAILABLE';
  availableDates?: string[];
  contactDemo?: string;
  contactNumber?: string;
  isRegisteredUser?: boolean;
}

export interface TractorService {
  id: string;
  demoId: string;
  ownerNameEn?: string;
  ownerNameTe?: string;
  ownerNameHi?: string;
  tractorModel: string;
  currentAttachment?: string; // Single authoritative attachment in use
  attachments: string[]; // Subcategory IDs of owned/supported attachments
  villageId: string;
  villageNameEn: string;
  villageNameTe: string;
  villageNameHi?: string;
  ratePerHour?: number;
  ratePerAcre?: number;
  includesOperator: boolean;
  isActiveToday?: boolean; // Daily availability status (must be activated each day)
  activeDate?: string; // YYYY-MM-DD date in kiosk timezone when activated
  isActive?: boolean;
  availability?: 'IMMEDIATE' | 'TOMORROW' | 'SCHEDULED' | 'UNKNOWN' | 'UNAVAILABLE';
  availableDates?: string[];
  contactDemo?: string;
  contactNumber?: string;
  isRegisteredUser?: boolean;
  vehiclePhotoUrl?: string; // Registered vehicle/machinery photo
  notes?: string;
}

export interface HarvesterService {
  id: string;
  demoId: string;
  ownerNameEn?: string;
  ownerNameTe?: string;
  ownerNameHi?: string;
  machineType: string;
  compatibleCrops: string[]; // Subcategory IDs
  villageId: string;
  villageNameEn: string;
  villageNameTe: string;
  villageNameHi?: string;
  ratePerAcre?: number;
  cutterBarWidthFeet?: number;
  includesOperator: boolean;
  isActive?: boolean;
  availability?: 'IMMEDIATE' | 'TOMORROW' | 'SCHEDULED' | 'UNKNOWN' | 'UNAVAILABLE';
  availableDates?: string[];
  contactDemo?: string;
  contactNumber?: string;
  isRegisteredUser?: boolean;
  vehiclePhotoUrl?: string; // Registered vehicle/machinery photo
  notes?: string;
}

export interface MiniTruckService {
  id: string;
  demoId: string;
  driverNameEn?: string;
  driverNameTe?: string;
  driverNameHi?: string;
  vehicleModel: string;
  cargoSpeciality: string[]; // Subcategory IDs
  bodyType: 'OPEN' | 'COVERED';
  capacityTons: number;
  villageId: string;
  villageNameEn: string;
  villageNameTe: string;
  villageNameHi?: string;
  baseCharge?: number;
  ratePerKm?: number;
  isActive?: boolean;
  availability?: 'IMMEDIATE' | 'TOMORROW' | 'SCHEDULED' | 'UNKNOWN' | 'UNAVAILABLE';
  availableDates?: string[];
  contactDemo?: string;
  contactNumber?: string;
  isRegisteredUser?: boolean;
  vehiclePhotoUrl?: string; // Registered vehicle/machinery photo
  notes?: string;
}

export interface SearchQueryParams {
  serviceType: MainServiceType;
  subcategoryId: string;
  subcategoryTitleEn: string;
  subcategoryTitleTe: string;
  subcategoryTitleHi?: string;
  kioskPanchayatId?: string;
  kioskPanchayatNameEn?: string;
  kioskPanchayatNameTe?: string;
  kioskPanchayatNameHi?: string;
  villageId?: string;
  villageNameEn?: string;
  villageNameTe?: string;
  villageNameHi?: string;
  date?: string;
  quantity?: number;
  duration?: string;
  offeredWage?: number;
  destinationVillageId?: string;
  destinationVillageNameEn?: string;
  destinationVillageNameTe?: string;
  destinationVillageNameHi?: string;
  fieldSizeAcres?: number;
  timeSlot?: string;
  goodsType?: string;
  approxLoadTons?: number;
  notes?: string;
}

export interface MatchScoreResult<T> {
  item: T;
  score: number;
  distanceKm: number;
  matchReasonsEn: string[];
  matchReasonsTe: string[];
  matchReasonsHi: string[];
}

export interface WorkerRegistrationForm {
  name: string; // Mandatory full name
  selectedSkills: string[];
  contactNumber: string; // Mandatory mobile number
  consentAgreed: boolean;
  villageId?: string;
  villageNameEn?: string;
  villageNameTe?: string;
  villageNameHi?: string;
  expectedWage?: number;
  workRadiusKm?: number;
  availableDate?: string;
  experienceYears?: number;
  notes?: string;
}

export interface TractorRegistrationForm {
  tractorModel: string;
  currentAttachment: string; // The single current working attachment
  selectedAttachments: string[];
  includesOperator: boolean;
  ownerName: string; // Mandatory full name
  contactNumber: string; // Mandatory mobile number
  consentAgreed: boolean;
  ratePerHour?: number;
  vehiclePhotoUrl?: string;
  notes?: string;
}

export interface HarvesterRegistrationForm {
  machineType: string;
  compatibleCrops: string[];
  includesOperator: boolean;
  ownerName: string; // Mandatory full name
  contactNumber: string; // Mandatory mobile number
  consentAgreed: boolean;
  ratePerAcre?: number;
  vehiclePhotoUrl?: string;
  notes?: string;
}

export interface MiniTruckRegistrationForm {
  vehicleModel: string;
  bodyType: 'OPEN' | 'COVERED';
  capacityTons: number;
  cargoSpeciality: string[];
  driverName: string; // Mandatory full name
  contactNumber: string; // Mandatory mobile number
  consentAgreed: boolean;
  baseCharge?: number;
  vehiclePhotoUrl?: string;
  notes?: string;
}

export type AnyRegistrationData =
  | { type: 'worker'; data: WorkerRegistrationForm }
  | { type: 'tractor'; data: TractorRegistrationForm }
  | { type: 'harvester'; data: HarvesterRegistrationForm }
  | { type: 'mini_truck'; data: MiniTruckRegistrationForm };

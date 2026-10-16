import { getKioskTodayDateString } from './dailyAvailability';
import { formatCleanMobile } from './dailyAvailability';

export interface BaseProviderAccount {
  id: string;
  mobile: string; // 10-digit Indian mobile
  name: string;
  registeredAt: string;
  isActive: boolean; // Work status: Active (available for work) vs Inactive (off duty)
  vehiclePhotoUrl?: string; // Optional registered vehicle/equipment photo
}

export interface WorkerAccount extends BaseProviderAccount {
  type: 'worker';
  skills: string[];
  dailyWage?: number;
  villageId: string;
  villageNameEn: string;
}

export interface TractorAccount extends BaseProviderAccount {
  type: 'tractor';
  tractorModel: string;
  currentAttachment: string; // STRICT 1-attachment rule
  ratePerHour?: number;
  includesOperator: boolean;
  villageId: string;
  villageNameEn: string;
  activeDate?: string; // Date of daily registration in Asia/Kolkata
  isActiveToday?: boolean; // Valid only for the day of registration
}

export interface HarvesterAccount extends BaseProviderAccount {
  type: 'harvester';
  machineType: string;
  compatibleCrops: string[];
  ratePerAcre?: number;
  includesOperator: boolean;
  villageId: string;
  villageNameEn: string;
}

export interface MiniTruckAccount extends BaseProviderAccount {
  type: 'mini_truck';
  vehicleModel: string;
  bodyType: 'OPEN' | 'COVERED';
  capacityTons: number;
  cargoSpeciality: string[];
  baseCharge?: number;
  villageId: string;
  villageNameEn: string;
}

export type ProviderAccount =
  | WorkerAccount
  | TractorAccount
  | HarvesterAccount
  | MiniTruckAccount;

const STORAGE_KEY_ACCOUNTS = 'gramaconnect_provider_accounts';

/**
 * Initial demo provider accounts matching the demo registries
 */
export const INITIAL_DEMO_ACCOUNTS: ProviderAccount[] = [
  {
    id: 'acc-tr-1',
    type: 'tractor',
    name: 'B. Srinivasa Rao',
    mobile: '9848011901',
    tractorModel: 'Mahindra 575 DI (45 HP)',
    currentAttachment: 'tractor_rotavator',
    ratePerHour: 800,
    includesOperator: true,
    villageId: 'rampur',
    villageNameEn: 'Rampur',
    isActive: true,
    isActiveToday: true,
    activeDate: getKioskTodayDateString(),
    registeredAt: '2026-10-16T08:00:00.000Z',
  },
  {
    id: 'acc-tr-2',
    type: 'tractor',
    name: 'T. Prabhakar',
    mobile: '9848022901',
    tractorModel: 'John Deere 5050D (50 HP)',
    currentAttachment: 'tractor_rotavator',
    ratePerHour: 950,
    includesOperator: true,
    villageId: 'chandanpur',
    villageNameEn: 'Chandanpur',
    isActive: true,
    isActiveToday: true,
    activeDate: getKioskTodayDateString(),
    registeredAt: '2026-10-16T08:30:00.000Z',
  },
  {
    id: 'acc-wrk-1',
    type: 'worker',
    name: 'G. Mallaiah',
    mobile: '9848011201',
    skills: ['sowing', 'transplanting', 'weeding', 'paddy_harvesting'],
    dailyWage: 450,
    villageId: 'rampur',
    villageNameEn: 'Rampur',
    isActive: true,
    registeredAt: '2026-10-16T07:00:00.000Z',
  },
  {
    id: 'acc-wrk-2',
    type: 'worker',
    name: 'K. Laxmi Bai',
    mobile: '9848011202',
    skills: ['transplanting', 'cotton_picking', 'vegetable_picking', 'weeding'],
    dailyWage: 400,
    villageId: 'rampur',
    villageNameEn: 'Rampur',
    isActive: true,
    registeredAt: '2026-10-16T07:15:00.000Z',
  },
  {
    id: 'acc-hv-1',
    type: 'harvester',
    name: 'M. Ramesh',
    mobile: '9848011401',
    machineType: 'Paddy Track Combine Harvester',
    compatibleCrops: ['harvester_paddy', 'harvester_combine'],
    ratePerAcre: 1800,
    includesOperator: true,
    villageId: 'rampur',
    villageNameEn: 'Rampur',
    isActive: true,
    registeredAt: '2026-10-16T07:45:00.000Z',
  },
  {
    id: 'acc-tk-1',
    type: 'mini_truck',
    name: 'V. Prakash',
    mobile: '9848011501',
    vehicleModel: 'Tata Ace (Chhota Hathi - 1.5 Ton)',
    bodyType: 'OPEN',
    capacityTons: 1.5,
    cargoSpeciality: ['truck_vegetable', 'truck_paddy_bags'],
    baseCharge: 600,
    villageId: 'rampur',
    villageNameEn: 'Rampur',
    isActive: true,
    registeredAt: '2026-10-16T08:15:00.000Z',
  },
];

function getStorage() {
  if (typeof window !== 'undefined' && window.localStorage) {
    return window.localStorage;
  }
  if (typeof localStorage !== 'undefined' && localStorage) {
    return localStorage;
  }
  return null;
}

export function loadProviderAccounts(): ProviderAccount[] {
  const storage = getStorage();
  if (!storage) {
    return INITIAL_DEMO_ACCOUNTS;
  }
  try {
    const raw = storage.getItem(STORAGE_KEY_ACCOUNTS);
    if (!raw) {
      storage.setItem(STORAGE_KEY_ACCOUNTS, JSON.stringify(INITIAL_DEMO_ACCOUNTS));
      return INITIAL_DEMO_ACCOUNTS;
    }
    const parsed = JSON.parse(raw) as ProviderAccount[];
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  } catch (e) {
    console.warn('Failed to parse provider accounts from storage:', e);
  }
  return INITIAL_DEMO_ACCOUNTS;
}

export function saveProviderAccounts(accounts: ProviderAccount[]): void {
  const storage = getStorage();
  if (!storage) return;
  try {
    storage.setItem(STORAGE_KEY_ACCOUNTS, JSON.stringify(accounts));
  } catch (e) {
    console.warn('Failed to save provider accounts to storage:', e);
  }
}

export function getAccountByMobile(mobile: string): ProviderAccount | undefined {
  const clean = formatCleanMobile(mobile);
  const accounts = loadProviderAccounts();
  return accounts.find((a) => formatCleanMobile(a.mobile) === clean);
}

export function upsertProviderAccount(account: ProviderAccount): ProviderAccount {
  const accounts = loadProviderAccounts();
  const cleanMobile = formatCleanMobile(account.mobile);
  const existingIdx = accounts.findIndex((a) => formatCleanMobile(a.mobile) === cleanMobile);

  let updatedAccounts: ProviderAccount[];
  if (existingIdx >= 0) {
    updatedAccounts = accounts.map((a, idx) => (idx === existingIdx ? account : a));
  } else {
    updatedAccounts = [account, ...accounts];
  }

  saveProviderAccounts(updatedAccounts);
  return account;
}

export function updateAccountStatus(mobile: string, isActive: boolean): ProviderAccount | undefined {
  const clean = formatCleanMobile(mobile);
  const accounts = loadProviderAccounts();
  let updatedAccount: ProviderAccount | undefined;

  const next = accounts.map((a) => {
    if (formatCleanMobile(a.mobile) === clean) {
      updatedAccount = { ...a, isActive };
      return updatedAccount;
    }
    return a;
  });

  if (updatedAccount) {
    saveProviderAccounts(next);
  }
  return updatedAccount;
}

export function updateTractorAttachment(mobile: string, newAttachment: string): TractorAccount | undefined {
  const clean = formatCleanMobile(mobile);
  const accounts = loadProviderAccounts();
  let updated: TractorAccount | undefined;

  const next = accounts.map((a) => {
    if (a.type === 'tractor' && formatCleanMobile(a.mobile) === clean) {
      updated = {
        ...a,
        currentAttachment: newAttachment,
      };
      return updated;
    }
    return a;
  });

  if (updated) {
    saveProviderAccounts(next);
  }
  return updated;
}

export function activateTractorDailyRegistration(
  mobile: string,
  currentAttachment?: string
): TractorAccount | undefined {
  const clean = formatCleanMobile(mobile);
  const todayStr = getKioskTodayDateString();
  const accounts = loadProviderAccounts();
  let updated: TractorAccount | undefined;

  const next = accounts.map((a) => {
    if (a.type === 'tractor' && formatCleanMobile(a.mobile) === clean) {
      updated = {
        ...a,
        isActive: true,
        isActiveToday: true,
        activeDate: todayStr,
        currentAttachment: currentAttachment || a.currentAttachment,
      };
      return updated;
    }
    return a;
  });

  if (updated) {
    saveProviderAccounts(next);
  }
  return updated;
}

export function isTractorRegistrationValidToday(account: TractorAccount, targetDate?: string): boolean {
  const todayStr = targetDate || getKioskTodayDateString();
  return Boolean(account.isActive && account.isActiveToday && account.activeDate === todayStr);
}

export function updateVehiclePhoto(mobile: string, photoUrl: string | null): ProviderAccount | undefined {
  const clean = formatCleanMobile(mobile);
  const accounts = loadProviderAccounts();
  let updatedAccount: ProviderAccount | undefined;

  const next = accounts.map((a) => {
    if (formatCleanMobile(a.mobile) === clean) {
      updatedAccount = { ...a, vehiclePhotoUrl: photoUrl || undefined };
      return updatedAccount;
    }
    return a;
  });

  if (updatedAccount) {
    saveProviderAccounts(next);
  }
  return updatedAccount;
}

export function updateProviderProfile(mobile: string, updates: Partial<ProviderAccount>): ProviderAccount | undefined {
  const clean = formatCleanMobile(mobile);
  const accounts = loadProviderAccounts();
  let updatedAccount: ProviderAccount | undefined;

  const next = accounts.map((a) => {
    if (formatCleanMobile(a.mobile) === clean) {
      updatedAccount = { ...a, ...updates } as ProviderAccount;
      return updatedAccount;
    }
    return a;
  });

  if (updatedAccount) {
    saveProviderAccounts(next);
  }
  return updatedAccount;
}


import { useState, useMemo, useCallback } from 'react';
import './App.css';
import {
  Language,
  Screen,
  MainServiceType,
  CategoryItem,
  SearchQueryParams,
  Worker,
  TractorService,
  HarvesterService,
  MiniTruckService,
  WorkerRegistrationForm,
  AnyRegistrationData,
} from './types';
import { INITIAL_DEMO_WORKERS } from './data/demoWorkers';
import { DEMO_TRACTORS, DEMO_HARVESTERS, DEMO_MINI_TRUCKS } from './data/demoMachinery';
import {
  matchWorkers,
  matchTractors,
  matchHarvesters,
  matchMiniTrucks,
  DEFAULT_KIOSK_CONFIG,
} from './utils/matchingEngine';
import { generateReferenceNumber } from './utils/receiptGenerator';
import { useKioskTimer } from './hooks/useKioskTimer';
import { setVoiceMuted, getVoiceMuted } from './utils/speechGuidance';

import { Header } from './components/Header';
import { IdleWarningModal } from './components/IdleWarningModal';
import { LanguageSelection } from './components/LanguageSelection';
import { HomeMenu } from './components/HomeMenu';
import { ServiceSelection } from './components/ServiceSelection';
import { SubcategoryGrid } from './components/SubcategoryGrid';
import { MatchResults } from './components/MatchResults';
import { ProviderHub } from './components/ProviderHub';
import { WorkerRegistration } from './components/WorkerRegistration';
import { MachineryRegistration } from './components/MachineryRegistration';
import { RegistrationConfirmation } from './components/RegistrationConfirmation';
import { PrintableReceipt } from './components/PrintableReceipt';
import { ProviderLogin } from './components/ProviderLogin';
import { ProviderDashboard } from './components/ProviderDashboard';
import { GrowingGrassStrip, GrassProgressStage } from './components/GrowingGrassStrip';
import {
  ProviderAccount,
  upsertProviderAccount,
} from './utils/providerAccounts';
import {
  loadTractorsFromStorage,
  saveTractorsToStorage,
  cleanTractorsDailyActivation,
  getKioskTodayDateString,
} from './utils/dailyAvailability';

export function App() {
  // 1. Core Kiosk State
  const [language, setLanguage] = useState<Language>('te');
  const [currentScreen, setCurrentScreen] = useState<Screen>('LANGUAGE_SELECT');
  const [screenHistory, setScreenHistory] = useState<Screen[]>([]);
  const [isVoiceMutedState, setIsVoiceMutedState] = useState<boolean>(getVoiceMuted());

  // 2. Service Search Workflow State
  const [selectedServiceType, setSelectedServiceType] = useState<MainServiceType>('person');
  const [, setSelectedSubcategory] = useState<CategoryItem | null>(null);
  const [searchParams, setSearchParams] = useState<SearchQueryParams | null>(null);
  const [searchReferenceNumber, setSearchReferenceNumber] = useState<string>('');

  // 3. Dynamic Registry State (Workers & Machinery)
  const [workersList, setWorkersList] = useState<Worker[]>(INITIAL_DEMO_WORKERS);
  const [tractorsList, setTractorsList] = useState<TractorService[]>(() => {
    const loaded = loadTractorsFromStorage(DEMO_TRACTORS);
    return cleanTractorsDailyActivation(loaded);
  });
  const [harvestersList, setHarvestersList] = useState<HarvesterService[]>(DEMO_HARVESTERS);
  const [trucksList, setTrucksList] = useState<MiniTruckService[]>(DEMO_MINI_TRUCKS);

  // 4. Provider Account & Auth State
  const [loggedInAccount, setLoggedInAccount] = useState<ProviderAccount | null>(null);
  const [, setAuthToken] = useState<string | null>(null);

  const handleUpdateProviderAccount = useCallback((updated: ProviderAccount) => {
    setLoggedInAccount(updated);

    if (updated.type === 'tractor') {
      setTractorsList((prev) => {
        const next = prev.map((tr) => {
          if (
            tr.contactNumber === updated.mobile ||
            (tr.contactDemo && tr.contactDemo.includes(updated.mobile.slice(-6)))
          ) {
            return {
              ...tr,
              isActiveToday: Boolean(updated.isActive && updated.isActiveToday),
              currentAttachment: updated.currentAttachment,
              ratePerHour: updated.ratePerHour || tr.ratePerHour,
              ownerNameEn: updated.name,
              ownerNameTe: updated.name,
              ownerNameHi: updated.name,
              vehiclePhotoUrl: updated.vehiclePhotoUrl !== undefined ? updated.vehiclePhotoUrl : tr.vehiclePhotoUrl,
            };
          }
          return tr;
        });
        saveTractorsToStorage(next);
        return next;
      });
    } else if (updated.type === 'worker') {
      setWorkersList((prev) =>
        prev.map((w) => {
          if (
            w.contactNumber === updated.mobile ||
            (w.contactDemo && w.contactDemo.includes(updated.mobile.slice(-6)))
          ) {
            return {
              ...w,
              availability: updated.isActive ? 'IMMEDIATE' : 'UNAVAILABLE',
              skills: updated.skills,
              nameEn: updated.name,
              nameTe: updated.name,
              nameHi: updated.name,
            };
          }
          return w;
        })
      );
    } else if (updated.type === 'harvester') {
      setHarvestersList((prev) =>
        prev.map((h) => {
          if (
            h.contactNumber === updated.mobile ||
            (h.contactDemo && h.contactDemo.includes(updated.mobile.slice(-6)))
          ) {
            return {
              ...h,
              availability: updated.isActive ? 'IMMEDIATE' : 'UNAVAILABLE',
              compatibleCrops: updated.compatibleCrops,
              ownerNameEn: updated.name,
              ownerNameTe: updated.name,
              ownerNameHi: updated.name,
              vehiclePhotoUrl: updated.vehiclePhotoUrl !== undefined ? updated.vehiclePhotoUrl : h.vehiclePhotoUrl,
            };
          }
          return h;
        })
      );
    } else if (updated.type === 'mini_truck') {
      setTrucksList((prev) =>
        prev.map((m) => {
          if (
            m.contactNumber === updated.mobile ||
            (m.contactDemo && m.contactDemo.includes(updated.mobile.slice(-6)))
          ) {
            return {
              ...m,
              availability: updated.isActive ? 'IMMEDIATE' : 'UNAVAILABLE',
              cargoSpeciality: updated.cargoSpeciality,
              driverNameEn: updated.name,
              driverNameTe: updated.name,
              driverNameHi: updated.name,
              vehiclePhotoUrl: updated.vehiclePhotoUrl !== undefined ? updated.vehiclePhotoUrl : m.vehiclePhotoUrl,
            };
          }
          return m;
        })
      );
    }
  }, []);

  // 5. Registration Confirmation State
  const [activeRegistration, setActiveRegistration] = useState<AnyRegistrationData | null>(null);
  const [registrationRefNumber, setRegistrationRefNumber] = useState<string>('');

  // 6. Receipt Printing State
  const [showReceipt, setShowReceipt] = useState<boolean>(false);
  const [receiptType, setReceiptType] = useState<'SERVICE_SEARCH' | 'WORKER_REGISTRATION'>('SERVICE_SEARCH');
  const [selectedProviderForReceipt, setSelectedProviderForReceipt] = useState<
    Worker | TractorService | HarvesterService | MiniTruckService | undefined
  >(undefined);

  // 7. Navigation State Machine
  const navigateTo = useCallback((screen: Screen) => {
    setScreenHistory((prev) => [...prev, currentScreen]);
    setCurrentScreen(screen);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentScreen]);

  const handleNavigateBack = useCallback(() => {
    setScreenHistory((prev) => {
      if (prev.length === 0) {
        setCurrentScreen('HOME_MENU');
        return [];
      }
      const newHistory = [...prev];
      const previousScreen = newHistory.pop() || 'HOME_MENU';
      setCurrentScreen(previousScreen);
      return newHistory;
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleResetSession = useCallback(() => {
    setCurrentScreen('LANGUAGE_SELECT');
    setScreenHistory([]);
    setSelectedSubcategory(null);
    setSearchParams(null);
    setShowReceipt(false);
    setSelectedProviderForReceipt(undefined);
    setActiveRegistration(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleNavigateHome = useCallback(() => {
    setCurrentScreen('HOME_MENU');
    setScreenHistory([]);
    setSelectedSubcategory(null);
    setSearchParams(null);
    setShowReceipt(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleToggleVoice = useCallback(() => {
    const nextState = !isVoiceMutedState;
    setIsVoiceMutedState(nextState);
    setVoiceMuted(nextState);
  }, [isVoiceMutedState]);

  // 7. Idle Countdown Hook (60 seconds idle timeout)
  const { secondsRemaining, isWarning, resetTimer, pauseTimer, resumeTimer } = useKioskTimer({
    timeoutSeconds: 60,
    warningThresholdSeconds: 15,
    enabled: currentScreen !== 'LANGUAGE_SELECT', // Do not timeout on initial landing
    onTimeout: handleResetSession,
  });

  // 8. Workflow Actions
  const handleSelectLanguage = (lang: Language) => {
    setLanguage(lang);
    resetTimer();
    navigateTo('HOME_MENU');
  };

  const handleHomeOptionSelect = (option: 'LOOKING_FOR_WORK' | 'NEED_SERVICES') => {
    resetTimer();
    if (option === 'LOOKING_FOR_WORK') {
      navigateTo('PROVIDER_HUB');
    } else {
      navigateTo('SERVICE_SELECT');
    }
  };

  const handleSelectService = (service: MainServiceType) => {
    setSelectedServiceType(service);
    resetTimer();
    navigateTo('SUBCATEGORY_SELECT');
  };

  // Direct 2-step selection: Subcategory selected -> Immediately search Rampur Panchayat records!
  const handleSelectSubcategory = (subcategory: CategoryItem) => {
    setSelectedSubcategory(subcategory);
    resetTimer();

    const params: SearchQueryParams = {
      serviceType: selectedServiceType,
      subcategoryId: subcategory.id,
      subcategoryTitleEn: subcategory.titleEn,
      subcategoryTitleTe: subcategory.titleTe,
      subcategoryTitleHi: subcategory.titleHi,
      kioskPanchayatId: DEFAULT_KIOSK_CONFIG.panchayatId,
      kioskPanchayatNameEn: DEFAULT_KIOSK_CONFIG.panchayatNameEn,
      kioskPanchayatNameTe: DEFAULT_KIOSK_CONFIG.panchayatNameTe,
      kioskPanchayatNameHi: DEFAULT_KIOSK_CONFIG.panchayatNameHi,
    };

    setSearchParams(params);
    setSearchReferenceNumber(generateReferenceNumber('REQ'));
    navigateTo('MATCH_RESULTS');
  };

  const handleProviderHubAction = (
    action:
      | 'REGISTER_WORKER'
      | 'REGISTER_TRACTOR'
      | 'REGISTER_HARVESTER'
      | 'REGISTER_MINI_TRUCK'
      | 'PROVIDER_LOGIN'
  ) => {
    resetTimer();
    switch (action) {
      case 'REGISTER_WORKER':
        navigateTo('WORKER_REGISTER');
        break;
      case 'REGISTER_TRACTOR':
        navigateTo('TRACTOR_REGISTER');
        break;
      case 'REGISTER_HARVESTER':
        navigateTo('HARVESTER_REGISTER');
        break;
      case 'REGISTER_MINI_TRUCK':
        navigateTo('MINI_TRUCK_REGISTER');
        break;
      case 'PROVIDER_LOGIN':
        if (loggedInAccount) {
          navigateTo('PROVIDER_DASHBOARD');
        } else {
          navigateTo('PROVIDER_LOGIN');
        }
        break;
    }
  };

  const handleWorkerRegistered = (form: WorkerRegistrationForm) => {
    pauseTimer();
    const refNum = generateReferenceNumber('WRK');
    setRegistrationRefNumber(refNum);
    setActiveRegistration({ type: 'worker', data: form });

    // Create new live worker record in system
    const newWorker: Worker = {
      id: `w-live-${Date.now()}`,
      demoId: `DEMO-${refNum.slice(-6)}`,
      nameEn: form.name || 'Agricultural Worker',
      nameTe: form.name || 'వ్యవసాయ కూలీ',
      nameHi: form.name || 'कृषि श्रमिक',
      villageId: DEFAULT_KIOSK_CONFIG.panchayatId,
      villageNameEn: DEFAULT_KIOSK_CONFIG.panchayatNameEn,
      villageNameTe: DEFAULT_KIOSK_CONFIG.panchayatNameTe,
      villageNameHi: DEFAULT_KIOSK_CONFIG.panchayatNameHi,
      skills: form.selectedSkills,
      availability: 'IMMEDIATE',
      contactDemo: form.contactNumber,
      contactNumber: form.contactNumber,
      isRegisteredUser: true,
    };

    setWorkersList((prev) => [newWorker, ...prev]);

    // Upsert provider account for immediate OTP login and status management
    if (form.contactNumber) {
      upsertProviderAccount({
        id: `acc-wrk-${Date.now()}`,
        type: 'worker',
        name: form.name,
        mobile: form.contactNumber,
        skills: form.selectedSkills,
        villageId: DEFAULT_KIOSK_CONFIG.panchayatId,
        villageNameEn: DEFAULT_KIOSK_CONFIG.panchayatNameEn,
        isActive: true,
        registeredAt: new Date().toISOString(),
      });
    }

    setTimeout(() => {
      resumeTimer();
      resetTimer();
      navigateTo('REGISTRATION_CONFIRMATION');
    }, 200);
  };

  const handleMachineryRegistered = (reg: AnyRegistrationData) => {
    pauseTimer();
    const refNum = generateReferenceNumber('MCH');
    setRegistrationRefNumber(refNum);
    setActiveRegistration(reg);

    if (reg.type === 'tractor') {
      const d = reg.data;
      const todayStr = getKioskTodayDateString();
      const initialAttachment = d.currentAttachment || (d.selectedAttachments && d.selectedAttachments[0]) || 'tractor_rotavator';
      const newTractor: TractorService = {
        id: `tr-live-${Date.now()}`,
        demoId: `DEMO-${refNum.slice(-6)}`,
        ownerNameEn: d.ownerName,
        ownerNameTe: d.ownerName,
        ownerNameHi: d.ownerName,
        tractorModel: d.tractorModel,
        currentAttachment: initialAttachment,
        attachments: [initialAttachment],
        villageId: DEFAULT_KIOSK_CONFIG.panchayatId,
        villageNameEn: DEFAULT_KIOSK_CONFIG.panchayatNameEn,
        villageNameTe: DEFAULT_KIOSK_CONFIG.panchayatNameTe,
        villageNameHi: DEFAULT_KIOSK_CONFIG.panchayatNameHi,
        ratePerHour: d.ratePerHour || 800,
        includesOperator: d.includesOperator,
        isActiveToday: true,
        activeDate: todayStr,
        availability: 'IMMEDIATE',
        contactDemo: d.contactNumber,
        contactNumber: d.contactNumber,
        vehiclePhotoUrl: d.vehiclePhotoUrl,
        isRegisteredUser: true,
      };
      setTractorsList((prev) => {
        const next = [newTractor, ...prev];
        saveTractorsToStorage(next);
        return next;
      });

      // Upsert account with daily registration for today only
      upsertProviderAccount({
        id: `acc-tr-${Date.now()}`,
        type: 'tractor',
        name: d.ownerName,
        mobile: d.contactNumber,
        tractorModel: d.tractorModel,
        currentAttachment: initialAttachment,
        ratePerHour: d.ratePerHour || 800,
        includesOperator: d.includesOperator,
        villageId: DEFAULT_KIOSK_CONFIG.panchayatId,
        villageNameEn: DEFAULT_KIOSK_CONFIG.panchayatNameEn,
        isActive: true,
        isActiveToday: true,
        activeDate: todayStr,
        vehiclePhotoUrl: d.vehiclePhotoUrl,
        registeredAt: new Date().toISOString(),
      });
    } else if (reg.type === 'harvester') {
      const d = reg.data;
      const newHarvester: HarvesterService = {
        id: `hv-live-${Date.now()}`,
        demoId: `DEMO-${refNum.slice(-6)}`,
        ownerNameEn: d.ownerName || 'Harvester Provider',
        ownerNameTe: d.ownerName || 'హార్వెస్టర్ ప్రొవైడర్',
        ownerNameHi: d.ownerName || 'हार्वेस्टर प्रदाता',
        machineType: d.machineType,
        compatibleCrops: d.compatibleCrops,
        villageId: DEFAULT_KIOSK_CONFIG.panchayatId,
        villageNameEn: DEFAULT_KIOSK_CONFIG.panchayatNameEn,
        villageNameTe: DEFAULT_KIOSK_CONFIG.panchayatNameTe,
        villageNameHi: DEFAULT_KIOSK_CONFIG.panchayatNameHi,
        ratePerAcre: d.ratePerAcre || 1800,
        cutterBarWidthFeet: 12,
        includesOperator: d.includesOperator,
        availability: 'IMMEDIATE',
        contactDemo: d.contactNumber || '98480-XXXXX (Demo)',
        contactNumber: d.contactNumber,
        vehiclePhotoUrl: d.vehiclePhotoUrl,
        isRegisteredUser: true,
      };
      setHarvestersList((prev) => [newHarvester, ...prev]);

      upsertProviderAccount({
        id: `acc-hv-${Date.now()}`,
        type: 'harvester',
        name: d.ownerName,
        mobile: d.contactNumber,
        machineType: d.machineType,
        compatibleCrops: d.compatibleCrops,
        ratePerAcre: d.ratePerAcre || 1800,
        includesOperator: d.includesOperator,
        villageId: DEFAULT_KIOSK_CONFIG.panchayatId,
        villageNameEn: DEFAULT_KIOSK_CONFIG.panchayatNameEn,
        isActive: true,
        vehiclePhotoUrl: d.vehiclePhotoUrl,
        registeredAt: new Date().toISOString(),
      });
    } else if (reg.type === 'mini_truck') {
      const d = reg.data;
      const newTruck: MiniTruckService = {
        id: `tk-live-${Date.now()}`,
        demoId: `DEMO-${refNum.slice(-6)}`,
        driverNameEn: d.driverName || 'Truck Driver',
        driverNameTe: d.driverName || 'డ్రైవర్',
        driverNameHi: d.driverName || 'वाहन चालक',
        vehicleModel: d.vehicleModel,
        cargoSpeciality: d.cargoSpeciality,
        bodyType: d.bodyType,
        capacityTons: d.capacityTons,
        villageId: DEFAULT_KIOSK_CONFIG.panchayatId,
        villageNameEn: DEFAULT_KIOSK_CONFIG.panchayatNameEn,
        villageNameTe: DEFAULT_KIOSK_CONFIG.panchayatNameTe,
        villageNameHi: DEFAULT_KIOSK_CONFIG.panchayatNameHi,
        baseCharge: d.baseCharge || 600,
        ratePerKm: 25,
        availability: 'IMMEDIATE',
        contactDemo: d.contactNumber || '98480-XXXXX (Demo)',
        contactNumber: d.contactNumber,
        vehiclePhotoUrl: d.vehiclePhotoUrl,
        isRegisteredUser: true,
      };
      setTrucksList((prev) => [newTruck, ...prev]);

      upsertProviderAccount({
        id: `acc-tk-${Date.now()}`,
        type: 'mini_truck',
        name: d.driverName,
        mobile: d.contactNumber,
        vehicleModel: d.vehicleModel,
        bodyType: d.bodyType,
        capacityTons: d.capacityTons,
        cargoSpeciality: d.cargoSpeciality,
        baseCharge: d.baseCharge || 600,
        villageId: DEFAULT_KIOSK_CONFIG.panchayatId,
        villageNameEn: DEFAULT_KIOSK_CONFIG.panchayatNameEn,
        isActive: true,
        vehiclePhotoUrl: d.vehiclePhotoUrl,
        registeredAt: new Date().toISOString(),
      });
    }

    setTimeout(() => {
      resumeTimer();
      resetTimer();
      navigateTo('REGISTRATION_CONFIRMATION');
    }, 200);
  };

  const handleOpenPrintSlip = (
    provider?: Worker | TractorService | HarvesterService | MiniTruckService
  ) => {
    setSelectedProviderForReceipt(provider);
    setReceiptType('SERVICE_SEARCH');
    setShowReceipt(true);
  };

  // 9. Matching calculation (Matching Rampur Gram Panchayat & vicinity)
  const matchResults = useMemo(() => {
    if (!searchParams) return [];

    switch (selectedServiceType) {
      case 'person':
        return matchWorkers(workersList, searchParams);
      case 'tractor':
        return matchTractors(tractorsList, searchParams);
      case 'harvester':
        return matchHarvesters(harvestersList, searchParams);
      case 'mini_truck':
        return matchMiniTrucks(trucksList, searchParams);
    }
  }, [searchParams, selectedServiceType, workersList, tractorsList, harvestersList, trucksList]);

  // Synchronise Growing Grass Strip with workflow progress across 5 stages
  const grassStage: GrassProgressStage = useMemo(() => {
    if (showReceipt || currentScreen === 'REGISTRATION_CONFIRMATION') {
      return 5; // Stage 5: Completion / Harvest
    }
    if (
      currentScreen === 'MATCH_RESULTS' ||
      currentScreen === 'PROVIDER_DASHBOARD'
    ) {
      return 4; // Stage 4: Mature plant / Results ready
    }
    if (
      currentScreen === 'WORKER_REGISTER' ||
      currentScreen === 'TRACTOR_REGISTER' ||
      currentScreen === 'HARVESTER_REGISTER' ||
      currentScreen === 'MINI_TRUCK_REGISTER' ||
      currentScreen === 'PROVIDER_LOGIN' ||
      currentScreen === 'SUBCATEGORY_SELECT'
    ) {
      return 3; // Stage 3: Developing plant / Entering details
    }
    if (
      currentScreen === 'SERVICE_SELECT' ||
      currentScreen === 'PROVIDER_HUB'
    ) {
      return 2; // Stage 2: Early growth / Selecting category
    }
    return 1; // Stage 1: Seedling / Initial start
  }, [currentScreen, showReceipt]);

  return (
    <div className="kiosk-app-wrapper">
      {/* Top Header Bar */}
      <Header
        language={language}
        onLanguageChange={(newLang) => {
          setLanguage(newLang);
          resetTimer();
        }}
        currentScreen={currentScreen}
        onNavigateHome={handleNavigateHome}
        onNavigateBack={handleNavigateBack}
        onResetSession={handleResetSession}
        secondsRemaining={secondsRemaining}
        canGoBack={screenHistory.length > 0 && currentScreen !== 'HOME_MENU'}
        isVoiceMuted={isVoiceMutedState}
        onToggleVoice={handleToggleVoice}
        onOpenProviderLogin={() => {
          resetTimer();
          if (loggedInAccount) {
            navigateTo('PROVIDER_DASHBOARD');
          } else {
            navigateTo('PROVIDER_LOGIN');
          }
        }}
        isLoggedIn={Boolean(loggedInAccount)}
      />

      {/* Main Kiosk Content Area */}
      <main className="kiosk-main-content">
        {currentScreen === 'LANGUAGE_SELECT' && (
          <LanguageSelection
            currentLanguage={language}
            onSelectLanguage={handleSelectLanguage}
          />
        )}

        {currentScreen === 'HOME_MENU' && (
          <HomeMenu
            language={language}
            onSelectOption={handleHomeOptionSelect}
          />
        )}

        {currentScreen === 'PROVIDER_HUB' && (
          <ProviderHub
            language={language}
            onSelectAction={handleProviderHubAction}
          />
        )}

        {currentScreen === 'WORKER_REGISTER' && (
          <WorkerRegistration
            language={language}
            onRegisterSuccess={handleWorkerRegistered}
            onCancel={handleNavigateBack}
          />
        )}

        {currentScreen === 'TRACTOR_REGISTER' && (
          <MachineryRegistration
            machineryType="tractor"
            language={language}
            onSubmit={handleMachineryRegistered}
            onCancel={handleNavigateBack}
            onGoToLogin={() => navigateTo('PROVIDER_LOGIN')}
            existingTractors={tractorsList}
          />
        )}

        {currentScreen === 'PROVIDER_LOGIN' && (
          <ProviderLogin
            language={language}
            onLoginSuccess={(account, token) => {
              setLoggedInAccount(account);
              setAuthToken(token);
              navigateTo('PROVIDER_DASHBOARD');
            }}
            onCancel={handleNavigateBack}
            onRegisterNew={() => navigateTo('PROVIDER_HUB')}
          />
        )}

        {currentScreen === 'PROVIDER_DASHBOARD' && loggedInAccount && (
          <ProviderDashboard
            language={language}
            account={loggedInAccount}
            onUpdateAccount={handleUpdateProviderAccount}
            onLogout={() => {
              setLoggedInAccount(null);
              setAuthToken(null);
              handleNavigateHome();
            }}
            onReturnHome={handleNavigateHome}
          />
        )}

        {currentScreen === 'HARVESTER_REGISTER' && (
          <MachineryRegistration
            machineryType="harvester"
            language={language}
            onSubmit={handleMachineryRegistered}
            onCancel={handleNavigateBack}
          />
        )}

        {currentScreen === 'MINI_TRUCK_REGISTER' && (
          <MachineryRegistration
            machineryType="mini_truck"
            language={language}
            onSubmit={handleMachineryRegistered}
            onCancel={handleNavigateBack}
          />
        )}

        {currentScreen === 'REGISTRATION_CONFIRMATION' && activeRegistration && (
          <RegistrationConfirmation
            language={language}
            registration={activeRegistration}
            referenceNumber={registrationRefNumber}
            onDone={handleNavigateHome}
          />
        )}

        {currentScreen === 'SERVICE_SELECT' && (
          <ServiceSelection
            language={language}
            onSelectService={handleSelectService}
          />
        )}

        {currentScreen === 'SUBCATEGORY_SELECT' && (
          <SubcategoryGrid
            language={language}
            serviceType={selectedServiceType}
            onSelectSubcategory={handleSelectSubcategory}
          />
        )}

        {currentScreen === 'MATCH_RESULTS' && searchParams && (
          <MatchResults
            language={language}
            serviceType={selectedServiceType}
            queryParams={searchParams}
            referenceNumber={searchReferenceNumber}
            results={matchResults}
            onPrintSlip={handleOpenPrintSlip}
            onModifySearch={() => navigateTo('SUBCATEGORY_SELECT')}
          />
        )}
      </main>

      {/* Idle Countdown Warning Dialog */}
      {isWarning && (
        <IdleWarningModal
          language={language}
          secondsRemaining={secondsRemaining}
          onExtendSession={resetTimer}
        />
      )}

      {/* Printable Receipt Modal & Print Area */}
      {showReceipt && (
        <PrintableReceipt
          language={language}
          referenceNumber={searchReferenceNumber}
          type={receiptType}
          serviceType={selectedServiceType}
          queryParams={searchParams || undefined}
          selectedProvider={selectedProviderForReceipt}
          allResults={matchResults}
          onClose={() => setShowReceipt(false)}
        />
      )}

      {/* Growing Grass Animated Strip (Bottom of Interface) */}
      <GrowingGrassStrip stage={grassStage} hasError={isWarning} />
    </div>
  );
}

export default App;

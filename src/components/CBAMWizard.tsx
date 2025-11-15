import React, { useState, useEffect, useMemo } from 'react';
import { calculateCBAMEmissions } from '../utils/calculationEngine';
import { validateCBAMSectionsStatus } from '../utils/dataValidationUtils';
import { DataValidationStatus } from '../types/CBAMData';
import { Box, Button, Paper, Tooltip, Typography } from '@mui/material';
import StepNavigationHeader from './StepNavigationHeader';
import CompanyInfoStep from './steps/CompanyInfoStep';
import AInstDataStep from './steps/AInstDataStep';
import DProcessesStep from './steps/DProcessesStep';
import CInstEmissionsStep from './steps/CInstEmissionsStep';
import EPurchasedStep from './steps/EPurchasedStep';
import BEmInstStep from './steps/BEmInstStep';
import EnergyFuelDataStep from './steps/EnergyFuelDataStep';
import ProcessProductionDataStep from './steps/ProcessProductionDataStep';
import ProductionStep from './steps/ProductionStep';
import PurchasedPrecursorsForm from './purchased-precursors/PurchasedPrecursorsForm';
import ResultsExportStep from './steps/ResultsExportStep';
import { CBAMData } from '../types/CBAMData';
import { DEFAULT_AINST_DATA } from '../types/AInstDataTypes';
import { DEFAULT_DPROCESSES_DATA } from '../types/DProcessesTypes';
import { E_PURCHASED_DEFAULTS } from '../types/EPurchasedTypes';
import { C_INST_EMISSIONS_DEFAULTS } from '../types/CInstEmissionsTypes';
import { F_EMISSIONS_DEFAULTS } from '../types/FEmissionsTypes';
import { exportAndDownloadExcel } from '../utils/excelExport';
import { exportAndDownloadPDF } from '../utils/pdfExport';
import { exportAndDownloadCSV } from '../utils/csvExport';
import { printCBAMData } from '../utils/printExport';
import { validateAInstData } from '../utils/aInstDataCalculationEngine';

const steps = [
  'Podaci o kompaniji',
  'Podaci o instalaciji',
  'Izvori emisija',
  'Bilans emisija',
  'Energija i gorivo',
  'Proizvodnja',
  'Kupljeni prekursori',
  'Pregled i izvoz'
];

const CBAMWizard: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [validationStatus, setValidationStatus] = useState<DataValidationStatus>({
    isValid: true,
    errors: [],
    warnings: [],
    hasMissingData: false,
    hasInconsistentData: false
  });
  const [cbamData, setCBAMData] = useState<CBAMData>({
    companyInfo: {
      companyName: '',
      companyAddress: '',
      companyContactPerson: '',
      companyPhone: '',
      companyEmail: ''
    },

    reportConfig: {
      reportingPeriod: '',
      installationId: '',
      installationName: '',
      installationCountry: '',
      installationAddress: ''
    },

    installationDetails: {
      installationType: '',
      mainActivity: '',
      cnCode: '',
      productionCapacity: 0,
      annualProduction: 0,
      // A_InstData additions
      startDate: '',
      endDate: '',
      installationName: '',
      installationEnglishName: '',
      streetAndNumber: '',
      postalCode: '',
      poBox: '',
      city: '',
      country: '',
      unlocode: '',
      authorizedRepresentativeName: '',
      authorizedRepresentativeEmail: '',
      authorizedRepresentativeTelephone: '',
      economicActivity: '',
      verifierStreetAndNumber: '',
      verifierCity: '',
      verifierCountry: '',
      aggregatedGoods: [],
      productionProcesses: []
    },

    aInstData: DEFAULT_AINST_DATA,
    dProcessesData: DEFAULT_DPROCESSES_DATA,
    ePurchased: E_PURCHASED_DEFAULTS,
    cInstEmissions: C_INST_EMISSIONS_DEFAULTS,
    fEmissions: F_EMISSIONS_DEFAULTS,
    emissionInstallationData: {
      emissions: [],
      totalDirectCO2Emissions: 0,
      totalIndirectCO2Emissions: 0,
      totalCO2Emissions: 0,
      totalCH4Emissions: 0,
      totalN2OEmissions: 0,
      totalGHGEmissions: 0,
      reportingPeriod: ''
    },
    emissionFactors: [],
    energyFuelData: [],
    processProductionData: [],
    purchasedPrecursors: {
      precursors: [],
      totalDirectEmbeddedEmissions: 0,
      totalIndirectEmbeddedEmissions: 0,
      totalEmbeddedEmissions: 0,
      reportingPeriod: ''
    },
    calculationResults: {
      totalDirectCO2Emissions: 0,
      totalProcessEmissions: 0,
      totalEmissions: 0,
      specificEmissions: 0,
      totalEnergy: 0,
      renewableShare: 0,
      importedRawMaterialShare: 0,
      embeddedEmissions: 0,
      cumulativeEmissions: 0,
      directEmissionsByGasType: { co2: 0, ch4: 0, n2o: 0, otherGwp: 0, total: 0 },
      biogenicCO2Emissions: 0,
      processEmissionsByGasType: { co2: 0, ch4: 0, n2o: 0, otherGwp: 0, total: 0 },
      importedRawMaterialShareByCountry: { total: 0, byCountry: {} },
          importedRawMaterialShareByMaterial: { total: 0, byMaterial: {} },
      embeddedEmissionsByGasType: { co2: 0, ch4: 0, n2o: 0, otherGwp: 0, total: 0 },
      importedMaterialEmbeddedEmissions: { total: 0, byMaterial: {} },
      transportEmissions: 0,
      purchasedPrecursorsEmbeddedEmissions: 0
    }
  });

  // One-way sync: map flat InstallationDetails into structured A_InstData where empty
  useEffect(() => {
    const inst = cbamData.installationDetails || {} as any;
    const a = cbamData.aInstData || DEFAULT_AINST_DATA;
    const updated = { ...a } as any;

    // Reporting period
    if (inst.startDate && !updated.reportingPeriod?.startDate) {
      updated.reportingPeriod = { ...(updated.reportingPeriod || {}), startDate: inst.startDate };
    }
    if (inst.endDate && !updated.reportingPeriod?.endDate) {
      updated.reportingPeriod = { ...(updated.reportingPeriod || {}), endDate: inst.endDate };
    }

    // Installation identification
    const ii = updated.installationIdentification || {};
    updated.installationIdentification = {
      ...ii,
      installationId: ii.installationId || cbamData.reportConfig.installationId || '',
      installationName: ii.installationName || inst.installationName || '',
      installationEnglishName: ii.installationEnglishName || inst.installationEnglishName || '',
      installationType: ii.installationType || inst.installationType || '',
      mainActivity: ii.mainActivity || inst.mainActivity || '',
      cnCode: ii.cnCode || inst.cnCode || '',
      productionCapacity: ii.productionCapacity || inst.productionCapacity || 0,
      annualProduction: ii.annualProduction || inst.annualProduction || 0,
      economicActivity: ii.economicActivity || inst.economicActivity || ''
    };

    // Address
    const ia = updated.installationAddress || {};
    updated.installationAddress = {
      ...ia,
      streetAndNumber: ia.streetAndNumber || inst.streetAndNumber || '',
      postalCode: ia.postalCode || inst.postalCode || '',
      poBox: ia.poBox || inst.poBox || '',
      city: ia.city || inst.city || '',
      country: ia.country || inst.country || '',
      unlocode: ia.unlocode || inst.unlocode || '',
      latitude: ia.latitude || inst.latitude || 0,
      longitude: ia.longitude || inst.longitude || 0
    };

    // Authorized representative
    const ar = updated.authorizedRepresentative || {};
    updated.authorizedRepresentative = {
      ...ar,
      name: ar.name || inst.authorizedRepresentativeName || '',
      email: ar.email || inst.authorizedRepresentativeEmail || '',
      telephone: ar.telephone || inst.authorizedRepresentativeTelephone || ''
    };

    // Verifier
    if (cbamData.installationDetails?.verifierCompanyName || cbamData.installationDetails?.verifierName) {
      const vi = updated.verifierInformation || {};
      updated.verifierInformation = {
        ...vi,
        companyName: vi.companyName || inst.verifierCompanyName || '',
        streetAndNumber: vi.streetAndNumber || inst.verifierStreetAndNumber || '',
        city: vi.city || inst.verifierCity || '',
        postalCode: vi.postalCode || inst.verifierPostalCode || '',
        country: vi.country || inst.verifierCountry || '',
        authorizedRepresentative: vi.authorizedRepresentative || inst.verifierAuthorizedRepresentative || '',
        email: vi.email || inst.verifierEmail || '',
        telephone: vi.telephone || inst.verifierTelephone || '',
        fax: vi.fax || inst.verifierFax || '',
        accreditationMemberState: vi.accreditationMemberState || inst.accreditationMemberState || '',
        accreditationBodyName: vi.accreditationBodyName || inst.accreditationBodyName || '',
        accreditationRegistrationNumber: vi.accreditationRegistrationNumber || inst.accreditationRegistrationNumber || '',
        verificationDate: vi.verificationDate || inst.verificationDate || ''
      };
    }

    if (JSON.stringify(a) !== JSON.stringify(updated)) {
      setCBAMData(prev => ({ ...prev, aInstData: updated }));
    }
  }, [cbamData.installationDetails]);

  

  const validateCurrentStep = React.useCallback((step: number): DataValidationStatus => {
    switch (step) {
      case 0:
        return validateCBAMSectionsStatus(cbamData, ['companyInfo']);
      case 1:
        {
          const v = validateAInstData(cbamData.aInstData || DEFAULT_AINST_DATA);
          return {
            isValid: v.isValid,
            errors: v.errors.map(e => e.message),
            warnings: v.warnings.map(w => w.message),
            hasMissingData: v.errors.length > 0,
            hasInconsistentData: v.warnings.length > 0
          };
        }
      case 2:
        return { isValid: true, errors: [], warnings: [], hasMissingData: false, hasInconsistentData: false };
      case 3:
        return validateCBAMSectionsStatus(cbamData, ['cInstEmissions']);
      case 4:
        return validateCBAMSectionsStatus(cbamData, ['energyFuelData']);
      case 5:
        return validateCBAMSectionsStatus(cbamData, ['dProcessesData', 'processProductionData']);
      case 6:
        return validateCBAMSectionsStatus(cbamData, ['ePurchased']);
      case 7:
        return { isValid: true, errors: [], warnings: [], hasMissingData: false, hasInconsistentData: false };
      default:
        return { isValid: true, errors: [], warnings: [], hasMissingData: false, hasInconsistentData: false };
    }
  }, [cbamData]);

  const handleNext = () => {
    const validation = validateCurrentStep(activeStep);
    setValidationStatus(validation);
    
    if (validation.isValid) {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
  };

  const updateCBAMData = (stepData: Partial<CBAMData>) => {
    setCBAMData(prevData => ({
      ...prevData,
      ...stepData
    }));
  };

  // Update calculation results whenever relevant data changes
  useEffect(() => {
    const updatedResults = calculateCBAMEmissions(cbamData);
    setCBAMData(prevData => ({
      ...prevData,
      calculationResults: updatedResults
    }));
  }, [cbamData]);

  const handleExport = (format: string) => {
    switch (format) {
      case 'excel':
        exportAndDownloadExcel(cbamData, cbamData.calculationResults);
        break;
      case 'pdf':
        exportAndDownloadPDF(cbamData, cbamData.calculationResults);
        break;
      case 'csv':
        exportAndDownloadCSV(cbamData, cbamData.calculationResults);
        break;
      case 'print':
        printCBAMData(cbamData, cbamData.calculationResults);
        break;
      default:
        console.error('Unknown export format:', format);
    }
  };

  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return <CompanyInfoStep data={cbamData.companyInfo} updateData={(data) => updateCBAMData({ companyInfo: data })} validationStatus={validationStatus} />;
      case 1:
        return <AInstDataStep data={cbamData.aInstData ?? DEFAULT_AINST_DATA} updateData={(data) => updateCBAMData({ aInstData: data })} validationStatus={validationStatus as any} />;
      case 2:
        return <BEmInstStep 
          data={cbamData.bEmInstData} 
          updateData={(data) => updateCBAMData({ bEmInstData: data })} 
          installationDetails={cbamData.installationDetails} 
          validationStatus={validationStatus} 
          cInstEmissions={cbamData.cInstEmissions ?? C_INST_EMISSIONS_DEFAULTS} 
          updateCInstEmissions={(data) => updateCBAMData({ cInstEmissions: data })}
        />;
      case 3:
        return <CInstEmissionsStep data={cbamData} onUpdate={(data) => setCBAMData(data)} />;
      case 4:
        return <EnergyFuelDataStep data={cbamData.energyFuelData} updateData={(data) => updateCBAMData({ energyFuelData: data })} emissionFactors={cbamData.emissionFactors} validationStatus={validationStatus} />;
      case 5:
        return (
          <ProductionStep
            dData={cbamData.dProcessesData ?? DEFAULT_DPROCESSES_DATA}
            ppData={cbamData.processProductionData}
            emissionFactors={cbamData.emissionFactors}
            validationStatus={validationStatus}
            onUpdateDProcesses={(data) => updateCBAMData({ dProcessesData: data })}
            onUpdateProcessProduction={(data) => {
              const pp = data || [];
              const toTJ = (val: number, unit: string) => {
                if (unit === 'GJ') return (val || 0) / 1000;
                if (unit === 'MWh') return ((val || 0) * 3.6) / 1000;
                return val || 0;
              };
              const efToTJ = (ef: number, unit: string) => {
                if (unit === 't/GJ' || unit === 'tCO2/GJ') return (ef || 0) * 1000;
                if (unit === 't/MWh' || unit === 'tCO2/MWh') return ((ef || 0) * 1000) / 3.6;
                return ef || 0;
              };
              const dProcs = pp.map((p, idx) => {
                const total = Number(p.totalProductionWithinInstallation ?? p.productionQuantity ?? p.productionAmount ?? 0) || 0;
                const market = Number(p.producedForMarket ?? 0) || 0;
                const ms = Number(p.marketSharePercent ?? (total > 0 ? Math.min(100, Math.max(0, (market / total) * 100)) : 0)) || 0;
                const mhUnit = String(p.measurableHeatData?.unit || '');
                const mhQtyTJ = toTJ(Number(p.measurableHeatData?.quantity || 0), mhUnit);
                const mhImpTJ = toTJ(Number(p.measurableHeatData?.imported || 0), mhUnit);
                const mhExpTJ = toTJ(Number(p.measurableHeatData?.exported || 0), mhUnit);
                const mhEfTJ = efToTJ(Number(p.measurableHeatData?.emissionFactor || 0), String(p.measurableHeatData?.emissionFactorUnit || ''));
                const elUnit = String(p.electricityUnit || 'MWh');
                const elEFUnit = String(p.electricityEmissionFactorUnit || 't/MWh');
                const expUnit = String(p.electricityExportedUnit || 'MWh');
                const expEFUnit = String(p.electricityExportedEmissionFactorUnit || 't/MWh');
                return {
                  id: `process-${idx + 1}`,
                  processNumber: idx + 1,
                  name: String(p.processName || ''),
                  productionRoute: String(p.processType || ''),
                  unit: String(p.unit || 't'),
                  amounts: total,
                  producedForMarket: market,
                  shareProducedForMarket: ms,
                  totalProductionOnlyForMarket: !!p.isProductionOnlyForMarket,
                  consumedInOtherProcesses: [],
                  consumedForNonCBAMGoods: Number(p.nonCBAMAmount || 0) || 0,
                  controlTotal: Number(p.processEmissions || 0) || 0,
                  directlyAttributableEmissions: { applicable: Number(p.processEmissions || 0) > 0, amount: Number(p.processEmissions || 0) || 0, unit: 'tCO2e', calculationMethod: '', dataSource: '' },
                  measurableHeat: { applicable: !!p.applicableElements?.measurableHeat, netAmount: mhQtyTJ, unit: 'TJ', emissionFactor: mhEfTJ, emissionFactorUnit: 'tCO2/TJ', imported: mhImpTJ, exported: mhExpTJ, },
                  wasteGases: { applicable: !!p.applicableElements?.wasteGases, amount: 0, unit: 'TJ', emissionFactor: 0, emissionFactorUnit: 'tCO2/TJ', imported: 0, exported: 0 },
                  indirectEmissions: { applicable: !!p.applicableElements?.indirectEmissions, electricityConsumption: Number(p.electricityConsumption || 0) || 0, electricityUnit: elUnit === 'kWh' ? 'kWh' : elUnit === 'GJ' ? 'GJ' : 'MWh', emissionFactor: Number(p.electricityEmissionFactor || 0) || 0, emissionFactorUnit: elEFUnit === 't/kWh' ? 'tCO2/kWh' : elEFUnit === 't/GJ' ? 'tCO2/GJ' : 'tCO2/MWh', emissionFactorSource: '', emissionFactorMethod: '' },
                  electricityExported: { applicable: Number(p.electricityExportedAmount || 0) > 0, exportedAmount: Number(p.electricityExportedAmount || 0) || 0, unit: expUnit === 'kWh' ? 'kWh' : expUnit === 'GJ' ? 'GJ' : 'MWh', emissionFactor: Number(p.electricityExportedEmissionFactor || 0) || 0, emissionFactorUnit: expEFUnit === 't/kWh' ? 'tCO2/kWh' : expEFUnit === 't/GJ' ? 'tCO2/GJ' : 'tCO2/MWh' },
                  inputOutputMatrix: { processToProcess: [], processToProduct: [], precursorConsumption: [], totalInputs: [], totalOutputs: [], netProduction: [], matrixSize: 0, goodsProduced: [], precursors: [] },
                  validationStatus: { isComplete: false, missingFields: [], errors: [], warnings: [], completenessPercentage: 0, productionDataComplete: false, emissionsDataComplete: false, inputOutputMatrixComplete: false, calculationsValid: false },
                  calculatedEmissions: { directEmissionsTotal: 0, directEmissionsPerUnit: 0, indirectEmissionsTotal: 0, indirectEmissionsPerUnit: 0, heatEmissionsTotal: 0, heatEmissionsPerUnit: 0, wasteGasEmissionsTotal: 0, wasteGasEmissionsPerUnit: 0, electricityExportCredit: 0, netAttributedEmissions: 0, netAttributedEmissionsPerUnit: 0, specificEmbeddedEmissions: 0, uncertaintyPercentage: 0, confidenceInterval: [0, 0] },
                  excelRowMapping: {}
                } as any;
              });
              const dps = cbamData.dProcessesData ?? DEFAULT_DPROCESSES_DATA;
              const merged = { 
                ...dps,
                productionProcesses: dProcs,
                processSummary: {
                  totalProcesses: dProcs.length,
                  totalProduction: dProcs.reduce((s, p: any) => s + (p.amounts || 0), 0),
                  totalAttributedEmissions: dProcs.reduce((s, p: any) => s + (p.calculatedEmissions?.netAttributedEmissions || 0), 0),
                  averageSEE: dProcs.length ? dProcs.reduce((s, p: any) => s + (p.calculatedEmissions?.specificEmbeddedEmissions || 0), 0) / dProcs.length : 0,
                  processesWithCompleteData: dProcs.filter((p: any) => !!p.name && !!p.unit && (p.amounts || 0) > 0).length,
                  processesWithValidCalculations: dProcs.length
                }
              };
              updateCBAMData({ processProductionData: data, dProcessesData: merged });
            }}
          />
        );
      case 6:
        return <EPurchasedStep data={cbamData} onUpdate={(data) => setCBAMData(data)} />;
      case 7:
        return <ResultsExportStep data={cbamData} calculationResults={cbamData.calculationResults} onExport={handleExport} />;
      default:
        return 'Unknown step';
    }
  };

  const currentStepValidation = useMemo(() => {
    return validateCurrentStep(activeStep);
  }, [activeStep, validateCurrentStep]);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <StepNavigationHeader
        activeStep={activeStep}
        totalSteps={steps.length}
        validationStatus={validationStatus}
        onStepChange={setActiveStep}
        title="CBAM Kalkulator Emisija (Instalacije)"
        subtitle="Izračun i izvještaj o ugrađenim emisijama"
      />
      
      <Box sx={{ p: { xs: 2, sm: 3, md: 4 }, maxWidth: 'lg', mx: 'auto' }}>
        <Paper 
          elevation={2} 
        sx={{ 
          p: { xs: 2, sm: 3, md: 4 }, 
          borderRadius: 3,
          minHeight: '60vh'
          }}
        >
          <Box className="wizard-step">
            {getStepContent(activeStep)}
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4, pt: 3, borderTop: 1, borderColor: 'divider' }}>
            <Button
              variant="outlined"
              startIcon={<span>←</span>}
              disabled={activeStep === 0}
              onClick={handleBack}
              sx={{ minWidth: 120 }}
            >
              Nazad
            </Button>
            
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              {activeStep === steps.length - 1 ? (
                <Button 
                  variant="contained" 
                  onClick={handleReset}
                  startIcon={<span>🔄</span>}
                  sx={{ minWidth: 120 }}
                >
                  Poništi
                </Button>
              ) : (
                <Button 
                  variant="contained" 
                  onClick={handleNext}
                  endIcon={<span>→</span>}
                  sx={{ minWidth: 120 }}
                  disabled={!currentStepValidation.isValid}
                >
                  Dalje
                </Button>
              )}
              {!currentStepValidation.isValid && (
                <Tooltip
                  title={(
                    <Box sx={{ maxWidth: 360 }}>
                      <Typography variant="caption" sx={{ fontWeight: 600 }}>Obavezna polja</Typography>
                      {currentStepValidation.errors.slice(0, 6).map((msg, i) => (
                        <Typography key={`req-${i}`} variant="caption" display="block">{msg}</Typography>
                      ))}
                      {currentStepValidation.errors.length > 6 && (
                        <Typography variant="caption" display="block">{`+ još ${currentStepValidation.errors.length - 6}…`}</Typography>
                      )}
                    </Box>
                  )}
                >
                  <Box sx={{ color: 'error.main', fontSize: 12, cursor: 'help' }}>
                    Riješi greške prije nastavka
                  </Box>
                </Tooltip>
              )}
            </Box>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default CBAMWizard;
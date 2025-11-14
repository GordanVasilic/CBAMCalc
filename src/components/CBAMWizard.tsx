import React, { useState, useEffect, useMemo } from 'react';
import { calculateCBAMEmissions } from '../utils/calculationEngine';
import { validateCBAMSectionsStatus } from '../utils/dataValidationUtils';
import { DataValidationStatus } from '../types/CBAMData';
import { Box, Button, Paper } from '@mui/material';
import StepNavigationHeader from './StepNavigationHeader';
import CompanyInfoStep from './steps/CompanyInfoStep';
import ReportConfigStep from './steps/ReportConfigStep';
import InstallationDetailsStep from './steps/InstallationDetailsStep';
import AInstDataStep from './steps/AInstDataStep';
import DProcessesStep from './steps/DProcessesStep';
import CInstEmissionsStep from './steps/CInstEmissionsStep';
import EPurchasedStep from './steps/EPurchasedStep';
import BEmInstStep from './steps/BEmInstStep';
import EnergyFuelDataStep from './steps/EnergyFuelDataStep';
import ProcessProductionDataStep from './steps/ProcessProductionDataStep';
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

const steps = [
  'Podaci o kompaniji',
  'Konfiguracija izvještaja',
  'Detalji o instalaciji',
  'A_InstData - Podaci o instalaciji',
  'D_Processes - Procesi proizvodnje',
  'C_InstEmissions - Emisije i energija',
  'E_Purchased - Kupljeni prekursori',
  'B_EmInst - Izvori emisija',
  'Energija i gorivo',
  'Proces i proizvodnja',
  'Nabavljeni prekursori',
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

  const validateCurrentStep = React.useCallback((step: number): DataValidationStatus => {
    switch (step) {
      case 0: // Company Info
        return validateCBAMSectionsStatus(cbamData, ['companyInfo']);
      case 1: // Report Config
        return validateCBAMSectionsStatus(cbamData, ['reportConfig']);
      case 2: // Installation Details
        return validateCBAMSectionsStatus(cbamData, ['installationDetails']);
      case 3:
        return { isValid: true, errors: [], warnings: [], hasMissingData: false, hasInconsistentData: false };
      case 4:
        return { isValid: true, errors: [], warnings: [], hasMissingData: false, hasInconsistentData: false };
        // No strict validations for this step yet
      case 5: // C_InstEmissions - Emissions and Energy Balance
        return validateCBAMSectionsStatus(cbamData, ['cInstEmissions']);
      case 6: // E_Purchased - Purchased Precursors
        return validateCBAMSectionsStatus(cbamData, ['ePurchased']);
      case 7: // B_EmInst - Emission Sources
        return validateCBAMSectionsStatus(cbamData, ['bEmInstData']);
      case 8: // Energy Fuel Data
        return validateCBAMSectionsStatus(cbamData, ['energyFuelData']);
      case 9: // Process Production Data
        return validateCBAMSectionsStatus(cbamData, ['processProductionData']);
      case 10: // Purchased Precursors (legacy)
        return validateCBAMSectionsStatus(cbamData, ['purchasedPrecursors']);
      case 11: // Results
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
        return <ReportConfigStep data={cbamData.reportConfig} updateData={(data) => updateCBAMData({ reportConfig: data })} validationStatus={validationStatus} />;
      case 2:
        return <InstallationDetailsStep data={cbamData.installationDetails} updateData={(data) => updateCBAMData({ installationDetails: data })} validationStatus={validationStatus} />;
      case 3:
        return <AInstDataStep data={cbamData.aInstData ?? DEFAULT_AINST_DATA} updateData={(data) => updateCBAMData({ aInstData: data })} validationStatus={validationStatus as any} />;
      case 4:
        return <DProcessesStep data={cbamData.dProcessesData ?? DEFAULT_DPROCESSES_DATA} onUpdate={(data) => updateCBAMData({ dProcessesData: data })} />;
      case 5:
        return <CInstEmissionsStep data={cbamData} onUpdate={(data) => setCBAMData(data)} />;
      case 6:
        return <EPurchasedStep data={cbamData} onUpdate={(data) => setCBAMData(data)} />;
      case 7:
        return <BEmInstStep data={cbamData.bEmInstData} updateData={(data) => updateCBAMData({ bEmInstData: data })} installationDetails={cbamData.installationDetails} validationStatus={validationStatus} />;
      case 8:
        return <EnergyFuelDataStep data={cbamData.energyFuelData} updateData={(data) => updateCBAMData({ energyFuelData: data })} emissionFactors={cbamData.emissionFactors} validationStatus={validationStatus} />;
      case 9:
        return <ProcessProductionDataStep data={cbamData.processProductionData} updateData={(data) => updateCBAMData({ processProductionData: data })} emissionFactors={cbamData.emissionFactors} validationStatus={validationStatus} />;
      case 10:
        return <PurchasedPrecursorsForm data={cbamData.purchasedPrecursors} updateData={(data) => updateCBAMData({ purchasedPrecursors: data })} validationStatus={validationStatus} />;
      case 11:
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
        title="CBAM čarobnjak komunikacijskog predloška"
        subtitle="Izrada izvještaja o ugrađenim emisijama"
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
                <Box sx={{ color: 'error.main', fontSize: 12 }}>
                  Riješi greške prije nastavka
                </Box>
              )}
            </Box>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default CBAMWizard;
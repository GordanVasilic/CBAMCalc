import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Switch,
  FormControlLabel,
  Divider
} from '@mui/material';
import { Tooltip } from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Calculate as CalculateIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';

import {
  CInstEmissionsData,
  C_INST_EMISSIONS_DEFAULTS,
  DATA_QUALITY_OPTIONS,
  DEFAULT_VALUES_JUSTIFICATION_OPTIONS,
  QUALITY_ASSURANCE_OPTIONS
} from '../../types/CInstEmissionsTypes';
import { CBAMData } from '../../types/CBAMData';
import { calculateCInstEmissions } from '../../utils/cInstEmissionsCalculationEngine';

interface CInstEmissionsStepProps {
  data: CBAMData;
  onUpdate: (data: CBAMData) => void;
}

const CInstEmissionsStep: React.FC<CInstEmissionsStepProps> = ({ data, onUpdate }) => {
  const [localData, setLocalData] = useState<CInstEmissionsData>(
    data.cInstEmissions || C_INST_EMISSIONS_DEFAULTS
  );
  const [validation, setValidation] = useState<any>(null);
  const [autoFields, setAutoFields] = useState<string[]>([]);
  
  const [useManualMode, setUseManualMode] = useState(false);

  const performCalculations = useCallback((currentData: CInstEmissionsData) => {
    try {
      const result = calculateCInstEmissions(currentData, data.bEmInstData);
      setValidation(result.data.validationStatus);
      setAutoFields(result.autoCalculatedFields || []);
      return result.data;
    } catch (error) {
      setValidation({ isValid: false, errors: ['Calculation error occurred'], warnings: [], completenessScore: 0 });
      return currentData;
    }
  }, [data.bEmInstData]);

  const calculatedData = useMemo(() => {
    return performCalculations(localData);
  }, [localData, performCalculations]);

  useEffect(() => {
    onUpdate({
      ...data,
      cInstEmissions: calculatedData
    });
  }, [calculatedData, onUpdate, data]);

  const handleFuelBalanceChange = (field: keyof typeof localData.fuelBalance, value: number) => {
    setLocalData(prev => ({
      ...prev,
      fuelBalance: {
        ...prev.fuelBalance,
        [field]: value,
        manualEntries: useManualMode ? {
          ...prev.fuelBalance.manualEntries,
          [field]: value
        } : prev.fuelBalance.manualEntries
      }
    }));
  };

  const handleEmissionsChange = (field: keyof typeof localData.emissionsBalance, value: number) => {
    setLocalData(prev => ({
      ...prev,
      emissionsBalance: {
        ...prev.emissionsBalance,
        [field]: value,
        manualEntries: useManualMode ? {
          ...prev.emissionsBalance.manualEntries,
          [field]: value
        } : prev.emissionsBalance.manualEntries
      }
    }));
  };

  const handleDataQualityChange = (field: keyof typeof localData.dataQuality, value: string) => {
    setLocalData(prev => ({
      ...prev,
      dataQuality: {
        ...prev.dataQuality,
        [field]: value
      }
    }));
  };

  const handleAdditionalCommentsChange = (value: string) => {
    setLocalData(prev => ({
      ...prev,
      dataQuality: {
        ...prev.dataQuality,
        additionalComments: value
      }
    }));
  };

  const handleModeToggle = () => {
    setUseManualMode(!useManualMode);
    if (!useManualMode) {
      // When switching to manual mode, clear manual entries
      setLocalData(prev => ({
        ...prev,
        fuelBalance: {
          ...prev.fuelBalance,
          manualEntries: {}
        },
        emissionsBalance: {
          ...prev.emissionsBalance,
          manualEntries: {}
        },
        metadata: {
          ...prev.metadata,
          calculationMethod: 'manual'
        }
      }));
    } else {
      // When switching to auto mode, reset to auto calculation
      setLocalData(prev => ({
        ...prev,
        metadata: {
          ...prev.metadata,
          calculationMethod: 'auto'
        }
      }));
    }
  };

  const handleDataSourceToggle = () => {
    const newSource = localData.metadata.dataSource === 'B_EmInst' ? 'manual' : 'B_EmInst';
    setLocalData(prev => ({
      ...prev,
      metadata: {
        ...prev.metadata,
        dataSource: newSource
      }
    }));
  };

  const getValidationStatus = () => {
    if (!validation) return null;
    
    return (
      <Box sx={{ mb: 2 }}>
        <Grid container spacing={1} alignItems="center">
          <Grid item>
            <Tooltip title="Procenat popunjenosti i valjanosti podataka">
              <Chip
                icon={validation.isValid ? <CheckCircleIcon /> : <WarningIcon />}
                label={`${validation.completenessScore.toFixed(0)}% Popunjeno`}
                color={validation.isValid ? 'success' : 'warning'}
                size="small"
              />
            </Tooltip>
          </Grid>
          {validation.errors.length > 0 && (
            <Grid item>
              <Tooltip title="Broj grešaka u unosu i proračunu">
                <Chip
                  label={`${validation.errors.length} Grešaka`}
                  color="error"
                  size="small"
                />
              </Tooltip>
            </Grid>
          )}
          {validation.warnings.length > 0 && (
            <Grid item>
              <Tooltip title="Broj upozorenja i nekonzistentnosti">
                <Chip
                  label={`${validation.warnings.length} Upozorenja`}
                  color="warning"
                  size="small"
                />
              </Tooltip>
            </Grid>
          )}
        </Grid>
      </Box>
    );
  };

  const renderValidationMessages = () => {
    if (!validation) return null;

    return (
      <Box sx={{ mt: 2 }}>
        {validation.errors.map((error: string, index: number) => (
          <Alert key={`error-${index}`} severity="error" sx={{ mb: 1 }}>
            {error}
          </Alert>
        ))}
        {validation.warnings.map((warning: string, index: number) => (
          <Alert key={`warning-${index}`} severity="warning" sx={{ mb: 1 }}>
            {warning}
          </Alert>
        ))}
      </Box>
    );
  };

  const getStatusColor = (status: string) => {
    if (status === 'OK') return 'success';
    if (status === 'Warning') return 'warning';
    if (status === 'Error') return 'error';
    return 'default';
  };

  const renderCrossSheetSummary = () => {
    const bTotals = data.bEmInstData?.totals || {
      totalCO2eFossil: 0,
      totalCO2eBiomass: 0,
      totalCO2eNonSustainableBiomass: 0,
      totalPFCEmissions: 0,
      totalEnergyContentFossil: 0,
      totalEnergyContentBiomass: 0
    } as any;
    const bCO2e = (bTotals.totalCO2eFossil || 0) + (bTotals.totalCO2eBiomass || 0) + (bTotals.totalCO2eNonSustainableBiomass || 0) + (bTotals.totalPFCEmissions || 0);
    const cDirect = localData.emissionsBalance.totalDirectEmissions || 0;
    const cBiomass = localData.emissionsBalance.biomassEmissions || 0;
    const cFuel = localData.fuelBalance.totalFuelInput || 0;
    const bEnergy = (bTotals.totalEnergyContentFossil || 0) + (bTotals.totalEnergyContentBiomass || 0);

    const pct = (a: number, b: number) => (b > 0 ? Math.abs(a - b) / b : 0);

    const directDiff = pct(cDirect, bCO2e);
    const directStatus = directDiff > 0.6 ? 'Error' : directDiff > 0.3 ? 'Warning' : 'OK';

    const biomassDiff = pct(cBiomass, bTotals.totalCO2eBiomass || 0);
    const biomassStatus = biomassDiff > 0.6 ? 'Error' : biomassDiff > 0.3 ? 'Warning' : 'OK';

    const fuelDiff = pct(cFuel, bEnergy);
    const fuelStatus = fuelDiff > 0.5 ? 'Warning' : fuelDiff > 0.3 ? 'Info' : 'OK';

    return (
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="subtitle1" gutterBottom>Unakrsni sažetak (C ↔ B)</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Typography variant="body2">Direktne emisije C vs B</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Tooltip title="Razlika C direktnih emisija vs zbroj B CO2e; pragovi 30%/60%">
                  <Chip label={directStatus} color={getStatusColor(directStatus) as any} size="small" />
                </Tooltip>
                <Typography variant="caption">Δ {(directDiff * 100).toFixed(1)}%</Typography>
              </Box>
              <Typography variant="caption" color="text.secondary">C: {cDirect.toFixed(3)} t | B: {bCO2e.toFixed(3)} t</Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="body2">Biomasa C vs B</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Tooltip title="Razlika C biomase vs B biomase; pragovi 30%/60%">
                  <Chip label={biomassStatus} color={getStatusColor(biomassStatus) as any} size="small" />
                </Tooltip>
                <Typography variant="caption">Δ {(biomassDiff * 100).toFixed(1)}%</Typography>
              </Box>
              <Typography variant="caption" color="text.secondary">C: {cBiomass.toFixed(3)} t | B: {(bTotals.totalCO2eBiomass || 0).toFixed(3)} t</Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="body2">Gorivo C vs energija B</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Tooltip title="Razlika C goriva vs B energijski sadržaj; pragovi 30%/50%">
                  <Chip label={fuelStatus} color={getStatusColor(fuelStatus) as any} size="small" />
                </Tooltip>
                <Typography variant="caption">Δ {(fuelDiff * 100).toFixed(1)}%</Typography>
              </Box>
              <Typography variant="caption" color="text.secondary">C: {cFuel.toFixed(3)} | B: {bEnergy.toFixed(3)}</Typography>
            </Grid>
          </Grid>
          <Box sx={{ mt: 2 }}>
            {(directStatus !== 'OK' || biomassStatus !== 'OK' || fuelStatus !== 'OK') && (
              <Alert severity={directStatus === 'Error' || biomassStatus === 'Error' ? 'error' : 'warning'}>
                <Box>
                  {directStatus !== 'OK' && (
                    <Typography variant="caption">Provjeri da su direktne emisije u C usklađene sa zbrojem CO2e u B (izvori + PFC). Ažuriraj C ili B podatke kako bi se smanjila razlika.</Typography>
                  )}
                  {biomassStatus !== 'OK' && (
                    <Typography variant="caption" display="block">Uskladi biomasu: provjeri označavanje biomase u B i polje biomase u C.</Typography>
                  )}
                  {fuelStatus !== 'OK' && (
                    <Typography variant="caption" display="block">Gorivo vs energija: uskladi ukupni gorivni unos u C s energijskim sadržajem u B.</Typography>
                  )}
                </Box>
              </Alert>
            )}
          </Box>
        </CardContent>
      </Card>
    );
  };
  

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" gutterBottom>
        C_InstEmissions - Bilans emisija i energije
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Unesite podatke o emisijama i bilans energije za instalaciju. Podaci se mogu uvesti iz B_EmInst ili uneti ručno.
      </Typography>

      {/* Mode and Source Controls */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item>
              <FormControlLabel
                control={
                  <Switch
                    checked={useManualMode}
                    onChange={handleModeToggle}
                  />
                }
                label="Ručni režim proračuna"
              />
            </Grid>
            <Grid item>
              <FormControlLabel
                control={
                  <Switch
                    checked={localData.metadata.dataSource === 'B_EmInst'}
                    onChange={handleDataSourceToggle}
                  />
                }
                label="Uvoz iz B_EmInst"
              />
            </Grid>
            <Grid item>
              <Typography variant="body2" color="text.secondary">
                Režim: {localData.metadata.calculationMethod === 'auto' ? 'Auto' : 'Ručno'}
              </Typography>
            </Grid>
            {autoFields.length > 0 && (
              <Grid item>
                <Tooltip title={`Automatski izračunata polja: ${autoFields.join(', ')}`}>
                  <Chip label={`Auto (${autoFields.length})`} color="info" size="small" />
                </Tooltip>
              </Grid>
            )}
          </Grid>
        </CardContent>
      </Card>

      {getValidationStatus()}
      {renderCrossSheetSummary()}

      {/* Fuel Balance Section */}
      <Accordion defaultExpanded sx={{ mb: 2 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CalculateIcon color="primary" />
            <Typography variant="h6">Bilans goriva (TJ)</Typography>
            
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Ukupan unos goriva"
                type="number"
                value={localData.fuelBalance.totalFuelInput}
                onChange={(e) => handleFuelBalanceChange('totalFuelInput', parseFloat(e.target.value) || 0)}
                InputProps={{}}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Direktno gorivo za CBAM proizvode"
                type="number"
                value={localData.fuelBalance.directFuelCBAM}
                onChange={(e) => handleFuelBalanceChange('directFuelCBAM', parseFloat(e.target.value) || 0)}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Gorivo za električnu energiju"
                type="number"
                value={localData.fuelBalance.fuelForElectricity}
                onChange={(e) => handleFuelBalanceChange('fuelForElectricity', parseFloat(e.target.value) || 0)}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Direktno gorivo za ne‑CBAM proizvode"
                type="number"
                value={localData.fuelBalance.directFuelNonCBAM}
                onChange={(e) => handleFuelBalanceChange('directFuelNonCBAM', parseFloat(e.target.value) || 0)}
                margin="normal"
              />
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Emissions Balance Section */}
      <Accordion defaultExpanded sx={{ mb: 2 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CalculateIcon color="primary" />
            <Typography variant="h6">Bilans GHG emisija (tCO2e)</Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Ukupne CO2 emisije"
                type="number"
                value={localData.emissionsBalance.totalCO2Emissions}
                onChange={(e) => handleEmissionsChange('totalCO2Emissions', parseFloat(e.target.value) || 0)}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Emisije biomase"
                type="number"
                value={localData.emissionsBalance.biomassEmissions}
                onChange={(e) => handleEmissionsChange('biomassEmissions', parseFloat(e.target.value) || 0)}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Ukupne N2O emisije"
                type="number"
                value={localData.emissionsBalance.totalN2OEmissions}
                onChange={(e) => handleEmissionsChange('totalN2OEmissions', parseFloat(e.target.value) || 0)}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Ukupne PFC emisije"
                type="number"
                value={localData.emissionsBalance.totalPFCEmissions}
                onChange={(e) => handleEmissionsChange('totalPFCEmissions', parseFloat(e.target.value) || 0)}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Ukupne direktne emisije"
                type="number"
                value={localData.emissionsBalance.totalDirectEmissions}
                onChange={(e) => handleEmissionsChange('totalDirectEmissions', parseFloat(e.target.value) || 0)}
                InputProps={{}}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Ukupne indirektne emisije"
                type="number"
                value={localData.emissionsBalance.totalIndirectEmissions}
                onChange={(e) => handleEmissionsChange('totalIndirectEmissions', parseFloat(e.target.value) || 0)}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12}>
              <Divider />
              <TextField
                fullWidth
                label="Ukupne emisije"
                type="number"
                value={localData.emissionsBalance.totalEmissions}
                onChange={(e) => handleEmissionsChange('totalEmissions', parseFloat(e.target.value) || 0)}
                InputProps={{}}
                margin="normal"
                sx={{ mt: 2 }}
              />
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Data Quality Section */}
      <Accordion defaultExpanded sx={{ mb: 2 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">Informacije o kvalitetu podataka</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Opšti kvalitet podataka</InputLabel>
                <Select
                  value={localData.dataQuality.generalDataQuality}
                  onChange={(e) => handleDataQualityChange('generalDataQuality', e.target.value)}
                >
                  {DATA_QUALITY_OPTIONS.map(option => (
                    <MenuItem key={option} value={option}>{option}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Obrazloženje podrazumevanih vrednosti</InputLabel>
                <Select
                  value={localData.dataQuality.defaultValuesJustification}
                  onChange={(e) => handleDataQualityChange('defaultValuesJustification', e.target.value)}
                >
                  {DEFAULT_VALUES_JUSTIFICATION_OPTIONS.map(option => (
                    <MenuItem key={option} value={option}>{option}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Obezbeđenje kvaliteta</InputLabel>
                <Select
                  value={localData.dataQuality.qualityAssurance}
                  onChange={(e) => handleDataQualityChange('qualityAssurance', e.target.value)}
                >
                  {QUALITY_ASSURANCE_OPTIONS.map(option => (
                    <MenuItem key={option} value={option}>{option}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Dodatni komentari"
                multiline
                rows={3}
                value={localData.dataQuality.additionalComments || ''}
                onChange={(e) => handleAdditionalCommentsChange(e.target.value)}
                margin="normal"
              />
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {renderValidationMessages()}
    </Box>
  );
};

export default CInstEmissionsStep;

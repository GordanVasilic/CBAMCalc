import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  MenuItem,
  FormHelperText,
  Divider,
  Alert,
  Tooltip,
  Chip
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { EmissionInstallationData, EmissionInstallationDataList, DataValidationStatus } from '../types/CBAMData';
import { monitoringMethods, dataQualityOptions, emissionSourceTypes, emissionFactorUnits } from '../data/codeLists';
import { calculateEmissionInstallationData } from '../utils/calculationEngine';

interface EmissionInstallationStepProps {
  data: EmissionInstallationDataList;
  updateData: (data: EmissionInstallationDataList) => void;
  installationDetails: any;
  validationStatus?: DataValidationStatus;
}

const EmissionInstallationStep: React.FC<EmissionInstallationStepProps> = ({
  data,
  updateData,
  installationDetails,
  validationStatus
}) => {
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Lists centralized in src/data/codeLists.ts: monitoringMethods, dataQualityOptions, emissionSourceTypes
  useEffect(() => {
    // Initialize with empty data if not provided
    if (!data || !data.emissions || data.emissions.length === 0) {
      updateData({
        emissions: [],
        totalDirectCO2Emissions: 0,
        totalIndirectCO2Emissions: 0,
        totalCO2Emissions: 0,
        totalCH4Emissions: 0,
        totalN2OEmissions: 0,
        totalGHGEmissions: 0,
        reportingPeriod: installationDetails?.reportingPeriod || '',
        verificationDate: '',
        verifierName: '',
        verifierAccreditationNumber: ''
      });
    }
  }, []);

  const addEmissionSource = () => {
    const newEmissionSource: EmissionInstallationData = {
      installationId: installationDetails?.installationId || '',
      installationName: installationDetails?.installationName || '',
      installationCountry: installationDetails?.installationCountry || '',
      emissionSourceId: `ES${data.emissions.length + 1}`,
      emissionSourceName: '',
      emissionSourceType: '',
      fuelType: '',
      activityLevel: 0,
      activityUnit: 't',
      emissionFactor: 0,
      emissionFactorUnit: 't/t',
      // Advanced calculation inputs
      calorificValue: 0,
      carbonContent: 0,
      oxidationFactor: 1,
      conversionFactor: 3.667,
      co2Emissions: 0,
      co2EmissionsUnit: 'tCO2',
      ch4Emissions: 0,
      ch4EmissionsUnit: 'tCH4',
      n2oEmissions: 0,
      n2oEmissionsUnit: 'tN2O',
      totalGhgEmissions: 0,
      totalGhgEmissionsUnit: 'tCO2e',
      biomassFraction: 0,
      carbonCaptureRate: 0,
      carbonCaptureUnit: '%',
      carbonStorageRate: 0,
      carbonStorageUnit: '%',
      monitoringMethod: '',
      dataQuality: 'Medium',
      uncertainty: 0,
      notes: ''
    };

    const updatedEmissions = [...data.emissions, newEmissionSource];
    updateData({
      ...data,
      emissions: updatedEmissions
    });
    recalcTotals(updatedEmissions);
  };

  const removeEmissionSource = (index: number) => {
    const updatedEmissions = [...data.emissions];
    updatedEmissions.splice(index, 1);
    updateData({
      ...data,
      emissions: updatedEmissions
    });
    recalcTotals(updatedEmissions);
  };

  const [fieldErrors, setFieldErrors] = useState<Record<number, Record<string, boolean>>>({})

  const getNCVUnit = (activityUnit?: string): string => {
    const au = (activityUnit || '').toLowerCase()
    if (au.includes('nm3')) return 'GJ/1000Nm3'
    if (au === 't' || au === 'kg') return 'GJ/t'
    if (au === 'mwh' || au === 'kwh') return 'GJ/MWh'
    return 'GJ/unit'
  }

  const getCarbonContentUnit = (activityUnit?: string): string => {
    const au = (activityUnit || '').toLowerCase()
    if (au.includes('nm3')) return 'tC/1000Nm3'
    if (au === 't' || au === 'kg') return 'tC/t'
    if (au === 'mwh' || au === 'kwh') return 'tC/MWh'
    return 'tC/unit'
  }

  const isEnergyEFUnit = (unit?: string): boolean => {
    const u = (unit || '').toLowerCase()
    return u.includes('gj') || u.includes('mwh')
  }

  const getDefaultEFUnitForSourceType = (type?: string): string => {
    switch (type) {
      case 'Combustion':
        return 't/GJ'
      case 'Electricity':
        return 'kg/MWh'
      case 'Heat':
      case 'Steam':
        return 't/MWh'
      case 'Transport':
        return 'kg/km'
      case 'Fugitive':
        return 't/h'
      case 'Process':
        return 't/t'
      default:
        return 't/t'
    }
  }

  const updateEmissionSource = (index: number, field: keyof EmissionInstallationData, value: any) => {
    const updatedEmissions = [...data.emissions]
    const original = value
    let newValue = value
    // Clamping and defaults for numeric fields
    if (field === 'oxidationFactor') {
      const num = typeof value === 'number' ? value : parseFloat(value)
      newValue = isNaN(num) ? 1 : Math.min(Math.max(num, 0), 1)
    } else if (field === 'conversionFactor') {
      const num = typeof value === 'number' ? value : parseFloat(value)
      newValue = isNaN(num) || num <= 0 ? 3.667 : num
    } else if (
      field === 'calorificValue' ||
      field === 'carbonContent' ||
      field === 'emissionFactor' ||
      field === 'activityLevel'
    ) {
      const num = typeof value === 'number' ? value : parseFloat(value)
      newValue = isNaN(num) ? 0 : Math.max(num, 0)
    } else if (field === 'biomassFraction') {
      const num = typeof value === 'number' ? value : parseFloat(value)
      const clamped = isNaN(num) ? 0 : Math.max(0, Math.min(100, num))
      newValue = clamped
    }

    updatedEmissions[index] = {
      ...updatedEmissions[index],
      [field]: newValue
    }

    // Smart default EF unit on source type change
    if (field === 'emissionSourceType') {
      const defaultUnit = getDefaultEFUnitForSourceType(String(newValue))
      const currentUnit = updatedEmissions[index].emissionFactorUnit
      if (!currentUnit || currentUnit === 'tCO2/t' || currentUnit === 't/t') {
        updatedEmissions[index].emissionFactorUnit = defaultUnit
      }
    }

    // track visual error when clamp occurred
    const errs = { ...fieldErrors }
    const changed = original !== newValue
    errs[index] = { ...(errs[index] || {}), [String(field)]: changed }
    setFieldErrors(errs)

    // Recalculate CO2 emissions if activity level or emission factor changes
    
    if (
      field === 'activityLevel' ||
      field === 'emissionFactor' ||
      field === 'calorificValue' ||
      field === 'carbonContent' ||
      field === 'oxidationFactor' ||
      field === 'conversionFactor' ||
      field === 'biomassFraction'
    ) {
      const activity = updatedEmissions[index].activityLevel || 0;
      const ef = updatedEmissions[index].emissionFactor || 0;
      let co2 = 0;
      if (ef && ef > 0) {
        co2 = activity * ef;
      } else {
        const ncv = updatedEmissions[index].calorificValue || 0;
        const cc = updatedEmissions[index].carbonContent || 0;
        const oxF = updatedEmissions[index].oxidationFactor ?? 1;
        const convF = updatedEmissions[index].conversionFactor ?? 3.667;
        co2 = activity * ncv * cc * oxF * convF;
      }
      const bio = updatedEmissions[index].biomassFraction || 0;
      if (bio && bio > 0) {
        const frac = Math.min(Math.max(bio, 0), 100) / 100;
        co2 = co2 * (1 - frac);
      }
      updatedEmissions[index].co2Emissions = co2;
    }

    updateData({
      ...data,
      emissions: updatedEmissions
    });
    recalcTotals(updatedEmissions);
  };

  // Recalculate totals helper
  const recalcTotals = (emissions: EmissionInstallationData[]) => {
    const totalCO2 = emissions.reduce((sum, e) => sum + (e.co2Emissions || 0), 0);
    const totalCH4 = emissions.reduce((sum, e) => sum + (e.ch4Emissions || 0), 0);
    const totalN2O = emissions.reduce((sum, e) => sum + (e.n2oEmissions || 0), 0);

    let totalGHG = 0;
    try {
      const { totalEmissions } = calculateEmissionInstallationData({ emissions } as any);
      totalGHG = totalEmissions;
    } catch {
      totalGHG = totalCO2; // fallback
    }

    updateData({
      ...data,
      emissions,
      totalCO2Emissions: totalCO2 + (data.totalIndirectCO2Emissions || 0),
      totalCH4Emissions: totalCH4,
      totalN2OEmissions: totalN2O,
      totalGHGEmissions: totalGHG,
      totalDirectCO2Emissions: totalCO2
    });
  };

  const updateVerificationInfo = (field: string, value: any) => {
    updateData({
      ...data,
      [field]: value
    });
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Podaci o emisijama instalacije (B_EmInst)
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Unesite detaljne informacije o izvorima emisija na ovoj instalaciji.
      </Typography>
      
      {/* Display validation errors if any */}
      {validationStatus && validationStatus.errors.length > 0 && (
        <Alert severity="error" sx={{ mb: 2 }}>
          <Typography variant="h6">Validation Errors</Typography>
          <ul>
            {validationStatus.errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </Alert>
      )}

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Izvori emisija
          </Typography>
          
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={addEmissionSource}
            sx={{ mb: 2 }}
          >
            Dodaj izvor emisija
          </Button>

          {data.emissions.length > 0 && (
            <TableContainer component={Paper} sx={{ mt: 2 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Fuel Type</TableCell>
                    <TableCell>Activity Level</TableCell>
                    <TableCell>Unit</TableCell>
                    <TableCell>Emission Factor</TableCell>
                    <TableCell>EF Unit</TableCell>
                    <TableCell>
                      <Tooltip title="Net calorific value (GJ po jedinici aktivnosti)">
                        <span>NCV (GJ/unit)</span>
                      </Tooltip>
                    </TableCell>
                    <TableCell>
                      <Tooltip title="Carbon content per energy (tC/GJ), koristi se za mass balance">
                        <span>Carbon Content</span>
                      </Tooltip>
                    </TableCell>
                    <TableCell>
                      <Tooltip title="Oxidation factor (udio ugljika oksidiran u CO₂, 0–1)">
                        <span>Oxidation Factor</span>
                      </Tooltip>
                    </TableCell>
                    <TableCell>
                      <Tooltip title="Conversion factor (tCO₂/tC = 44/12 = 3.667)">
                        <span>Conversion Factor</span>
                      </Tooltip>
                    </TableCell>
                    <TableCell>CO₂ Emissions</TableCell>
                    <TableCell>CH4 Emisije</TableCell>
                    <TableCell>CH4 Jedinica</TableCell>
                    <TableCell>N2O Emisije</TableCell>
                    <TableCell>N2O Jedinica</TableCell>
                    <TableCell>Biomasa %</TableCell>
                    <TableCell>Kvaliteta podataka</TableCell>
                    <TableCell>Neizvjesnost %</TableCell>
                    <TableCell>Bilješke</TableCell>
                    <TableCell>Monitoring Method</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.emissions.map((emission, index) => (
                    <TableRow key={index}>
                      {/* existing cells */}
                      <TableCell>
                        <TextField
                          value={emission.emissionSourceId}
                          onChange={(e) => updateEmissionSource(index, 'emissionSourceId', e.target.value)}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          value={emission.emissionSourceName}
                          onChange={(e) => updateEmissionSource(index, 'emissionSourceName', e.target.value)}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          select
                          value={emission.emissionSourceType}
                          onChange={(e) => updateEmissionSource(index, 'emissionSourceType', e.target.value)}
                          size="small"
                          variant="outlined"
                          sx={{ minWidth: 120 }}
                        >
                          {emissionSourceTypes.map((type) => (
                            <MenuItem key={type} value={type}>
                              {type}
                            </MenuItem>
                          ))}
                        </TextField>
                      </TableCell>
                      <TableCell>
                        <TextField
                          value={emission.fuelType}
                          onChange={(e) => updateEmissionSource(index, 'fuelType', e.target.value)}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          type="number"
                          value={emission.activityLevel}
                          onChange={(e) => updateEmissionSource(index, 'activityLevel', parseFloat(e.target.value))}
                          size="small"
                          variant="outlined"
                          InputProps={{ inputProps: { min: 0, step: 0.001 } }}
                          error={Boolean(fieldErrors[index]?.activityLevel)}
                          helperText={fieldErrors[index]?.activityLevel ? 'Vrijednost korigirana (min 0)' : 'Unesite nenegativnu vrijednost'}
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          value={emission.activityUnit}
                          onChange={(e) => updateEmissionSource(index, 'activityUnit', e.target.value)}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          type="number"
                          value={emission.emissionFactor}
                          onChange={(e) => updateEmissionSource(index, 'emissionFactor', parseFloat(e.target.value))}
                          size="small"
                          variant="outlined"
                          InputProps={{ inputProps: { min: 0, step: 0.0001 } }}
                          disabled={(emission.calorificValue ?? 0) > 0 && (emission.carbonContent ?? 0) > 0}
                          error={Boolean(fieldErrors[index]?.emissionFactor)}
                          helperText={(emission.calorificValue ?? 0) > 0 && (emission.carbonContent ?? 0) > 0 ? 'Onemogućeno jer koristite napredne faktore (NCV, C, OxF, ConvF)' : (fieldErrors[index]?.emissionFactor ? 'Vrijednost korigirana (min 0)' : 'Faktor emisije ≥ 0')}
                        />
                      </TableCell>
                      <TableCell>
                        <Tooltip title="Odaberite energijske jedinice ('t/GJ', 't/MWh') kada koristite NCV; masene ('t/t') ili volumenske (npr. 't/1000Nm3') kada NCV nije primjenjiv.">
                          <TextField
                            value={emission.emissionFactorUnit || emissionFactorUnits[0]}
                            onChange={(e) => updateEmissionSource(index, 'emissionFactorUnit', e.target.value)}
                            size="small"
                            select
                            variant="outlined"
                            sx={{ minWidth: 120 }}
                          >
                            {emissionFactorUnits.map((unit) => (
                              <MenuItem key={unit} value={unit}>
                                {unit}
                              </MenuItem>
                            ))}
                          </TextField>
                        </Tooltip>
                      </TableCell>
                      <TableCell>
                        <TextField
                          type="number"
                          value={emission.calorificValue || 0}
                          onChange={(e) => updateEmissionSource(index, 'calorificValue', parseFloat(e.target.value))}
                          size="small"
                          variant="outlined"
                          InputProps={{ inputProps: { min: 0, step: 0.001 } }}
                          disabled={(emission.emissionFactor ?? 0) > 0 || !isEnergyEFUnit(emission.emissionFactorUnit)}
                          error={Boolean(fieldErrors[index]?.calorificValue) && !((emission.emissionFactor ?? 0) > 0 || !isEnergyEFUnit(emission.emissionFactorUnit))}
                          helperText={(emission.emissionFactor ?? 0) > 0 || !isEnergyEFUnit(emission.emissionFactorUnit)
                            ? 'Neprimjenjivo s odabranom EF jedinicom/metodom'
                            : (fieldErrors[index]?.calorificValue ? `Vrijednost korigirana (min 0). Jedinica: ${getNCVUnit(emission.activityUnit)}` : `Jedinica: ${getNCVUnit(emission.activityUnit)}`)}
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          type="number"
                          value={emission.carbonContent || 0}
                          onChange={(e) => updateEmissionSource(index, 'carbonContent', parseFloat(e.target.value))}
                          size="small"
                          variant="outlined"
                          InputProps={{ inputProps: { min: 0, step: 0.001 } }}
                          disabled={(emission.emissionFactor ?? 0) > 0 || !isEnergyEFUnit(emission.emissionFactorUnit)}
                          error={Boolean(fieldErrors[index]?.carbonContent) && !((emission.emissionFactor ?? 0) > 0 || !isEnergyEFUnit(emission.emissionFactorUnit))}
                          helperText={(emission.emissionFactor ?? 0) > 0 || !isEnergyEFUnit(emission.emissionFactorUnit)
                            ? 'Neprimjenjivo s odabranom EF jedinicom/metodom'
                            : (fieldErrors[index]?.carbonContent ? `Vrijednost korigirana (min 0). Jedinica: ${getCarbonContentUnit(emission.activityUnit)}` : `Jedinica: ${getCarbonContentUnit(emission.activityUnit)}`)}
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          type="number"
                          value={emission.oxidationFactor ?? 1}
                          onChange={(e) => updateEmissionSource(index, 'oxidationFactor', parseFloat(e.target.value))}
                          size="small"
                          variant="outlined"
                          InputProps={{ inputProps: { min: 0, max: 1, step: 0.01 } }}
                          disabled={(emission.emissionFactor ?? 0) > 0 || !isEnergyEFUnit(emission.emissionFactorUnit)}
                          error={Boolean(fieldErrors[index]?.oxidationFactor) && !((emission.emissionFactor ?? 0) > 0 || !isEnergyEFUnit(emission.emissionFactorUnit))}
                          helperText={(emission.emissionFactor ?? 0) > 0 || !isEnergyEFUnit(emission.emissionFactorUnit)
                            ? 'Neprimjenjivo s odabranom EF jedinicom/metodom'
                            : (fieldErrors[index]?.oxidationFactor ? 'Vrijednost korigirana (0–1, default 1.0)' : 'Raspon 0–1 (default 1.0)')}
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          type="number"
                          value={emission.conversionFactor ?? 3.667}
                          onChange={(e) => updateEmissionSource(index, 'conversionFactor', parseFloat(e.target.value))}
                          size="small"
                          variant="outlined"
                          InputProps={{ inputProps: { min: 0, step: 0.001 } }}
                          disabled={(emission.emissionFactor ?? 0) > 0 || !isEnergyEFUnit(emission.emissionFactorUnit)}
                          error={Boolean(fieldErrors[index]?.conversionFactor) && !((emission.emissionFactor ?? 0) > 0 || !isEnergyEFUnit(emission.emissionFactorUnit))}
                          helperText={(emission.emissionFactor ?? 0) > 0 || !isEnergyEFUnit(emission.emissionFactorUnit)
                            ? 'Neprimjenjivo s odabranom EF jedinicom/metodom'
                            : (fieldErrors[index]?.conversionFactor ? 'Vrijednost korigirana (min > 0). Default 3.667 (44/12)' : 'Default 3.667 (44/12)')}
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          type="number"
                          value={emission.biomassFraction || 0}
                          onChange={(e) => updateEmissionSource(index, 'biomassFraction', parseFloat(e.target.value))}
                          size="small"
                          variant="outlined"
                          InputProps={{ inputProps: { min: 0, max: 100 } }}
                          error={Boolean(fieldErrors[index]?.biomassFraction)}
                          helperText={fieldErrors[index]?.biomassFraction ? '% udio biomase (0–100) — vrijednost korigirana' : '% udio biomase (0–100)'}
                        />
                        {/* FormHelperText removed in favor of helperText */}
                      </TableCell>
                      <TableCell>
                        <TextField
                          select
                          value={emission.dataQuality || 'Medium'}
                          onChange={(e) => updateEmissionSource(index, 'dataQuality', e.target.value)}
                          size="small"
                          variant="outlined"
                          sx={{ minWidth: 120 }}
                        >
                          {dataQualityOptions.map((opt) => (
                            <MenuItem key={opt} value={opt}>
                              {opt}
                            </MenuItem>
                          ))}
                        </TextField>
                      </TableCell>
                      <TableCell>
                        <TextField
                          type="number"
                          value={emission.uncertainty || 0}
                          onChange={(e) => updateEmissionSource(index, 'uncertainty', parseFloat(e.target.value))}
                          size="small"
                          variant="outlined"
                          InputProps={{ inputProps: { min: 0, max: 100 } }}
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          value={emission.notes || ''}
                          onChange={(e) => updateEmissionSource(index, 'notes', e.target.value)}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          select
                          value={emission.monitoringMethod}
                          onChange={(e) => updateEmissionSource(index, 'monitoringMethod', e.target.value)}
                          size="small"
                          variant="outlined"
                          sx={{ minWidth: 120 }}
                        >
                          {monitoringMethods.map((method) => (
                            <MenuItem key={method} value={method}>
                              {method}
                            </MenuItem>
                          ))}
                        </TextField>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={(Object.values(fieldErrors[index] || {}).filter(Boolean).length > 0) ? `Greške: ${Object.values(fieldErrors[index] || {}).filter(Boolean).length}` : 'OK'}
                          color={(Object.values(fieldErrors[index] || {}).filter(Boolean).length > 0) ? 'error' : 'default'}
                          size="small"
                          variant={(Object.values(fieldErrors[index] || {}).filter(Boolean).length > 0) ? 'filled' : 'outlined'}
                        />
                      </TableCell>
                      <TableCell>
                        <IconButton color="error" onClick={() => removeEmissionSource(index)}>
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {/* Dodatni parametri: hvatanje i skladištenje CO2 */}
          {data.emissions.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle1" gutterBottom>
                Dodatni parametri (hvatanje/skladištenje ugljika)
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    label="Hvatanje CO2 (%)"
                    type="number"
                    value={data.emissions[0]?.carbonCaptureRate || 0}
                    onChange={(e) => updateEmissionSource(0, 'carbonCaptureRate', parseFloat(e.target.value))}
                    fullWidth
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    label="Skladištenje CO2 (%)"
                    type="number"
                    value={data.emissions[0]?.carbonStorageRate || 0}
                    onChange={(e) => updateEmissionSource(0, 'carbonStorageRate', parseFloat(e.target.value))}
                    fullWidth
                    size="small"
                  />
                </Grid>
              </Grid>
            </Box>
          )}

          {/* Total-i */}
          <Box sx={{ mt: 3 }}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle1" gutterBottom>
              Agregirani total-i
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  label="Ukupne CO2 emisije (t)"
                  value={data.totalCO2Emissions || 0}
                  size="small"
                  fullWidth
                  InputProps={{ readOnly: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  label="Ukupne CH4 emisije (t)"
                  value={data.totalCH4Emissions || 0}
                  size="small"
                  fullWidth
                  InputProps={{ readOnly: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  label="Ukupne N2O emisije (t)"
                  value={data.totalN2OEmissions || 0}
                  size="small"
                  fullWidth
                  InputProps={{ readOnly: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  label="Ukupne GHG emisije (tCO2e)"
                  value={data.totalGHGEmissions || 0}
                  size="small"
                  fullWidth
                  InputProps={{ readOnly: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  label="Indirektne CO2 emisije (t) — ručni unos"
                  type="number"
                  value={data.totalIndirectCO2Emissions || 0}
                  onChange={(e) => {
                    const v = parseFloat(e.target.value || '0');
                    const direct = data.emissions.reduce((sum, e) => sum + (e.co2Emissions || 0), 0);
                    updateData({
                      ...data,
                      totalIndirectCO2Emissions: isNaN(v) ? 0 : v,
                      totalDirectCO2Emissions: direct,
                      totalCO2Emissions: direct + (isNaN(v) ? 0 : v)
                    });
                  }}
                  size="small"
                  fullWidth
                  helperText="Odnosno Scope 2; ne ulazi u GHG ukupno (CO2e)"
                />
              </Grid>
            </Grid>
          </Box>
        </CardContent>
      </Card>

      {/* Informacije o verifikaciji */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Informacije o verifikaciji
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Datum verifikacije"
                type="date"
                value={data.verificationDate || ''}
                onChange={(e) => updateVerificationInfo('verificationDate', e.target.value)}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Ime verifikatora"
                value={data.verifierName || ''}
                onChange={(e) => updateVerificationInfo('verifierName', e.target.value)}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Broj akreditacije"
                value={data.verifierAccreditationNumber || ''}
                onChange={(e) => updateVerificationInfo('verifierAccreditationNumber', e.target.value)}
                fullWidth
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

export default EmissionInstallationStep;
import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Button,
  Alert,
  Grid,
  Chip,
  Tooltip,
  InputAdornment
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import {
  EmissionSourceStream,
  PFCSourceStream,
  BEmInstData,
  DEFAULT_EMISSION_SOURCES,
  DEFAULT_PFC_SOURCES
} from '../../types/BEmInstTypes';
import { calculateBEmInstData } from '../../utils/bEmInstCalculationEngine';
import { CInstEmissionsData, MeasurementBasedSource, DATA_QUALITY_OPTIONS } from '../../types/CInstEmissionsTypes';

interface BEmInstStepProps {
  data: BEmInstData | undefined;
  updateData: (data: BEmInstData) => void;
  installationDetails: any;
  validationStatus: any;
  cInstEmissions: CInstEmissionsData;
  updateCInstEmissions: (data: CInstEmissionsData) => void;
}

const BEmInstStep: React.FC<BEmInstStepProps> = ({
  data,
  updateData,
  installationDetails,
  validationStatus,
  cInstEmissions,
  updateCInstEmissions
}) => {
  const defaultData: BEmInstData = {
    emissionSources: DEFAULT_EMISSION_SOURCES.map((source, index) => ({
      ...source,
      id: `emission-${index + 1}`
    })),
    pfcEmissions: DEFAULT_PFC_SOURCES.map((source, index) => ({
      ...source,
      id: `pfc-${index + 1}`
    })),
    totals: {
      totalCO2eFossil: 0,
      totalCO2eBiomass: 0,
      totalCO2eNonSustainableBiomass: 0,
      totalEnergyContentFossil: 0,
      totalEnergyContentBiomass: 0,
      totalCF4Emissions: 0,
      totalC2F6Emissions: 0,
      totalPFCEmissions: 0
    },
    validationStatus: {
      isValid: true,
      errors: [],
      warnings: [],
      completenessScore: 0
    },
    reportingPeriod: ''
  };
  const [localData, setLocalData] = useState<BEmInstData>(data || defaultData);
  

  useEffect(() => {
    setLocalData(data || {
      emissionSources: DEFAULT_EMISSION_SOURCES.map((source, index) => ({
        ...source,
        id: `emission-${index + 1}`
      })),
      pfcEmissions: DEFAULT_PFC_SOURCES.map((source, index) => ({
        ...source,
        id: `pfc-${index + 1}`
      })),
      totals: {
        totalCO2eFossil: 0,
        totalCO2eBiomass: 0,
        totalCO2eNonSustainableBiomass: 0,
        totalEnergyContentFossil: 0,
        totalEnergyContentBiomass: 0,
        totalCF4Emissions: 0,
        totalC2F6Emissions: 0,
        totalPFCEmissions: 0
      },
      validationStatus: {
        isValid: true,
        errors: [],
        warnings: [],
        completenessScore: 0
      },
      reportingPeriod: ''
    });
  }, [data]);

  useEffect(() => {
    // Recalculate when data changes
    const calculatedData = calculateBEmInstData(localData);
    if (JSON.stringify(calculatedData) !== JSON.stringify(localData)) {
      setLocalData(calculatedData);
      updateData(calculatedData);
    }
  }, [localData, updateData]);

  const handleSourceChange = (id: string, field: keyof EmissionSourceStream, value: any) => {
    setLocalData(prev => ({
      ...prev,
      emissionSources: prev.emissionSources.map(source =>
        source.id === id ? { ...source, [field]: value } : source
      )
    }));
  };

  const handlePFCChange = (id: string, field: keyof PFCSourceStream, value: any) => {
    setLocalData(prev => ({
      ...prev,
      pfcEmissions: prev.pfcEmissions.map(pfc =>
        pfc.id === id ? { ...pfc, [field]: value } : pfc
      )
    }));
  };

  const addEmissionSource = () => {
    const newSource: EmissionSourceStream = {
      id: `source_${Date.now()}`,
      rowNumber: localData.emissionSources.length + 15,
      method: 'Combustion',
      sourceStreamName: '',
      activityData: 0,
      activityDataUnit: 't',
      emissionFactor: 0,
      emissionFactorUnit: 'tCO2/TJ',
      oxidationFactor: 100,
      oxidationFactorUnit: '%',
      conversionFactor: 100,
      conversionFactorUnit: '%',
      biomassContent: 0,
      biomassContentUnit: '%',
      nonSustainableBiomassContent: 0,
      nonSustainableBiomassContentUnit: '%'
    };

    setLocalData(prev => ({
      ...prev,
      emissionSources: [...prev.emissionSources, newSource]
    }));
  };

  const addPFCSource = () => {
    const newPFC: PFCSourceStream = {
      id: `pfc_${Date.now()}`,
      rowNumber: localData.pfcEmissions.length + 98,
      method: 'Slope method',
      technologyType: '',
      activityData: 0,
      activityDataUnit: 't',
      frequency: 0,
      duration: 0,
      sefCF4: 0,
      aeo: 0,
      ce: 0,
      ovc: 0,
      c2f6Factor: 0,
      cf4EmissionsTons: 0,
      c2f6EmissionsTons: 0,
      gwpCF4: 6630,
      gwpC2F6: 11100,
      cf4EmissionsCO2e: 0,
      c2f6EmissionsCO2e: 0,
      collectionEfficiency: 0.98,
      isComplete: false
    };

    setLocalData(prev => ({
      ...prev,
      pfcEmissions: [...prev.pfcEmissions, newPFC]
    }));
  };

  const deleteEmissionSource = (id: string) => {
    setLocalData(prev => ({
      ...prev,
      emissionSources: prev.emissionSources.filter(source => source.id !== id)
    }));
  };

  const deletePFCSource = (id: string) => {
    setLocalData(prev => ({
      ...prev,
      pfcEmissions: prev.pfcEmissions.filter(pfc => pfc.id !== id)
    }));
  };

  // Measurement-based sources handlers (section c)
  const addMeasurementSource = () => {
    const newSrc: MeasurementBasedSource = {
      id: `meas_${Date.now()}`,
      rowNumber: (cInstEmissions.measurementSources?.length || 0) + 1,
      name: '',
      ghgType: 'CO2',
      activityData: 0,
      activityDataUnit: 't',
      netCalorificValue: 0
    };
    updateCInstEmissions({
      ...cInstEmissions,
      measurementSources: [...(cInstEmissions.measurementSources || []), newSrc]
    });
  };

  const updateMeasurementSource = (id: string, field: keyof MeasurementBasedSource, value: any) => {
    const updated = (cInstEmissions.measurementSources || []).map(ms => ms.id === id ? { ...ms, [field]: value } : ms);
    updateCInstEmissions({ ...cInstEmissions, measurementSources: updated });
  };

  const deleteMeasurementSource = (id: string) => {
    const updated = (cInstEmissions.measurementSources || []).filter(ms => ms.id !== id);
    updateCInstEmissions({ ...cInstEmissions, measurementSources: updated });
  };

  const loadDefaultData = () => {
    const defaultSources = DEFAULT_EMISSION_SOURCES.map((source, index) => ({
      ...source,
      id: `default_source_${index}`
    }));

    const defaultPFCs = DEFAULT_PFC_SOURCES.map((pfc, index) => ({
      ...pfc,
      id: `default_pfc_${index}`
    }));

    const newData: BEmInstData = {
      ...localData,
      emissionSources: defaultSources,
      pfcEmissions: defaultPFCs
    };

    setLocalData(newData);
    updateData(newData);
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'Combustion': return 'primary';
      case 'Process Emissions': return 'secondary';
      case 'Mass balance': return 'success';
      case 'PFC': return 'warning';
      default: return 'default';
    }
  };

  const getValidationColor = (isValid: boolean | undefined) => {
    return isValid ? 'success' : 'error';
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        B. Emisije instalacije po tokovima i izvorima emisija
      </Typography>
      
      <Typography variant="body2" color="text.secondary" paragraph>
        Unesite podatke o emisijama za sve tokove i izvore emisija na nivou instalacije.
        Koristite metode proračuna navedene u EU ETS smernicama.
      </Typography>

      {/* Action Buttons */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={addEmissionSource}
          sx={{ mr: 2 }}
        >
          Dodaj izvor emisije
        </Button>
        <Button
          variant="contained"
          onClick={loadDefaultData}
          sx={{ ml: 'auto' }}
        >
          Učitaj demo podatke
        </Button>
      </Box>

      {/* Validation Status */}
      {localData.validationStatus && (
        <Alert 
          severity={localData.validationStatus.isValid ? 'success' : 'error'}
          sx={{ mb: 3 }}
        >
          Status validacije: {localData.validationStatus.isValid ? 'Validno' : 'Nevalidno'}
          {localData.validationStatus.errors.length > 0 && (
            <ul>
              {localData.validationStatus.errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          )}
        </Alert>
      )}

      {/* Emission Sources Table */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Tokovi i izvori emisija
          </Typography>
          
          <TableContainer component={Paper} sx={{ overflowX: 'auto', width: '100%' }}>
            <Table size="small" sx={{ tableLayout: 'fixed', minWidth: 1200 }}>
              <TableHead>
                <TableRow sx={{ position: 'sticky', top: 0, zIndex: 1, bgcolor: 'background.paper' }}>
                  <TableCell sx={{ width: 56, position: 'sticky', left: 0, zIndex: 2, bgcolor: 'background.paper' }}>#</TableCell>
                  <TableCell sx={{ width: 140, position: 'sticky', left: 56, zIndex: 2, bgcolor: 'background.paper' }}>Metoda</TableCell>
                  <TableCell sx={{ width: 180, minWidth: 160, maxWidth: 190 }}>Naziv toka</TableCell>
                  <TableCell sx={{ width: 140, minWidth: 120, maxWidth: 160 }}>Podaci o aktivnosti</TableCell>
                  <TableCell sx={{ width: 160, minWidth: 140, maxWidth: 180 }}>
                    <Tooltip title="NCV (Lower heating value) – tipično GJ/t ili TJ/t; normalizujemo na TJ/t">
                      <Box sx={{ whiteSpace: 'nowrap' }}>NCV</Box>
                    </Tooltip>
                  </TableCell>
                  <TableCell sx={{ width: 160, minWidth: 140, maxWidth: 180 }}>
                    <Tooltip title="Faktor emisije (EF) – tCO2/TJ ili kgCO2/GJ; normalizujemo na tCO2/TJ">
                      <Box sx={{ whiteSpace: 'nowrap' }}>Faktor emisije</Box>
                    </Tooltip>
                  </TableCell>
                  <TableCell sx={{ width: 60, minWidth: 60, maxWidth: 70 }}>OxF (%)</TableCell>
                  <TableCell sx={{ width: 60, minWidth: 60, maxWidth: 70 }}>ConvF (%)</TableCell>
                  <TableCell sx={{ width: 75, minWidth: 70, maxWidth: 85 }}>Carbon content</TableCell>
                  <TableCell sx={{ width: 65, minWidth: 60, maxWidth: 75 }}>Biomass %</TableCell>
                  <TableCell sx={{ width: 65, minWidth: 60, maxWidth: 75 }}>Non-sust. Biomass %</TableCell>
                  <TableCell sx={{ width: 120 }}>CO2e fosilni</TableCell>
                  <TableCell sx={{ width: 120 }}>CO2e biomasa</TableCell>
                  <TableCell sx={{ width: 140 }}>Energetski sadržaj (fossil TJ)</TableCell>
                  <TableCell sx={{ width: 140 }}>Energetski sadržaj (biomasa TJ)</TableCell>
                  <TableCell sx={{ width: 120 }}>Akcije</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {localData.emissionSources.map((source) => (
                  <TableRow key={source.id}>
                    <TableCell sx={{ width: 56, position: 'sticky', left: 0, zIndex: 1, bgcolor: 'background.paper' }}>{source.rowNumber}</TableCell>
                    <TableCell sx={{ width: 140, position: 'sticky', left: 56, zIndex: 1, bgcolor: 'background.paper' }}>
                      <Chip 
                        label={source.method} 
                        size="small" 
                        color={getMethodColor(source.method) as any}
                      />
                    </TableCell>
                    <TableCell sx={{ width: 180, minWidth: 160, maxWidth: 190 }}>
                      <TextField
                        size="small"
                        value={source.sourceStreamName}
                        onChange={(e) => handleSourceChange(source.id, 'sourceStreamName', e.target.value)}
                        placeholder="Unesite naziv toka"
                        inputProps={{ style: { fontSize: 12 } }}
                        fullWidth
                      />
                    </TableCell>
                    <TableCell sx={{ width: 140, minWidth: 120, maxWidth: 160 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <TextField
                          size="small"
                          type="number"
                          value={source.activityData}
                          onChange={(e) => handleSourceChange(source.id, 'activityData', parseFloat(e.target.value) || 0)}
                          inputProps={{ style: { fontSize: 11, textAlign: 'right' } }}
                          sx={{ flex: 1 }}
                        />
                        <TextField
                          size="small"
                          value={source.activityDataUnit}
                          onChange={(e) => handleSourceChange(source.id, 'activityDataUnit', e.target.value)}
                          inputProps={{ style: { fontSize: 11 } }}
                          sx={{ width: 60 }}
                        />
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <TextField
                          size="small"
                          type="number"
                          value={source.netCalorificValue || ''}
                          onChange={(e) => handleSourceChange(source.id, 'netCalorificValue', parseFloat(e.target.value) || 0)}
                          disabled={source.method === 'Process Emissions' || source.method === 'Mass balance'}
                          inputProps={{ style: { fontSize: 11, textAlign: 'right' } }}
                          sx={{ flex: 1 }}
                        />
                        <FormControl size="small" sx={{ width: 100 }}>
                          <Select
                            value={source.netCalorificValueUnit || 'GJ/t'}
                            onChange={(e) => handleSourceChange(source.id, 'netCalorificValueUnit', e.target.value)}
                            disabled={source.method === 'Process Emissions' || source.method === 'Mass balance'}
                            sx={{ '& .MuiSelect-select': { fontSize: 11, paddingY: 0.25 } }}
                          >
                            <MenuItem value="TJ/t">TJ/t</MenuItem>
                            <MenuItem value="GJ/t">GJ/t</MenuItem>
                            <MenuItem value="MJ/kg">MJ/kg</MenuItem>
                          </Select>
                        </FormControl>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <TextField
                          size="small"
                          type="number"
                          value={source.emissionFactor || ''}
                          onChange={(e) => handleSourceChange(source.id, 'emissionFactor', parseFloat(e.target.value) || 0)}
                          disabled={source.method === 'Mass balance'}
                          inputProps={{ style: { fontSize: 11, textAlign: 'right' } }}
                          sx={{ flex: 1 }}
                        />
                        <FormControl size="small" sx={{ width: 100 }}>
                          <Select
                            value={source.emissionFactorUnit || 'tCO2/TJ'}
                            onChange={(e) => handleSourceChange(source.id, 'emissionFactorUnit', e.target.value)}
                            disabled={source.method === 'Mass balance'}
                            sx={{ '& .MuiSelect-select': { fontSize: 11, paddingY: 0.25 } }}
                          >
                            <MenuItem value="tCO2/TJ">tCO2/TJ</MenuItem>
                            <MenuItem value="kgCO2/GJ">kgCO2/GJ</MenuItem>
                          </Select>
                        </FormControl>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <TextField
                        size="small"
                        type="number"
                        value={source.oxidationFactor ?? ''}
                        onChange={(e) => handleSourceChange(source.id, 'oxidationFactor', parseFloat(e.target.value) || 0)}
                        disabled={source.method !== 'Combustion'}
                        inputProps={{ style: { fontSize: 12, textAlign: 'right' } }}
                        InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        size="small"
                        type="number"
                        value={source.conversionFactor ?? ''}
                        onChange={(e) => handleSourceChange(source.id, 'conversionFactor', parseFloat(e.target.value) || 0)}
                        inputProps={{ style: { fontSize: 12, textAlign: 'right' } }}
                        InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        size="small"
                        type="number"
                        value={source.carbonContent ?? ''}
                        onChange={(e) => handleSourceChange(source.id, 'carbonContent', parseFloat(e.target.value) || 0)}
                        disabled={source.method !== 'Mass balance'}
                        inputProps={{ style: { fontSize: 12, textAlign: 'right' } }}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        size="small"
                        type="number"
                        value={source.biomassContent ?? ''}
                        onChange={(e) => handleSourceChange(source.id, 'biomassContent', parseFloat(e.target.value) || 0)}
                        inputProps={{ style: { fontSize: 12, textAlign: 'right' } }}
                        InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        size="small"
                        type="number"
                        value={source.nonSustainableBiomassContent ?? ''}
                        onChange={(e) => handleSourceChange(source.id, 'nonSustainableBiomassContent', parseFloat(e.target.value) || 0)}
                        inputProps={{ style: { fontSize: 12, textAlign: 'right' } }}
                        InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color={getValidationColor(source.isValid)}>
                        {source.co2eFossil?.toFixed(2) || '0.00'} t CO2e
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="success">
                        {source.co2eBiomass?.toFixed(2) || '0.00'} t CO2e
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {source.energyContentFossil?.toFixed(3) || '0.000'} TJ
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {source.energyContentBiomass?.toFixed(3) || '0.000'} TJ
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <IconButton size="small" onClick={() => deleteEmissionSource(source.id)}>
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* PFC Emissions Table */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            PFC (Perfluorougljovodonici) emisije
          </Typography>
          <Box sx={{ mb: 2 }}>
            <Button variant="outlined" startIcon={<AddIcon />} onClick={addPFCSource}>Dodaj PFC izvor</Button>
          </Box>
          
          <TableContainer component={Paper} sx={{ overflowX: 'auto', width: '100%' }}>
            <Table size="small" sx={{ tableLayout: 'fixed', minWidth: 1100 }}>
              <TableHead>
                <TableRow sx={{ position: 'sticky', top: 0, zIndex: 1, bgcolor: 'background.paper' }}>
                  <TableCell sx={{ width: 56, position: 'sticky', left: 0, zIndex: 2, bgcolor: 'background.paper' }}>#</TableCell>
                  <TableCell sx={{ width: 140, minWidth: 140, position: 'sticky', left: 56, zIndex: 2, bgcolor: 'background.paper' }}>Metoda</TableCell>
                  <TableCell sx={{ width: 200 }}>Tip tehnologije</TableCell>
                  <TableCell sx={{ width: 180 }}>Podaci o aktivnosti</TableCell>
                  <TableCell sx={{ width: 140 }}>Učestalost</TableCell>
                  <TableCell sx={{ width: 140 }}>Trajanje</TableCell>
                  <TableCell sx={{ width: 160 }}>SEF(CF4)</TableCell>
                  <TableCell sx={{ width: 160 }}>Faktor C2F6</TableCell>
                  <TableCell sx={{ width: 120 }}>
                    <Tooltip title="Anode Effect Overvoltage (AEo) – dodatni napon tokom anodne pojave (mV)">
                      <Box>AEo</Box>
                    </Tooltip>
                  </TableCell>
                  <TableCell sx={{ width: 120 }}>
                    <Tooltip title="Current Efficiency (CE) – efikasnost struje procesa (frakcija ili %)">
                      <Box>CE</Box>
                    </Tooltip>
                  </TableCell>
                  <TableCell sx={{ width: 120 }}>
                    <Tooltip title="Overvoltage Coefficient (OVC) – kg CF4 po t Al i po mV">
                      <Box>OVC</Box>
                    </Tooltip>
                  </TableCell>
                      <TableCell sx={{ width: 180 }}>
                        <Box sx={{ whiteSpace: 'nowrap' }}>CF4 emisije</Box>
                      </TableCell>
                      <TableCell sx={{ width: 180 }}>
                        <Box sx={{ whiteSpace: 'nowrap' }}>C2F6 emisije</Box>
                      </TableCell>
                      <TableCell sx={{ width: 120 }}>
                        <Box sx={{ whiteSpace: 'nowrap' }}>Akcije</Box>
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {localData.pfcEmissions.map((pfc) => (
                  <TableRow key={pfc.id}>
                    <TableCell sx={{ width: 56, position: 'sticky', left: 0, zIndex: 1, bgcolor: 'background.paper' }}>{pfc.rowNumber}</TableCell>
                    <TableCell sx={{ width: 140, position: 'sticky', left: 56, zIndex: 1, bgcolor: 'background.paper' }}>
                      <FormControl size="small">
                        <Select
                          value={pfc.method}
                          onChange={(e) => handlePFCChange(pfc.id, 'method', e.target.value)}
                          sx={{ '& .MuiSelect-select': { fontSize: 12 } }}
                        >
                          <MenuItem value="Slope method">Metoda nagiba</MenuItem>
                          <MenuItem value="Technology specific">Specifično za tehnologiju</MenuItem>
                          <MenuItem value="Other">Ostalo</MenuItem>
                        </Select>
                      </FormControl>
                    </TableCell>
                    <TableCell sx={{ width: 200 }}>
                      <FormControl fullWidth size="small">
                        <Select
                          value={pfc.technologyType || 'Centre Worked Pre-Bake (CWPB)'}
                          onChange={(e) => handlePFCChange(pfc.id, 'technologyType', e.target.value)}
                          sx={{ '& .MuiSelect-select': { fontSize: 12 } }}
                        >
                          <MenuItem value="Centre Worked Pre-Bake (CWPB)">CWPB</MenuItem>
                          <MenuItem value="Vertical Stud Søderberg (VSS)">VSS</MenuItem>
                          <MenuItem value="Other">Other</MenuItem>
                        </Select>
                      </FormControl>
                    </TableCell>
                    <TableCell sx={{ width: 180 }}>
                      <Grid container spacing={1}>
                        <Grid item xs={8}>
                          <TextField
                            size="small"
                            type="number"
                            value={pfc.activityData}
                            onChange={(e) => handlePFCChange(pfc.id, 'activityData', parseFloat(e.target.value) || 0)}
                            inputProps={{ style: { fontSize: 12, textAlign: 'right' } }}
                          />
                        </Grid>
                        <Grid item xs={4}>
                          <TextField
                            size="small"
                            value={pfc.activityDataUnit}
                            onChange={(e) => handlePFCChange(pfc.id, 'activityDataUnit', e.target.value)}
                            inputProps={{ style: { fontSize: 12 } }}
                          />
                        </Grid>
                      </Grid>
                    </TableCell>
                        <TableCell sx={{ width: 140 }}>
                          <TextField
                            size="small"
                            type="number"
                            value={pfc.frequency}
                            onChange={(e) => handlePFCChange(pfc.id, 'frequency', parseFloat(e.target.value) || 0)}
                            inputProps={{ style: { fontSize: 12, textAlign: 'right' } }}
                          />
                        </TableCell>
                        <TableCell sx={{ width: 140 }}>
                          <TextField
                            size="small"
                            type="number"
                            value={pfc.duration}
                            onChange={(e) => handlePFCChange(pfc.id, 'duration', parseFloat(e.target.value) || 0)}
                            inputProps={{ style: { fontSize: 12, textAlign: 'right' } }}
                          />
                        </TableCell>
                        <TableCell sx={{ width: 160 }}>
                          <Grid container spacing={1}>
                            <Grid item xs={7}>
                              <TextField
                                size="small"
                                type="number"
                                value={pfc.sefCF4}
                                onChange={(e) => handlePFCChange(pfc.id, 'sefCF4', parseFloat(e.target.value) || 0)}
                                inputProps={{ style: { fontSize: 12, textAlign: 'right' } }}
                              />
                            </Grid>
                            <Grid item xs={5}>
                              <FormControl fullWidth size="small">
                                <Select
                                  value="preset"
                                  onChange={(e) => {
                                    const tech = pfc.technologyType || '';
                                    const val = tech.includes('CWPB') ? 0.143 : tech.includes('VSS') ? 0.092 : pfc.sefCF4 || 0;
                                    handlePFCChange(pfc.id, 'sefCF4', val);
                                  }}
                                  sx={{ '& .MuiSelect-select': { fontSize: 12 } }}
                                >
                                  <MenuItem value="preset">Predefinisano</MenuItem>
                                </Select>
                              </FormControl>
                            </Grid>
                          </Grid>
                        </TableCell>
                        <TableCell sx={{ width: 160 }}>
                          <Grid container spacing={1}>
                            <Grid item xs={7}>
                              <TextField
                                size="small"
                                type="number"
                                value={pfc.c2f6Factor}
                                onChange={(e) => handlePFCChange(pfc.id, 'c2f6Factor', parseFloat(e.target.value) || 0)}
                                inputProps={{ style: { fontSize: 12, textAlign: 'right' } }}
                              />
                            </Grid>
                            <Grid item xs={5}>
                            <FormControl fullWidth size="small">
                              <Select
                                value="preset"
                                onChange={(e) => {
                                  const tech = pfc.technologyType || '';
                                  const val = tech.includes('CWPB') ? 0.121 : tech.includes('VSS') ? 0.053 : pfc.c2f6Factor || 0;
                                  handlePFCChange(pfc.id, 'c2f6Factor', val);
                                }}
                                sx={{ '& .MuiSelect-select': { fontSize: 12 } }}
                              >
                                <MenuItem value="preset">Predefinisano</MenuItem>
                              </Select>
                            </FormControl>
                            </Grid>
                          </Grid>
                        </TableCell>
                        <TableCell sx={{ width: 140 }}>
                          <TextField
                            size="small"
                            type="number"
                            value={pfc.aeo}
                            onChange={(e) => handlePFCChange(pfc.id, 'aeo', parseFloat(e.target.value) || 0)}
                            inputProps={{ style: { fontSize: 12, textAlign: 'right' } }}
                          />
                        </TableCell>
                        <TableCell sx={{ width: 140 }}>
                          <TextField
                            size="small"
                            type="number"
                            value={pfc.ce}
                            onChange={(e) => handlePFCChange(pfc.id, 'ce', parseFloat(e.target.value) || 0)}
                            inputProps={{ style: { fontSize: 12, textAlign: 'right' } }}
                          />
                        </TableCell>
                        <TableCell sx={{ width: 140 }}>
                          <TextField
                            size="small"
                            type="number"
                            value={pfc.ovc}
                            onChange={(e) => handlePFCChange(pfc.id, 'ovc', parseFloat(e.target.value) || 0)}
                            inputProps={{ style: { fontSize: 12, textAlign: 'right' } }}
                          />
                        </TableCell>
                    <TableCell sx={{ width: 180 }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                        <Typography variant="body2" color={pfc.isComplete ? 'success' : 'error'} noWrap sx={{ maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis' }} title={`${(pfc.cf4EmissionsTons ?? 0).toFixed(3)} t CF4`}>
                          {(pfc.cf4EmissionsTons ?? 0).toFixed(3)} t CF4
                        </Typography>
                        <Typography variant="caption" color="text.secondary" noWrap sx={{ maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis' }} title={`${(pfc.cf4EmissionsCO2e ?? 0).toFixed(2)} t CO2e`}>
                          {(pfc.cf4EmissionsCO2e ?? 0).toFixed(2)} t CO2e
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ width: 180 }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                        <Typography variant="body2" color={pfc.isComplete ? 'success' : 'error'} noWrap sx={{ maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis' }} title={`${(pfc.c2f6EmissionsTons ?? 0).toFixed(3)} t C2F6`}>
                          {(pfc.c2f6EmissionsTons ?? 0).toFixed(3)} t C2F6
                        </Typography>
                        <Typography variant="caption" color="text.secondary" noWrap sx={{ maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis' }} title={`${(pfc.c2f6EmissionsCO2e ?? 0).toFixed(2)} t CO2e`}>
                          {(pfc.c2f6EmissionsCO2e ?? 0).toFixed(2)} t CO2e
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ width: 120 }}>
                      <IconButton size="small" onClick={() => deletePFCSource(pfc.id)}>
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Measurement-Based Approaches (c) */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Mjerenjem zasnovane emisije (Measurement-based)
          </Typography>

          <Box sx={{ mb: 2 }}>
            <Button variant="outlined" startIcon={<AddIcon />} onClick={addMeasurementSource}>Dodaj mjereni izvor</Button>
          </Box>

          <TableContainer component={Paper}>
            <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>#</TableCell>
                      <TableCell>Naziv</TableCell>
                      <TableCell>Tip GHG</TableCell>
                      <TableCell>AD</TableCell>
                      <TableCell>AD jedinica</TableCell>
                      <TableCell>NCV</TableCell>
                      <TableCell>Metoda mjerenja</TableCell>
                      <TableCell>Izvor podataka</TableCell>
                      <TableCell>Kvalitet podataka</TableCell>
                      <TableCell>Akcije</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(cInstEmissions.measurementSources || []).map((ms) => (
                      <TableRow key={ms.id}>
                        <TableCell>{ms.rowNumber}</TableCell>
                        <TableCell>
                          <TextField size="small" value={ms.name} onChange={(e) => updateMeasurementSource(ms.id, 'name', e.target.value)} />
                        </TableCell>
                        <TableCell>
                          <FormControl size="small">
                            <Select value={ms.ghgType} onChange={(e) => updateMeasurementSource(ms.id, 'ghgType', e.target.value)}>
                              <MenuItem value="CO2">CO2</MenuItem>
                              <MenuItem value="N2O">N2O</MenuItem>
                              <MenuItem value="CH4">CH4</MenuItem>
                              <MenuItem value="Other">Other</MenuItem>
                            </Select>
                          </FormControl>
                        </TableCell>
                        <TableCell>
                          <TextField size="small" type="number" value={ms.activityData} onChange={(e) => updateMeasurementSource(ms.id, 'activityData', parseFloat(e.target.value) || 0)} />
                        </TableCell>
                        <TableCell>
                          <TextField size="small" value={ms.activityDataUnit} onChange={(e) => updateMeasurementSource(ms.id, 'activityDataUnit', e.target.value)} />
                        </TableCell>
                        <TableCell>
                          <TextField size="small" type="number" value={ms.netCalorificValue || ''} onChange={(e) => updateMeasurementSource(ms.id, 'netCalorificValue', parseFloat(e.target.value) || 0)} />
                        </TableCell>
                        <TableCell>
                          <TextField size="small" value={ms.measurementMethod || ''} onChange={(e) => updateMeasurementSource(ms.id, 'measurementMethod', e.target.value)} />
                        </TableCell>
                        <TableCell>
                          <TextField size="small" value={ms.dataSource || ''} onChange={(e) => updateMeasurementSource(ms.id, 'dataSource', e.target.value)} />
                        </TableCell>
                        <TableCell>
                          <FormControl size="small">
                            <Select value={ms.dataQuality || DATA_QUALITY_OPTIONS[0]} onChange={(e) => updateMeasurementSource(ms.id, 'dataQuality', e.target.value)}>
                              {DATA_QUALITY_OPTIONS.map((opt) => (
                                <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </TableCell>
                        <TableCell>
                          <IconButton size="small" onClick={() => deleteMeasurementSource(ms.id)}>
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Totals Summary */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Ukupne emisije
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={4}>
              <Typography variant="body2" color="text.secondary">
                Ukupno CO2e fosilni
              </Typography>
              <Typography variant="h6" color="error">
                {localData.totals.totalCO2eFossil.toFixed(2)} t CO2e
              </Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography variant="body2" color="text.secondary">
                Ukupno CO2e biomasa
              </Typography>
              <Typography variant="h6" color="success">
                {localData.totals.totalCO2eBiomass.toFixed(2)} t CO2e
              </Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography variant="body2" color="text.secondary">
                Ukupno PFC emisije
              </Typography>
              <Typography variant="h6" color="warning">
                {localData.totals.totalPFCEmissions.toFixed(2)} t CO2e
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

export default BEmInstStep;
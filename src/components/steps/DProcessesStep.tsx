import React, { useState, useEffect, useCallback } from 'react';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Chip,
  Button,
  Box
} from '@mui/material';
import { ExpandMore as ExpandMoreIcon, Add as AddIcon } from '@mui/icons-material';
import { Alert, AlertTitle, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import dataValidationUtils, { validateDProcessesData } from '../../utils/dataValidationUtils';

import {
  ProductionProcess,
  DProcessesData,
  DEFAULT_PRODUCTION_PROCESS,
  DEFAULT_DPROCESSES_DATA,
  PRODUCTION_PROCESS_LIMITS
} from '../../types/DProcessesTypes';
import { ProcessProductionData } from '../../types/CBAMData';

interface DProcessesStepProps {
  data: DProcessesData;
  onUpdate: (data: DProcessesData) => void;
  syncProcessProductionData?: (data: ProcessProductionData[]) => void;
}

const DProcessesStep: React.FC<DProcessesStepProps> = ({ data, onUpdate, syncProcessProductionData }) => {
  const [localData, setLocalData] = useState<DProcessesData>(data || DEFAULT_DPROCESSES_DATA);
  const [expandedAccordion, setExpandedAccordion] = useState<string | false>('process-0');
  const [updateTimeout, setUpdateTimeout] = useState<NodeJS.Timeout | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [showValidationErrors, setShowValidationErrors] = useState(false);

  const recalcProcess = useCallback((p: ProductionProcess): ProductionProcess => {
    const dir = p.directlyAttributableEmissions?.applicable ? (p.directlyAttributableEmissions.amount || 0) : 0;
    const heatEF = p.measurableHeat?.emissionFactor || 0;
    const heatNet = p.measurableHeat?.applicable ? ((p.measurableHeat.netAmount || 0) + (p.measurableHeat.imported || 0) - (p.measurableHeat.exported || 0)) : 0;
    const heatShare = p.measurableHeat?.shareToCBAMGoods !== undefined ? Math.max(0, Math.min(100, p.measurableHeat.shareToCBAMGoods)) / 100 : 1;
    const heat = Math.max(0, heatNet) * heatEF * heatShare;
    const wgEF = p.wasteGases?.emissionFactor || 0;
    const wgNet = p.wasteGases?.applicable ? ((p.wasteGases.amount || 0) + (p.wasteGases.imported || 0) - (p.wasteGases.exported || 0)) : 0;
    const wgReused = p.wasteGases?.reusedShare !== undefined ? Math.max(0, Math.min(100, p.wasteGases.reusedShare)) / 100 : 0;
    const wg = Math.max(0, wgNet) * (1 - wgReused) * wgEF;
    const elCons = p.indirectEmissions?.applicable ? (p.indirectEmissions.electricityConsumption || 0) : 0;
    const elUnit = p.indirectEmissions?.electricityUnit || 'MWh';
    const elEF = p.indirectEmissions?.emissionFactor || 0;
    const elEFUnit = p.indirectEmissions?.emissionFactorUnit || 'tCO2/MWh';
    const consMWh = elUnit === 'kWh' ? elCons / 1000 : elUnit === 'GJ' ? elCons * 0.2777777778 : elCons;
    const efPerMWh = elEFUnit === 'tCO2/kWh' ? elEF * 1000 : elEFUnit === 'tCO2/GJ' ? elEF * 3.6 : elEF;
    const ind = consMWh * efPerMWh;
    const expAmt = p.electricityExported?.applicable ? (p.electricityExported.exportedAmount || 0) : 0;
    const expUnit = p.electricityExported?.unit || 'MWh';
    const expEF = p.electricityExported?.emissionFactor || 0;
    const expEFUnit = p.electricityExported?.emissionFactorUnit || 'tCO2/MWh';
    const expMWh = expUnit === 'kWh' ? expAmt / 1000 : expUnit === 'GJ' ? expAmt * 0.2777777778 : expAmt;
    const expEfPerMWh = expEFUnit === 'tCO2/kWh' ? expEF * 1000 : expEFUnit === 'tCO2/GJ' ? expEF * 3.6 : expEF;
    const credit = expMWh * expEfPerMWh;
    const net = dir + heat + wg + ind - credit;
    const perUnit = (p.amounts || 0) > 0 ? net / (p.amounts || 0) : 0;
    return {
      ...p,
      calculatedEmissions: {
        ...p.calculatedEmissions,
        directEmissionsTotal: dir,
        heatEmissionsTotal: heat,
        wasteGasEmissionsTotal: wg,
        indirectEmissionsTotal: ind,
        electricityExportCredit: credit,
        netAttributedEmissions: net,
        netAttributedEmissionsPerUnit: perUnit,
        specificEmbeddedEmissions: perUnit
      }
    };
  }, []);

  useEffect(() => {
    setLocalData(data || DEFAULT_DPROCESSES_DATA);
  }, [data]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (updateTimeout) {
        clearTimeout(updateTimeout);
      }
    };
  }, [updateTimeout]);

  // Debounced update funkcija
  const debouncedUpdate = useCallback((newData: DProcessesData) => {
    if (updateTimeout) {
      clearTimeout(updateTimeout);
    }
    
    const timeout = setTimeout(() => {
      onUpdate(newData);
      if (typeof syncProcessProductionData === 'function') {
        const mapped: ProcessProductionData[] = (newData.productionProcesses || []).map((dp) => ({
          id: dp.id || `pp-${dp.processNumber}`,
          processName: String(dp.name || ''),
          processType: String(dp.productionRoute || ''),
          productionAmount: Number(dp.amounts || 0) || 0,
          unit: String(dp.unit || 't'),
          inputs: [],
          outputs: [],
          directEmissions: Number(dp.directlyAttributableEmissions?.amount || 0) || 0,
          processEmissions: Number(dp.directlyAttributableEmissions?.amount || 0) || 0,
          totalProductionWithinInstallation: Number(dp.amounts || 0) || 0,
          producedForMarket: Number(dp.producedForMarket || 0) || 0,
          isProductionOnlyForMarket: !!dp.totalProductionOnlyForMarket,
          nonCBAMAmount: Number(dp.consumedForNonCBAMGoods || 0) || 0,
          applicableElements: {
            measurableHeat: !!dp.measurableHeat?.applicable,
            wasteGases: !!dp.wasteGases?.applicable,
            indirectEmissions: !!dp.indirectEmissions?.applicable
          },
          measurableHeatData: {
            quantity: (dp.measurableHeat?.netAmount || 0) * 1000,
            imported: (dp.measurableHeat?.imported || 0) * 1000,
            exported: (dp.measurableHeat?.exported || 0) * 1000,
            unit: 'GJ',
            emissionFactor: (dp.measurableHeat?.emissionFactor || 0) / 1000,
            emissionFactorUnit: 't/GJ',
            shareToCBAMGoods: dp.measurableHeat?.shareToCBAMGoods
          },
          wasteGasesData: {
            quantity: dp.wasteGases?.amount || 0,
            imported: dp.wasteGases?.imported || 0,
            exported: dp.wasteGases?.exported || 0,
            unit: 'TJ',
            emissionFactor: dp.wasteGases?.emissionFactor || 0,
            emissionFactorUnit: dp.wasteGases?.emissionFactorUnit || 'tCO2/TJ',
            reusedShare: dp.wasteGases?.reusedShare
          },
          electricityConsumption: Number(dp.indirectEmissions?.electricityConsumption || 0) || 0,
          electricityUnit: dp.indirectEmissions?.electricityUnit || 'MWh',
          electricityEmissionFactor: Number(dp.indirectEmissions?.emissionFactor || 0) || 0,
          electricityEmissionFactorUnit: dp.indirectEmissions?.emissionFactorUnit || 'tCO2/MWh',
          electricityEmissionFactorSource: dp.indirectEmissions?.emissionFactorSource || '',
          electricityExportedAmount: Number(dp.electricityExported?.exportedAmount || 0) || 0,
          electricityExportedUnit: dp.electricityExported?.unit || 'MWh',
          electricityExportedEmissionFactor: Number(dp.electricityExported?.emissionFactor || 0) || 0,
          electricityExportedEmissionFactorUnit: dp.electricityExported?.emissionFactorUnit || 'tCO2/MWh',
          marketSharePercent: Number(dp.shareProducedForMarket || 0) || 0
        }));
        syncProcessProductionData(mapped);
      }
    }, 300); // 300ms debounce
    
    setUpdateTimeout(timeout);
  }, [onUpdate, updateTimeout, syncProcessProductionData]);

  const handleProcessUpdate = useCallback((index: number, updatedProcess: ProductionProcess) => {
    const updatedProcesses = [...localData.productionProcesses];
    updatedProcesses[index] = recalcProcess(updatedProcess);
    
    const newData = {
      ...localData,
      productionProcesses: updatedProcesses
    };
    
    setLocalData(newData);
    debouncedUpdate(newData);
  }, [localData, debouncedUpdate]);

  const addProductionProcess = useCallback(() => {
    if (localData.productionProcesses.length >= PRODUCTION_PROCESS_LIMITS.MAX_PROCESSES) {
      return;
    }

    const newProcess: ProductionProcess = {
      ...DEFAULT_PRODUCTION_PROCESS,
      id: `process-${Date.now()}`,
      processNumber: localData.productionProcesses.length + 1
    };

    const newData = {
      ...localData,
      productionProcesses: [...localData.productionProcesses, newProcess]
    };

    setLocalData(newData);
    debouncedUpdate(newData);
  }, [localData, debouncedUpdate]);

  const getProcessCompleteness = useCallback((process: ProductionProcess): number => {
    let completed = 0;
    let total = 0;

    // Basic info
    if (process.name) completed++;
    if (process.unit) completed++;
    if (process.amounts > 0) completed++;
    total += 3;

    return Math.round((completed / total) * 100);
  }, []);

  const getProcessStatusColor = (completeness: number): 'success' | 'warning' | 'error' => {
    if (completeness >= 80) return 'success';
    if (completeness >= 50) return 'warning';
    return 'error';
  };

  const validateDProcesses = useCallback(() => {
    const res = validateDProcessesData(localData);
    const msgs = [...res.errors, ...res.warnings];
    setValidationErrors(msgs);
    setShowValidationErrors(true);
  }, [localData]);

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        D_Processes - Proizvodni procesi sa ulazno/izlaznim matricama
      </Typography>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
        <Button variant="outlined" onClick={validateDProcesses}>Validiraj D_Processes</Button>
      </Box>
      {showValidationErrors && validationErrors.length > 0 && (
        <Alert 
          severity="error" 
          sx={{ mb: 2 }}
          action={
            <IconButton aria-label="close" color="inherit" size="small" onClick={() => setShowValidationErrors(false)}>
              <CloseIcon fontSize="inherit" />
            </IconButton>
          }
        >
          <AlertTitle>Greške validacije</AlertTitle>
          {validationErrors.map((e, i) => (<div key={`verr-${i}`}>• {e}</div>))}
        </Alert>
      )}
      
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Definišite proizvodne procese, njihove ulazno/izlazne odnose i izračunajte pripisane emisije.
        Svaki proces može imati više ulaza (prekursori, energija) i izlaza (proizvodi, nusproizvodi).
      </Typography>

      {/* Production Processes */}
      {localData.productionProcesses.map((process, index) => (
        <Accordion
          key={process.id}
          expanded={expandedAccordion === `process-${index}`}
          onChange={(_, expanded) => setExpandedAccordion(expanded ? `process-${index}` : false)}
          sx={{ mb: 1 }}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
              <Typography variant="subtitle1" sx={{ flexGrow: 1 }}>
                Proizvodni proces {process.processNumber}: {process.name || 'Neimenovani proces'}
              </Typography>
              <Chip
                label={`${getProcessCompleteness(process)}% Popunjeno`}
                color={getProcessStatusColor(getProcessCompleteness(process))}
                size="small"
              />
            </Box>
          </AccordionSummary>
          
          <AccordionDetails>
            <Grid container spacing={3}>
              {/* Basic Process Information */}
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>
                  Osnovne informacije o procesu
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Naziv procesa"
                  value={process.name}
                  onChange={(e) => handleProcessUpdate(index, {
                    ...process,
                    name: e.target.value
                  })}
                  helperText="Naziv proizvodnog procesa"
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Proizvodna ruta"
                  value={process.productionRoute}
                  onChange={(e) => handleProcessUpdate(index, {
                    ...process,
                    productionRoute: e.target.value
                  })}
                  helperText="Proizvodna ruta ili korišćena tehnologija"
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Ukupna količina proizvodnje"
                  type="number"
                  value={process.amounts}
                  onChange={(e) => handleProcessUpdate(index, {
                    ...process,
                    amounts: parseFloat(e.target.value) || 0
                  })}
                  helperText="Ukupna proizvodnja u okviru instalacije"
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Jedinica</InputLabel>
                  <Select
                    value={process.unit}
                    onChange={(e) => handleProcessUpdate(index, {
                      ...process,
                      unit: e.target.value
                    })}
                  >
                    <MenuItem value="t">tone (t)</MenuItem>
                    <MenuItem value="kg">kilogrami (kg)</MenuItem>
                    <MenuItem value="m3">kubni metri (m³)</MenuItem>
                    <MenuItem value="m2">kvadratni metri (m²)</MenuItem>
                    <MenuItem value="m">metri (m)</MenuItem>
                    <MenuItem value="pieces">komadi</MenuItem>
                    <MenuItem value="l">litri (l)</MenuItem>
                    <MenuItem value="other">ostalo</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* Production Details */}
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>
                  Detalji proizvodnje
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Proizvedeno za tržište"
                  type="number"
                  value={process.producedForMarket}
                  onChange={(e) => handleProcessUpdate(index, {
                    ...process,
                    producedForMarket: parseFloat(e.target.value) || 0
                  })}
                  helperText="Količina proizvedena za tržište"
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Udeo za tržište (%)"
                  type="number"
                  value={process.shareProducedForMarket}
                  onChange={(e) => handleProcessUpdate(index, {
                    ...process,
                    shareProducedForMarket: parseFloat(e.target.value) || 0
                  })}
                  helperText="Udeo ukupne proizvodnje za tržište"
                  inputProps={{ min: 0, max: 100 }}
                />
              </Grid>
              
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={process.totalProductionOnlyForMarket}
                      onChange={(e) => handleProcessUpdate(index, {
                        ...process,
                        totalProductionOnlyForMarket: e.target.checked
                      })}
                    />
                  }
                  label="Ukupna proizvodnja samo za tržište?"
                />
              </Grid>

              {/* Direct Emissions */}
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>
                  Direktno pripisive emisije
                </Typography>
              </Grid>
              
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={process.directlyAttributableEmissions.applicable}
                      onChange={(e) => handleProcessUpdate(index, {
                        ...process,
                        directlyAttributableEmissions: {
                          ...process.directlyAttributableEmissions,
                          applicable: e.target.checked
                        }
                      })}
                    />
                  }
                  label="Primjenjuju se direktno pripisive emisije?"
                />
              </Grid>
              
              {process.directlyAttributableEmissions.applicable && (
                <>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Direktne emisije (tCO2e)"
                      type="number"
                      value={process.directlyAttributableEmissions.amount}
                      onChange={(e) => handleProcessUpdate(index, {
                        ...process,
                        directlyAttributableEmissions: {
                          ...process.directlyAttributableEmissions,
                          amount: parseFloat(e.target.value) || 0
                        }
                      })}
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Izvor podataka"
                      value={process.directlyAttributableEmissions.dataSource}
                      onChange={(e) => handleProcessUpdate(index, {
                        ...process,
                        directlyAttributableEmissions: {
                          ...process.directlyAttributableEmissions,
                          dataSource: e.target.value
                        }
                      })}
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Metoda proračuna"
                      value={process.directlyAttributableEmissions.calculationMethod}
                      onChange={(e) => handleProcessUpdate(index, {
                        ...process,
                        directlyAttributableEmissions: {
                          ...process.directlyAttributableEmissions,
                          calculationMethod: e.target.value
                        }
                      })}
                    />
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Metoda mjerenja"
                      value={process.directlyAttributableEmissions.measurementMethod || ''}
                      onChange={(e) => handleProcessUpdate(index, {
                        ...process,
                        directlyAttributableEmissions: {
                          ...process.directlyAttributableEmissions,
                          measurementMethod: e.target.value
                        }
                      })}
                    />
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Učestalost mjerenja"
                      value={process.directlyAttributableEmissions.measurementFrequency || ''}
                      onChange={(e) => handleProcessUpdate(index, {
                        ...process,
                        directlyAttributableEmissions: {
                          ...process.directlyAttributableEmissions,
                          measurementFrequency: e.target.value
                        }
                      })}
                    />
                  </Grid>
                </>
              )}

              {/* Measurable Heat */}
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>
                  Mjerljiva toplota
                </Typography>
              </Grid>
              
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={process.measurableHeat.applicable}
                      onChange={(e) => handleProcessUpdate(index, {
                        ...process,
                        measurableHeat: {
                          ...process.measurableHeat,
                          applicable: e.target.checked
                        }
                      })}
                    />
                  }
                  label="Primjenjuje se mjerljiva toplota?"
                />
              </Grid>
              
              {process.measurableHeat.applicable && (
                <>
                  <Grid item xs={12} md={3}>
                    <TextField
                      fullWidth
                      label="Neto toplota (TJ)"
                      type="number"
                      value={process.measurableHeat.netAmount}
                      onChange={(e) => handleProcessUpdate(index, {
                        ...process,
                        measurableHeat: {
                          ...process.measurableHeat,
                          netAmount: parseFloat(e.target.value) || 0
                        }
                      })}
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={3}>
                    <TextField
                      fullWidth
                      label="Uvezena toplota (TJ)"
                      type="number"
                      value={process.measurableHeat.imported}
                      onChange={(e) => handleProcessUpdate(index, {
                        ...process,
                        measurableHeat: {
                          ...process.measurableHeat,
                          imported: parseFloat(e.target.value) || 0
                        }
                      })}
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={3}>
                    <TextField
                      fullWidth
                      label="Izvezena toplota (TJ)"
                      type="number"
                      value={process.measurableHeat.exported}
                      onChange={(e) => handleProcessUpdate(index, {
                        ...process,
                        measurableHeat: {
                          ...process.measurableHeat,
                          exported: parseFloat(e.target.value) || 0
                        }
                      })}
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={3}>
                    <TextField
                      fullWidth
                      label="Faktor emisije (tCO2/TJ)"
                      type="number"
                      value={process.measurableHeat.emissionFactor}
                      onChange={(e) => handleProcessUpdate(index, {
                        ...process,
                        measurableHeat: {
                          ...process.measurableHeat,
                          emissionFactor: parseFloat(e.target.value) || 0
                        }
                      })}
                    />
                  </Grid>
                </>
              )}

              {/* Waste Gases */}
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>
                  Otpadni plinovi
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={process.wasteGases.applicable}
                      onChange={(e) => handleProcessUpdate(index, {
                        ...process,
                        wasteGases: {
                          ...process.wasteGases,
                          applicable: e.target.checked
                        }
                      })}
                    />
                  }
                  label="Primjenjuju se otpadni plinovi?"
                />
              </Grid>
              {process.wasteGases.applicable && (
                <>
                  <Grid item xs={12} md={3}>
                    <TextField
                      fullWidth
                      label="Otpadni plinovi (TJ)"
                      type="number"
                      value={process.wasteGases.amount}
                      onChange={(e) => handleProcessUpdate(index, {
                        ...process,
                        wasteGases: {
                          ...process.wasteGases,
                          amount: parseFloat(e.target.value) || 0
                        }
                      })}
                    />
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <TextField
                      fullWidth
                      label="Uvezena količina (TJ)"
                      type="number"
                      value={process.wasteGases.imported}
                      onChange={(e) => handleProcessUpdate(index, {
                        ...process,
                        wasteGases: {
                          ...process.wasteGases,
                          imported: parseFloat(e.target.value) || 0
                        }
                      })}
                    />
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <TextField
                      fullWidth
                      label="Izvezena količina (TJ)"
                      type="number"
                      value={process.wasteGases.exported}
                      onChange={(e) => handleProcessUpdate(index, {
                        ...process,
                        wasteGases: {
                          ...process.wasteGases,
                          exported: parseFloat(e.target.value) || 0
                        }
                      })}
                    />
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <TextField
                      fullWidth
                      label="Faktor emisije (tCO2/TJ)"
                      type="number"
                      value={process.wasteGases.emissionFactor}
                      onChange={(e) => handleProcessUpdate(index, {
                        ...process,
                        wasteGases: {
                          ...process.wasteGases,
                          emissionFactor: parseFloat(e.target.value) || 0
                        }
                      })}
                    />
                  </Grid>
                </>
              )}

              {/* Indirektne emisije (električna energija) */}
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>
                  Neizravne emisije (električna energija)
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={process.indirectEmissions.applicable}
                      onChange={(e) => handleProcessUpdate(index, {
                        ...process,
                        indirectEmissions: {
                          ...process.indirectEmissions,
                          applicable: e.target.checked
                        }
                      })}
                    />
                  }
                  label="Primjenjuju se neizravne emisije?"
                />
              </Grid>
              {process.indirectEmissions.applicable && (
                <>
                  <Grid item xs={12} md={3}>
                    <TextField
                      fullWidth
                      label="Potrošnja električne energije"
                      type="number"
                      value={process.indirectEmissions.electricityConsumption}
                      onChange={(e) => handleProcessUpdate(index, {
                        ...process,
                        indirectEmissions: {
                          ...process.indirectEmissions,
                          electricityConsumption: parseFloat(e.target.value) || 0
                        }
                      })}
                    />
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <FormControl fullWidth>
                      <InputLabel>Jedinica</InputLabel>
                      <Select
                        value={process.indirectEmissions.electricityUnit}
                        onChange={(e) => handleProcessUpdate(index, {
                          ...process,
                          indirectEmissions: {
                            ...process.indirectEmissions,
                            electricityUnit: e.target.value as any
                          }
                        })}
                      >
                        <MenuItem value="MWh">MWh</MenuItem>
                        <MenuItem value="kWh">kWh</MenuItem>
                        <MenuItem value="GJ">GJ</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <TextField
                      fullWidth
                      label="Faktor emisije"
                      type="number"
                      value={process.indirectEmissions.emissionFactor}
                      onChange={(e) => handleProcessUpdate(index, {
                        ...process,
                        indirectEmissions: {
                          ...process.indirectEmissions,
                          emissionFactor: parseFloat(e.target.value) || 0
                        }
                      })}
                    />
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <FormControl fullWidth>
                      <InputLabel>Jedinica EF</InputLabel>
                      <Select
                        value={process.indirectEmissions.emissionFactorUnit}
                        onChange={(e) => handleProcessUpdate(index, {
                          ...process,
                          indirectEmissions: {
                            ...process.indirectEmissions,
                            emissionFactorUnit: e.target.value as any
                          }
                        })}
                      >
                        <MenuItem value="tCO2/MWh">tCO2/MWh</MenuItem>
                        <MenuItem value="tCO2/kWh">tCO2/kWh</MenuItem>
                        <MenuItem value="tCO2/GJ">tCO2/GJ</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </>
              )}

              {/* Izvoz električne energije */}
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>
                  Izvoz električne energije
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={process.electricityExported.applicable}
                      onChange={(e) => handleProcessUpdate(index, {
                        ...process,
                        electricityExported: {
                          ...process.electricityExported,
                          applicable: e.target.checked
                        }
                      })}
                    />
                  }
                  label="Primjenjuje se izvoz električne energije?"
                />
              </Grid>
              {process.electricityExported.applicable && (
                <>
                  <Grid item xs={12} md={3}>
                    <TextField
                      fullWidth
                      label="Izvezena el. energija"
                      type="number"
                      value={process.electricityExported.exportedAmount}
                      onChange={(e) => handleProcessUpdate(index, {
                        ...process,
                        electricityExported: {
                          ...process.electricityExported,
                          exportedAmount: parseFloat(e.target.value) || 0
                        }
                      })}
                    />
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <FormControl fullWidth>
                      <InputLabel>Jedinica</InputLabel>
                      <Select
                        value={process.electricityExported.unit}
                        onChange={(e) => handleProcessUpdate(index, {
                          ...process,
                          electricityExported: {
                            ...process.electricityExported,
                            unit: e.target.value as any
                          }
                        })}
                      >
                        <MenuItem value="MWh">MWh</MenuItem>
                        <MenuItem value="kWh">kWh</MenuItem>
                        <MenuItem value="GJ">GJ</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <TextField
                      fullWidth
                      label="EF izvezene el. energije"
                      type="number"
                      value={process.electricityExported.emissionFactor}
                      onChange={(e) => handleProcessUpdate(index, {
                        ...process,
                        electricityExported: {
                          ...process.electricityExported,
                          emissionFactor: parseFloat(e.target.value) || 0
                        }
                      })}
                    />
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <FormControl fullWidth>
                      <InputLabel>Jedinica EF</InputLabel>
                      <Select
                        value={process.electricityExported.emissionFactorUnit}
                        onChange={(e) => handleProcessUpdate(index, {
                          ...process,
                          electricityExported: {
                            ...process.electricityExported,
                            emissionFactorUnit: e.target.value as any
                          }
                        })}
                      >
                        <MenuItem value="tCO2/MWh">tCO2/MWh</MenuItem>
                        <MenuItem value="tCO2/kWh">tCO2/kWh</MenuItem>
                        <MenuItem value="tCO2/GJ">tCO2/GJ</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </>
              )}

              {/* Ne-CBAM dobra i kontrola */}
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>
                  Ne‑CBAM dobra i kontrola
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Količina ne‑CBAM dobara"
                  type="number"
                  value={process.consumedForNonCBAMGoods}
                  onChange={(e) => handleProcessUpdate(index, {
                    ...process,
                    consumedForNonCBAMGoods: parseFloat(e.target.value) || 0
                  })}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Kontrolni total"
                  type="number"
                  value={process.controlTotal}
                  onChange={(e) => handleProcessUpdate(index, {
                    ...process,
                    controlTotal: parseFloat(e.target.value) || 0
                  })}
                />
              </Grid>

              {/* Calculated Results */}
              {process.calculatedEmissions.netAttributedEmissions > 0 && (
                <>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" gutterBottom>
                      Izračunati rezultati emisija
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Neto pripisane emisije (tCO2e)"
                      value={process.calculatedEmissions?.netAttributedEmissions?.toFixed(2) ?? '0.00'}
                      InputProps={{ readOnly: true }}
                      helperText="Ukupno pripisane emisije za ovaj proces"
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Specifične ugrađene emisije (tCO2e/jedinica)"
                      value={process.calculatedEmissions?.specificEmbeddedEmissions?.toFixed(4) ?? '0.0000'}
                      InputProps={{ readOnly: true }}
                      helperText="SEE po jedinici proizvodnje"
                    />
                  </Grid>
                </>
              )}

              {/* Input/Output Matrice */}
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>
                  Ulazno/izlazne matrice
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body2">Proces → Proces</Typography>
              </Grid>
              {Array.from({ length: process.inputOutputMatrix.processToProcess.length || 0 }).map((_, rIdx) => (
                <React.Fragment key={`p2p-${process.id}-${rIdx}`}>
                  <Grid item xs={12} md={3}>
                    <TextField
                      fullWidth
                      label="Iz procesa"
                      type="number"
                      value={process.inputOutputMatrix.processToProcess[rIdx]?.[0]?.fromProcess || 0}
                      onChange={(e) => {
                        const v = parseInt(e.target.value || '0', 10);
                        const rows = [...(process.inputOutputMatrix.processToProcess || [])];
                        const cell = { ...(rows[rIdx]?.[0] || { fromProcess: 0, toProcess: 0, amount: 0, unit: '', share: 0, calculationMethod: '' }) } as any;
                        cell.fromProcess = v;
                        rows[rIdx] = [cell];
                        handleProcessUpdate(index, { ...process, inputOutputMatrix: { ...process.inputOutputMatrix, processToProcess: rows } });
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <TextField
                      fullWidth
                      label="U proces"
                      type="number"
                      value={process.inputOutputMatrix.processToProcess[rIdx]?.[0]?.toProcess || 0}
                      onChange={(e) => {
                        const v = parseInt(e.target.value || '0', 10);
                        const rows = [...(process.inputOutputMatrix.processToProcess || [])];
                        const cell = { ...(rows[rIdx]?.[0] || { fromProcess: 0, toProcess: 0, amount: 0, unit: '', share: 0, calculationMethod: '' }) } as any;
                        cell.toProcess = v;
                        rows[rIdx] = [cell];
                        handleProcessUpdate(index, { ...process, inputOutputMatrix: { ...process.inputOutputMatrix, processToProcess: rows } });
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <TextField
                      fullWidth
                      label="Količina"
                      type="number"
                      value={process.inputOutputMatrix.processToProcess[rIdx]?.[0]?.amount || 0}
                      onChange={(e) => {
                        const v = parseFloat(e.target.value) || 0;
                        const rows = [...(process.inputOutputMatrix.processToProcess || [])];
                        const cell = { ...(rows[rIdx]?.[0] || { fromProcess: 0, toProcess: 0, amount: 0, unit: '', share: 0, calculationMethod: '' }) } as any;
                        cell.amount = v;
                        rows[rIdx] = [cell];
                        handleProcessUpdate(index, { ...process, inputOutputMatrix: { ...process.inputOutputMatrix, processToProcess: rows } });
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <FormControl fullWidth>
                      <InputLabel>Jedinica</InputLabel>
                      <Select
                        value={process.inputOutputMatrix.processToProcess[rIdx]?.[0]?.unit || process.unit || 't'}
                        onChange={(e) => {
                          const rows = [...(process.inputOutputMatrix.processToProcess || [])];
                          const cell = { ...(rows[rIdx]?.[0] || { fromProcess: 0, toProcess: 0, amount: 0, unit: '', share: 0, calculationMethod: '' }) } as any;
                          cell.unit = e.target.value;
                          rows[rIdx] = [cell];
                          handleProcessUpdate(index, { ...process, inputOutputMatrix: { ...process.inputOutputMatrix, processToProcess: rows } });
                        }}
                      >
                        <MenuItem value="t">t</MenuItem>
                        <MenuItem value="kg">kg</MenuItem>
                        <MenuItem value="m3">m³</MenuItem>
                        <MenuItem value="pieces">kom</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <TextField
                      fullWidth
                      label="Udio (%)"
                      type="number"
                      value={process.inputOutputMatrix.processToProcess[rIdx]?.[0]?.share || 0}
                      onChange={(e) => {
                        const v = parseFloat(e.target.value) || 0;
                        const rows = [...(process.inputOutputMatrix.processToProcess || [])];
                        const cell = { ...(rows[rIdx]?.[0] || { fromProcess: 0, toProcess: 0, amount: 0, unit: process.unit || 't', share: 0, calculationMethod: '' }) } as any;
                        cell.share = v;
                        rows[rIdx] = [cell];
                        handleProcessUpdate(index, { ...process, inputOutputMatrix: { ...process.inputOutputMatrix, processToProcess: rows } });
                      }}
                      inputProps={{ min: 0, max: 100, step: 0.01 }}
                    />
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <TextField
                      fullWidth
                      label="Metoda"
                      value={process.inputOutputMatrix.processToProcess[rIdx]?.[0]?.calculationMethod || ''}
                      onChange={(e) => {
                        const rows = [...(process.inputOutputMatrix.processToProcess || [])];
                        const cell = { ...(rows[rIdx]?.[0] || { fromProcess: 0, toProcess: 0, amount: 0, unit: process.unit || 't', share: 0, calculationMethod: '' }) } as any;
                        cell.calculationMethod = e.target.value;
                        rows[rIdx] = [cell];
                        handleProcessUpdate(index, { ...process, inputOutputMatrix: { ...process.inputOutputMatrix, processToProcess: rows } });
                      }}
                    />
                  </Grid>
                </React.Fragment>
              ))}
              <Grid item xs={12}>
                <Button onClick={() => {
                  const rows = [...(process.inputOutputMatrix.processToProcess || [])];
                  rows.push([{ fromProcess: process.processNumber, toProcess: 0, amount: 0, unit: process.unit || 't', share: 0, calculationMethod: '' }] as any);
                  handleProcessUpdate(index, { ...process, inputOutputMatrix: { ...process.inputOutputMatrix, processToProcess: rows } });
                }}>Dodaj vezu Proces→Proces</Button>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="body2">Proces → Proizvod</Typography>
              </Grid>
              {Array.from({ length: process.inputOutputMatrix.processToProduct.length || 0 }).map((_, rIdx) => (
                <React.Fragment key={`p2prod-${process.id}-${rIdx}`}>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Proces #"
                      type="number"
                      value={process.inputOutputMatrix.processToProduct[rIdx]?.[0]?.processNumber || process.processNumber}
                      onChange={(e) => {
                        const v = parseInt(e.target.value || '0', 10);
                        const rows = [...(process.inputOutputMatrix.processToProduct || [])];
                        const cell = { ...(rows[rIdx]?.[0] || { processNumber: 0, productNumber: 0, amount: 0, unit: '', shareOfTotal: 0, cbamRelevant: true }) } as any;
                        cell.processNumber = v;
                        rows[rIdx] = [cell];
                        handleProcessUpdate(index, { ...process, inputOutputMatrix: { ...process.inputOutputMatrix, processToProduct: rows } });
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Proizvod #"
                      type="number"
                      value={process.inputOutputMatrix.processToProduct[rIdx]?.[0]?.productNumber || 0}
                      onChange={(e) => {
                        const v = parseInt(e.target.value || '0', 10);
                        const rows = [...(process.inputOutputMatrix.processToProduct || [])];
                        const cell = { ...(rows[rIdx]?.[0] || { processNumber: 0, productNumber: 0, amount: 0, unit: '', shareOfTotal: 0, cbamRelevant: true }) } as any;
                        cell.productNumber = v;
                        rows[rIdx] = [cell];
                        handleProcessUpdate(index, { ...process, inputOutputMatrix: { ...process.inputOutputMatrix, processToProduct: rows } });
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Količina"
                      type="number"
                      value={process.inputOutputMatrix.processToProduct[rIdx]?.[0]?.amount || 0}
                      onChange={(e) => {
                        const v = parseFloat(e.target.value) || 0;
                        const rows = [...(process.inputOutputMatrix.processToProduct || [])];
                        const cell = { ...(rows[rIdx]?.[0] || { processNumber: 0, productNumber: 0, amount: 0, unit: '', shareOfTotal: 0, cbamRelevant: true }) } as any;
                        cell.amount = v;
                        rows[rIdx] = [cell];
                        handleProcessUpdate(index, { ...process, inputOutputMatrix: { ...process.inputOutputMatrix, processToProduct: rows } });
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <FormControl fullWidth>
                      <InputLabel>Jedinica</InputLabel>
                      <Select
                        value={process.inputOutputMatrix.processToProduct[rIdx]?.[0]?.unit || process.unit || 't'}
                        onChange={(e) => {
                          const rows = [...(process.inputOutputMatrix.processToProduct || [])];
                          const cell = { ...(rows[rIdx]?.[0] || { processNumber: 0, productNumber: 0, amount: 0, unit: '', shareOfTotal: 0, cbamRelevant: true }) } as any;
                          cell.unit = e.target.value;
                          rows[rIdx] = [cell];
                          handleProcessUpdate(index, { ...process, inputOutputMatrix: { ...process.inputOutputMatrix, processToProduct: rows } });
                        }}
                      >
                        <MenuItem value="t">t</MenuItem>
                        <MenuItem value="kg">kg</MenuItem>
                        <MenuItem value="m3">m³</MenuItem>
                        <MenuItem value="pieces">kom</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <TextField
                      fullWidth
                      label="Udio ukupno (%)"
                      type="number"
                      value={process.inputOutputMatrix.processToProduct[rIdx]?.[0]?.shareOfTotal || 0}
                      onChange={(e) => {
                        const v = parseFloat(e.target.value) || 0;
                        const rows = [...(process.inputOutputMatrix.processToProduct || [])];
                        const cell = { ...(rows[rIdx]?.[0] || { processNumber: 0, productNumber: 0, amount: 0, unit: process.unit || 't', shareOfTotal: 0, cbamRelevant: true }) } as any;
                        cell.shareOfTotal = v;
                        rows[rIdx] = [cell];
                        handleProcessUpdate(index, { ...process, inputOutputMatrix: { ...process.inputOutputMatrix, processToProduct: rows } });
                      }}
                      inputProps={{ min: 0, max: 100, step: 0.01 }}
                    />
                  </Grid>
                  <Grid item xs={12} md={2}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={process.inputOutputMatrix.processToProduct[rIdx]?.[0]?.cbamRelevant ?? true}
                          onChange={(e) => {
                            const rows = [...(process.inputOutputMatrix.processToProduct || [])];
                            const cell = { ...(rows[rIdx]?.[0] || { processNumber: process.processNumber, productNumber: 0, amount: 0, unit: process.unit || 't', shareOfTotal: 0, cbamRelevant: true }) } as any;
                            cell.cbamRelevant = e.target.checked;
                            rows[rIdx] = [cell];
                            handleProcessUpdate(index, { ...process, inputOutputMatrix: { ...process.inputOutputMatrix, processToProduct: rows } });
                          }}
                        />
                      }
                      label="CBAM relevantno"
                    />
                  </Grid>
                </React.Fragment>
              ))}
              <Grid item xs={12}>
                <Button onClick={() => {
                  const rows = [...(process.inputOutputMatrix.processToProduct || [])];
                  rows.push([{ processNumber: process.processNumber, productNumber: 0, amount: 0, unit: process.unit || 't', shareOfTotal: 0, cbamRelevant: true }] as any);
                  handleProcessUpdate(index, { ...process, inputOutputMatrix: { ...process.inputOutputMatrix, processToProduct: rows } });
                }}>Dodaj vezu Proces→Proizvod</Button>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="body2">Konzumacija prekursora</Typography>
              </Grid>
              {Array.from({ length: process.inputOutputMatrix.precursorConsumption.length || 0 }).map((_, rIdx) => (
                <React.Fragment key={`prec-${process.id}-${rIdx}`}>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Prekursor #"
                      type="number"
                      value={process.inputOutputMatrix.precursorConsumption[rIdx]?.[0]?.precursorNumber || 0}
                      onChange={(e) => {
                        const v = parseInt(e.target.value || '0', 10);
                        const rows = [...(process.inputOutputMatrix.precursorConsumption || [])];
                        const cell = { ...(rows[rIdx]?.[0] || { processNumber: process.processNumber, precursorNumber: 0, amount: 0, unit: process.unit || 't', sourceType: 'internal' }) } as any;
                        cell.precursorNumber = v;
                        rows[rIdx] = [cell];
                        handleProcessUpdate(index, { ...process, inputOutputMatrix: { ...process.inputOutputMatrix, precursorConsumption: rows } });
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Količina"
                      type="number"
                      value={process.inputOutputMatrix.precursorConsumption[rIdx]?.[0]?.amount || 0}
                      onChange={(e) => {
                        const v = parseFloat(e.target.value) || 0;
                        const rows = [...(process.inputOutputMatrix.precursorConsumption || [])];
                        const cell = { ...(rows[rIdx]?.[0] || { processNumber: process.processNumber, precursorNumber: 0, amount: 0, unit: process.unit || 't', sourceType: 'internal' }) } as any;
                        cell.amount = v;
                        rows[rIdx] = [cell];
                        handleProcessUpdate(index, { ...process, inputOutputMatrix: { ...process.inputOutputMatrix, precursorConsumption: rows } });
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <FormControl fullWidth>
                      <InputLabel>Jedinica</InputLabel>
                      <Select
                        value={process.inputOutputMatrix.precursorConsumption[rIdx]?.[0]?.unit || process.unit || 't'}
                        onChange={(e) => {
                          const rows = [...(process.inputOutputMatrix.precursorConsumption || [])];
                          const cell = { ...(rows[rIdx]?.[0] || { processNumber: process.processNumber, precursorNumber: 0, amount: 0, unit: process.unit || 't', sourceType: 'internal' }) } as any;
                          cell.unit = e.target.value;
                          rows[rIdx] = [cell];
                          handleProcessUpdate(index, { ...process, inputOutputMatrix: { ...process.inputOutputMatrix, precursorConsumption: rows } });
                        }}
                      >
                        <MenuItem value="t">t</MenuItem>
                        <MenuItem value="kg">kg</MenuItem>
                        <MenuItem value="m3">m³</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </React.Fragment>
              ))}
              <Grid item xs={12}>
                <Button onClick={() => {
                  const rows = [...(process.inputOutputMatrix.precursorConsumption || [])];
                  rows.push([{ processNumber: process.processNumber, precursorNumber: 0, amount: 0, unit: process.unit || 't', sourceType: 'internal' }] as any);
                  handleProcessUpdate(index, { ...process, inputOutputMatrix: { ...process.inputOutputMatrix, precursorConsumption: rows } });
                }}>Dodaj prekursor</Button>
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>
      ))}

      {/* Add Process Button */}
      <Box sx={{ mt: 2, textAlign: 'center' }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={addProductionProcess}
          disabled={localData.productionProcesses.length >= PRODUCTION_PROCESS_LIMITS.MAX_PROCESSES}
        >
          Dodaj proizvodni proces ({localData.productionProcesses.length}/{PRODUCTION_PROCESS_LIMITS.MAX_PROCESSES})
        </Button>
      </Box>
    </Box>
  );
};

export default DProcessesStep;
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

import {
  ProductionProcess,
  DProcessesData,
  DEFAULT_PRODUCTION_PROCESS,
  DEFAULT_DPROCESSES_DATA,
  PRODUCTION_PROCESS_LIMITS
} from '../../types/DProcessesTypes';

interface DProcessesStepProps {
  data: DProcessesData;
  onUpdate: (data: DProcessesData) => void;
}

const DProcessesStep: React.FC<DProcessesStepProps> = ({ data, onUpdate }) => {
  const [localData, setLocalData] = useState<DProcessesData>(data || DEFAULT_DPROCESSES_DATA);
  const [expandedAccordion, setExpandedAccordion] = useState<string | false>('process-0');
  const [updateTimeout, setUpdateTimeout] = useState<NodeJS.Timeout | null>(null);

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
    }, 300); // 300ms debounce
    
    setUpdateTimeout(timeout);
  }, [onUpdate, updateTimeout]);

  const handleProcessUpdate = useCallback((index: number, updatedProcess: ProductionProcess) => {
    const updatedProcesses = [...localData.productionProcesses];
    updatedProcesses[index] = updatedProcess;
    
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

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        D_Processes - Proizvodni procesi sa ulazno/izlaznim matricama
      </Typography>
      
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
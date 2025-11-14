import React, { useState, useCallback, useMemo } from 'react';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  TextField,
  Button,
  Grid,
  Box,
  Chip,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  Divider
} from '@mui/material';
import { Tooltip } from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Info as InfoIcon
} from '@mui/icons-material';

import {
  FEmissionsData,
  AdditionalEmission,
  EMISSION_TYPES,
  CALCULATION_METHODS,
  DATA_QUALITY_LEVELS,
  VERIFICATION_LEVELS,
  VERIFICATION_RESULTS,
  F_EMISSIONS_DEFAULTS,
  CALCULATION_CONSTANTS
} from '../../types/FEmissionsTypes';
import { calculateFEmissions } from '../../utils/fEmissionsCalculationEngine';
import { CBAMData } from '../../types/CBAMData';

interface FEmissionsStepProps {
  data: CBAMData;
  onUpdate: (data: CBAMData) => void;
}

const FEmissionsStep: React.FC<FEmissionsStepProps> = ({ data, onUpdate }) => {
  const [localData, setLocalData] = useState<FEmissionsData>(
    data.fEmissions || F_EMISSIONS_DEFAULTS
  );
  const [validation, setValidation] = useState<any>(null);
  const [calculatedFields, setCalculatedFields] = useState<string[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEmission, setEditingEmission] = useState<AdditionalEmission | null>(null);
  const [expandedAccordion, setExpandedAccordion] = useState<string>('additional-emissions');

  // Memoized calculation function
  const performCalculations = useCallback((currentData: FEmissionsData) => {
    try {
      const result = calculateFEmissions(
        currentData,
        data.cInstEmissions,
        data.bEmInstData
      );
      
      setValidation(result.data.validationStatus);
      setCalculatedFields(result.calculatedFields);
      
      return result.data;
    } catch (error) {
      console.error('Error calculating F_Emissions:', error);
      setValidation({
        isValid: false,
        errors: ['Calculation error occurred'],
        warnings: [],
        completenessScore: 0
      });
      return currentData;
    }
  }, [data.cInstEmissions, data.bEmInstData]);

  // Perform calculations when data changes
  const calculatedData = useMemo(() => {
    return performCalculations(localData);
  }, [localData, performCalculations]);

  // Update parent when calculated data changes
  React.useEffect(() => {
    onUpdate({
      ...data,
      fEmissions: calculatedData
    });
  }, [calculatedData, onUpdate, data]);

  const handleAccordionChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpandedAccordion(isExpanded ? panel : '');
  };

  const handleEmissionChange = (index: number, field: keyof AdditionalEmission, value: any) => {
    const updatedEmissions = [...localData.additionalEmissions];
    updatedEmissions[index] = {
      ...updatedEmissions[index],
      [field]: value
    };
    
    setLocalData({
      ...localData,
      additionalEmissions: updatedEmissions
    });
  };

  const handleNestedEmissionChange = (index: number, parentField: string, field: string, value: any) => {
    const updatedEmissions = [...localData.additionalEmissions];
    const currentParentField = updatedEmissions[index][parentField as keyof AdditionalEmission];
    
    updatedEmissions[index] = {
      ...updatedEmissions[index],
      [parentField]: {
        ...(typeof currentParentField === 'object' && currentParentField !== null ? currentParentField : {}),
        [field]: value
      }
    };
    
    setLocalData({
      ...localData,
      additionalEmissions: updatedEmissions
    });
  };

  const addNewEmission = () => {
    const newEmission: AdditionalEmission = {
      id: `emission_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      emissionType: 'Other',
      emissionSource: '',
      co2Emissions: 0,
      n2OEmissions: 0,
      pfcEmissions: 0,
      biomassCO2: 0,
      calculationMethod: 'Tier 1',
      activityData: {
        value: 0,
        unit: 't',
        dataSource: '',
        measurementMethod: '',
        uncertainty: 0,
        temporalResolution: 'Annual',
        spatialResolution: 'Site'
      },
      emissionFactor: {
        value: 0,
        unit: 't CO2/t',
        source: '',
        year: new Date().getFullYear(),
        applicability: '',
        uncertainty: 0,
        biomassFraction: 0
      },
      uncertainty: 0,
      dataQuality: 'Unknown',
      verificationStatus: 'Not Verified',
      comments: ''
    };

    setEditingEmission(newEmission);
    setDialogOpen(true);
  };

  const editEmission = (emission: AdditionalEmission) => {
    setEditingEmission(emission);
    setDialogOpen(true);
  };

  const deleteEmission = (index: number) => {
    const updatedEmissions = localData.additionalEmissions.filter((_, i) => i !== index);
    setLocalData({
      ...localData,
      additionalEmissions: updatedEmissions
    });
  };

  const saveEmission = (emission: AdditionalEmission) => {
    const updatedEmissions = [...localData.additionalEmissions];
    const existingIndex = updatedEmissions.findIndex(e => e.id === emission.id);
    
    if (existingIndex >= 0) {
      updatedEmissions[existingIndex] = emission;
    } else {
      updatedEmissions.push(emission);
    }
    
    setLocalData({
      ...localData,
      additionalEmissions: updatedEmissions
    });
    
    setDialogOpen(false);
    setEditingEmission(null);
  };

  const handleMetadataChange = (field: string, value: any) => {
    setLocalData({
      ...localData,
      metadata: {
        ...localData.metadata,
        [field]: value
      }
    });
  };

  const handleVerificationChange = (field: string, value: any) => {
    setLocalData({
      ...localData,
      verificationData: {
        ...localData.verificationData,
        [field]: value
      }
    });
  };

  const getValidationChip = () => {
    if (!validation) return null;
    
    const { isValid, errors, warnings, completenessScore } = validation;
    
    if (errors.length > 0) {
      return (
        <Tooltip title="Broj grešaka u dodatnim emisijama">
          <Chip icon={<WarningIcon />} label={`${errors.length} Grešaka`} color="error" size="small" />
        </Tooltip>
      );
    } else if (warnings.length > 0) {
      return (
        <Tooltip title="Broj upozorenja u dodatnim emisijama">
          <Chip icon={<InfoIcon />} label={`${warnings.length} Upozorenja`} color="warning" size="small" />
        </Tooltip>
      );
    } else if (isValid) {
      return (
        <Tooltip title="Podaci valjani i konzistentni">
          <Chip icon={<CheckCircleIcon />} label="Validno" color="success" size="small" />
        </Tooltip>
      );
    }
    
    return null;
  };

  const getCompletenessChip = () => {
    if (!validation) return null;
    
    const { completenessScore } = validation;
    const color = completenessScore >= 90 ? 'success' : completenessScore >= 70 ? 'warning' : 'error';
    
    return (
      <Tooltip title="Procenat popunjenosti i valjanosti podataka">
        <Chip label={`${completenessScore}% Popunjeno`} color={color} size="small" />
      </Tooltip>
    );
  };

  const getStatusColor = (status: string) => {
    if (status === 'OK') return 'success';
    if (status === 'Warning') return 'warning';
    if (status === 'Error') return 'error';
    return 'default';
  };

  const renderCrossSheetSummary = () => {
    const c = data.cInstEmissions?.emissionsBalance;
    const f = localData.emissionCalculations;
    const bCount = data.bEmInstData?.emissionSources?.length || 0;
    const fCount = localData.additionalEmissions.length;

    const cDirect = c?.totalDirectEmissions || 0;
    const cCO2 = c?.totalCO2Emissions || 0;
    const cBiomass = c?.biomassEmissions || 0;
    const cTotal = c?.totalEmissions || 0;

    const fCO2 = f.totalCO2 || 0;
    const fBiomass = f.totalBiomassCO2 || 0;
    const fCO2Eq = f.co2Equivalent || 0;

    const pct = (a: number, b: number) => (b > 0 ? Math.abs(a - b) / b : 0);

    const co2VsDirectStatus = cDirect > 0 && fCO2 > cDirect ? 'Error' : cDirect > 0 && fCO2 > cDirect * 0.5 ? 'Warning' : 'OK';
    const co2VsDirectDiff = pct(fCO2, cDirect);

    const co2VsCO2Diff = pct(fCO2, cCO2);
    const co2VsCO2Status = cCO2 > 0 && co2VsCO2Diff > 0.6 ? 'Warning' : 'OK';

    const biomassDiff = pct(fBiomass, cBiomass);
    const biomassStatus = cBiomass === 0 && fBiomass > 0 ? 'Warning' : biomassDiff > 0.6 ? 'Error' : biomassDiff > 0.3 ? 'Warning' : 'OK';

    const co2EqDiff = pct(fCO2Eq, cTotal);
    const co2EqStatus = cTotal > 0 && co2EqDiff > 0.5 ? 'Error' : cTotal > 0 && co2EqDiff > 0.2 ? 'Warning' : 'OK';

    const sourceStatus = bCount > 0 && fCount > bCount * 2 ? 'Warning' : 'OK';

    return (
      <Accordion expanded={expandedAccordion === 'cross-summary'} onChange={handleAccordionChange('cross-summary')} sx={{ mb: 2 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>Unakrsni sažetak (F ↔ C/B)</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="body2">CO2 F vs C Direct</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Tooltip title="CO2 F vs C direktne emisije; pragovi 50% upozorenje, >100% greška">
                  <Chip label={co2VsDirectStatus} color={getStatusColor(co2VsDirectStatus) as any} size="small" />
                </Tooltip>
                <Typography variant="caption">Δ {(co2VsDirectDiff * 100).toFixed(1)}%</Typography>
              </Box>
              <Typography variant="caption" color="text.secondary">F: {fCO2.toFixed(3)} t | C: {cDirect.toFixed(3)} t</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2">CO2 F vs C CO2</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Tooltip title="CO2 F vs CO2 u C; prag visok udio >60%">
                  <Chip label={co2VsCO2Status} color={getStatusColor(co2VsCO2Status) as any} size="small" />
                </Tooltip>
                <Typography variant="caption">Δ {(co2VsCO2Diff * 100).toFixed(1)}%</Typography>
              </Box>
              <Typography variant="caption" color="text.secondary">F: {fCO2.toFixed(3)} t | C: {cCO2.toFixed(3)} t</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2">Biomasa F vs C</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Tooltip title="Biomasa F vs C; pragovi 30%/60% i upozorenje kad C=0, F>0">
                  <Chip label={biomassStatus} color={getStatusColor(biomassStatus) as any} size="small" />
                </Tooltip>
                <Typography variant="caption">Δ {(biomassDiff * 100).toFixed(1)}%</Typography>
              </Box>
              <Typography variant="caption" color="text.secondary">F: {fBiomass.toFixed(3)} t | C: {cBiomass.toFixed(3)} t</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2">CO2eq F vs C Total</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Tooltip title="CO2eq F vs C ukupno; pragovi 20%/50%">
                  <Chip label={co2EqStatus} color={getStatusColor(co2EqStatus) as any} size="small" />
                </Tooltip>
                <Typography variant="caption">Δ {(co2EqDiff * 100).toFixed(1)}%</Typography>
              </Box>
              <Typography variant="caption" color="text.secondary">F: {fCO2Eq.toFixed(3)} t | C: {cTotal.toFixed(3)} t</Typography>
            </Grid>
            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
              <Typography variant="body2">Broj dodatnih izvora F vs B_EmInst</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Tooltip title="Broj dodatnih izvora F naspram izvora u B_EmInst">
                  <Chip label={sourceStatus} color={getStatusColor(sourceStatus) as any} size="small" />
                </Tooltip>
              </Box>
              <Typography variant="caption" color="text.secondary">F: {fCount} | B: {bCount}</Typography>
            </Grid>
          </Grid>
          <Box sx={{ mt: 2 }}>
            {(co2VsDirectStatus !== 'OK' || co2EqStatus !== 'OK' || biomassStatus !== 'OK' || sourceStatus !== 'OK') && (
              <Alert severity={co2VsDirectStatus === 'Error' || co2EqStatus === 'Error' || biomassStatus === 'Error' ? 'error' : 'warning'}>
                <Box>
                  {co2VsDirectStatus !== 'OK' && (
                    <Typography variant="caption" display="block">CO2 u F je visok u odnosu na C direktne emisije; provjeri izvore u F i raspodjelu u C.</Typography>
                  )}
                  {co2EqStatus !== 'OK' && (
                    <Typography variant="caption" display="block">CO2eq u F odstupa od ukupnih emisija u C; provjeri faktore GWP i ulazne podatke.</Typography>
                  )}
                  {biomassStatus !== 'OK' && (
                    <Typography variant="caption" display="block">Uskladi biomasu između F i C; provjeri označavanje biomase.</Typography>
                  )}
                  {sourceStatus !== 'OK' && (
                    <Typography variant="caption" display="block">Broj dodatnih izvora u F je visok naspram B; razmotri spajanje ili klasifikaciju izvora.</Typography>
                  )}
                </Box>
              </Alert>
            )}
          </Box>
        </AccordionDetails>
      </Accordion>
    );
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="h6" gutterBottom>
        F_Emissions - Dodatne emisije i proračuni
      </Typography>
      
      <Box sx={{ mb: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        {getValidationChip()}
        {getCompletenessChip()}
      </Box>

      {validation?.errors.length > 0 && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {validation.errors.map((error: string, index: number) => (
            <div key={index}>{error}</div>
          ))}
        </Alert>
      )}

      {validation?.warnings.length > 0 && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          {validation.warnings.map((warning: string, index: number) => (
            <div key={index}>{warning}</div>
          ))}
        </Alert>
      )}

      {renderCrossSheetSummary()}

      <Accordion 
        expanded={expandedAccordion === 'metadata'} 
        onChange={handleAccordionChange('metadata')}
        sx={{ mb: 2 }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>Metapodaci proračuna</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Period izveštavanja"
                value={localData.metadata.reportingPeriod}
                onChange={(e) => handleMetadataChange('reportingPeriod', e.target.value)}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Proračun izvršio"
                value={localData.metadata.calculatedBy}
                onChange={(e) => handleMetadataChange('calculatedBy', e.target.value)}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Reviziju izvršio"
                value={localData.metadata.reviewedBy}
                onChange={(e) => handleMetadataChange('reviewedBy', e.target.value)}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Pristup proračunu</InputLabel>
                <Select
                  value={localData.metadata.calculationApproach}
                  onChange={(e) => handleMetadataChange('calculationApproach', e.target.value)}
                >
                  <MenuItem value="IPCC Guidelines">IPCC smernice</MenuItem>
                  <MenuItem value="EU ETS Methodology">EU ETS metodologija</MenuItem>
                  <MenuItem value="CBAM Methodology">CBAM metodologija</MenuItem>
                  <MenuItem value="Company Specific">Specifično za kompaniju</MenuItem>
                  <MenuItem value="Industry Standard">Industrijski standard</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      <Accordion 
        expanded={expandedAccordion === 'additional-emissions'} 
        onChange={handleAccordionChange('additional-emissions')}
        sx={{ mb: 2 }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
            <Typography>Dodatne emisije ({localData.additionalEmissions.length} izvora)</Typography>
            <Button
              variant="outlined"
              size="small"
              startIcon={<AddIcon />}
              onClick={(e) => {
                e.stopPropagation();
                addNewEmission();
              }}
            >
              Dodaj emisiju
            </Button>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          {localData.additionalEmissions.length === 0 ? (
            <Alert severity="info">
              Nema dodatnih emisija. Kliknite "Dodaj emisiju" da dodate izvore emisija.
            </Alert>
          ) : (
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Tip</TableCell>
                    <TableCell>Izvor</TableCell>
                    <TableCell align="right">CO2 (t)</TableCell>
                    <TableCell align="right">N2O (t)</TableCell>
                    <TableCell align="right">PFC (t)</TableCell>
                    <TableCell align="right">Biomasa CO2 (t)</TableCell>
                    <TableCell>Metoda</TableCell>
                    <TableCell>Kvalitet</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="center">Akcije</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {localData.additionalEmissions.map((emission, index) => (
                    <TableRow key={emission.id}>
                      <TableCell>{emission.emissionType}</TableCell>
                      <TableCell>{emission.emissionSource}</TableCell>
                      <TableCell align="right">{emission.co2Emissions.toFixed(3)}</TableCell>
                      <TableCell align="right">{emission.n2OEmissions.toFixed(6)}</TableCell>
                      <TableCell align="right">{emission.pfcEmissions.toFixed(9)}</TableCell>
                      <TableCell align="right">{emission.biomassCO2.toFixed(3)}</TableCell>
                      <TableCell>{emission.calculationMethod}</TableCell>
                      <TableCell>
                        <Chip 
                          label={emission.dataQuality} 
                          size="small"
                          color={emission.dataQuality === 'Excellent' || emission.dataQuality === 'Good' ? 'success' : 
                                 emission.dataQuality === 'Fair' ? 'warning' : 'error'}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={emission.verificationStatus} 
                          size="small"
                          color={emission.verificationStatus === 'Verified' ? 'success' : 
                                 emission.verificationStatus === 'Under Review' ? 'warning' : 'default'}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <IconButton size="small" onClick={() => editEmission(emission)}>
                          <EditIcon />
                        </IconButton>
                        <IconButton size="small" onClick={() => deleteEmission(index)} color="error">
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </AccordionDetails>
      </Accordion>

      <Accordion 
        expanded={expandedAccordion === 'calculations'} 
        onChange={handleAccordionChange('calculations')}
        sx={{ mb: 2 }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>Proračuni emisija</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle2" gutterBottom>Ukupne emisije</Typography>
                <List dense>
                  <ListItem>
                    <ListItemText 
                      primary="Ukupan CO2" 
                      secondary={`${localData.emissionCalculations.totalCO2.toFixed(3)} t`} 
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Ukupan N2O" 
                      secondary={`${localData.emissionCalculations.totalN2O.toFixed(6)} t`} 
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Ukupan PFC" 
                      secondary={`${localData.emissionCalculations.totalPFC.toFixed(9)} t`} 
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Ukupan biomasa CO2" 
                      secondary={`${localData.emissionCalculations.totalBiomassCO2.toFixed(3)} t`} 
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Ukupan fosilni CO2" 
                      secondary={`${localData.emissionCalculations.totalFossilCO2.toFixed(3)} t`} 
                    />
                  </ListItem>
                </List>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle2" gutterBottom>Izračunate vrednosti</Typography>
                <List dense>
                  <ListItem>
                    <ListItemText 
                      primary="Ukupan GHG" 
                      secondary={`${localData.emissionCalculations.totalGHG.toFixed(3)} t`} 
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="CO2 ekvivalent" 
                      secondary={`${localData.emissionCalculations.co2Equivalent.toFixed(3)} t`} 
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Broj izvora" 
                      secondary={localData.additionalEmissions.length} 
                    />
                  </ListItem>
                </List>
              </Paper>
            </Grid>
          </Grid>

          {localData.emissionCalculations.calculationChecks.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>Provere proračuna</Typography>
              <TableContainer component={Paper}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Naziv provere</TableCell>
                      <TableCell>Rezultat</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Poruka</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {localData.emissionCalculations.calculationChecks.map((check, index) => (
                      <TableRow key={index}>
                        <TableCell>{check.checkName}</TableCell>
                        <TableCell>
                          <Chip 
                            label={check.result} 
                            size="small"
                            color={check.result === 'Pass' ? 'success' : check.result === 'Warning' ? 'warning' : 'error'}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={check.status} 
                            size="small"
                            color={check.status === 'OK' ? 'success' : check.status === 'Warning' ? 'warning' : 'error'}
                          />
                        </TableCell>
                        <TableCell>{check.message}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </AccordionDetails>
      </Accordion>

      <Accordion 
        expanded={expandedAccordion === 'verification'} 
        onChange={handleAccordionChange('verification')}
        sx={{ mb: 2 }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>Podaci o verifikaciji</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Telo za verifikaciju"
                value={localData.verificationData.verificationBody}
                onChange={(e) => handleVerificationChange('verificationBody', e.target.value)}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Datum verifikacije"
                type="date"
                value={localData.verificationData.verificationDate}
                onChange={(e) => handleVerificationChange('verificationDate', e.target.value)}
                margin="normal"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Nivo verifikacije</InputLabel>
                <Select
                  value={localData.verificationData.verificationLevel}
                  onChange={(e) => handleVerificationChange('verificationLevel', e.target.value)}
                >
                  {VERIFICATION_LEVELS.map(level => (
                    <MenuItem key={level} value={level}>{level}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Rezultat verifikacije</InputLabel>
                <Select
                  value={localData.verificationData.verificationResult}
                  onChange={(e) => handleVerificationChange('verificationResult', e.target.value)}
                >
                  {VERIFICATION_RESULTS.map(result => (
                    <MenuItem key={result} value={result}>{result}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Opseg verifikacije"
                value={localData.verificationData.verificationScope}
                onChange={(e) => handleVerificationChange('verificationScope', e.target.value)}
                margin="normal"
                multiline
                rows={2}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Referenca verifikacionog izveštaja"
                value={localData.verificationData.verificationReport}
                onChange={(e) => handleVerificationChange('verificationReport', e.target.value)}
                margin="normal"
                multiline
                rows={2}
              />
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Emission Dialog */}
      <EmissionDialog
        open={dialogOpen}
        emission={editingEmission}
        onSave={saveEmission}
        onClose={() => {
          setDialogOpen(false);
          setEditingEmission(null);
        }}
      />
    </Box>
  );
};

interface EmissionDialogProps {
  open: boolean;
  emission: AdditionalEmission | null;
  onSave: (emission: AdditionalEmission) => void;
  onClose: () => void;
}

const EmissionDialog: React.FC<EmissionDialogProps> = ({ open, emission, onSave, onClose }) => {
  const [localEmission, setLocalEmission] = useState<AdditionalEmission>(
    emission || {
      id: `emission_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      emissionType: 'Other',
      emissionSource: '',
      co2Emissions: 0,
      n2OEmissions: 0,
      pfcEmissions: 0,
      biomassCO2: 0,
      calculationMethod: 'Tier 1',
      activityData: {
        value: 0,
        unit: 't',
        dataSource: '',
        measurementMethod: '',
        uncertainty: 0,
        temporalResolution: 'Annual',
        spatialResolution: 'Site'
      },
      emissionFactor: {
        value: 0,
        unit: 't CO2/t',
        source: '',
        year: new Date().getFullYear(),
        applicability: '',
        uncertainty: 0,
        biomassFraction: 0
      },
      uncertainty: 0,
      dataQuality: 'Unknown',
      verificationStatus: 'Not Verified',
      comments: ''
    }
  );

  const handleChange = (field: keyof AdditionalEmission, value: any) => {
    setLocalEmission({
      ...localEmission,
      [field]: value
    });
  };

  const handleNestedChange = (parentField: string, field: string, value: any) => {
    const currentParentField = localEmission[parentField as keyof AdditionalEmission];
    
    setLocalEmission({
      ...localEmission,
      [parentField]: {
        ...(typeof currentParentField === 'object' && currentParentField !== null ? currentParentField : {}),
        [field]: value
      }
    });
  };

  const handleSave = () => {
    onSave(localEmission);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {emission ? 'Uredi dodatnu emisiju' : 'Dodaj dodatnu emisiju'}
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth margin="normal">
              <InputLabel>Tip emisije</InputLabel>
              <Select
                value={localEmission.emissionType}
                onChange={(e) => handleChange('emissionType', e.target.value)}
              >
                {EMISSION_TYPES.map(type => (
                  <MenuItem key={type} value={type}>{type}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth margin="normal">
              <InputLabel>Metoda proračuna</InputLabel>
              <Select
                value={localEmission.calculationMethod}
                onChange={(e) => handleChange('calculationMethod', e.target.value)}
              >
                {CALCULATION_METHODS.map(method => (
                  <MenuItem key={method} value={method}>{method}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Izvor emisije"
              value={localEmission.emissionSource}
              onChange={(e) => handleChange('emissionSource', e.target.value)}
              margin="normal"
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="CO2 emisije (t)"
              type="number"
              value={localEmission.co2Emissions}
              onChange={(e) => handleChange('co2Emissions', parseFloat(e.target.value) || 0)}
              margin="normal"
              inputProps={{ step: 0.001, min: 0 }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="N2O emisije (t)"
              type="number"
              value={localEmission.n2OEmissions}
              onChange={(e) => handleChange('n2OEmissions', parseFloat(e.target.value) || 0)}
              margin="normal"
              inputProps={{ step: 0.000001, min: 0 }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="PFC emisije (t)"
              type="number"
              value={localEmission.pfcEmissions}
              onChange={(e) => handleChange('pfcEmissions', parseFloat(e.target.value) || 0)}
              margin="normal"
              inputProps={{ step: 0.000000001, min: 0 }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="Biomasa CO2 (t)"
              type="number"
              value={localEmission.biomassCO2}
              onChange={(e) => handleChange('biomassCO2', parseFloat(e.target.value) || 0)}
              margin="normal"
              inputProps={{ step: 0.001, min: 0 }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Vrednost aktivnosti"
              type="number"
              value={localEmission.activityData.value}
              onChange={(e) => handleNestedChange('activityData', 'value', parseFloat(e.target.value) || 0)}
              margin="normal"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Jedinica aktivnosti"
              value={localEmission.activityData.unit}
              onChange={(e) => handleNestedChange('activityData', 'unit', e.target.value)}
              margin="normal"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Vrednost faktora emisije"
              type="number"
              value={localEmission.emissionFactor.value}
              onChange={(e) => handleNestedChange('emissionFactor', 'value', parseFloat(e.target.value) || 0)}
              margin="normal"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Jedinica faktora emisije"
              value={localEmission.emissionFactor.unit}
              onChange={(e) => handleNestedChange('emissionFactor', 'unit', e.target.value)}
              margin="normal"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Neizvesnost (%)"
              type="number"
              value={localEmission.uncertainty}
              onChange={(e) => handleChange('uncertainty', parseFloat(e.target.value) || 0)}
              margin="normal"
              inputProps={{ step: 0.1, min: 0, max: 100 }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth margin="normal">
              <InputLabel>Kvalitet podataka</InputLabel>
              <Select
                value={localEmission.dataQuality}
                onChange={(e) => handleChange('dataQuality', e.target.value)}
              >
                {DATA_QUALITY_LEVELS.map(level => (
                  <MenuItem key={level} value={level}>{level}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth margin="normal">
              <InputLabel>Status verifikacije</InputLabel>
              <Select
                value={localEmission.verificationStatus}
                onChange={(e) => handleChange('verificationStatus', e.target.value)}
              >
                <MenuItem value="Verified">Verified</MenuItem>
                <MenuItem value="Not Verified">Not Verified</MenuItem>
                <MenuItem value="Under Review">Under Review</MenuItem>
                <MenuItem value="Pending">Pending</MenuItem>
                <MenuItem value="Rejected">Rejected</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Komentari"
              value={localEmission.comments}
              onChange={(e) => handleChange('comments', e.target.value)}
              margin="normal"
              multiline
              rows={3}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Otkaži</Button>
        <Button onClick={handleSave} variant="contained">
          Sačuvaj
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FEmissionsStep;
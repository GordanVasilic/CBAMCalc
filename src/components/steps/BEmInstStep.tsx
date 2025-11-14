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
  Chip
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

interface BEmInstStepProps {
  data: BEmInstData | undefined;
  updateData: (data: BEmInstData) => void;
  installationDetails: any;
  validationStatus: any;
}

const BEmInstStep: React.FC<BEmInstStepProps> = ({
  data,
  updateData,
  installationDetails,
  validationStatus
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
      <Box sx={{ mb: 3 }}>
        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={addEmissionSource}
          sx={{ mr: 2 }}
        >
          Dodaj izvor emisije
        </Button>
        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={addPFCSource}
          sx={{ mr: 2 }}
        >
          Dodaj PFC izvor
        </Button>
        <Button
          variant="contained"
          onClick={loadDefaultData}
        >
          Učitaj primjerne podatke
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
          
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>#</TableCell>
                  <TableCell>Metoda</TableCell>
                  <TableCell>Naziv toka</TableCell>
                  <TableCell>Podaci o aktivnosti</TableCell>
                  <TableCell>NCV</TableCell>
                  <TableCell>Faktor emisije</TableCell>
                  <TableCell>CO2e fosilni</TableCell>
                  <TableCell>CO2e biomasa</TableCell>
                  <TableCell>Akcije</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {localData.emissionSources.map((source) => (
                  <TableRow key={source.id}>
                    <TableCell>{source.rowNumber}</TableCell>
                    <TableCell>
                      <Chip 
                        label={source.method} 
                        size="small" 
                        color={getMethodColor(source.method) as any}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        size="small"
                        value={source.sourceStreamName}
                        onChange={(e) => handleSourceChange(source.id, 'sourceStreamName', e.target.value)}
                        placeholder="Unesite naziv toka"
                      />
                    </TableCell>
                    <TableCell>
                      <Grid container spacing={1}>
                        <Grid item xs={8}>
                          <TextField
                            size="small"
                            type="number"
                            value={source.activityData}
                            onChange={(e) => handleSourceChange(source.id, 'activityData', parseFloat(e.target.value) || 0)}
                          />
                        </Grid>
                        <Grid item xs={4}>
                          <TextField
                            size="small"
                            value={source.activityDataUnit}
                            onChange={(e) => handleSourceChange(source.id, 'activityDataUnit', e.target.value)}
                          />
                        </Grid>
                      </Grid>
                    </TableCell>
                    <TableCell>
                      <TextField
                        size="small"
                        type="number"
                        value={source.netCalorificValue || ''}
                        onChange={(e) => handleSourceChange(source.id, 'netCalorificValue', parseFloat(e.target.value) || 0)}
                        disabled={source.method === 'Process Emissions' || source.method === 'Mass balance'}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        size="small"
                        type="number"
                        value={source.emissionFactor || ''}
                        onChange={(e) => handleSourceChange(source.id, 'emissionFactor', parseFloat(e.target.value) || 0)}
                        disabled={source.method === 'Mass balance'}
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
          
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>#</TableCell>
                  <TableCell>Metoda</TableCell>
                  <TableCell>Tip tehnologije</TableCell>
                  <TableCell>Podaci o aktivnosti</TableCell>
                  <TableCell>Učestalost</TableCell>
                  <TableCell>SEF(CF4)</TableCell>
                  <TableCell>CF4 emisije</TableCell>
                  <TableCell>C2F6 emisije</TableCell>
                  <TableCell>Akcije</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {localData.pfcEmissions.map((pfc) => (
                  <TableRow key={pfc.id}>
                    <TableCell>{pfc.rowNumber}</TableCell>
                    <TableCell>
                      <FormControl size="small">
                        <Select
                          value={pfc.method}
                          onChange={(e) => handlePFCChange(pfc.id, 'method', e.target.value)}
                        >
                          <MenuItem value="Slope method">Metoda nagiba</MenuItem>
                          <MenuItem value="Technology specific">Specifično za tehnologiju</MenuItem>
                          <MenuItem value="Other">Ostalo</MenuItem>
                        </Select>
                      </FormControl>
                    </TableCell>
                    <TableCell>
                      <TextField
                        size="small"
                        value={pfc.technologyType}
                        onChange={(e) => handlePFCChange(pfc.id, 'technologyType', e.target.value)}
                        placeholder="Tip tehnologije"
                      />
                    </TableCell>
                    <TableCell>
                      <Grid container spacing={1}>
                        <Grid item xs={8}>
                          <TextField
                            size="small"
                            type="number"
                            value={pfc.activityData}
                            onChange={(e) => handlePFCChange(pfc.id, 'activityData', parseFloat(e.target.value) || 0)}
                          />
                        </Grid>
                        <Grid item xs={4}>
                          <TextField
                            size="small"
                            value={pfc.activityDataUnit}
                            onChange={(e) => handlePFCChange(pfc.id, 'activityDataUnit', e.target.value)}
                          />
                        </Grid>
                      </Grid>
                    </TableCell>
                    <TableCell>
                      <TextField
                        size="small"
                        type="number"
                        value={pfc.frequency}
                        onChange={(e) => handlePFCChange(pfc.id, 'frequency', parseFloat(e.target.value) || 0)}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        size="small"
                        type="number"
                        value={pfc.sefCF4}
                        onChange={(e) => handlePFCChange(pfc.id, 'sefCF4', parseFloat(e.target.value) || 0)}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color={pfc.isComplete ? 'success' : 'error'}>
                        {pfc.cf4EmissionsTons?.toFixed(3) || '0.000'} t CF4
                        <br />
                        {pfc.cf4EmissionsCO2e?.toFixed(2) || '0.00'} t CO2e
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color={pfc.isComplete ? 'success' : 'error'}>
                        {pfc.c2f6EmissionsTons?.toFixed(3) || '0.000'} t C2F6
                        <br />
                        {pfc.c2f6EmissionsCO2e?.toFixed(2) || '0.00'} t CO2e
                      </Typography>
                    </TableCell>
                    <TableCell>
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
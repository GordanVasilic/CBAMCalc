import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Tooltip,
  List,
  ListItem,
  ListItemText
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Add as AddIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import { PurchasedPrecursor, PurchasedPrecursorsData, CBAMData, DataValidationStatus } from '../../types/CBAMData';
import { validatePurchasedPrecursors } from '../../utils/dataValidationUtils';
import { processUnits, electricityUnits } from '../../data/codeLists';
import CNCodeAutocomplete from '../common/CNCodeAutocomplete';

interface PurchasedPrecursorsFormProps {
  data: PurchasedPrecursorsData;
  updateData: (data: PurchasedPrecursorsData) => void;
  validationStatus?: DataValidationStatus;
}

const PurchasedPrecursorsForm: React.FC<PurchasedPrecursorsFormProps> = ({ data, updateData }) => {
  const [openDialog, setOpenDialog] = useState(false);
  const [editingPrecursor, setEditingPrecursor] = useState<PurchasedPrecursor | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [validationWarnings, setValidationWarnings] = useState<string[]>([]);
  const [formData, setFormData] = useState<Partial<PurchasedPrecursor>>({
    id: '',
    name: '',
    cnCode: '',
    productionRoute: '',
    totalAmountConsumed: 0,
    totalAmountUnit: 't',
    processConsumption: [],
    nonCBAMAmount: 0,
    nonCBAMUnit: 't',
    specificDirectEmbeddedEmissions: 0,
    directEmissionsUnit: 'tCO2/t',
    directEmissionsDataSource: '',
    electricityConsumption: 0,
    electricityUnit: 'MWh',
    electricityEmissionFactor: 0.475, // Default EU average
    electricityEmissionFactorUnit: 'tCO2/MWh',
    electricityEmissionFactorSource: 'EU average',
    specificIndirectEmbeddedEmissions: 0,
    totalSpecificEmbeddedEmissions: 0,
    usesDefaultValues: false,
    defaultJustification: '',
    supplierName: '',
    originCountry: '',
    notes: ''
  });



  useEffect(() => {
    // Calculate electricity emissions when electricity consumption or emission factor changes
    if (formData.electricityConsumption !== undefined && formData.electricityEmissionFactor !== undefined) {
      setFormData(prev => ({
        ...prev,
        specificIndirectEmbeddedEmissions: (prev.electricityConsumption || 0) * (prev.electricityEmissionFactor || 0)
      }));
    }
  }, [formData.electricityConsumption, formData.electricityEmissionFactor]);

  useEffect(() => {
    // Calculate total embedded emissions
    if (formData.specificDirectEmbeddedEmissions !== undefined && formData.totalAmountConsumed !== undefined && formData.specificIndirectEmbeddedEmissions !== undefined) {
      const directEmissions = (formData.specificDirectEmbeddedEmissions || 0) * (formData.totalAmountConsumed || 0);
      setFormData(prev => ({
        ...prev,
        totalSpecificEmbeddedEmissions: directEmissions + (prev.specificIndirectEmbeddedEmissions || 0)
      }));
    }
  }, [formData.specificDirectEmbeddedEmissions, formData.totalAmountConsumed, formData.specificIndirectEmbeddedEmissions]);
  
  // Validate all purchased precursors data
  useEffect(() => {
    if (data.precursors.length > 0) {
      const allValidationResults = data.precursors.map(precursor => 
        validatePurchasedPrecursors({
          companyInfo: {
            companyName: '',
            companyAddress: '',
            companyContactPerson: '',
            companyEmail: '',
            companyPhone: ''
          },
          reportConfig: { 
            reportingPeriod: data.reportingPeriod || '',
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
                annualProduction: 0
              },
          emissionInstallationData: {
            emissions: [],
            totalDirectCO2Emissions: 0,
            totalIndirectCO2Emissions: 0,
            totalCO2Emissions: 0,
            totalCH4Emissions: 0,
            totalN2OEmissions: 0,
            totalGHGEmissions: 0,
            reportingPeriod: data.reportingPeriod || ''
          },
          emissionFactors: [],
          energyFuelData: [],
          processProductionData: [],
          purchasedPrecursors: { ...data, precursors: [precursor] },
          calculationResults: {
              totalDirectCO2Emissions: 0,
              totalProcessEmissions: 0,
              totalEmissions: 0,
              specificEmissions: 0,
              totalEnergy: 0,
              renewableShare: 0,
              importedRawMaterialShare: 0,
              embeddedEmissions: 0,
              purchasedPrecursorsEmbeddedEmissions: 0,
              cumulativeEmissions: 0,
              directEmissionsByGasType: { co2: 0, ch4: 0, n2o: 0, otherGwp: 0, total: 0 },
              biogenicCO2Emissions: 0,
              processEmissionsByGasType: { co2: 0, ch4: 0, n2o: 0, otherGwp: 0, total: 0 },
              importedRawMaterialShareByCountry: { total: 0, byCountry: {} },
              importedRawMaterialShareByMaterial: { total: 0, byMaterial: {} },
              embeddedEmissionsByGasType: { co2: 0, ch4: 0, n2o: 0, otherGwp: 0, total: 0 },
              importedMaterialEmbeddedEmissions: { total: 0, byMaterial: {} },
              transportEmissions: 0
            }
        })
      );
      
      const allErrors = allValidationResults.flatMap(result => result.errors);
      setValidationErrors(allErrors);
      const allWarnings = allValidationResults.flatMap(result => result.warnings);
      setValidationWarnings(allWarnings);
      
      // You could add a summary alert here if needed
      // For example: setGlobalErrors(allErrors);
      // setGlobalWarnings(allWarnings);
    }
  }, [data]);

  const handleOpenDialog = (precursor?: PurchasedPrecursor) => {
    // Clear validation state when opening the dialog
    setValidationErrors([]);
    setValidationWarnings([]);
    
    if (precursor) {
      setEditingPrecursor(precursor);
      setFormData(precursor);
    } else {
      setEditingPrecursor(null);
      setFormData({
        id: '',
        name: '',
        cnCode: '',
        productionRoute: '',
        totalAmountConsumed: 0,
        totalAmountUnit: 't',
        processConsumption: [],
        nonCBAMAmount: 0,
        nonCBAMUnit: 't',
        specificDirectEmbeddedEmissions: 0,
        directEmissionsUnit: 'tCO2/t',
        directEmissionsDataSource: '',
        electricityConsumption: 0,
        electricityUnit: 'MWh',
        electricityEmissionFactor: 0.475,
        electricityEmissionFactorUnit: 'tCO2/MWh',
        electricityEmissionFactorSource: 'EU average',
        specificIndirectEmbeddedEmissions: 0,
        totalSpecificEmbeddedEmissions: 0,
        usesDefaultValues: false,
        defaultJustification: '',
        supplierName: '',
        originCountry: '',
        notes: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingPrecursor(null);
  };

  const handleSavePrecursor = () => {
    // Create a temporary precursor object for validation
    const tempPrecursor: PurchasedPrecursor = {
      id: editingPrecursor?.id || Date.now().toString(),
      name: formData.name || '',
      cnCode: formData.cnCode || '',
      productionRoute: formData.productionRoute || '',
      totalAmountConsumed: formData.totalAmountConsumed || 0,
      totalAmountUnit: formData.totalAmountUnit || 't',
      processConsumption: formData.processConsumption || [],
      nonCBAMAmount: formData.nonCBAMAmount || 0,
      nonCBAMUnit: formData.nonCBAMUnit || 't',
      specificDirectEmbeddedEmissions: formData.specificDirectEmbeddedEmissions || 0,
      directEmissionsUnit: formData.directEmissionsUnit || 'tCO2/t',
      directEmissionsDataSource: formData.directEmissionsDataSource || '',
      electricityConsumption: formData.electricityConsumption || 0,
      electricityUnit: formData.electricityUnit || 'MWh',
      electricityEmissionFactor: formData.electricityEmissionFactor || 0.475,
      electricityEmissionFactorUnit: formData.electricityEmissionFactorUnit || 'tCO2/MWh',
      electricityEmissionFactorSource: formData.electricityEmissionFactorSource || 'EU average',
      specificIndirectEmbeddedEmissions: formData.specificIndirectEmbeddedEmissions || 0,
      totalSpecificEmbeddedEmissions: formData.totalSpecificEmbeddedEmissions || 0,
      usesDefaultValues: formData.usesDefaultValues || false,
      defaultJustification: formData.defaultJustification || '',
      supplierName: formData.supplierName || '',
      originCountry: formData.originCountry || '',
      notes: formData.notes || ''
    };

    // Create a minimal CBAMData object for validation
    const tempData: CBAMData = {
      companyInfo: {
        companyName: '',
        companyAddress: '',
        companyContactPerson: '',
        companyEmail: '',
        companyPhone: ''
      },
      reportConfig: {
        reportingPeriod: data.reportingPeriod || '',
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
        annualProduction: 0
      },
      emissionInstallationData: {
        emissions: [],
        totalDirectCO2Emissions: 0,
        totalIndirectCO2Emissions: 0,
        totalCO2Emissions: 0,
        totalCH4Emissions: 0,
        totalN2OEmissions: 0,
        totalGHGEmissions: 0,
        reportingPeriod: data.reportingPeriod || ''
      },
      emissionFactors: [],
      energyFuelData: [],
      processProductionData: [],
      purchasedPrecursors: {
        precursors: [tempPrecursor],
        totalEmbeddedEmissions: 0,
        totalDirectEmbeddedEmissions: 0,
        totalIndirectEmbeddedEmissions: 0,
        reportingPeriod: data.reportingPeriod || ''
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
        purchasedPrecursorsEmbeddedEmissions: 0,
        cumulativeEmissions: 0,
        directEmissionsByGasType: { co2: 0, ch4: 0, n2o: 0, otherGwp: 0, total: 0 },
        biogenicCO2Emissions: 0,
        processEmissionsByGasType: { co2: 0, ch4: 0, n2o: 0, otherGwp: 0, total: 0 },
        importedRawMaterialShareByCountry: { total: 0, byCountry: {} },
        importedRawMaterialShareByMaterial: { total: 0, byMaterial: {} },
        embeddedEmissionsByGasType: { co2: 0, ch4: 0, n2o: 0, otherGwp: 0, total: 0 },
        importedMaterialEmbeddedEmissions: { total: 0, byMaterial: {} },
        transportEmissions: 0
      }
    };
    const validationResult = validatePurchasedPrecursors(tempData);
    
    // Set validation errors and warnings
    setValidationErrors(validationResult.errors);
    setValidationWarnings(validationResult.warnings);
    
    // If there are errors, don't save the data
    if (validationResult.errors.length > 0) {
      return;
    }

    const newPrecursor: PurchasedPrecursor = tempPrecursor;

    let updatedPrecursors: PurchasedPrecursor[];
    if (editingPrecursor) {
      // Update existing precursor
      updatedPrecursors = data.precursors.map(p => 
        p.id === editingPrecursor.id ? newPrecursor : p
      );
    } else {
      // Add new precursor
      updatedPrecursors = [...data.precursors, newPrecursor];
    }

    // Calculate total emissions
    const totalDirectEmbeddedEmissions = updatedPrecursors.reduce(
      (sum, p) => sum + p.specificDirectEmbeddedEmissions,
      0
    );
    
    const totalIndirectEmbeddedEmissions = updatedPrecursors.reduce(
      (sum, p) => sum + (p.specificIndirectEmbeddedEmissions || 0), 
      0
    );
    
    const totalEmbeddedEmissions = updatedPrecursors.reduce(
      (sum, p) => sum + (p.totalSpecificEmbeddedEmissions || 0),
      0
    );

    updateData({
      precursors: updatedPrecursors,
      totalEmbeddedEmissions,
      totalDirectEmbeddedEmissions,
      totalIndirectEmbeddedEmissions,
      reportingPeriod: data.reportingPeriod || ''
    });

    handleCloseDialog();
  };

  const handleDeletePrecursor = (id: string) => {
    const updatedPrecursors = data.precursors.filter(p => p.id !== id);
    
    // Calculate total emissions
    const totalDirectEmbeddedEmissions = updatedPrecursors.reduce(
      (sum, p) => sum + p.specificDirectEmbeddedEmissions, 
      0
    );
    
    const totalIndirectEmbeddedEmissions = updatedPrecursors.reduce(
      (sum, p) => sum + (p.specificIndirectEmbeddedEmissions || 0), 
      0
    );
    
    const totalEmbeddedEmissions = totalDirectEmbeddedEmissions + totalIndirectEmbeddedEmissions;

    updateData({
      precursors: updatedPrecursors,
      totalDirectEmbeddedEmissions,
      totalIndirectEmbeddedEmissions,
      totalEmbeddedEmissions,
      reportingPeriod: data.reportingPeriod || ''
    });
  };

  const handleInputChange = (field: keyof PurchasedPrecursor, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Kupljeni prekursori (E_PurchPrec)
      </Typography>
      
      <Alert severity="info" sx={{ mb: 2 }}>
        Unesite detalje o kupljenim prekursorima koji se koriste u proizvodnom procesu.
        Ovi podaci se koriste za proračun ugrađenih emisija iz kupljenih materijala.
      </Alert>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Dodaj kupljeni prekursor
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>CN Code</TableCell>
              <TableCell>Consumption</TableCell>
              <TableCell>Specific Direct Embedded Emissions</TableCell>
              <TableCell>Electricity Consumption</TableCell>
              <TableCell>Electricity Emissions</TableCell>
              <TableCell>Total Embedded Emissions</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.precursors.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  Nema dodatih kupljenih prekursora
                </TableCell>
              </TableRow>
            ) : (
              data.precursors.map((precursor) => (
                <TableRow key={precursor.id}>
                  <TableCell>{precursor.name}</TableCell>
                  <TableCell>{precursor.cnCode}</TableCell>
                  <TableCell>{`${precursor.totalAmountConsumed} ${precursor.totalAmountUnit}`}</TableCell>
                  <TableCell>{precursor.specificDirectEmbeddedEmissions}</TableCell>
                  <TableCell>{`${precursor.electricityConsumption} ${precursor.electricityUnit}`}</TableCell>
                  <TableCell>{(precursor.specificIndirectEmbeddedEmissions ?? 0).toFixed(2)}</TableCell>
                  <TableCell>{(precursor.totalSpecificEmbeddedEmissions ?? 0).toFixed(2)}</TableCell>
                  <TableCell>
                    <Tooltip title="Uredi">
                      <IconButton
                        color="primary"
                        onClick={() => handleOpenDialog(precursor)}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Obriši">
                      <IconButton
                        color="error"
                        onClick={() => handleDeletePrecursor(precursor.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {data.precursors.length > 0 && (
        <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
          <Typography variant="subtitle1">
            Ukupne ugrađene emisije: {data.totalEmbeddedEmissions.toFixed(2)} tCO2
          </Typography>
        </Box>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingPrecursor ? 'Uredi kupljeni prekursor' : 'Dodaj kupljeni prekursor'}
        </DialogTitle>
        <DialogContent>
          {/* Display validation errors */}
          {validationErrors.length > 0 && (
            <Alert severity="error" sx={{ mb: 2 }}>
              <Typography variant="subtitle2">Molimo ispravite sljedeće greške:</Typography>
              <List dense>
                {validationErrors.map((error, index) => (
                  <ListItem key={index} disablePadding>
                    <ListItemText primary={error} />
                  </ListItem>
                ))}
              </List>
            </Alert>
          )}
          
          {/* Display validation warnings */}
          {validationWarnings.length > 0 && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              <Typography variant="subtitle2">Molimo obratite pažnju na sljedeća upozorenja:</Typography>
              <List dense>
                {validationWarnings.map((warning, index) => (
                  <ListItem key={index} disablePadding>
                    <ListItemText primary={warning} />
                  </ListItem>
                ))}
              </List>
            </Alert>
          )}
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Naziv"
                fullWidth
                value={formData.name || ''}
                onChange={(e) => handleInputChange('name', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <CNCodeAutocomplete
                value={formData.cnCode || ''}
                onChange={(v) => handleInputChange('cnCode', v)}
                label="CN kod"
                helperText="EU kombinovana nomenklatura (CN)"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label="Potrošnja"
                type="number"
                fullWidth
                value={formData.totalAmountConsumed || 0}
                onChange={(e) => handleInputChange('totalAmountConsumed', parseFloat(e.target.value) || 0)}
                inputProps={{ min: 0, step: 0.01 }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>Jedinica</InputLabel>
                <Select
                  value={formData.totalAmountUnit || 't'}
                  onChange={(e) => handleInputChange('totalAmountUnit', e.target.value)}
                >
                  {processUnits.map((unit) => (
                    <MenuItem key={unit} value={unit}>
                      {unit}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label="Specifične direktne ugrađene emisije (tCO2/jedinica)"
                type="number"
                fullWidth
                value={formData.specificDirectEmbeddedEmissions || 0}
                onChange={(e) => handleInputChange('specificDirectEmbeddedEmissions', parseFloat(e.target.value) || 0)}
                inputProps={{ min: 0, step: 0.001 }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label="Potrošnja električne energije"
                type="number"
                fullWidth
                value={formData.electricityConsumption || 0}
                onChange={(e) => handleInputChange('electricityConsumption', parseFloat(e.target.value) || 0)}
                inputProps={{ min: 0, step: 0.001 }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>Jedinica električne energije</InputLabel>
                <Select
                  value={formData.electricityUnit || 'MWh'}
                  onChange={(e) => handleInputChange('electricityUnit', e.target.value)}
                >
                  {electricityUnits.map((unit) => (
                    <MenuItem key={unit} value={unit}>
                      {unit}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label="Faktor emisije električne energije (tCO2/MWh)"
                type="number"
                fullWidth
                value={formData.electricityEmissionFactor || 0.475}
                onChange={(e) => handleInputChange('electricityEmissionFactor', parseFloat(e.target.value) || 0.475)}
                inputProps={{ min: 0, step: 0.001 }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Obrazloženje podrazumevanih vrednosti"
                fullWidth
                multiline
                rows={2}
                value={formData.defaultJustification || ''}
                onChange={(e) => handleInputChange('defaultJustification', e.target.value)}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Otkaži</Button>
          <Button onClick={handleSavePrecursor} variant="contained">
            Sačuvaj
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PurchasedPrecursorsForm;
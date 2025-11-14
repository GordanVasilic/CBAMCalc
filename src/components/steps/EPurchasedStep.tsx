import React, { useState, useEffect, useCallback } from 'react';
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
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tooltip
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Assessment as AssessmentIcon
} from '@mui/icons-material';

import {
  EPurchasedData,
  E_PURCHASED_DEFAULTS,
  PurchasedPrecursorItem,
  PRECURSOR_TYPES,
  UNITS
} from '../../types/EPurchasedTypes';
import { calculateEPurchased } from '../../utils/ePurchasedCalculationEngine';
import { CBAMData } from '../../types/CBAMData';

interface EPurchasedStepProps {
  data: CBAMData;
  onUpdate: (data: CBAMData) => void;
}

const EPurchasedStep: React.FC<EPurchasedStepProps> = ({ data, onUpdate }) => {
  const [localData, setLocalData] = useState<EPurchasedData>(
    data.ePurchased || E_PURCHASED_DEFAULTS
  );
  const [validation, setValidation] = useState<any>(null);
  
  const [validationTimeout, setValidationTimeout] = useState<NodeJS.Timeout | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPrecursor, setEditingPrecursor] = useState<PurchasedPrecursorItem | null>(null);
  const [currentPrecursor, setCurrentPrecursor] = useState<Partial<PurchasedPrecursorItem>>({});

  // Perform validation with debouncing
  const performValidation = useCallback(() => {
    if (validationTimeout) {
      clearTimeout(validationTimeout);
    }
    
    const timeout = setTimeout(() => {
      const result = calculateEPurchased(localData, data.dProcessesData);
      setLocalData(result.data);
      setValidation(result.data.validationStatus);
      
      
      // Update parent data
      onUpdate({
        ...data,
        ePurchased: result.data
      });
    }, 400); // 400ms debounce
    
    setValidationTimeout(timeout);
  }, [localData, onUpdate, data, validationTimeout]);

  useEffect(() => {
    performValidation();
    return () => {
      if (validationTimeout) {
        clearTimeout(validationTimeout);
      }
    };
  }, [performValidation, validationTimeout]);

  const handlePrecursorChange = (field: keyof PurchasedPrecursorItem, value: any) => {
    setCurrentPrecursor(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddPrecursor = () => {
    const newPrecursor: PurchasedPrecursorItem = {
      id: `precursor_${Date.now()}`,
      name: '',
      cnCode: '',
      precursorType: 'Raw materials',
      totalQuantity: 0,
      unit: 't',
      supplierName: '',
      supplierCountry: '',
      supplierContact: '',
      productionRoute: '',
      productionProcess: '',
      processConsumptions: [],
      nonCBAMQuantity: 0,
      nonCBAMUnit: 't',
      nonCBAMJustification: '',
      directEmbeddedEmissions: 0,
      directEmissionsUnit: 'tCO2e',
      directEmissionsDataSource: 'Default values',
      directEmissionsUncertainty: 0,
      electricityConsumption: 0,
      electricityUnit: 'MWh',
      electricityEmissionFactor: 0.5,
      electricityEmissionFactorUnit: 'tCO2e/MWh',
      electricityEmissionFactorSource: 'Default values',
      indirectEmbeddedEmissions: 0,
      totalSpecificEmbeddedEmissions: 0,
      totalEmbeddedEmissionsUnit: 'tCO2e',
      usesDefaultValues: true,
      defaultValueJustification: '',
      dataQuality: 'Estimated',
      verificationStatus: 'Not verified',
      verificationDate: '',
      verifierName: '',
      verifierAccreditation: '',
      notes: '',
      comments: '',
      lastUpdated: new Date()
    };
    
    setCurrentPrecursor(newPrecursor);
    setEditingPrecursor(null);
    setDialogOpen(true);
  };

  const handleEditPrecursor = (precursor: PurchasedPrecursorItem) => {
    setCurrentPrecursor(precursor);
    setEditingPrecursor(precursor);
    setDialogOpen(true);
  };

  const handleDeletePrecursor = (precursorId: string) => {
    setLocalData(prev => ({
      ...prev,
      precursors: prev.precursors.filter(p => p.id !== precursorId)
    }));
  };

  const handleSavePrecursor = () => {
    if (!currentPrecursor.name || currentPrecursor.name.trim().length === 0) {
      alert('Please enter a precursor name');
      return;
    }
    
    if (editingPrecursor) {
      // Update existing precursor
      setLocalData(prev => ({
        ...prev,
        precursors: prev.precursors.map(p => 
          p.id === editingPrecursor.id 
            ? { ...currentPrecursor, lastUpdated: new Date() } as PurchasedPrecursorItem
            : p
        )
      }));
    } else {
      // Add new precursor
      const newPrecursor: PurchasedPrecursorItem = {
        ...currentPrecursor as PurchasedPrecursorItem,
        id: `precursor_${Date.now()}`,
        lastUpdated: new Date()
      };
      
      setLocalData(prev => ({
        ...prev,
        precursors: [...prev.precursors, newPrecursor]
      }));
    }
    
    setDialogOpen(false);
    setCurrentPrecursor({});
    setEditingPrecursor(null);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setCurrentPrecursor({});
    setEditingPrecursor(null);
  };

  const handleReportingPeriodChange = (value: string) => {
    setLocalData(prev => ({
      ...prev,
      reportingPeriod: value
    }));
  };

  const handleOverallDataQualityChange = (value: string) => {
    setLocalData(prev => ({
      ...prev,
      overallDataQuality: value
    }));
  };

  const handleOverallVerificationStatusChange = (value: string) => {
    setLocalData(prev => ({
      ...prev,
      overallVerificationStatus: value
    }));
  };

  const getValidationStatus = () => {
    if (!validation) return null;
    
    return (
      <Box sx={{ mb: 2 }}>
        <Grid container spacing={1} alignItems="center">
          <Grid item>
            <Chip
              icon={validation.isValid ? <CheckCircleIcon /> : <WarningIcon />}
              label={`${validation.completenessScore.toFixed(0)}% Popunjeno`}
              color={validation.isValid ? 'success' : 'warning'}
              size="small"
            />
          </Grid>
          {validation.errors.length > 0 && (
            <Grid item>
              <Chip
                label={`${validation.errors.length} Grešaka`}
                color="error"
                size="small"
              />
            </Grid>
          )}
          {validation.warnings.length > 0 && (
            <Grid item>
              <Chip
                label={`${validation.warnings.length} Upozorenja`}
                color="warning"
                size="small"
              />
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

  

  const renderPrecursorDialog = () => (
    <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
      <DialogTitle>
        {editingPrecursor ? 'Uredi prekursor' : 'Dodaj novi prekursor'}
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Naziv prekursora"
              value={currentPrecursor.name || ''}
              onChange={(e) => handlePrecursorChange('name', e.target.value)}
              required
              margin="normal"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="CN kod"
              value={currentPrecursor.cnCode || ''}
              onChange={(e) => handlePrecursorChange('cnCode', e.target.value)}
              margin="normal"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth margin="normal">
              <InputLabel>Tip prekursora</InputLabel>
              <Select
                value={currentPrecursor.precursorType || 'Raw materials'}
                onChange={(e) => handlePrecursorChange('precursorType', e.target.value)}
              >
                {PRECURSOR_TYPES.map(option => (
                  <MenuItem key={option} value={option}>{option}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="Ukupna količina"
              type="number"
              value={currentPrecursor.totalQuantity || 0}
              onChange={(e) => handlePrecursorChange('totalQuantity', parseFloat(e.target.value) || 0)}
              margin="normal"
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth margin="normal">
              <InputLabel>Jedinica</InputLabel>
              <Select
                value={currentPrecursor.unit || 't'}
                onChange={(e) => handlePrecursorChange('unit', e.target.value)}
              >
                {UNITS.map(option => (
                  <MenuItem key={option} value={option}>{option}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Naziv dobavljača"
              value={currentPrecursor.supplierName || ''}
              onChange={(e) => handlePrecursorChange('supplierName', e.target.value)}
              margin="normal"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Zemlja dobavljača"
              value={currentPrecursor.supplierCountry || ''}
              onChange={(e) => handlePrecursorChange('supplierCountry', e.target.value)}
              margin="normal"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Direktno ugrađene emisije"
              type="number"
              value={currentPrecursor.directEmbeddedEmissions || 0}
              onChange={(e) => handlePrecursorChange('directEmbeddedEmissions', parseFloat(e.target.value) || 0)}
              margin="normal"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Potrošnja električne energije"
              type="number"
              value={currentPrecursor.electricityConsumption || 0}
              onChange={(e) => handlePrecursorChange('electricityConsumption', parseFloat(e.target.value) || 0)}
              margin="normal"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth margin="normal">
              <InputLabel>Kvalitet podataka</InputLabel>
              <Select
                value={currentPrecursor.dataQuality || 'Estimated'}
                onChange={(e) => handlePrecursorChange('dataQuality', e.target.value)}
              >
                {['Actual data', 'Calculated data', 'Estimated data', 'Default values'].map(option => (
                  <MenuItem key={option} value={option}>{option}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth margin="normal">
              <InputLabel>Status verifikacije</InputLabel>
              <Select
                value={currentPrecursor.verificationStatus || 'Not verified'}
                onChange={(e) => handlePrecursorChange('verificationStatus', e.target.value)}
              >
                {['Verified', 'Not verified', 'Pending verification'].map(option => (
                  <MenuItem key={option} value={option}>{option}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Napomene"
              multiline
              rows={3}
              value={currentPrecursor.notes || ''}
              onChange={(e) => handlePrecursorChange('notes', e.target.value)}
              margin="normal"
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCloseDialog}>Otkaži</Button>
        <Button onClick={handleSavePrecursor} variant="contained">
          {editingPrecursor ? 'Ažuriraj' : 'Dodaj'}
        </Button>
      </DialogActions>
    </Dialog>
  );

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" gutterBottom>
        E_Purchased - Kupljeni prekursori
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Unesite podatke o kupljenim prekursorima i njihovim ugrađenim emisijama, uključujući sirovine, međuproizvode i druge ulaze u proizvodne procese.
      </Typography>

      {getValidationStatus()}

      {/* Summary Section */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            <AssessmentIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Sažetak
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Ukupan broj prekursora"
                type="number"
                value={localData.summary.totalPrecursors}
                InputProps={{ readOnly: true }}
                margin="normal"
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Ukupna količina"
                type="number"
                value={localData.summary.totalQuantity}
                InputProps={{ readOnly: true }}
                margin="normal"
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Ukupne ugrađene emisije"
                type="number"
                value={localData.summary.totalEmbeddedEmissions}
                InputProps={{ readOnly: true }}
                margin="normal"
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Verifikovani prekursori"
                type="number"
                value={localData.summary.verifiedPrecursors}
                InputProps={{ readOnly: true }}
                margin="normal"
                size="small"
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Precursors List */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              Lista prekursora
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddPrecursor}
            >
              Dodaj prekursor
            </Button>
          </Box>

          {localData.precursors.length === 0 ? (
            <Alert severity="info">
              Nema dodatih prekursora. Kliknite "Dodaj prekursor" za početak.
            </Alert>
          ) : (
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Naziv</TableCell>
                    <TableCell>Tip</TableCell>
                    <TableCell align="right">Količina</TableCell>
                    <TableCell>Dobavljač</TableCell>
                    <TableCell align="right">Emisije</TableCell>
                    <TableCell>Kvalitet</TableCell>
                    <TableCell>Verifikacija</TableCell>
                    <TableCell align="center">Akcije</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {localData.precursors.map((precursor) => (
                    <TableRow key={precursor.id}>
                      <TableCell>{precursor.name}</TableCell>
                      <TableCell>{precursor.precursorType}</TableCell>
                      <TableCell align="right">
                        {precursor.totalQuantity} {precursor.unit}
                      </TableCell>
                      <TableCell>
                        <Tooltip title={`${precursor.supplierName}, ${precursor.supplierCountry}`}>
                          <span>{precursor.supplierName}</span>
                        </Tooltip>
                      </TableCell>
                      <TableCell align="right">
                        {precursor.totalSpecificEmbeddedEmissions?.toFixed(2) || '0.00'} tCO2e
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={precursor.dataQuality} 
                          size="small"
                          color={precursor.dataQuality === 'Actual data' ? 'success' : 'default'}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={precursor.verificationStatus} 
                          size="small"
                          color={precursor.verificationStatus === 'Verified' ? 'success' : 'default'}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          onClick={() => handleEditPrecursor(precursor)}
                          color="primary"
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDeletePrecursor(precursor.id)}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Overall Data Quality */}
      <Accordion defaultExpanded sx={{ mb: 2 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">Opšti kvalitet podataka</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Period izveštavanja"
                value={localData.reportingPeriod}
                onChange={(e) => handleReportingPeriodChange(e.target.value)}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Opšti kvalitet podataka</InputLabel>
                <Select
                  value={localData.overallDataQuality}
                  onChange={(e) => handleOverallDataQualityChange(e.target.value)}
                >
                  {['Excellent', 'Good', 'Fair', 'Poor'].map(option => (
                    <MenuItem key={option} value={option}>{option}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Opšti status verifikacije</InputLabel>
                <Select
                  value={localData.overallVerificationStatus}
                  onChange={(e) => handleOverallVerificationStatusChange(e.target.value)}
                >
                  {['Fully verified', 'Partially verified', 'Not verified'].map(option => (
                    <MenuItem key={option} value={option}>{option}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {renderValidationMessages()}
      {renderPrecursorDialog()}
    </Box>
  );
};

export default EPurchasedStep;

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  IconButton,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
  Alert
} from '@mui/material';
import { 
  Delete as DeleteIcon, 
  Add as AddIcon,
  Info as InfoIcon,
  ExpandMore as ExpandMoreIcon
} from '@mui/icons-material';
import { EmissionFactor, DataValidationStatus } from '../../types/CBAMData';
import { emissionCategories as categories, emissionFactorUnits as units, gasTypes, emissionSources as sources, applicables } from '../../data/codeLists';

interface EmissionFactorsStepProps {
  data: EmissionFactor[];
  updateData: (data: EmissionFactor[]) => void;
  validationStatus?: DataValidationStatus;
}

const EmissionFactorsStep: React.FC<EmissionFactorsStepProps> = ({ data, updateData, validationStatus }) => {
  const [openDialog, setOpenDialog] = useState(false);
  const [editingFactor, setEditingFactor] = useState<Partial<EmissionFactor> | null>(null);
  
  const [formData, setFormData] = useState<Partial<EmissionFactor>>({
    id: '',
    name: '',
    category: '',
    value: 0,
    unit: 't/t',
    source: 'Default',
    sourceDescription: '',
    year: new Date().getFullYear(),
    applicableTo: 'All',
    notes: ''
  });

  // Kategorije, jedinice, gasTypes, izvori i applicables sada dolaze iz centralnog codeLists

  const defaultEmissionFactors: Partial<EmissionFactor>[] = [
    {
      name: 'Electricity - EU Grid Average',
      category: 'Electricity',
      value: 0.276,
      unit: 't/MWh',
      source: 'Default',
      sourceDescription: 'EU average electricity emission factor',
      year: 2022,
      applicableTo: 'Electricity',
      notes: 'Default EU grid average emission factor'
    },
    {
      name: 'Natural Gas',
      category: 'Fuel',
      value: 0.056,
      unit: 't/GJ',
      source: 'IPCC',
      sourceDescription: 'IPCC 2006 Guidelines',
      year: 2021,
      applicableTo: 'Heat',
      notes: 'Combustion emission factor for natural gas'
    },
    {
      name: 'Diesel',
      category: 'Fuel',
      value: 0.074,
      unit: 't/GJ',
      source: 'IPCC',
      sourceDescription: 'IPCC 2006 Guidelines',
      year: 2021,
      applicableTo: 'Transport',
      notes: 'Combustion emission factor for diesel'
    },
    {
      name: 'Coal',
      category: 'Fuel',
      value: 0.094,
      unit: 't/GJ',
      source: 'IPCC',
      sourceDescription: 'IPCC 2006 Guidelines',
      year: 2021,
      applicableTo: 'Heat',
      notes: 'Combustion emission factor for coal'
    },
    {
      name: 'Steel - Primary Production',
      category: 'Product',
      value: 1.9,
      unit: 't/t',
      source: 'Default',
      sourceDescription: 'World Steel Association',
      year: 2021,
      applicableTo: 'Product',
      notes: 'Average emission factor for primary steel production'
    },
    {
      name: 'Aluminum - Primary Production',
      category: 'Product',
      value: 16.0,
      unit: 't/t',
      source: 'Default',
      sourceDescription: 'International Aluminum Institute',
      year: 2021,
      applicableTo: 'Product',
      notes: 'Average emission factor for primary aluminum production'
    },
    {
      name: 'Cement',
      category: 'Product',
      value: 0.66,
      unit: 't/t',
      source: 'Default',
      sourceDescription: 'Global Cement and Concrete Association',
      year: 2021,
      applicableTo: 'Product',
      notes: 'Average emission factor for cement production'
    },
    {
      name: 'Ammonia',
      category: 'Product',
      value: 2.0,
      unit: 't/t',
      source: 'Default',
      sourceDescription: 'International Fertilizer Association',
      year: 2021,
      applicableTo: 'Product',
      notes: 'Average emission factor for ammonia production'
    }
  ];

  const handleOpenDialog = (factor?: EmissionFactor) => {
    if (factor) {
      setEditingFactor(factor);
      setFormData(factor);
    } else {
      setEditingFactor(null);
      setFormData({
        name: '',
        category: '',
        gasType: 'CO2',
        value: 0,
        unit: 't/t',
        source: 'Default',
        sourceDescription: '',
        year: new Date().getFullYear(),
        applicableTo: 'All',
        notes: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingFactor(null);
  };

  const handleInputChange = (field: string) => (
    event: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>
  ) => {
    const value = field === 'value' || field === 'year'
      ? parseFloat(event.target.value as string) || 0
      : event.target.value;
    
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSelectChange = (field: string) => (
    event: { target: { value: unknown } }
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleSave = () => {
    const numericValue = Number(formData.value ?? 0);
    if (!formData.name || !formData.category || numericValue <= 0) {
      return;
    }

    const newFactor: EmissionFactor = {
      id: editingFactor?.id ?? Date.now().toString(),
      name: formData.name || '',
      category: formData.category || '',
      gasType: formData.gasType || 'CO2',
      value: numericValue,
      unit: formData.unit || 't/t',
      source: formData.source || 'Default',
      sourceDescription: formData.sourceDescription || '',
      year: Number(formData.year ?? new Date().getFullYear()),
      applicableTo: formData.applicableTo || 'All',
      notes: formData.notes || ''
    };

    if (editingFactor) {
      updateData(data.map(factor => factor.id === editingFactor.id ? newFactor : factor));
    } else {
      updateData([...data, newFactor]);
    }

    handleCloseDialog();
  };

  const handleDelete = (id: string) => {
    updateData(data.filter(factor => factor.id !== id));
  };

  const handleAddDefaultFactors = () => {
    const newFactors = defaultEmissionFactors.map(factor => ({
      ...factor,
      id: Date.now().toString() + Math.random().toString(36).substring(2, 9)
    } as EmissionFactor));
    
    updateData([...data, ...newFactors]);
  };

  const groupedFactors = data.reduce((groups, factor) => {
    const category = factor.category;
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(factor);
    return groups;
  }, {} as Record<string, EmissionFactor[]>);

  return (
    <Box className="form-section">
      <Typography variant="h5" component="h2" gutterBottom>
        Faktori emisija
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Definišite faktore emisija za različite materijale, izvore energije i procese. Ovi faktori se koriste za izračun ugljičnog otiska vaše proizvodnje.
      </Typography>
      
      {/* Display validation errors if any */}
      {validationStatus && validationStatus.errors.length > 0 && (
        <Alert severity="error" sx={{ mb: 2 }}>
          <Typography variant="h6">Greške pri validaciji</Typography>
          <ul>
            {validationStatus.errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </Alert>
      )}
      
      <Paper sx={{ p: 3 }}>
        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="h6">
            Baza faktora emisija
          </Typography>
          <Box>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={handleAddDefaultFactors}
              sx={{ mr: 1 }}
            >
              Dodaj podrazumijevane faktore
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
            >
              Dodaj prilagođeni faktor
            </Button>
          </Box>
        </Box>

        {data.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 3, color: 'text.secondary' }}>
            <Typography>Još nema dodatih faktora emisija.</Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              Kliknite "Dodaj podrazumijevane faktore" da dodate uobičajene faktore emisija ili "Dodaj prilagođeni faktor" da dodate svoje.
            </Typography>
          </Box>
        ) : (
          <Box>
            {Object.entries(groupedFactors).map(([category, factors]) => (
              <Accordion key={category} defaultExpanded={category === 'Electricity'}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="h6">{category} ({factors.length})</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Naziv</TableCell>
                          <TableCell align="right">Vrijednost</TableCell>
                          <TableCell>Izvor</TableCell>
                          <TableCell>Godina</TableCell>
                          <TableCell>Primjenjivo na</TableCell>
                          <TableCell align="center">Akcije</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {factors.map((factor) => (
                          <TableRow key={factor.id}>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                {factor.name}
                                {factor.notes && (
                                  <Tooltip title={factor.notes}>
                                    <InfoIcon fontSize="small" sx={{ ml: 1, color: 'text.secondary' }} />
                                  </Tooltip>
                                )}
                              </Box>
                            </TableCell>
                            <TableCell align="right">
                              {factor.value.toFixed(3)} {factor.unit}
                            </TableCell>
                            <TableCell>
                              {factor.source === 'Other' ? factor.sourceDescription : factor.source}
                            </TableCell>
                            <TableCell>{factor.year}</TableCell>
                            <TableCell>{factor.applicableTo}</TableCell>
                            <TableCell align="center">
                              <IconButton
                                color="primary"
                                onClick={() => handleOpenDialog(factor)}
                              >
                                <AddIcon fontSize="small" />
                              </IconButton>
                              <IconButton
                                color="error"
                                onClick={() => handleDelete(factor.id)}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
        )}

        <Divider sx={{ my: 2 }} />
        
        <Typography variant="h6" gutterBottom>
          O faktorima emisija
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Faktori emisija predstavljaju količinu stakleničkih plinova emitiranih po jedinici aktivnosti, poput jedinice potrošene energije ili jedinice proizvedenog proizvoda.
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Tačnost izračuna ugljičnog otiska zavisi od kvaliteta i relevantnosti faktora emisija koje koristite. Gdje je moguće, koristite specifične faktore za vaše procese i izvore energije.
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Uobičajeni izvori faktora emisija uključuju IPCC smjernice, nacionalne inventare emisija, industrijske asocijacije i baze podataka analize životnog ciklusa.
        </Typography>
      </Paper>

      {/* Emission Factor Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingFactor ? 'Uredi faktor emisija' : 'Dodaj faktor emisija'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                id="name"
                label="Naziv"
                fullWidth
                value={formData.name}
                onChange={handleInputChange('name')}
                helperText="Opisni naziv za faktor emisija"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="category-label">Kategorija</InputLabel>
                <Select
                  labelId="category-label"
                  id="category"
                  value={formData.category}
                  onChange={handleSelectChange('category')}
                  label="Kategorija"
                >
                  {categories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="gasType-label">Tip plina</InputLabel>
                <Select
                  labelId="gasType-label"
                  id="gasType"
                  value={formData.gasType}
                  onChange={handleSelectChange('gasType')}
                  label="Tip plina"
                >
                  {gasTypes.map((gasType) => (
                    <MenuItem key={gasType} value={gasType}>
                      {gasType}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <TextField
                required
                id="value"
                label="Vrijednost faktora emisija"
                type="number"
                fullWidth
                inputProps={{ min: 0, step: 0.001 }}
                value={formData.value}
                onChange={handleInputChange('value')}
              />
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel id="unit-label">Jedinica</InputLabel>
                <Select
                  labelId="unit-label"
                  id="unit"
                  value={formData.unit}
                  onChange={handleSelectChange('unit')}
                  label="Jedinica"
                >
                  {units.map((unit) => (
                    <MenuItem key={unit} value={unit}>
                      {unit}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <TextField
                id="year"
                label="Godina"
                type="number"
                fullWidth
                inputProps={{ min: 2000, max: new Date().getFullYear() + 5 }}
                value={formData.year}
                onChange={handleInputChange('year')}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="source-label">Izvor</InputLabel>
                <Select
                  labelId="source-label"
                  id="source"
                  value={formData.source}
                  onChange={handleSelectChange('source')}
                  label="Izvor"
                >
                  {sources.map((source) => (
                    <MenuItem key={source} value={source}>
                      {source}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="applicableTo-label">Primjenjivo na</InputLabel>
                <Select
                  labelId="applicableTo-label"
                  id="applicableTo"
                  value={formData.applicableTo}
                  onChange={handleSelectChange('applicableTo')}
                  label="Primjenjivo na"
                >
                  {applicables.map((applicable) => (
                    <MenuItem key={applicable} value={applicable}>
                      {applicable}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                id="sourceDescription"
                label="Opis izvora"
                fullWidth
                value={formData.sourceDescription}
                onChange={handleInputChange('sourceDescription')}
                helperText="Obavezno kada je izvor 'Drugo'"
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                id="notes"
                label="Napomene"
                fullWidth
                multiline
                rows={2}
                value={formData.notes}
                onChange={handleInputChange('notes')}
                helperText="Dodatne informacije o ovom faktoru emisija"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Otkaži</Button>
          <Button onClick={handleSave} variant="contained">
            {editingFactor ? 'Ažuriraj' : 'Dodaj'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EmissionFactorsStep;
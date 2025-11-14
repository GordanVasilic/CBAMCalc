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
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert
} from '@mui/material';
import { Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import { EnergyFuelData, EmissionFactor, DataValidationStatus } from '../../types/CBAMData';
import { fuelTypes, fuelSources, energyUnits, fuelUseCategories } from '../../data/codeLists';

interface EnergyFuelDataStepProps {
  data: EnergyFuelData[];
  updateData: (data: EnergyFuelData[]) => void;
  validationStatus?: DataValidationStatus;
  emissionFactors?: EmissionFactor[];
}

const EnergyFuelDataStep: React.FC<EnergyFuelDataStepProps> = ({ data, updateData, emissionFactors, validationStatus }) => {
  const [openDialog, setOpenDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<Partial<EnergyFuelData> | null>(null);
  const [formData, setFormData] = useState<Partial<EnergyFuelData>>({
    id: '',
    fuelType: '',
    fuelSource: '',
    consumption: 0,
    unit: 'GJ',
    useCategory: '',
    co2EmissionFactor: 0,
    biomassShare: 0,
    renewableShare: 0
  });

  // fuelTypes, fuelSources i units premješteni u centralni codeLists

  useEffect(() => {
    // Set default CO2 emission factors based on fuel type
    const defaultFactors: Record<string, number> = {
      'Natural gas': 56.1,
      'Coal': 94.6,
      'Oil': 73.3,
      'LPG': 63.1,
      'Coke': 107.0,
      'Biomass': 0,
      'Electricity': 0,
      'Steam': 0,
      'Other': 0
    };

    const ft = formData.fuelType;
    if (ft) {
      // First check if we have a custom emission factor for this fuel type
      if (emissionFactors && emissionFactors.length > 0) {
        const customFactor = emissionFactors.find(
          factor => factor.category === 'Fuel' && factor.name === ft
        );
        if (customFactor) {
          setFormData(prev => ({
            ...prev,
            co2EmissionFactor: customFactor.value
          }));
          return;
        }
      }
      
      // Fall back to default factors
      if (defaultFactors[ft] !== undefined) {
        setFormData(prev => ({
          ...prev,
          co2EmissionFactor: defaultFactors[ft]
        }));
      }
    }
  }, [formData.fuelType, emissionFactors]);

  const handleOpenDialog = (item?: EnergyFuelData) => {
    if (item) {
      setEditingItem(item);
      setFormData(item);
    } else {
      setEditingItem(null);
      setFormData({
        id: '',
        fuelType: '',
        fuelSource: '',
        consumption: 0,
        unit: 'GJ',
        useCategory: '',
        co2EmissionFactor: 0,
        biomassShare: 0,
        renewableShare: 0
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingItem(null);
  };

  const handleInputChange = (field: string) => (
    event: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>
  ) => {
    const value = field === 'consumption' || field === 'co2EmissionFactor' || 
                  field === 'biomassShare' || field === 'renewableShare'
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
    const consumptionValue = Number(formData.consumption ?? 0);
    if (!formData.fuelType || !formData.fuelSource || consumptionValue <= 0) {
      return;
    }

    const newItem: EnergyFuelData = {
      id: editingItem?.id ?? Date.now().toString(),
      fuelType: formData.fuelType || '',
      fuelSource: formData.fuelSource || '',
      consumption: consumptionValue,
      unit: formData.unit || 'GJ',
      useCategory: formData.useCategory || '',
      co2EmissionFactor: Number(formData.co2EmissionFactor ?? 0),
      biomassShare: Number(formData.biomassShare ?? 0),
      renewableShare: Number(formData.renewableShare ?? 0)
    };

    if (editingItem) {
      updateData(data.map(item => item.id === editingItem.id ? newItem : item));
    } else {
      updateData([...data, newItem]);
    }

    handleCloseDialog();
  };

  const handleDelete = (id: string) => {
    updateData(data.filter(item => item.id !== id));
  };

  return (
    <Box className="form-section">
      <Typography variant="h5" component="h2" gutterBottom>
        Energija i gorivo
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Unesite sve izvore energije i goriva koje instalacija troši. Ovi podaci se koriste za izračun direktnih emisija CO2.
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
            Izvori energije i goriva
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Dodaj energiju/gorivo
          </Button>
        </Box>

        {data.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 3, color: 'text.secondary' }}>
            <Typography>Još nema unijetih podataka o energiji ili gorivu.</Typography>
            <Typography variant="body2">
              Kliknite „Dodaj energiju/gorivo” da dodate prvi unos.
            </Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Tip goriva</TableCell>
                  <TableCell>Izvor</TableCell>
                  <TableCell>Namjena</TableCell>
                  <TableCell align="right">Potrošnja</TableCell>
                  <TableCell align="right">CO2 faktor</TableCell>
                  <TableCell align="right">CO2 emisije</TableCell>
                  <TableCell align="center">Akcije</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.map((item) => {
                  const emissions = item.consumption * (item.co2EmissionFactor || 0);
                  return (
                    <TableRow key={item.id}>
                      <TableCell>{item.fuelType}</TableCell>
                      <TableCell>{item.fuelSource}</TableCell>
                      <TableCell>{item.useCategory || '-'}</TableCell>
                      <TableCell align="right">
                        {item.consumption.toFixed(2)} {item.unit}
                      </TableCell>
                      <TableCell align="right">
                        {(item.co2EmissionFactor || 0).toFixed(2)} t/TJ
                      </TableCell>
                      <TableCell align="right">
                        {emissions.toFixed(2)} t CO2
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          color="primary"
                          onClick={() => handleOpenDialog(item)}
                        >
                          <AddIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          color="error"
                          onClick={() => handleDelete(item.id)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })}
                <TableRow>
                  <TableCell colSpan={3}>
                    <Typography variant="subtitle1" fontWeight="bold">
                      Ukupne direktne emisije CO2
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="subtitle1" fontWeight="bold">
                      {data.reduce((sum, item) => sum + (item.consumption * (item.co2EmissionFactor || 0)), 0).toFixed(2)}
                    </Typography>
                  </TableCell>
                  <TableCell>t CO2</TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      <Paper sx={{ p: 3, mt: 2 }}>
        <Typography variant="h6" gutterBottom>Fuel balance</Typography>
        <Grid container spacing={1}>
          <Grid item xs={12} sm={8}>
            <Typography>Ukupan unos goriva</Typography>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography align="right">
              {data.reduce((sum, item) => sum + (item.unit === 'GJ' ? item.consumption/1000 : item.unit === 'MWh' ? (item.consumption*3.6)/1000 : 0), 0).toFixed(3)} TJ
            </Typography>
          </Grid>

          <Grid item xs={12} sm={8}>
            <Typography>Gorivo za CBAM proizvodne procese</Typography>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography align="right">
              {data.filter(i => i.useCategory === 'CBAM proizvodni procesi').reduce((s, i) => s + (i.unit === 'GJ' ? i.consumption/1000 : i.unit === 'MWh' ? (i.consumption*3.6)/1000 : 0), 0).toFixed(3)} TJ
            </Typography>
          </Grid>

          <Grid item xs={12} sm={8}>
            <Typography>Gorivo za proizvodnju električne energije</Typography>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography align="right">
              {data.filter(i => i.useCategory === 'Proizvodnja električne energije').reduce((s, i) => s + (i.unit === 'GJ' ? i.consumption/1000 : i.unit === 'MWh' ? (i.consumption*3.6)/1000 : 0), 0).toFixed(3)} TJ
            </Typography>
          </Grid>

          <Grid item xs={12} sm={8}>
            <Typography>Gorivo za ne-CBAM procese</Typography>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography align="right">
              {data.filter(i => i.useCategory === 'Ne-CBAM procesi').reduce((s, i) => s + (i.unit === 'GJ' ? i.consumption/1000 : i.unit === 'MWh' ? (i.consumption*3.6)/1000 : 0), 0).toFixed(3)} TJ
            </Typography>
          </Grid>
        </Grid>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Napomena: Sažetak uključuje unose u GJ i MWh (konverzija u TJ).
        </Typography>
      </Paper>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingItem ? 'Uredi energiju/gorivo' : 'Dodaj energiju/gorivo'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="fuelType-label">Tip goriva</InputLabel>
                <Select
                  labelId="fuelType-label"
                  id="fuelType"
                  value={formData.fuelType}
                  onChange={handleSelectChange('fuelType')}
                  label="Fuel Type"
                >
                  {fuelTypes.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="fuelSource-label">Izvor goriva</InputLabel>
                <Select
                  labelId="fuelSource-label"
                  id="fuelSource"
                  value={formData.fuelSource}
                  onChange={handleSelectChange('fuelSource')}
                  label="Fuel Source"
                >
                  {fuelSources.map((source) => (
                    <MenuItem key={source} value={source}>
                      {source}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="useCategory-label">Namjena</InputLabel>
                <Select
                  labelId="useCategory-label"
                  id="useCategory"
                  value={formData.useCategory || ''}
                  onChange={handleSelectChange('useCategory')}
                  label="Namjena"
                >
                  {fuelUseCategories.map((cat) => (
                    <MenuItem key={cat} value={cat}>
                      {cat}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                required
                id="consumption"
                label="Potrošnja"
                type="number"
                fullWidth
                inputProps={{ min: 0, step: 0.01 }}
                value={formData.consumption}
                onChange={handleInputChange('consumption')}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="unit-label">Jedinica</InputLabel>
                <Select
                  labelId="unit-label"
                  id="unit"
                  value={formData.unit}
                  onChange={handleSelectChange('unit')}
                  label="Unit"
                >
                  {energyUnits.map((unit) => (
                    <MenuItem key={unit} value={unit}>
                      {unit}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                id="co2EmissionFactor"
                label="Faktor emisije CO2 (t/TJ)"
                type="number"
                fullWidth
                inputProps={{ min: 0, step: 0.01 }}
                value={formData.co2EmissionFactor}
                onChange={handleInputChange('co2EmissionFactor')}
                helperText="t CO2 po TJ goriva"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                id="biomassShare"
                label="Učešće biomase (%)"
                type="number"
                fullWidth
                inputProps={{ min: 0, max: 100, step: 0.1 }}
                value={formData.biomassShare}
                onChange={handleInputChange('biomassShare')}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                id="renewableShare"
                label="Učešće obnovljive energije (%)"
                type="number"
                fullWidth
                inputProps={{ min: 0, max: 100, step: 0.1 }}
                value={formData.renewableShare}
                onChange={handleInputChange('renewableShare')}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Otkaži</Button>
          <Button onClick={handleSave} variant="contained">
            {editingItem ? 'Ažuriraj' : 'Dodaj'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EnergyFuelDataStep;
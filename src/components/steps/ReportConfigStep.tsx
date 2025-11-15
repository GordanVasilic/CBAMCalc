import React from 'react';
import {
  Box,
  Typography,
  TextField,
  Grid,
  Paper,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Alert,
  Autocomplete
} from '@mui/material';
import { SelectChangeEvent } from '@mui/material/Select';
import { ReportConfig, DataValidationStatus } from '../../types/CBAMData';

interface ReportConfigStepProps {
  data: ReportConfig;
  updateData: (data: ReportConfig) => void;
  validationStatus?: DataValidationStatus;
}

const ReportConfigStep: React.FC<ReportConfigStepProps> = ({ data, updateData, validationStatus }) => {
  const handleInputChange = (field: keyof ReportConfig) => (
    event: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>
  ) => {
    updateData({
      ...data,
      [field]: event.target.value
    });
  };

  const handleSelectChange = (field: keyof ReportConfig) => (
    event: SelectChangeEvent<string>
  ) => {
    updateData({
      ...data,
      [field]: event.target.value as string
    });
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);
  const reportTypeOptions = [
    'Kvartalni izvještaj',
    'Godišnji izvještaj',
    'Privremeni izvještaj',
    'Korigovani izvještaj'
  ];
  
  // countries moved to centralized codeLists

  return (
    <Box className="form-section">
      <Typography variant="h5" component="h2" gutterBottom>
        Konfiguracija izvještaja
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Podesite izvještajni period i detalje instalacije za ovaj CBAM izvještaj.
      </Typography>
      
      {validationStatus && validationStatus.errors.length > 0 && (
        <Alert severity="error" sx={{ mb: 2 }}>
          <Typography variant="subtitle2">Molimo ispravite sljedeće greške:</Typography>
          <ul>
            {validationStatus.errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </Alert>
      )}
      
      <Paper sx={{ p: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel id="reportingPeriod-label">Izvještajni period</InputLabel>
              <Select
                labelId="reportingPeriod-label"
                id="reportingPeriod"
                name="reportingPeriod"
                value={data.reportingPeriod}
                onChange={handleSelectChange('reportingPeriod')}
                label="Izvještajni period"
              >
                {years.map((year) => (
                  <MenuItem key={year} value={year.toString()}>
                    {year}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Autocomplete
              options={reportTypeOptions}
              freeSolo
              value={data.reportType || ''}
              onChange={(_, value) => updateData({ ...data, reportType: value || '' })}
              renderInput={(params) => (
                <TextField
                  {...params}
                  id="reportType"
                  name="reportType"
                  label="Vrsta izvještaja"
                  helperText="Odaberite ili unesite tip izvještaja"
                />
              )}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              required
              id="installationId"
              name="installationId"
              label="ID instalacije"
              fullWidth
              value={data.installationId}
              onChange={handleInputChange('installationId')}
              helperText="Jedinstveni identifikator instalacije"
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              required
              id="installationId"
              name="installationId"
              label="ID instalacije"
              fullWidth
              value={data.installationId}
              onChange={handleInputChange('installationId')}
              helperText="Jedinstveni identifikator instalacije"
            />
          </Grid>
          
          {/* Identitet instalacije (naziv, adresa, država) seljen u A_InstData */}
        </Grid>
      </Paper>
    </Box>
  );
};

export default ReportConfigStep;
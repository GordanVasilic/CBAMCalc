import React from 'react';
import {
  Box,
  Typography,
  TextField,
  Grid,
  Paper,
  Alert
} from '@mui/material';
import { CompanyInfo, DataValidationStatus } from '../../types/CBAMData';

interface CompanyInfoStepProps {
  data: CompanyInfo;
  updateData: (data: CompanyInfo) => void;
  validationStatus?: DataValidationStatus;
}

const CompanyInfoStep: React.FC<CompanyInfoStepProps> = ({ data, updateData, validationStatus }) => {
  const handleInputChange = (field: keyof CompanyInfo) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    updateData({
      ...data,
      [field]: event.target.value
    });
  };

  return (
    <Box className="form-section">
      <Typography variant="h5" component="h2" gutterBottom>
        Podaci o kompaniji
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Molimo unesite podatke o kompaniji. Ovi podaci će biti korišteni u CBAM izvještaju.
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
          <Grid item xs={12}>
            <TextField
              required
              id="companyName"
              name="companyName"
              label="Naziv kompanije"
              fullWidth
              value={data.companyName}
              onChange={handleInputChange('companyName')}
              helperText="Pravni naziv kompanije"
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              required
              id="companyAddress"
              name="companyAddress"
              label="Adresa kompanije"
              fullWidth
              multiline
              rows={2}
              value={data.companyAddress}
              onChange={handleInputChange('companyAddress')}
              helperText="Puna registrirana adresa kompanije"
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              required
              id="companyContactPerson"
              name="companyContactPerson"
              label="Kontakt osoba"
              fullWidth
              value={data.companyContactPerson}
              onChange={handleInputChange('companyContactPerson')}
              helperText="Ime osobe odgovorne za CBAM izvještavanje"
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              required
              id="companyPhone"
              name="companyPhone"
              label="Broj telefona"
              fullWidth
              value={data.companyPhone}
              onChange={handleInputChange('companyPhone')}
              helperText="Kontakt telefon"
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              required
              id="companyEmail"
              name="companyEmail"
              label="Email adresa"
              fullWidth
              type="email"
              value={data.companyEmail}
              onChange={handleInputChange('companyEmail')}
              helperText="Email za CBAM komunikaciju"
            />
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default CompanyInfoStep;
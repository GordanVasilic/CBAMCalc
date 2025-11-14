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
  Button
} from '@mui/material';
import { InstallationDetails, DataValidationStatus } from '../../types/CBAMData';
import { installationTypes, mainActivities, countries } from '../../data/codeLists';
import CNCodeAutocomplete from '../common/CNCodeAutocomplete';

interface InstallationDetailsStepProps {
  data: InstallationDetails;
  updateData: (data: InstallationDetails) => void;
  validationStatus?: DataValidationStatus;
}

const InstallationDetailsStep: React.FC<InstallationDetailsStepProps> = ({ data, updateData, validationStatus }) => {
  const handleInputChange = (field: keyof InstallationDetails) => (
    event: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>
  ) => {
    const value = field === 'productionCapacity' || field === 'annualProduction'
      ? parseFloat(event.target.value as string) || 0
      : event.target.value;
    
    updateData({
      ...data,
      [field]: value as any
    });
  };

  const handleSelectChange = (field: keyof InstallationDetails) => (
    event: { target: { value: unknown } }
  ) => {
    updateData({
      ...data,
      [field]: event.target.value as any
    });
  };

  const addAggregatedGood = () => {
    const current = data.aggregatedGoods ?? [];
    updateData({
      ...data,
      aggregatedGoods: [...current, { category: '', routes: [''] }]
    });
  };

  const updateAggregatedGood = (index: number, key: 'category' | 'routes', value: any) => {
    const current = data.aggregatedGoods ?? [];
    const updated = current.map((item, i) => i === index ? { ...item, [key]: value } : item);
    updateData({ ...data, aggregatedGoods: updated });
  };

  const addRoute = (aggIndex: number) => {
    const current = data.aggregatedGoods ?? [];
    const routes = current[aggIndex]?.routes ?? [];
    current[aggIndex] = { ...current[aggIndex], routes: [...routes, ''] };
    updateData({ ...data, aggregatedGoods: [...current] });
  };

  const updateRoute = (aggIndex: number, routeIndex: number, value: string) => {
    const current = data.aggregatedGoods ?? [];
    const routes = [...(current[aggIndex]?.routes ?? [])];
    routes[routeIndex] = value;
    current[aggIndex] = { ...current[aggIndex], routes };
    updateData({ ...data, aggregatedGoods: [...current] });
  };

  

  const addProductionProcess = () => {
    const current = data.productionProcesses ?? [];
    updateData({ ...data, productionProcesses: [...current, { name: '', includedGoodsCategories: [] }] });
  };

  const updateProductionProcess = (index: number, key: 'name' | 'includedGoodsCategories', value: any) => {
    const current = data.productionProcesses ?? [];
    const updated = current.map((p, i) => i === index ? { ...p, [key]: value } : p);
    updateData({ ...data, productionProcesses: updated });
  };

  return (
    <Box className="form-section">
      <Typography variant="h5" component="h2" gutterBottom>
        Detalji o instalaciji
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Unesite specifične detalje o tipu instalacije, glavnoj aktivnosti, adresi, periodu izvještavanja i kapacitetu proizvodnje.
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
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Period izvještavanja</Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <TextField
              id="startDate"
              name="startDate"
              label="Početak"
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={data.startDate ?? ''}
              onChange={handleInputChange('startDate')}
              helperText="Datum početka izvještajnog perioda"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              id="endDate"
              name="endDate"
              label="Kraj"
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={data.endDate ?? ''}
              onChange={handleInputChange('endDate')}
              helperText="Datum završetka izvještajnog perioda"
            />
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>O instalaciji</Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel id="installationType-label">Tip instalacije</InputLabel>
              <Select
                labelId="installationType-label"
                id="installationType"
                name="installationType"
                value={data.installationType}
                onChange={handleSelectChange('installationType')}
                label="Tip instalacije"
              >
                {installationTypes.map((type) => (
                  <MenuItem key={type} value={type}>{type}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel id="mainActivity-label">Glavna aktivnost</InputLabel>
              <Select
                labelId="mainActivity-label"
                id="mainActivity"
                name="mainActivity"
                value={data.mainActivity}
                onChange={handleSelectChange('mainActivity')}
                label="Glavna aktivnost"
              >
                {mainActivities.map((activity) => (
                  <MenuItem key={activity} value={activity}>{activity}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              id="economicActivity"
              name="economicActivity"
              label="Ekonomska aktivnost"
              fullWidth
              value={data.economicActivity ?? ''}
              onChange={handleInputChange('economicActivity')}
              helperText="Opis ekonomske aktivnosti (npr. NACE)"
            />
          </Grid>

          <Grid item xs={12}>
            <CNCodeAutocomplete
              value={data.cnCode || ''}
              onChange={(v) => updateData({ ...data, cnCode: v })}
              label="CN kod (Kombinirana nomenklatura)"
              helperText="EU CN kod za glavni proizvod"
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              id="installationName"
              name="installationName"
              label="Naziv instalacije"
              fullWidth
              value={data.installationName ?? ''}
              onChange={handleInputChange('installationName')}
              helperText="Opcionalno"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              id="installationEnglishName"
              name="installationEnglishName"
              label="Naziv instalacije (eng.)"
              fullWidth
              value={data.installationEnglishName ?? ''}
              onChange={handleInputChange('installationEnglishName')}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              id="streetAndNumber"
              name="streetAndNumber"
              label="Ulica i broj"
              fullWidth
              value={data.streetAndNumber ?? ''}
              onChange={handleInputChange('streetAndNumber')}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              id="postalCode"
              name="postalCode"
              label="Poštanski broj"
              fullWidth
              value={data.postalCode ?? ''}
              onChange={handleInputChange('postalCode')}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              id="poBox"
              name="poBox"
              label="Poštanski pretinac"
              fullWidth
              value={data.poBox ?? ''}
              onChange={handleInputChange('poBox')}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              id="city"
              name="city"
              label="Grad"
              fullWidth
              value={data.city ?? ''}
              onChange={handleInputChange('city')}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel id="country-label">Država</InputLabel>
              <Select
                labelId="country-label"
                id="country"
                name="country"
                value={data.country ?? ''}
                onChange={handleSelectChange('country')}
                label="Država"
              >
                {countries.map((c) => (
                  <MenuItem key={c} value={c}>{c}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              id="unlocode"
              name="unlocode"
              label="UNLOCODE"
              fullWidth
              value={data.unlocode ?? ''}
              onChange={handleInputChange('unlocode')}
              helperText="UN lokacija code, ako je primjenjivo"
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              id="latitude"
              name="latitude"
              label="Latituda"
              fullWidth
              type="number"
              inputProps={{ step: 0.000001 }}
              value={data.latitude ?? ''}
              onChange={handleInputChange('latitude')}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              id="longitude"
              name="longitude"
              label="Longituda"
              fullWidth
              type="number"
              inputProps={{ step: 0.000001 }}
              value={data.longitude ?? ''}
              onChange={handleInputChange('longitude')}
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField
              id="authorizedRepresentativeName"
              name="authorizedRepresentativeName"
              label="Ovlaštena osoba"
              fullWidth
              value={data.authorizedRepresentativeName ?? ''}
              onChange={handleInputChange('authorizedRepresentativeName')}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              id="authorizedRepresentativeEmail"
              name="authorizedRepresentativeEmail"
              label="Email ovlaštene osobe"
              type="email"
              fullWidth
              value={data.authorizedRepresentativeEmail ?? ''}
              onChange={handleInputChange('authorizedRepresentativeEmail')}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              id="authorizedRepresentativeTelephone"
              name="authorizedRepresentativeTelephone"
              label="Telefon ovlaštene osobe"
              fullWidth
              value={data.authorizedRepresentativeTelephone ?? ''}
              onChange={handleInputChange('authorizedRepresentativeTelephone')}
            />
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Verifikator izvještaja</Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <TextField id="verifierCompanyName" name="verifierCompanyName" label="Naziv kompanije verifikatora" fullWidth value={data.verifierCompanyName ?? ''} onChange={handleInputChange('verifierCompanyName')} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField id="verifierStreetAndNumber" name="verifierStreetAndNumber" label="Ulica i broj verifikatora" fullWidth value={data.verifierStreetAndNumber ?? ''} onChange={handleInputChange('verifierStreetAndNumber')} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField id="verifierCity" name="verifierCity" label="Grad verifikatora" fullWidth value={data.verifierCity ?? ''} onChange={handleInputChange('verifierCity')} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel id="verifierCountry-label">Država verifikatora</InputLabel>
              <Select labelId="verifierCountry-label" id="verifierCountry" name="verifierCountry" value={data.verifierCountry ?? ''} onChange={handleSelectChange('verifierCountry')} label="Država verifikatora">
                {countries.map((c) => (<MenuItem key={c} value={c}>{c}</MenuItem>))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField id="verifierPostalCode" name="verifierPostalCode" label="Poštanski broj verifikatora" fullWidth value={data.verifierPostalCode ?? ''} onChange={handleInputChange('verifierPostalCode')} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField id="verifierAuthorizedRepresentative" name="verifierAuthorizedRepresentative" label="Ovlašteni predstavnik verifikatora" fullWidth value={data.verifierAuthorizedRepresentative ?? ''} onChange={handleInputChange('verifierAuthorizedRepresentative')} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField id="verifierName" name="verifierName" label="Ime verifikatora" fullWidth value={data.verifierName ?? ''} onChange={handleInputChange('verifierName')} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField id="verifierEmail" name="verifierEmail" label="Email verifikatora" type="email" fullWidth value={data.verifierEmail ?? ''} onChange={handleInputChange('verifierEmail')} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField id="verifierTelephone" name="verifierTelephone" label="Telefon verifikatora" fullWidth value={data.verifierTelephone ?? ''} onChange={handleInputChange('verifierTelephone')} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField id="verifierFax" name="verifierFax" label="Fax" fullWidth value={data.verifierFax ?? ''} onChange={handleInputChange('verifierFax')} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel id="accreditationMemberState-label">Država akreditacije</InputLabel>
              <Select labelId="accreditationMemberState-label" id="accreditationMemberState" name="accreditationMemberState" value={data.accreditationMemberState ?? ''} onChange={handleSelectChange('accreditationMemberState')} label="Država akreditacije">
                {countries.map((c) => (<MenuItem key={c} value={c}>{c}</MenuItem>))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField id="accreditationBodyName" name="accreditationBodyName" label="Naziv akreditacijskog tijela" fullWidth value={data.accreditationBodyName ?? ''} onChange={handleInputChange('accreditationBodyName')} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField id="accreditationRegistrationNumber" name="accreditationRegistrationNumber" label="Registarski broj" fullWidth value={data.accreditationRegistrationNumber ?? ''} onChange={handleInputChange('accreditationRegistrationNumber')} />
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Agregirane kategorije dobara i proizvodne rute</Typography>
        {(data.aggregatedGoods ?? []).map((item, idx) => (
          <Box key={idx} sx={{ mb: 2 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={6}>
                <TextField label="Agregirana kategorija" fullWidth value={item.category} onChange={(e) => updateAggregatedGood(idx, 'category', e.target.value)} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Button variant="outlined" onClick={() => addRoute(idx)}>Dodaj rutu</Button>
              </Grid>
              {(item.routes ?? []).map((route, rIdx) => (
                <Grid item xs={12} sm={6} key={rIdx}>
                  <TextField label={`Ruta ${rIdx + 1}`} fullWidth value={route} onChange={(e) => updateRoute(idx, rIdx, e.target.value)} />
                </Grid>
              ))}
            </Grid>
          </Box>
        ))}
        <Button variant="contained" onClick={addAggregatedGood}>Dodaj kategoriju</Button>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>Procesi proizvodnje (bubble pristup gdje primjenjivo)</Typography>
        {(data.productionProcesses ?? []).map((proc, pIdx) => (
          <Box key={pIdx} sx={{ mb: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField label="Naziv procesa" fullWidth value={proc.name} onChange={(e) => updateProductionProcess(pIdx, 'name', e.target.value)} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel id={`includedGoods-${pIdx}`}>Uključene kategorije dobara</InputLabel>
                  <Select
                    labelId={`includedGoods-${pIdx}`}
                    multiple
                    value={proc.includedGoodsCategories}
                    onChange={(e: any) => updateProductionProcess(pIdx, 'includedGoodsCategories', e.target.value)}
                    label="Uključene kategorije dobara"
                  >
                    {(data.aggregatedGoods ?? []).map((g, i) => (
                      <MenuItem key={`${g.category}-${i}`} value={g.category}>{g.category || `Kategorija ${i+1}`}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        ))}
        <Button variant="contained" onClick={addProductionProcess}>Dodaj proces</Button>
      </Paper>
    </Box>
  );
};

export default InstallationDetailsStep;
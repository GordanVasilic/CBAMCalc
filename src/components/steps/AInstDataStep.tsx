import React, { useState, useEffect, useCallback } from 'react';
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
  Button,
  Checkbox,
  FormControlLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  IconButton,
  Divider,
  Tooltip
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Add as AddIcon,
  Info as InfoIcon,
  DateRange as DateRangeIcon
} from '@mui/icons-material';
import { AInstData } from '../../types/AInstDataTypes';
import { validateAInstData, ValidationStatus } from '../../utils/aInstDataCalculationEngine';
import { countries, installationTypes, mainActivities } from '../../data/codeLists';
import CNCodeAutocomplete from '../common/CNCodeAutocomplete';

interface AInstDataStepProps {
  data: AInstData;
  updateData: (data: AInstData) => void;
  validationStatus?: ValidationStatus;
}

const AInstDataStep: React.FC<AInstDataStepProps> = ({ data, updateData, validationStatus }) => {
  const [localValidation, setLocalValidation] = useState<ValidationStatus | null>(null);
  const [expandedSections, setExpandedSections] = useState<string[]>(['reporting', 'installation', 'representative']);
  const [validationTimeout, setValidationTimeout] = useState<NodeJS.Timeout | null>(null);

  const periodSummary = `${data.reportingPeriod.startDate || '—'} → ${data.reportingPeriod.endDate || '—'}`;

  // Memoizirana validacija s debouncingom
  const performValidation = useCallback(() => {
    if (validationTimeout) {
      clearTimeout(validationTimeout);
    }
    
    const timeout = setTimeout(() => {
      const validation = validateAInstData(data);
      setLocalValidation(validation);
    }, 500); // 500ms debounce
    
    setValidationTimeout(timeout);
  }, [data, validationTimeout]);

  useEffect(() => {
    performValidation();
    
    return () => {
      if (validationTimeout) {
        clearTimeout(validationTimeout);
      }
    };
  }, [performValidation, validationTimeout]);
  
  // Update the data with validation results when validation changes
  useEffect(() => {
    if (localValidation) {
      const updatedData = {
        ...data,
        validationStatus: {
          isComplete: localValidation.isValid,
          missingFields: localValidation.errors.map(e => e.field),
          errors: localValidation.errors.map(e => e.message),
          warnings: localValidation.warnings.map(w => w.message),
          completenessPercentage: localValidation.completeness
        }
      };
      updateData(updatedData);
    }
  }, [localValidation, data, updateData]);

  const handleSectionToggle = useCallback((section: string) => {
    setExpandedSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  }, []);

  const handleReportingPeriodChange = useCallback((field: keyof AInstData['reportingPeriod'], value: any) => {
    const updatedData = {
      ...data,
      reportingPeriod: {
        ...data.reportingPeriod,
        [field]: value
      }
    };
    updateData(updatedData);
  }, [data, updateData]);

  const handleInstallationIdentificationChange = useCallback((field: keyof AInstData['installationIdentification'], value: any) => {
    const updatedData = {
      ...data,
      installationIdentification: {
        ...data.installationIdentification,
        [field]: value
      }
    };
    updateData(updatedData);
  }, [data, updateData]);

  const handleInstallationAddressChange = useCallback((field: keyof AInstData['installationAddress'], value: any) => {
    const updatedData = {
      ...data,
      installationAddress: {
        ...data.installationAddress,
        [field]: value
      }
    };
    updateData(updatedData);
  }, [data, updateData]);

  const handleAuthorizedRepresentativeChange = (field: keyof AInstData['authorizedRepresentative'], value: any) => {
    const updatedData = {
      ...data,
      authorizedRepresentative: {
        ...data.authorizedRepresentative,
        [field]: value
      }
    };
    updateData(updatedData);
  };

  const handleVerifierInformationChange = (field: keyof NonNullable<AInstData['verifierInformation']>, value: any) => {
    if (!data.verifierInformation) {
      return; // Don't update if verifierInformation doesn't exist
    }
    
    const updatedData = {
      ...data,
      verifierInformation: {
        ...data.verifierInformation,
        [field]: value
      }
    };
    updateData(updatedData);
  };

  const addAggregatedGoodsCategory = () => {
    const newCategory = {
      id: `G${data.aggregatedGoodsCategories.length + 1}`,
      category: '',
      productionRoutes: [],
      isDirectProduction: false,
      relevantPrecursors: [],
      pfcEmissionsRelevant: false
    };
    
    const updatedData = {
      ...data,
      aggregatedGoodsCategories: [...data.aggregatedGoodsCategories, newCategory]
    };
    updateData(updatedData);
  };

  const updateAggregatedGoodsCategory = (index: number, field: string, value: any) => {
    const updatedCategories = [...data.aggregatedGoodsCategories];
    updatedCategories[index] = {
      ...updatedCategories[index],
      [field]: value
    };
    
    const updatedData = {
      ...data,
      aggregatedGoodsCategories: updatedCategories
    };
    updateData(updatedData);
  };

  const addProductionRoute = (categoryIndex: number) => {
    const updatedCategories = [...data.aggregatedGoodsCategories];
    const newRoute = {
      routeNumber: updatedCategories[categoryIndex].productionRoutes.length + 1,
      routeName: '',
      isPrimaryRoute: false,
      rawMaterials: [],
      intermediates: [],
      finalProducts: [],
      energySources: [],
      emissionSources: []
    };
    
    updatedCategories[categoryIndex].productionRoutes.push(newRoute);
    
    const updatedData = {
      ...data,
      aggregatedGoodsCategories: updatedCategories
    };
    updateData(updatedData);
  };

  const updateProductionRoute = (categoryIndex: number, routeIndex: number, field: string, value: any) => {
    const updatedCategories = [...data.aggregatedGoodsCategories];
    updatedCategories[categoryIndex].productionRoutes[routeIndex] = {
      ...updatedCategories[categoryIndex].productionRoutes[routeIndex],
      [field]: value
    };
    
    const updatedData = {
      ...data,
      aggregatedGoodsCategories: updatedCategories
    };
    updateData(updatedData);
  };

  const addProductionProcess = () => {
    const newProcess = {
      id: `P${data.productionProcesses.length + 1}`,
      name: '',
      aggregatedGoodsCategory: '',
      includedGoodsCategories: [],
      isBubbleApproach: false,
      systemBoundary: {
        includesDirectEmissions: true,
        includesMeasurableHeat: false,
        includesWasteGases: false,
        includesIndirectEmissions: false,
        includesPrecursors: false
      },
      goodsAndPrecursors: {
        goods: [],
        precursors: []
      },
      validationStatus: {
        isComplete: false,
        errorMessages: [],
        warnings: []
      }
    };
    
    const updatedData = {
      ...data,
      productionProcesses: [...data.productionProcesses, newProcess]
    };
    updateData(updatedData);
  };

  const updateProductionProcess = (index: number, field: string, value: any) => {
    const updatedProcesses = [...data.productionProcesses];
    updatedProcesses[index] = {
      ...updatedProcesses[index],
      [field]: value
    };
    
    const updatedData = {
      ...data,
      productionProcesses: updatedProcesses
    };
    updateData(updatedData);
  };

  

  const currentValidation = validationStatus || localValidation;

  return (
    <Box className="form-section">
      <Typography variant="h5" component="h2" gutterBottom>
        Podaci o instalaciji
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Unesite opšte informacije o instalaciji i proizvodne procese prema Excel predlošku.
      </Typography>
      
      {currentValidation?.errors && currentValidation.errors.length > 0 && (
        <Alert severity="error" sx={{ mb: 2 }}>
          <Typography variant="subtitle2">Pronađene greške:</Typography>
          <ul>
            {currentValidation?.errors?.map((error, index) => (
              <li key={index}>{error.message}</li>
            ))}
          </ul>
        </Alert>
      )}
      
      {currentValidation?.warnings && currentValidation.warnings.length > 0 && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          <Typography variant="subtitle2">Upozorenja:</Typography>
          <ul>
            {currentValidation?.warnings?.map((warning, index) => (
              <li key={index}>{warning.message}</li>
            ))}
          </ul>
        </Alert>
      )}
      
      {currentValidation && (
        <Alert 
          severity={currentValidation?.isValid ? "success" : "info"} 
          sx={{ mb: 2 }}
        >
          <Typography variant="subtitle2">
            Kompletnost: {currentValidation?.completeness?.toFixed(1) ?? 0}%
          </Typography>
          {currentValidation?.recommendations?.length > 0 && (
            <ul>
              {currentValidation?.recommendations?.map((rec, index) => (
                <li key={index}>{rec}</li>
              ))}
            </ul>
          )}
        </Alert>
      )}

      {/* Section 1: Reporting Period */}
      <Accordion 
        expanded={expandedSections.includes('reporting')} 
        onChange={() => handleSectionToggle('reporting')}
        sx={{ borderLeft: 4, borderColor: 'primary.main', bgcolor: 'background.paper' }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="h6">1. Izvještajni period</Typography>
              <Chip 
                label={`${currentValidation?.sections?.find(s => s.section === 'Reporting Period')?.percentage?.toFixed(0) ?? 0}%`}
                color={currentValidation?.sections?.find(s => s.section === 'Reporting Period')?.percentage === 100 ? 'success' : 'default'}
                size="small"
              />
            </Box>
            <Chip 
              icon={<DateRangeIcon />} 
              label={periodSummary} 
              variant="outlined" 
              size="small" 
            />
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="date"
                label="Početak izvještajnog perioda"
                value={data.reportingPeriod.startDate}
                onChange={(e) => handleReportingPeriodChange('startDate', e.target.value)}
                InputLabelProps={{ shrink: true }}
                helperText="Npr. 2023-01-01 za cijelu 2023. godinu"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="date"
                label="Kraj izvještajnog perioda"
                value={data.reportingPeriod.endDate}
                onChange={(e) => handleReportingPeriodChange('endDate', e.target.value)}
                InputLabelProps={{ shrink: true }}
                helperText="Npr. 2023-12-31 za cijelu 2023. godinu"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Napomene o izvještajnom periodu"
                value={data.reportingPeriod.notes || ''}
                onChange={(e) => handleReportingPeriodChange('notes', e.target.value)}
                helperText="Dodatne informacije o izvještajnom periodu"
              />
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Section 2: Installation Details */}
      <Accordion 
        expanded={expandedSections.includes('installation')} 
        onChange={() => handleSectionToggle('installation')}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">2. O instalaciji</Typography>
          <Chip 
            label={`${currentValidation?.sections?.find(s => s.section === 'Installation Identification')?.percentage?.toFixed(0) ?? 0}%`}
            color={currentValidation?.sections?.find(s => s.section === 'Installation Identification')?.percentage === 100 ? 'success' : 'default'}
            size="small"
            sx={{ ml: 2 }}
          />
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Tip instalacije</InputLabel>
                <Select
                  value={data.installationIdentification.installationType}
                  onChange={(e) => handleInstallationIdentificationChange('installationType', e.target.value)}
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
                <InputLabel>Glavna aktivnost</InputLabel>
                <Select
                  value={data.installationIdentification.mainActivity}
                  onChange={(e) => handleInstallationIdentificationChange('mainActivity', e.target.value)}
                  label="Glavna aktivnost"
                >
                  {mainActivities.map((activity) => (
                    <MenuItem key={activity} value={activity}>{activity}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <CNCodeAutocomplete
                value={data.installationIdentification.cnCode}
                onChange={(value) => handleInstallationIdentificationChange('cnCode', value)}
                label="CN kod (Kombinirana nomenklatura)"
                helperText="8-znamenkasti CN kod za glavni proizvod"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Naziv instalacije"
                value={data.installationIdentification.installationName}
                onChange={(e) => handleInstallationIdentificationChange('installationName', e.target.value)}
                helperText="Službeni naziv instalacije"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Naziv instalacije (engleski)"
                value={data.installationIdentification.installationEnglishName || ''}
                onChange={(e) => handleInstallationIdentificationChange('installationEnglishName', e.target.value)}
                helperText="Engleski naziv instalacije (opcionalno)"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Ekonomska aktivnost (NACE)"
                value={data.installationIdentification.economicActivity}
                onChange={(e) => handleInstallationIdentificationChange('economicActivity', e.target.value)}
                helperText="NACE kod i opis ekonomske aktivnosti"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="Kapacitet proizvodnje"
                value={data.installationIdentification.productionCapacity}
                onChange={(e) => handleInstallationIdentificationChange('productionCapacity', parseFloat(e.target.value) || 0)}
                helperText="Godišnji kapacitet proizvodnje"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Jedinica kapaciteta"
                value={data.installationIdentification.capacityUnit}
                onChange={(e) => handleInstallationIdentificationChange('capacityUnit', e.target.value)}
                helperText="Npr. tona, m3, komada"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="Godišnja proizvodnja"
                value={data.installationIdentification.annualProduction}
                onChange={(e) => handleInstallationIdentificationChange('annualProduction', parseFloat(e.target.value) || 0)}
                helperText="Stvarna godišnja proizvodnja u izvještajnom periodu"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Jedinica proizvodnje"
                value={data.installationIdentification.productionUnit}
                onChange={(e) => handleInstallationIdentificationChange('productionUnit', e.target.value)}
                helperText="Jedinica za godišnju proizvodnju"
              />
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />
          
          <Typography variant="h6" gutterBottom>Adresa instalacije</Typography>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Ulica i broj"
                value={data.installationAddress.streetAndNumber}
                onChange={(e) => handleInstallationAddressChange('streetAndNumber', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Poštanski broj"
                value={data.installationAddress.postalCode}
                onChange={(e) => handleInstallationAddressChange('postalCode', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Poštanski pretinac"
                value={data.installationAddress.poBox || ''}
                onChange={(e) => handleInstallationAddressChange('poBox', e.target.value)}
                helperText="Opcionalno"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Grad"
                value={data.installationAddress.city}
                onChange={(e) => handleInstallationAddressChange('city', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Država</InputLabel>
                <Select
                  value={data.installationAddress.country}
                  onChange={(e) => handleInstallationAddressChange('country', e.target.value)}
                  label="Država"
                >
                  {countries.map((country) => (
                    <MenuItem key={country} value={country}>{country}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="UNLOCODE"
                value={data.installationAddress.unlocode || ''}
                onChange={(e) => handleInstallationAddressChange('unlocode', e.target.value)}
                helperText="UN lokacija code, ako je primjenjiv"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="Latituda"
                value={data.installationAddress.latitude || ''}
                onChange={(e) => handleInstallationAddressChange('latitude', parseFloat(e.target.value) || undefined)}
                inputProps={{ step: 0.000001, min: -90, max: 90 }}
                helperText="Koordinate glavnog izvora emisija"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="Longituda"
                value={data.installationAddress.longitude || ''}
                onChange={(e) => handleInstallationAddressChange('longitude', parseFloat(e.target.value) || undefined)}
                inputProps={{ step: 0.000001, min: -180, max: 180 }}
                helperText="Koordinate glavnog izvora emisija"
              />
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Section 3: Authorized Representative */}
      <Accordion 
        expanded={expandedSections.includes('representative')} 
        onChange={() => handleSectionToggle('representative')}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">3. Ovlašteni predstavnik</Typography>
          <Chip 
            label={`${currentValidation?.sections?.find(s => s.section === 'Authorized Representative')?.percentage?.toFixed(0) ?? 0}%`}
            color={currentValidation?.sections?.find(s => s.section === 'Authorized Representative')?.percentage === 100 ? 'success' : 'default'}
            size="small"
            sx={{ ml: 2 }}
          />
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Ime i prezime"
                value={data.authorizedRepresentative.name}
                onChange={(e) => handleAuthorizedRepresentativeChange('name', e.target.value)}
                helperText="Ime ovlaštene osobe"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                type="email"
                label="Email adresa"
                value={data.authorizedRepresentative.email}
                onChange={(e) => {
                  const v = e.target.value;
                  const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
                  handleAuthorizedRepresentativeChange('email', v);
                }}
                error={Boolean(data.authorizedRepresentative.email) && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.authorizedRepresentative.email)}
                helperText={Boolean(data.authorizedRepresentative.email) && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.authorizedRepresentative.email) ? 'Unesite ispravnu email adresu' : 'Email ovlaštene osobe'}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Telefon"
                value={data.authorizedRepresentative.telephone}
                onChange={(e) => handleAuthorizedRepresentativeChange('telephone', e.target.value)}
                helperText="Telefon ovlaštene osobe"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Fax"
                value={data.authorizedRepresentative.fax || ''}
                onChange={(e) => handleAuthorizedRepresentativeChange('fax', e.target.value)}
                helperText="Opcionalno"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Pozicija"
                value={data.authorizedRepresentative.position || ''}
                onChange={(e) => handleAuthorizedRepresentativeChange('position', e.target.value)}
                helperText="Radno mjesto"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Odjel"
                value={data.authorizedRepresentative.department || ''}
                onChange={(e) => handleAuthorizedRepresentativeChange('department', e.target.value)}
                helperText="Organizacijska jedinica"
              />
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Section 4: Verifier Information (Optional) */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">4. Verifikator izvještaja (nije obvezno u prijelaznom periodu)</Typography>
          <Tooltip title="Informacije o verifikatoru nisu obvezne tijekom prijelaznog perioda CBAM">
            <InfoIcon color="action" sx={{ ml: 1 }} />
          </Tooltip>
        </AccordionSummary>
        <AccordionDetails>
          <FormControlLabel
            control={
              <Checkbox
                checked={!!data.verifierInformation}
                onChange={(e) => {
                  if (e.target.checked) {
                    const updatedData = {
                      ...data,
                      verifierInformation: {
                        accreditationScope: [],
                        isAccredited: false,
                        verificationStatus: 'planned' as const
                      }
                    };
                    updateData(updatedData);
                  } else {
                    const updatedData = { ...data };
                    delete updatedData.verifierInformation;
                    updateData(updatedData);
                  }
                }}
              />
            }
            label="Uključi informacije o verifikatoru"
          />
          
          {data.verifierInformation && (
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Naziv kompanije verifikatora"
                    value={data.verifierInformation.companyName}
                    onChange={(e) => handleVerifierInformationChange('companyName', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Ovlašteni predstavnik verifikatora"
                    value={data.verifierInformation.authorizedRepresentative}
                    onChange={(e) => handleVerifierInformationChange('authorizedRepresentative', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Ulica i broj verifikatora"
                    value={data.verifierInformation.streetAndNumber}
                    onChange={(e) => handleVerifierInformationChange('streetAndNumber', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Grad verifikatora"
                    value={data.verifierInformation.city}
                    onChange={(e) => handleVerifierInformationChange('city', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Poštanski broj verifikatora"
                    value={data.verifierInformation.postalCode}
                    onChange={(e) => handleVerifierInformationChange('postalCode', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth>
                    <InputLabel>Država verifikatora</InputLabel>
                    <Select
                      value={data.verifierInformation.country}
                      onChange={(e) => handleVerifierInformationChange('country', e.target.value)}
                      label="Država verifikatora"
                    >
                      {countries.map((country) => (
                        <MenuItem key={country} value={country}>{country}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="email"
                    label="Email verifikatora"
                    value={data.verifierInformation.email}
                    onChange={(e) => {
                      const v = e.target.value;
                      handleVerifierInformationChange('email', v);
                    }}
                    error={Boolean(data.verifierInformation.email) && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.verifierInformation.email || '')}
                    helperText={Boolean(data.verifierInformation.email) && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.verifierInformation.email || '') ? 'Unesite ispravnu email adresu' : ''}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Telefon verifikatora"
                    value={data.verifierInformation.telephone}
                    onChange={(e) => handleVerifierInformationChange('telephone', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Država akreditacije</InputLabel>
                    <Select
                      value={data.verifierInformation.accreditationMemberState}
                      onChange={(e) => handleVerifierInformationChange('accreditationMemberState', e.target.value)}
                      label="Država akreditacije"
                    >
                      {countries.map((country) => (
                        <MenuItem key={country} value={country}>{country}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Naziv akreditacijskog tijela"
                    value={data.verifierInformation.accreditationBodyName}
                    onChange={(e) => handleVerifierInformationChange('accreditationBodyName', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Registracijski broj akreditacije"
                    value={data.verifierInformation.accreditationRegistrationNumber}
                    onChange={(e) => handleVerifierInformationChange('accreditationRegistrationNumber', e.target.value)}
                  />
                </Grid>
              </Grid>
            </Box>
          )}
        </AccordionDetails>
      </Accordion>

      {/* Section 5: Aggregated Goods Categories */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">5. Agregirane kategorije dobara i proizvodne rute</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary" paragraph>
              Popis svih agregiranih kategorija dobara, uključujući relevantne prekursore proizvedene unutar instalacije.
            </Typography>
          </Box>
          
          {data.aggregatedGoodsCategories.map((category, categoryIndex) => (
            <Paper key={category.id} sx={{ p: 2, mb: 2 }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={3}>
                  <TextField
                    fullWidth
                    label="ID kategorije"
                    value={category.id}
                    disabled
                    helperText="Automatski generirano"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Naziv kategorije"
                    value={category.category}
                    onChange={(e) => updateAggregatedGoodsCategory(categoryIndex, 'category', e.target.value)}
                    helperText="Npr. Čelični proizvodi, Gnojiva, Cement"
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={category.pfcEmissionsRelevant}
                        onChange={(e) => updateAggregatedGoodsCategory(categoryIndex, 'pfcEmissionsRelevant', e.target.checked)}
                      />
                    }
                    label="PFC emisije relevantne"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Opis kategorije"
                    value={category.description || ''}
                    onChange={(e) => updateAggregatedGoodsCategory(categoryIndex, 'description', e.target.value)}
                    helperText="Detaljan opis kategorije dobara"
                  />
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Typography variant="subtitle2">Proizvodne rute:</Typography>
                    <IconButton 
                      size="small" 
                      onClick={() => addProductionRoute(categoryIndex)}
                      sx={{ ml: 1 }}
                    >
                      <AddIcon />
                    </IconButton>
                  </Box>
                  {category.productionRoutes.map((route, routeIndex) => (
                    <Paper key={routeIndex} sx={{ p: 2, mb: 1, bgcolor: 'grey.50' }}>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={2}>
                          <TextField
                            fullWidth
                            label="Broj rute"
                            value={route.routeNumber}
                            disabled
                            helperText="Automatski"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="Naziv rute"
                            value={route.routeName}
                            onChange={(e) => updateProductionRoute(categoryIndex, routeIndex, 'routeName', e.target.value)}
                            helperText="Npr. Ruta 1 - Visokopećni proces"
                          />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={route.isPrimaryRoute}
                                onChange={(e) => updateProductionRoute(categoryIndex, routeIndex, 'isPrimaryRoute', e.target.checked)}
                              />
                            }
                            label="Primarna ruta"
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            label="Opis rute"
                            value={route.routeDescription || ''}
                            onChange={(e) => updateProductionRoute(categoryIndex, routeIndex, 'routeDescription', e.target.value)}
                            helperText="Detaljan opis proizvodne rute"
                          />
                        </Grid>
                      </Grid>
                    </Paper>
                  ))}
                </Grid>
              </Grid>
            </Paper>
          ))}
          
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={addAggregatedGoodsCategory}
          >
            Dodaj agregiranu kategoriju dobara
          </Button>
        </AccordionDetails>
      </Accordion>

      {/* Section 6: Production Processes */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">6. Proizvodni procesi</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary" paragraph>
              Lista proizvodnih procesa s podrškom za bubble pristup gdje je primjenjivo.
            </Typography>
          </Box>
          
          {data.productionProcesses.map((process, processIndex) => (
            <Paper key={process.id} sx={{ p: 2, mb: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={2}>
                  <TextField
                    fullWidth
                    label="ID procesa"
                    value={process.id}
                    disabled
                    helperText="Automatski"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Naziv procesa"
                    value={process.name}
                    onChange={(e) => updateProductionProcess(processIndex, 'name', e.target.value)}
                    helperText="Npr. Proizvodnja amonijaka"
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth>
                    <InputLabel>Agregirana kategorija</InputLabel>
                    <Select
                      value={process.aggregatedGoodsCategory}
                      onChange={(e) => updateProductionProcess(processIndex, 'aggregatedGoodsCategory', e.target.value)}
                      label="Agregirana kategorija"
                    >
                      {data.aggregatedGoodsCategories.map((cat) => (
                        <MenuItem key={cat.id} value={cat.id}>{cat.category || cat.id}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Opis procesa"
                    value={process.description || ''}
                    onChange={(e) => updateProductionProcess(processIndex, 'description', e.target.value)}
                    helperText="Detaljan opis proizvodnog procesa"
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={process.isBubbleApproach}
                        onChange={(e) => updateProductionProcess(processIndex, 'isBubbleApproach', e.target.checked)}
                      />
                    }
                    label="Bubble pristup"
                  />
                  <Tooltip title="Bubble pristup je dopušten samo ako se svi proizvedeni proizvodi prerađuju u sljedećem koraku">
                    <InfoIcon color="action" sx={{ ml: 1, fontSize: 16 }} />
                  </Tooltip>
                </Grid>
                {process.isBubbleApproach && (
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      multiline
                      rows={2}
                      label="Obrazloženje bubble pristupa"
                      value={process.bubbleApproachJustification || ''}
                      onChange={(e) => updateProductionProcess(processIndex, 'bubbleApproachJustification', e.target.value)}
                      helperText="Obrazložite zašto se koristi bubble pristup"
                    />
                  </Grid>
                )}
                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom>Sistemska granica:</Typography>
                  <Grid container spacing={1}>
                    <Grid item xs={12} sm={6}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={process.systemBoundary.includesDirectEmissions}
                            onChange={(e) => updateProductionProcess(processIndex, 'systemBoundary', {
                              ...process.systemBoundary,
                              includesDirectEmissions: e.target.checked
                            })}
                          />
                        }
                        label="Uključuje direktne emisije"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={process.systemBoundary.includesMeasurableHeat}
                            onChange={(e) => updateProductionProcess(processIndex, 'systemBoundary', {
                              ...process.systemBoundary,
                              includesMeasurableHeat: e.target.checked
                            })}
                          />
                        }
                        label="Uključuje mjerljivu toplinu"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={process.systemBoundary.includesWasteGases}
                            onChange={(e) => updateProductionProcess(processIndex, 'systemBoundary', {
                              ...process.systemBoundary,
                              includesWasteGases: e.target.checked
                            })}
                          />
                        }
                        label="Uključuje otpadne plinove"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={process.systemBoundary.includesIndirectEmissions}
                            onChange={(e) => updateProductionProcess(processIndex, 'systemBoundary', {
                              ...process.systemBoundary,
                              includesIndirectEmissions: e.target.checked
                            })}
                          />
                        }
                        label="Uključuje indirektne emisije"
                      />
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </Paper>
          ))}
          
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={addProductionProcess}
          >
            Dodaj proizvodni proces
          </Button>
        </AccordionDetails>
      </Accordion>

      
    </Box>
  );
};

export default AInstDataStep;
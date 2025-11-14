import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Grid,
  Card,
  CardContent,
  CardActions,
  Divider,
  Alert,
  AlertTitle,
  List,
  ListItem,
  ListItemText,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import { 
  Download as DownloadIcon,
  ExpandMore as ExpandMoreIcon,
  PictureAsPdf as PdfIcon,
  Description as ExcelIcon,
  TextSnippet as CsvIcon,
  Print as PrintIcon
} from '@mui/icons-material';
import { CBAMData, CalculationResults } from '../../types/CBAMData';

interface ResultsExportStepProps {
  data: CBAMData;
  calculationResults: CalculationResults;
  onExport: (format: string) => void;
}

const ResultsExportStep: React.FC<ResultsExportStepProps> = ({ 
  data, 
  calculationResults, 
  onExport 
}) => {
  const [exportFormat, setExportFormat] = useState('excel');
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = () => {
    setIsExporting(true);
    setExportDialogOpen(false);
    
    // Simulate export process
    setTimeout(() => {
      onExport(exportFormat);
      setIsExporting(false);
    }, 2000);
  };

  const formatNumber = (num?: number, decimals: number = 2): string => {
    const n = typeof num === 'number' && isFinite(num) ? num : 0;
    return n.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  const getEmissionLevel = (value: number): { level: string; color: string } => {
    if (value < 1) return { level: 'Low', color: 'success' };
    if (value < 5) return { level: 'Medium', color: 'warning' };
    return { level: 'High', color: 'error' };
  };

  const computeIndirectForProcess = (process: CBAMData['processProductionData'][number]): number => {
    if (!process.applicableElements?.indirectEmissions) return 0;
    const cons = process.electricityConsumption ?? 0;
    const unit = process.electricityUnit ?? 'MWh';
    const ef = process.electricityEmissionFactor ?? 0;
    const efUnit = process.electricityEmissionFactorUnit ?? 't/MWh';
    const consMWh = unit === 'kWh' ? cons / 1000 : unit === 'GJ' ? cons * 0.2777777778 : cons;
    const efPerMWh = efUnit === 't/kWh' ? ef * 1000 : efUnit === 't/GJ' ? ef * 3.6 : ef;
    return consMWh * efPerMWh;
  };

  const totalDirectEmissions = calculationResults.totalDirectCO2Emissions;
  const totalProcessEmissions = calculationResults.totalProcessEmissions;
  const totalEmissions = calculationResults.totalEmissions;
  const specificEmissions = calculationResults.specificEmissions;
  const totalEnergy = calculationResults.totalEnergy;
  const renewableShare = calculationResults.renewableShare;
  const importedRawMaterialShare = calculationResults.importedRawMaterialShare;
  const embeddedEmissions = calculationResults.embeddedEmissions;
  const cumulativeEmissions = calculationResults.cumulativeEmissions;

  const totalIndirectCO2Emissions = data.emissionInstallationData?.totalIndirectCO2Emissions ?? 0;
  const directEmissionLevel = getEmissionLevel(totalDirectEmissions);
  const processEmissionLevel = getEmissionLevel(totalProcessEmissions);
  const indirectEmissionLevel = getEmissionLevel(totalIndirectCO2Emissions);
  const totalEmissionLevel = getEmissionLevel(totalEmissions);
  const specificEmissionLevel = getEmissionLevel(specificEmissions);

  // Fuel balance calculations (convert GJ/MWh to TJ)
  const convertToTJ = (consumption: number, unit?: string): number => {
    if (unit === 'GJ') return consumption / 1000;
    if (unit === 'MWh') return (consumption * 3.6) / 1000;
    if (unit === 'TJ') return consumption;
    return 0;
  };

  const totalFuelInputTJ = (data.energyFuelData || []).reduce((sum, fuel) => {
    return sum + convertToTJ(fuel.consumption || 0, fuel.unit);
  }, 0);

  const fuelBalanceTJ = {
    cbam: (data.energyFuelData || []).reduce((sum, fuel) => (
      fuel.useCategory === 'CBAM proizvodni procesi'
        ? sum + convertToTJ(fuel.consumption || 0, fuel.unit)
        : sum
    ), 0),
    electricity: (data.energyFuelData || []).reduce((sum, fuel) => (
      fuel.useCategory === 'Proizvodnja električne energije'
        ? sum + convertToTJ(fuel.consumption || 0, fuel.unit)
        : sum
    ), 0),
    nonCbam: (data.energyFuelData || []).reduce((sum, fuel) => (
      fuel.useCategory === 'Ne-CBAM procesi'
        ? sum + convertToTJ(fuel.consumption || 0, fuel.unit)
        : sum
    ), 0)
  };

  return (
    <Box className="form-section">
      <Typography variant="h5" component="h2" gutterBottom>
        Rezultati i izvoz
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Pregledajte izračunate emisije i izvezite rezultate za CBAM prijavu.
      </Typography>
      
      <Grid container spacing={3}>
        {/* Summary Cards */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Sažetak emisija
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <List dense>
                <ListItem>
                  <ListItemText 
                    primary="Ukupne direktne emisije CO₂" 
                    secondary={`${formatNumber(totalDirectEmissions)} t CO₂`} 
                  />
                  <Chip 
                    label={directEmissionLevel.level} 
                    color={directEmissionLevel.color as any} 
                    size="small" 
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemText 
                    primary="Ukupne procesne emisije" 
                    secondary={`${formatNumber(totalProcessEmissions)} t CO₂`} 
                  />
                  <Chip 
                    label={processEmissionLevel.level} 
                    color={processEmissionLevel.color as any} 
                    size="small" 
                  />
                </ListItem>

                <ListItem>
                  <ListItemText 
                    primary="Ukupne indirektne emisije CO₂" 
                    secondary={`${formatNumber(totalIndirectCO2Emissions)} t CO₂`} 
                  />
                  <Chip 
                    label={indirectEmissionLevel.level} 
                    color={indirectEmissionLevel.color as any} 
                    size="small" 
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemText 
                    primary="Ukupne emisije" 
                    secondary={`${formatNumber(totalEmissions)} t CO₂`} 
                  />
                  <Chip 
                    label={totalEmissionLevel.level} 
                    color={totalEmissionLevel.color as any} 
                    size="small" 
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemText 
                    primary="Specifične emisije" 
                    secondary={`${formatNumber(specificEmissions)} t CO₂/t proizvod`} 
                  />
                  <Chip 
                    label={specificEmissionLevel.level} 
                    color={specificEmissionLevel.color as any} 
                    size="small" 
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Energija i materijali
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <List dense>
                <ListItem>
                  <ListItemText 
                    primary="Ukupna energija" 
                    secondary={`${formatNumber(totalEnergy)} MWh`} 
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemText 
                    primary="Udeo obnovljive energije" 
                    secondary={`${formatNumber(renewableShare * 100, 1)}%`} 
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemText 
                    primary="Udeo uvezenih sirovina" 
                    secondary={`${formatNumber(importedRawMaterialShare * 100, 1)}%`} 
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemText 
                    primary="Ugrađene emisije" 
                    secondary={`${formatNumber(embeddedEmissions)} t CO₂`} 
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemText 
                    primary="Kumulativne emisije" 
                    secondary={`${formatNumber(cumulativeEmissions)} t CO₂`} 
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Detailed Results */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Detaljni rezultati
            </Typography>
            
            <Accordion defaultExpanded>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>Struktura direktnih emisija</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Vrsta goriva</TableCell>
                        <TableCell align="right">Potrošnja</TableCell>
                        <TableCell align="right">Faktor emisije</TableCell>
                        <TableCell align="right">Emisije CO₂ (t)</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {data.energyFuelData.map((fuel, index) => (
                        <TableRow key={index}>
                          <TableCell>{fuel.fuelType}</TableCell>
                          <TableCell align="right">
                            {formatNumber(fuel.consumption)} {fuel.unit}
                          </TableCell>
                          <TableCell align="right">
                            {formatNumber(fuel.co2EmissionFactor || 0)} t/{fuel.unit}
                          </TableCell>
                          <TableCell align="right">
                            {formatNumber(fuel.consumption * (fuel.co2EmissionFactor || 0))}
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow>
                        <TableCell colSpan={3}>
                          <strong>Ukupne direktne emisije</strong>
                        </TableCell>
                        <TableCell align="right">
                          <strong>{formatNumber(totalDirectEmissions)}</strong>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </AccordionDetails>
            </Accordion>
            
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>Struktura procesnih emisija</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Proces</TableCell>
                        <TableCell align="right">Proizvodnja</TableCell>
                        <TableCell align="right">Faktor emisije</TableCell>
                        <TableCell align="right">Emisije CO₂ (t)</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {data.processProductionData.map((process, index) => (
                        <TableRow key={index}>
                          <TableCell>{process.processName}</TableCell>
                          <TableCell align="right">
                            {formatNumber(process.productionAmount ?? process.productionQuantity ?? 0)} {process.unit}
                          </TableCell>
                          <TableCell align="right">
                            {formatNumber(process.processEmissionFactor ?? 0)} t/{process.unit}
                          </TableCell>
                          <TableCell align="right">
                            {formatNumber((process.processEmissions ?? 0) + computeIndirectForProcess(process))}
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow>
                        <TableCell colSpan={3}>
                          <strong>Ukupne procesne emisije</strong>
                        </TableCell>
                        <TableCell align="right">
                          <strong>{formatNumber(totalProcessEmissions)}</strong>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </AccordionDetails>
            </Accordion>
            
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>Struktura ugrađenih emisija</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Materijal</TableCell>
                        <TableCell align="right">Količina</TableCell>
                        <TableCell align="right">Poreklo</TableCell>
                        <TableCell align="right">Ugrađene emisije (t)</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {data.processProductionData.flatMap((process) => 
                        process.inputs.map((input, index) => (
                          <TableRow key={`${process.processName}-${index}`}>
                            <TableCell>{input.materialName || 'Unknown'}</TableCell>
                            <TableCell align="right">
                              {formatNumber(input.amount ?? input.quantity ?? 0)} t
                            </TableCell>
                            <TableCell>{input.origin ?? input.originCountry ?? 'Domestic'}</TableCell>
                            <TableCell align="right">
                              {formatNumber(input.embeddedEmissions ?? 0)}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                      <TableRow>
                        <TableCell colSpan={3}>
                          <strong>Ukupne ugrađene emisije</strong>
                        </TableCell>
                        <TableCell align="right">
                          <strong>{formatNumber(embeddedEmissions)}</strong>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </AccordionDetails>
            </Accordion>

            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>Bilans goriva (TJ)</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <List dense>
                  <ListItem>
                    <ListItemText 
                      primary="Ukupan unos goriva" 
                      secondary={`${formatNumber(totalFuelInputTJ, 3)} TJ`} 
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="CBAM proizvodni procesi" 
                      secondary={`${formatNumber(fuelBalanceTJ.cbam, 3)} TJ`} 
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Proizvodnja električne energije" 
                      secondary={`${formatNumber(fuelBalanceTJ.electricity, 3)} TJ`} 
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Ne-CBAM procesi" 
                      secondary={`${formatNumber(fuelBalanceTJ.nonCbam, 3)} TJ`} 
                    />
                  </ListItem>
                </List>
                <Typography variant="body2" color="text.secondary">
                  Napomena: vrednosti GJ i MWh konvertovane u TJ.
                </Typography>
              </AccordionDetails>
            </Accordion>

          </Paper>
        </Grid>
        
        {/* Export Options */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Opcije izvoza
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Izvezite rezultate CBAM prijave u različitim formatima.
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <ExcelIcon color="primary" sx={{ mr: 1 }} />
                      <Typography variant="h6">Excel</Typography>
                    </Box>
                      <Typography variant="body2" color="text.secondary">
                        Izvoz u Excel format kompatibilan sa CBAM obrascem.
                      </Typography>
                  </CardContent>
                  <CardActions>
                    <Button 
                      size="small" 
                      variant="contained"
                      startIcon={<DownloadIcon />}
                      onClick={() => {
                        setExportFormat('excel');
                        setExportDialogOpen(true);
                      }}
                      disabled={isExporting}
                    >
                      {isExporting && exportFormat === 'excel' ? (
                        <CircularProgress size={20} />
                      ) : (
                        'Izvoz'
                      )}
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <PdfIcon color="error" sx={{ mr: 1 }} />
                      <Typography variant="h6">PDF</Typography>
                    </Box>
                      <Typography variant="body2" color="text.secondary">
                        Izvoz u PDF format za lakše deljenje i štampu.
                      </Typography>
                  </CardContent>
                  <CardActions>
                    <Button 
                      size="small" 
                      variant="contained"
                      startIcon={<DownloadIcon />}
                      onClick={() => {
                        setExportFormat('pdf');
                        setExportDialogOpen(true);
                      }}
                      disabled={isExporting}
                    >
                      {isExporting && exportFormat === 'pdf' ? (
                        <CircularProgress size={20} />
                      ) : (
                        'Izvoz'
                      )}
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <CsvIcon color="success" sx={{ mr: 1 }} />
                      <Typography variant="h6">CSV</Typography>
                    </Box>
                      <Typography variant="body2" color="text.secondary">
                        Izvoz u CSV format za dalju analizu podataka.
                      </Typography>
                  </CardContent>
                  <CardActions>
                    <Button 
                      size="small" 
                      variant="contained"
                      startIcon={<DownloadIcon />}
                      onClick={() => {
                        setExportFormat('csv');
                        setExportDialogOpen(true);
                      }}
                      disabled={isExporting}
                    >
                      {isExporting && exportFormat === 'csv' ? (
                        <CircularProgress size={20} />
                      ) : (
                        'Izvoz'
                      )}
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <PrintIcon color="action" sx={{ mr: 1 }} />
                      <Typography variant="h6">Štampa</Typography>
                    </Box>
                      <Typography variant="body2" color="text.secondary">
                        Štampa formatiranog izveštaja za arhivu.
                      </Typography>
                  </CardContent>
                  <CardActions>
                    <Button 
                      size="small" 
                      variant="contained"
                      startIcon={<PrintIcon />}
                      onClick={() => {
                        setExportFormat('print');
                        setExportDialogOpen(true);
                      }}
                      disabled={isExporting}
                    >
                      {isExporting && exportFormat === 'print' ? (
                        <CircularProgress size={20} />
                      ) : (
                        'Štampa'
                      )}
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        
        {/* Validation Messages */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Poruke validacije
            </Typography>
            
            <Alert severity="success" sx={{ mb: 2 }}>
              <AlertTitle>Izračun završen</AlertTitle>
              CBAM emisije su uspešno izračunate. Pregledajte rezultate pre izvoza.
            </Alert>
            
            {totalEmissionLevel.color === 'error' && (
              <Alert severity="warning" sx={{ mb: 2 }}>
                <AlertTitle>Otkrivene visoke emisije</AlertTitle>
                Ukupne emisije su visoke. Proverite tačnost podataka i razmotrite smanjenje emisija.
              </Alert>
            )}
            
            {renewableShare < 0.2 && (
              <Alert severity="info" sx={{ mb: 2 }}>
                <AlertTitle>Nizak udeo obnovljive energije</AlertTitle>
                Udeo obnovljive energije je ispod 20%. Povećanje obnovljive energije može smanjiti emisije.
              </Alert>
            )}
            
            <Alert severity="info">
              <AlertTitle>Spremno za izvoz</AlertTitle>
              Rezultati su spremni za izvoz. Izaberite format iznad.
            </Alert>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Export Confirmation Dialog */}
      <Dialog open={exportDialogOpen} onClose={() => setExportDialogOpen(false)}>
        <DialogTitle>Izvoz rezultata</DialogTitle>
        <DialogContent>
          <Typography>
            Da li želite da izvezete rezultate u {exportFormat.toUpperCase()} formatu?
          </Typography>
          {isExporting && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <CircularProgress />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setExportDialogOpen(false)} disabled={isExporting}>
            Otkaži
          </Button>
          <Button onClick={handleExport} variant="contained" disabled={isExporting}>
            Izvoz
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ResultsExportStep;
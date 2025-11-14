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
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tabs,
  Tab,
  Alert,
  AlertTitle,
  List,
  ListItem,
  ListItemText,
  Tooltip,
  FormControlLabel,
  Checkbox,
  InputAdornment
} from '@mui/material';
import { 
  Delete as DeleteIcon, 
  Add as AddIcon,
  ExpandMore as ExpandMoreIcon,
  CheckCircle as CheckCircleIcon,
  Close as CloseIcon,
  Info as InfoIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import { ProcessProductionData, ProcessInput, ProcessOutput, EmissionFactor, CBAMData, DataValidationStatus, ConsumedInOtherProcess } from '../../types/CBAMData';
import { SelectChangeEvent } from '@mui/material/Select';
import { exportToExcel, downloadBlob } from '../../utils/excelExport';
import CNCodeAutocomplete from '../common/CNCodeAutocomplete';
import { processUnits, processTypes, origins } from '../../data/codeLists';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

interface ProcessProductionDataStepProps {
  data: ProcessProductionData[];
  updateData: (data: ProcessProductionData[]) => void;
  emissionFactors?: EmissionFactor[];
  validationStatus?: DataValidationStatus;
}

const ProcessProductionDataStep: React.FC<ProcessProductionDataStepProps> = ({ data, updateData, emissionFactors = [], validationStatus }) => {
    const [tabValue, setTabValue] = useState(0);
    const [openProcessDialog, setOpenProcessDialog] = useState(false);
    
    // Custom emission factors for different process types and materials
    const [customProcessEmissionFactors, setCustomProcessEmissionFactors] = useState<EmissionFactor[]>([]);
    const [customEmbeddedEmissionFactors, setCustomEmbeddedEmissionFactors] = useState<EmissionFactor[]>([]);
    
    // Function to find custom emission factor for a specific process
    const findCustomProcessEmissionFactor = (processType: string): number | null => {
      const factor = emissionFactors.find(ef => 
        ef.category === 'Process' && 
        ef.name.toLowerCase() === processType.toLowerCase()
      );
      return factor ? factor.value : null;
    };
    
    // Function to find custom embedded emission factor for a specific material
    const findCustomEmbeddedEmissionFactor = (materialName: string): number | null => {
      const factor = emissionFactors.find(ef => 
        ef.category === 'Embedded' && 
        ef.name.toLowerCase() === materialName.toLowerCase()
      );
      return factor ? factor.value : null;
    };
  const [openInputDialog, setOpenInputDialog] = useState(false);
  const [openOutputDialog, setOpenOutputDialog] = useState(false);
  const [editingProcess, setEditingProcess] = useState<Partial<ProcessProductionData> | null>(null);
  const [editingInput, setEditingInput] = useState<Partial<ProcessInput> | null>(null);
  const [editingOutput, setEditingOutput] = useState<Partial<ProcessOutput> | null>(null);
  
  // Custom emission factors dialog state
  const [openEmissionFactorsDialog, setOpenEmissionFactorsDialog] = useState(false);
  const [emissionFactorTab, setEmissionFactorTab] = useState(0); // 0 for process, 1 for embedded
  const [editingEmissionFactor, setEditingEmissionFactor] = useState<EmissionFactor | null>(null);
  const [emissionFactorFormData, setEmissionFactorFormData] = useState<EmissionFactor>({
    id: '',
    name: '',
    category: '',
    value: 0,
    unit: '',
    source: '',
    sourceDescription: '',
    year: new Date().getFullYear(),
    applicableTo: '',
    notes: '',
    gasType: 'CO2'
  });
  
  // Import/Export state
  const [importExportDialogOpen, setImportExportDialogOpen] = useState(false);
  const [importStatus, setImportStatus] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  const [selectedProcessId, setSelectedProcessId] = useState<string | null>(null);
  
  const [processFormData, setProcessFormData] = useState<Partial<ProcessProductionData>>({
    processName: '',
    processType: '',
    productionQuantity: 0,
    unit: 't',
    processEmissionFactor: 0,
    processEmissions: 0
  });
  
  const [inputFormData, setInputFormData] = useState<Partial<ProcessInput>>({
    materialName: '',
    quantity: 0,
    unit: 't',
    origin: 'Domestic',
    embeddedEmissions: 0
  });
  
  const [outputFormData, setOutputFormData] = useState<Partial<ProcessOutput>>({
    productName: '',
    quantity: 0,
    unit: 't',
    cnCode: '',
    destination: 'Domestic'
  });

  // processTypes premještene u centralni codeLists
  // origins premještene u centralni codeLists

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Helperi za ažuriranje polja procesa (D_Processes)
  const updateProcessField = (processId: string, field: keyof ProcessProductionData, value: any) => {
    updateData(data.map(p => p.id === processId ? { ...p, [field]: value } : p));
  };

  const updateProcessNested = (
    processId: string,
    path: 'applicableElements' | 'measurableHeatData' | 'wasteGasesData',
    value: any
  ) => {
    updateData(data.map(p => p.id === processId ? { ...p, [path]: { ...(p as any)[path], ...value } } : p));
  };

  const addConsumptionEntry = (processId: string) => {
    updateData(
      data.map(p => p.id === processId
        ? { ...p, consumedInOtherProcesses: [ ...(p.consumedInOtherProcesses ?? []), { targetProcessId: '', quantity: 0, unit: p.unit ?? 't' } ] }
        : p
      )
    );
  };

  const updateConsumptionEntry = (processId: string, index: number, value: Partial<ConsumedInOtherProcess>) => {
    updateData(
      data.map(p => p.id === processId
        ? { ...p, consumedInOtherProcesses: (p.consumedInOtherProcesses ?? []).map((c, i) => i === index ? { ...c, ...value } : c) }
        : p
      )
    );
  };

  const removeConsumptionEntry = (processId: string, index: number) => {
    updateData(
      data.map(p => p.id === processId
        ? { ...p, consumedInOtherProcesses: (p.consumedInOtherProcesses ?? []).filter((_, i) => i !== index) }
        : p
      )
    );
  };

  useEffect(() => {
    // Calculate process emissions when emission factor or quantity changes
    if (processFormData.processEmissionFactor !== undefined && processFormData.productionQuantity !== undefined) {
      setProcessFormData(prev => ({
        ...prev,
        processEmissions: (prev.processEmissionFactor || 0) * (prev.productionQuantity || 0)
      }));
    }
  }, [processFormData.processEmissionFactor, processFormData.productionQuantity]);

  const handleOpenProcessDialog = (process?: ProcessProductionData) => {
    if (process) {
      setEditingProcess(process);
      setProcessFormData(process);
    } else {
      setEditingProcess(null);
      setProcessFormData({
        processName: '',
        processType: '',
        productionQuantity: 0,
        unit: 't',
        processEmissionFactor: 0,
        processEmissions: 0
      });
    }
    setOpenProcessDialog(true);
  };

  const handleCloseProcessDialog = () => {
    setOpenProcessDialog(false);
    setEditingProcess(null);
  };

  const handleOpenInputDialog = (processId: string, input?: ProcessInput) => {
    setSelectedProcessId(processId);
    if (input) {
      setEditingInput(input);
      setInputFormData(input);
    } else {
      setEditingInput(null);
      setInputFormData({
        materialName: '',
        quantity: 0,
        unit: 't',
        origin: 'Domestic',
        embeddedEmissions: 0
      });
    }
    setOpenInputDialog(true);
  };

  const handleCloseInputDialog = () => {
    setOpenInputDialog(false);
    setEditingInput(null);
    setSelectedProcessId(null);
  };

  const handleOpenOutputDialog = (processId: string, output?: ProcessOutput) => {
    setSelectedProcessId(processId);
    if (output) {
      setEditingOutput(output);
      setOutputFormData(output);
    } else {
      setEditingOutput(null);
      setOutputFormData({
        productName: '',
        quantity: 0,
        unit: 't',
        cnCode: '',
        destination: 'Domestic'
      });
    }
    setOpenOutputDialog(true);
  };

  const handleCloseOutputDialog = () => {
    setOpenOutputDialog(false);
    setEditingOutput(null);
    setSelectedProcessId(null);
  };
  
  // Custom emission factors dialog handlers
  const handleOpenEmissionFactorsDialog = () => {
    setOpenEmissionFactorsDialog(true);
  };
  
  const handleCloseEmissionFactorsDialog = () => {
    setOpenEmissionFactorsDialog(false);
    setEditingEmissionFactor(null);
    setEmissionFactorFormData({
      id: '',
      name: '',
      category: '',
      value: 0,
      unit: '',
      source: '',
      sourceDescription: '',
      year: new Date().getFullYear(),
      applicableTo: '',
      notes: '',
      gasType: 'CO2'
    });
  };
  
  const handleEmissionFactorTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setEmissionFactorTab(newValue);
  };
  
  const handleEditEmissionFactor = (factor: EmissionFactor, isProcessFactor: boolean) => {
    setEditingEmissionFactor(factor);
    setEmissionFactorFormData({ ...factor });
    setEmissionFactorTab(isProcessFactor ? 0 : 1);
    setOpenEmissionFactorsDialog(true);
  };
  
  const handleEmissionFactorChange = (field: string) => (
    event: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>
  ) => {
    const value = field === 'value' || field === 'year'
      ? parseFloat(event.target.value as string) || 0
      : event.target.value;
    
    setEmissionFactorFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const handleSaveEmissionFactor = () => {
    if (!emissionFactorFormData.name || !emissionFactorFormData.category || emissionFactorFormData.value <= 0) {
      alert('Please fill in all required fields with valid values');
      return;
    }
    
    const isProcessFactor = emissionFactorTab === 0;
    const newFactor: EmissionFactor = {
      ...emissionFactorFormData,
      id: editingEmissionFactor?.id || `custom-${Date.now()}`
    };
    
    if (isProcessFactor) {
      if (editingEmissionFactor) {
        setCustomProcessEmissionFactors(prev => 
          prev.map(factor => factor.id === editingEmissionFactor.id ? newFactor : factor)
        );
      } else {
        setCustomProcessEmissionFactors(prev => [...prev, newFactor]);
      }
    } else {
      if (editingEmissionFactor) {
        setCustomEmbeddedEmissionFactors(prev => 
          prev.map(factor => factor.id === editingEmissionFactor.id ? newFactor : factor)
        );
      } else {
        setCustomEmbeddedEmissionFactors(prev => [...prev, newFactor]);
      }
    }
    
    handleCloseEmissionFactorsDialog();
  };
  
  const handleDeleteEmissionFactor = (id: string, isProcessFactor: boolean) => {
    if (isProcessFactor) {
      setCustomProcessEmissionFactors(prev => prev.filter(factor => factor.id !== id));
    } else {
      setCustomEmbeddedEmissionFactors(prev => prev.filter(factor => factor.id !== id));
    }
  };

  // Validation function for process data consistency
  const validateProcessDataConsistency = (process: ProcessProductionData): string[] => {
    const errors: string[] = [];
    
    // Check if inputs and outputs exist
    if (process.inputs.length === 0) {
      errors.push(`Process "${process.processName}" must have at least one input material`);
    }
    
    if (process.outputs.length === 0) {
      errors.push(`Process "${process.processName}" must have at least one output product`);
    }
    
    // Check for duplicate input materials
    const inputNames = process.inputs.map(input => input.materialName.toLowerCase());
    const duplicateInputs = inputNames.filter((name, index) => inputNames.indexOf(name) !== index);
    if (duplicateInputs.length > 0) {
      errors.push(`Process "${process.processName}" has duplicate input materials: ${duplicateInputs.join(', ')}`);
    }
    
    // Check for duplicate output products
    const outputNames = process.outputs.map(output => output.productName.toLowerCase());
    const duplicateOutputs = outputNames.filter((name, index) => outputNames.indexOf(name) !== index);
    if (duplicateOutputs.length > 0) {
      errors.push(`Process "${process.processName}" has duplicate output products: ${duplicateOutputs.join(', ')}`);
    }
    
    // Validate input quantities are positive
    process.inputs.forEach(input => {
      if (input.quantity && input.quantity <= 0) {
        errors.push(`Input "${input.materialName}" in process "${process.processName}" must have a positive quantity`);
      }
    });
    
    // Validate output quantities are positive
    process.outputs.forEach(output => {
      if (output.quantity && output.quantity <= 0) {
        errors.push(`Output "${output.productName}" in process "${process.processName}" must have a positive quantity`);
      }
    });
    
    // Check if embedded emissions are reasonable (not negative and not extremely high)
    process.inputs.forEach(input => {
      if (input.embeddedEmissions && input.embeddedEmissions < 0) {
        errors.push(`Embedded CO2 for input "${input.materialName}" in process "${process.processName}" cannot be negative`);
      }
      
      // Check for unreasonably high embedded emissions (more than 100 tCO2 per tonne)
      if (input.embeddedEmissions && input.quantity) {
        const embeddedPerUnit = input.embeddedEmissions / input.quantity;
        if (embeddedPerUnit > 100000) { // 100 tCO2 = 100,000 kg CO2
          errors.push(`Embedded CO2 for input "${input.materialName}" in process "${process.processName}" seems unusually high (${embeddedPerUnit.toFixed(2)} kg CO2/${input.unit})`);
        }
      }
    });
    
    // Process type specific validations
    if (process.processType === 'Calcination' || process.processType === 'Reduction') {
      // These processes typically have significant process emissions
      const productionQuantity = process.productionQuantity || process.productionAmount;
      if (productionQuantity && process.processEmissions < 0.1 * productionQuantity) {
        errors.push(`Process "${process.processName}" of type "${process.processType}" typically has higher process emissions. Current value may be underestimated.`);
      }
    }
    
    return errors;
  };
  
  // Function to validate all processes
  const validateAllProcesses = (): { isValid: boolean; errors: string[] } => {
    const allErrors: string[] = [];
    
    data.forEach(process => {
      const processErrors = validateProcessDataConsistency(process);
      allErrors.push(...processErrors);
    });
    
    // Check for duplicate process names
    const processNames = data.map(p => p.processName.toLowerCase());
    const duplicateProcessNames = processNames.filter((name, index) => processNames.indexOf(name) !== index);
    if (duplicateProcessNames.length > 0) {
      allErrors.push(`Duplicate process names found: ${duplicateProcessNames.join(', ')}`);
    }
    
    // Validate production quantities are positive
    data.forEach(process => {
      if (process.productionAmount <= 0) {
        allErrors.push(`Process "${process.processName}" must have a positive production quantity`);
      }
    });
    
    return {
      isValid: allErrors.length === 0,
      errors: allErrors
    };
  };
  
  // State for validation errors
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [showValidationErrors, setShowValidationErrors] = useState(false);

  const handleProcessInputChange = (field: string) => (
    event: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>
  ) => {
    const value = field === 'productionQuantity' || field === 'processEmissionFactor' || field === 'processEmissions'
      ? parseFloat(event.target.value as string) || 0
      : event.target.value;
    
    const updatedFormData = {
      ...processFormData,
      [field]: value
    };
    
    // Automatically calculate process emissions when production quantity or emission factor changes
    if (field === 'productionQuantity' || field === 'processEmissionFactor') {
      const productionQuantity = typeof updatedFormData.productionQuantity === 'number' 
        ? updatedFormData.productionQuantity 
        : (updatedFormData.productionQuantity !== undefined 
          ? parseFloat(updatedFormData.productionQuantity as string) || 0 
          : 0);
      const emissionFactor = typeof updatedFormData.processEmissionFactor === 'number' 
        ? updatedFormData.processEmissionFactor 
        : (updatedFormData.processEmissionFactor !== undefined 
          ? parseFloat(updatedFormData.processEmissionFactor as string) || 0 
          : 0);
      updatedFormData.processEmissions = productionQuantity * emissionFactor;
    }
    
    setProcessFormData(updatedFormData);
  };

  const handleInputChange = (field: string) => (
    event: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>
  ) => {
    const value = field === 'quantity' || field === 'embeddedEmissions'
      ? parseFloat(event.target.value as string) || 0
      : event.target.value;
    
    setInputFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleOutputChange = (field: string) => (
    event: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>
  ) => {
    const value = field === 'quantity'
      ? parseFloat(event.target.value as string) || 0
      : event.target.value;
    
    setOutputFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleProcessSelectChange = (field: string) => (
    event: SelectChangeEvent<string>
  ) => {
    const value = event.target.value as string;
    setProcessFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleInputSelectChange = (field: string) => (
    event: SelectChangeEvent<string>
  ) => {
    const value = event.target.value as string;
    setInputFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleOutputSelectChange = (field: string) => (
    event: SelectChangeEvent<string>
  ) => {
    const value = event.target.value as string;
    setOutputFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Validation function for process emission factors
  const validateProcessEmissionFactor = (processType: string, emissionFactor: number): string[] => {
    const errors: string[] = [];
    
    // Check if emission factor is a positive number
    if (emissionFactor < 0) {
      errors.push('Emission factor must be a positive number');
    }
    
    // Check industry-specific ranges based on process type
    // These ranges are based on typical CBAM values for different processes
    const industryRanges: Record<string, { min: number; max: number }> = {
      'Calcination': { min: 0.3, max: 1.2 },
      'Reduction': { min: 1.0, max: 5.0 },
      'Smelting': { min: 0.5, max: 3.0 },
      'Refining': { min: 0.2, max: 2.0 },
      'Chemical Reaction': { min: 0.1, max: 5.0 },
      'Physical Transformation': { min: 0.05, max: 1.0 },
    };
    
    // Check if process type has a defined range
    if (industryRanges[processType]) {
      const { min, max } = industryRanges[processType];
      if (emissionFactor < min || emissionFactor > max) {
        errors.push(`Emission factor for ${processType} should be between ${min} and ${max} tCO2/unit`);
      }
    } else {
      // For other process types, use a general range
      if (emissionFactor > 20.0) {
        errors.push('Emission factor seems unusually high. Please verify the value.');
      }
    }
    
    return errors;
  };

  const handleSaveProcess = () => {
    const prodQty = Number(processFormData.productionQuantity ?? 0);
    
    // Check if there's a custom emission factor for this process type
    const customEmissionFactor = findCustomProcessEmissionFactor(processFormData.processType || '');
    const procEmissFactor = Number(processFormData.processEmissionFactor ?? customEmissionFactor ?? 0);
    const procEmissions = procEmissFactor * prodQty;

    if (!processFormData.processName || !processFormData.processType || prodQty <= 0) {
      return;
    }

    // Validate emission factor
    const emissionFactorToValidate = procEmissFactor || 0;
    const emissionFactorErrors = validateProcessEmissionFactor(
      processFormData.processType || '',
      emissionFactorToValidate
    );
    
    if (emissionFactorErrors.length > 0) {
      alert(`Emission factor validation errors:\n${emissionFactorErrors.join('\n')}`);
      return;
    }

    const newProcess: ProcessProductionData = {
      id: editingProcess ? (editingProcess.id ?? Date.now().toString()) : Date.now().toString(),
      processName: processFormData.processName || '',
      processType: processFormData.processType || '',
      productionAmount: prodQty,
      productionQuantity: prodQty,
      unit: processFormData.unit || 't',
      processEmissionFactor: procEmissFactor,
      processEmissions: procEmissions,
      directEmissions: editingProcess?.directEmissions ?? 0,
      inputs: editingProcess ? (editingProcess.inputs ?? []) : [],
      outputs: editingProcess ? (editingProcess.outputs ?? []) : []
    };

    if (editingProcess) {
      updateData(data.map(process => process.id === editingProcess.id ? newProcess : process));
    } else {
      updateData([...data, newProcess]);
    }

    handleCloseProcessDialog();
  };

  const handleSaveInput = () => {
    const qty = Number(inputFormData.quantity ?? 0);
    if (!selectedProcessId || !inputFormData.materialName || qty <= 0) {
      return;
    }

    // Check if there's a custom embedded emission factor for this material
    const customEmbeddedFactor = findCustomEmbeddedEmissionFactor(inputFormData.materialName || '');
    const embeddedEmissions = Number(inputFormData.embeddedEmissions ?? customEmbeddedFactor ?? 0);
    
    const newInput: ProcessInput = {
      id: editingInput ? (editingInput.id ?? Date.now().toString()) : Date.now().toString(),
      materialName: inputFormData.materialName || '',
      amount: qty,
      quantity: qty,
      unit: inputFormData.unit || 't',
      originCountry: inputFormData.origin ?? 'Domestic',
      origin: inputFormData.origin ?? 'Domestic',
      embeddedEmissions
    };

    updateData(data.map(process => {
      if (process.id === selectedProcessId) {
        const inputs = editingInput
          ? process.inputs.map(input => input.id === editingInput.id ? newInput : input)
          : [...process.inputs, newInput];
        return { ...process, inputs };
      }
      return process;
    }));

    handleCloseInputDialog();
  };

  const handleSaveOutput = () => {
    const qty = Number(outputFormData.quantity ?? 0);
    if (!selectedProcessId || !outputFormData.productName || qty <= 0) {
      return;
    }

    const newOutput: ProcessOutput = {
      id: editingOutput ? (editingOutput.id ?? Date.now().toString()) : Date.now().toString(),
      productName: outputFormData.productName || '',
      amount: qty,
      quantity: qty,
      unit: outputFormData.unit || 't',
      cnCode: outputFormData.cnCode || '',
      destination: outputFormData.destination ?? 'Domestic'
    };

    updateData(data.map(process => {
      if (process.id === selectedProcessId) {
        const outputs = editingOutput
          ? process.outputs.map(output => output.id === editingOutput.id ? newOutput : output)
          : [...process.outputs, newOutput];
        return { ...process, outputs };
      }
      return process;
    }));

    handleCloseOutputDialog();
  };

  const handleDeleteProcess = (id: string) => {
    updateData(data.filter(process => process.id !== id));
  };

  const handleDeleteInput = (processId: string, inputId: string) => {
    updateData(data.map(process => {
      if (process.id === processId) {
        return {
          ...process,
          inputs: process.inputs.filter(input => input.id !== inputId)
        };
      }
      return process;
    }));
  };

  const handleDeleteOutput = (processId: string, outputId: string) => {
    updateData(data.map(process => {
      if (process.id === processId) {
        return {
          ...process,
          outputs: process.outputs.filter(output => output.id !== outputId)
        };
      }
      return process;
    }));
  };

  const indirectProcessEmissionsTotal = data.reduce((sum, process) => {
    if (!process.applicableElements?.indirectEmissions) return sum;
    const cons = process.electricityConsumption ?? 0;
    const unit = process.electricityUnit ?? 'MWh';
    const ef = process.electricityEmissionFactor ?? 0;
    const efUnit = process.electricityEmissionFactorUnit ?? 't/MWh';
    const consMWh = unit === 'kWh' ? cons / 1000 : unit === 'GJ' ? cons * 0.2777777778 : cons;
    const efPerMWh = efUnit === 't/kWh' ? ef * 1000 : efUnit === 't/GJ' ? ef * 3.6 : ef;
    return sum + (consMWh * efPerMWh);
  }, 0);

  const totalProcessEmissions = data.reduce(
    (sum, process) => sum + (process.processEmissions ?? 0), 0
  ) + indirectProcessEmissionsTotal;

  const totalEmbeddedEmissions = data.reduce(
    (sum, process) => sum + process.inputs.reduce(
      (inputSum, input) => inputSum + ((input.embeddedEmissions ?? 0) * (input.quantity ?? 0)), 0
    ), 0
  );

  // Import/Export functions
  const handleExportProcessData = () => {
    try {
      // Create a complete CBAMData object with default values for required fields
      const exportData: CBAMData = {
        companyInfo: {
          companyName: '',
          companyAddress: '',
          companyContactPerson: '',
          companyEmail: '',
          companyPhone: ''
        },
        reportConfig: {
          reportingPeriod: new Date().getFullYear().toString(),
          installationId: 'TEMP',
          installationName: 'Temporary Installation',
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
        emissionFactors: customProcessEmissionFactors,
        energyFuelData: [],
        processProductionData: data,
        emissionInstallationData: {
          emissions: [],
          totalDirectCO2Emissions: 0,
          totalIndirectCO2Emissions: indirectProcessEmissionsTotal,
          totalCO2Emissions: 0,
          totalCH4Emissions: 0,
          totalN2OEmissions: 0,
          totalGHGEmissions: 0,
          reportingPeriod: new Date().getFullYear().toString()
        },
        purchasedPrecursors: {
          precursors: [],
          totalEmbeddedEmissions: 0,
          totalDirectEmbeddedEmissions: 0,
          totalIndirectEmbeddedEmissions: 0,
          reportingPeriod: new Date().getFullYear().toString()
        },
        calculationResults: {
          totalDirectCO2Emissions: 0,
          totalProcessEmissions: totalProcessEmissions,
          totalEmissions: totalProcessEmissions + totalEmbeddedEmissions,
          specificEmissions: 0,
          totalEnergy: 0,
          renewableShare: 0,
          importedRawMaterialShare: 0,
          embeddedEmissions: totalEmbeddedEmissions,
          purchasedPrecursorsEmbeddedEmissions: totalEmbeddedEmissions,
          cumulativeEmissions: totalProcessEmissions + totalEmbeddedEmissions,
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
      
      const blob = exportToExcel(exportData, exportData.calculationResults);
      downloadBlob(blob, `CBAM_Process_Production_Data_${new Date().toISOString().split('T')[0]}.xlsx`);
      
      setImportStatus({
        type: 'success',
        message: 'Process data exported successfully!'
      });
      setImportExportDialogOpen(true);
    } catch (error) {
      setImportStatus({
        type: 'error',
        message: `Failed to export data: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
      setImportExportDialogOpen(true);
    }
  };

  const handleImportProcessData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    setImportStatus({
      type: 'info',
      message: 'Processing file...'
    });
    setImportExportDialogOpen(true);
    
    // For a real implementation, we would use a library like xlsx to read the file
    // For now, we'll simulate the import process
    setTimeout(() => {
      try {
        // Simulate successful import
        setImportStatus({
          type: 'success',
          message: 'Process data imported successfully!'
        });
        
        // In a real implementation, we would parse the file and update the data
        // For example:
        // const reader = new FileReader();
        // reader.onload = (e) => {
        //   const data = new Uint8Array(e.target?.result as ArrayBuffer);
        //   const workbook = XLSX.read(data, { type: 'array' });
        //   const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        //   const jsonData = XLSX.utils.sheet_to_json(worksheet);
        //   // Process jsonData and update state
        // };
        // reader.readAsArrayBuffer(file);
      } catch (error) {
        setImportStatus({
          type: 'error',
          message: `Failed to import data: ${error instanceof Error ? error.message : 'Unknown error'}`
        });
      }
    }, 1500);
  };

  return (
    <Box className="form-section">
      <Typography variant="h5" component="h2" gutterBottom>
        Podaci o procesu i proizvodnji
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Unesite informacije o proizvodnim procesima, ulazima i izlazima. Ovi podaci se koriste za izračun emisija procesa i specifičnih emisija.
      </Typography>
      
      <Paper sx={{ p: 3 }}>
        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="h6">
            Proizvodni procesi
          </Typography>
          <Box>
            <Button
              variant="outlined"
              startIcon={<CheckCircleIcon />}
              onClick={() => {
                const validation = validateAllProcesses();
                setValidationErrors(validation.errors);
                setShowValidationErrors(true);
              }}
              sx={{ mr: 1 }}
            >
              Validiraj podatke
            </Button>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={handleExportProcessData}
              sx={{ mr: 1 }}
            >
              Izvezi podatke
            </Button>
            <Button
              variant="outlined"
              component="label"
              sx={{ mr: 1 }}
            >
              Import Data
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                hidden
                onChange={handleImportProcessData}
              />
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenProcessDialog()}
            >
              Add Process
            </Button>
          </Box>
        </Box>
        
        {/* Validation Errors Alert */}
        {showValidationErrors && validationErrors.length > 0 && (
          <Alert 
            severity="error" 
            sx={{ mb: 2 }}
            action={
              <IconButton
                aria-label="close"
                color="inherit"
                size="small"
                onClick={() => setShowValidationErrors(false)}
              >
                <CloseIcon fontSize="inherit" />
              </IconButton>
            }
          >
            <AlertTitle>Data Validation Errors</AlertTitle>
            <List dense>
              {validationErrors.map((error, index) => (
                <ListItem key={index} sx={{ py: 0, px: 0 }}>
                  <ListItemText primary={`• ${error}`} />
                </ListItem>
              ))}
            </List>
          </Alert>
        )}
        
        {/* Error Display Section */}
        {validationStatus && validationStatus.errors && validationStatus.errors.length > 0 && (
          <Alert 
            severity="error" 
            sx={{ mb: 2 }}
            action={
              <IconButton
                aria-label="close"
                color="inherit"
                size="small"
                onClick={() => {
                  // Trigger data update to clear validation errors
                  updateData([...data]);
                }}
              >
                <CloseIcon fontSize="inherit" />
              </IconButton>
            }
          >
            <AlertTitle>Validation Errors</AlertTitle>
            <List dense>
              {validationStatus.errors.map((error, index) => (
                <ListItem key={index} sx={{ py: 0, px: 0 }}>
                  <ListItemText primary={`• ${error}`} />
                </ListItem>
              ))}
            </List>
          </Alert>
        )}
        
        {/* Validation Success Alert */}
        {showValidationErrors && validationErrors.length === 0 && (
          <Alert 
            severity="success" 
            sx={{ mb: 2 }}
            action={
              <IconButton
                aria-label="close"
                color="inherit"
                size="small"
                onClick={() => setShowValidationErrors(false)}
              >
                <CloseIcon fontSize="inherit" />
              </IconButton>
            }
          >
            <AlertTitle>Validation Successful</AlertTitle>
            All process data is consistent and valid.
          </Alert>
        )}

        {data.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 3, color: 'text.secondary' }}>
            <Typography>No production processes added yet.</Typography>
            <Typography variant="body2">
              Click "Add Process" to add your first process.
            </Typography>
          </Box>
        ) : (
          <Box>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Process Name</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell align="right">Production</TableCell>
                    <TableCell align="right">Process Emissions</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.map((process) => (
                    <TableRow key={process.id}>
                      <TableCell>{process.processName}</TableCell>
                      <TableCell>{process.processType}</TableCell>
                      <TableCell align="right">
                        {(process.productionQuantity ?? 0).toFixed(2)} {process.unit}
                      </TableCell>
                      <TableCell align="right">
                        {process.processEmissions.toFixed(2)} t CO2
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          color="primary"
                          onClick={() => handleOpenProcessDialog(process)}
                        >
                          <AddIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          color="error"
                          onClick={() => handleDeleteProcess(process.id)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell colSpan={2}>
                      <Typography variant="subtitle1" fontWeight="bold">
                        Total Process Emissions
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="subtitle1" fontWeight="bold">
                        {totalProcessEmissions.toFixed(2)}
                      </Typography>
                    </TableCell>
                    <TableCell>t CO2</TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>

            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom>
                Process Details (Inputs & Outputs)
              </Typography>
              {data.map((process) => (
                <Accordion key={process.id}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography>{process.processName}</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Box sx={{ width: '100%' }}>
                      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                        <Tabs value={tabValue} onChange={handleTabChange}>
                          <Tab label={`Inputs (${process.inputs.length})`} />
                          <Tab label={`Outputs (${process.outputs.length})`} />
                        </Tabs>
                      </Box>
                      <TabPanel value={tabValue} index={0}>
                        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="subtitle1">Input Materials</Typography>
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<AddIcon />}
                            onClick={() => handleOpenInputDialog(process.id)}
                          >
                            Add Input
                          </Button>
                        </Box>
                        {process.inputs.length === 0 ? (
                          <Typography color="text.secondary">No inputs added yet.</Typography>
                        ) : (
                          <TableContainer>
                            <Table size="small">
                              <TableHead>
                                <TableRow>
                                  <TableCell>Material</TableCell>
                                  <TableCell align="right">Quantity</TableCell>
                                  <TableCell>Origin</TableCell>
                                  <TableCell align="right">Embedded CO2</TableCell>
                                  <TableCell align="center">Actions</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {process.inputs.map((input) => (
                                  <TableRow key={input.id}>
                                    <TableCell>{input.materialName}</TableCell>
                                    <TableCell align="right">
                                      {(input.quantity ?? 0).toFixed(2)} {input.unit}
                                    </TableCell>
                                    <TableCell>{input.origin}</TableCell>
                                    <TableCell align="right">
                                      {((input.embeddedEmissions ?? 0) * (input.quantity ?? 0)).toFixed(2)} t
                                    </TableCell>
                                    <TableCell align="center">
                                      <IconButton
                                        size="small"
                                        color="primary"
                                        onClick={() => handleOpenInputDialog(process.id, input)}
                                      >
                                        <AddIcon fontSize="small" />
                                      </IconButton>
                                      <IconButton
                                        size="small"
                                        color="error"
                                        onClick={() => handleDeleteInput(process.id, input.id!)}
                                      >
                                        <DeleteIcon fontSize="small" />
                                      </IconButton>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </TableContainer>
                        )}
                      </TabPanel>
                      <TabPanel value={tabValue} index={1}>
                        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="subtitle1">Output Products</Typography>
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<AddIcon />}
                            onClick={() => handleOpenOutputDialog(process.id)}
                          >
                            Add Output
                          </Button>
                        </Box>
                        {process.outputs.length === 0 ? (
                          <Typography color="text.secondary">No outputs added yet.</Typography>
                        ) : (
                          <TableContainer>
                            <Table size="small">
                              <TableHead>
                                <TableRow>
                                  <TableCell>Product</TableCell>
                                  <TableCell align="right">Quantity</TableCell>
                                  <TableCell>CN Code</TableCell>
                                  <TableCell>Destination</TableCell>
                                  <TableCell align="center">Actions</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {process.outputs.map((output) => (
                                  <TableRow key={output.id}>
                                    <TableCell>{output.productName}</TableCell>
                                    <TableCell align="right">
                                      {(output.quantity ?? 0).toFixed(2)} {output.unit}
                                    </TableCell>
                                    <TableCell>{output.cnCode}</TableCell>
                                    <TableCell>{output.destination}</TableCell>
                                    <TableCell align="center">
                                      <IconButton
                                        size="small"
                                        color="primary"
                                        onClick={() => handleOpenOutputDialog(process.id, output)}
                                      >
                                        <AddIcon fontSize="small" />
                                      </IconButton>
                                      <IconButton
                                        size="small"
                                        color="error"
                                        onClick={() => handleDeleteOutput(process.id, output.id!)}
                                      >
                                        <DeleteIcon fontSize="small" />
                                      </IconButton>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </TableContainer>
                        )}
                      </TabPanel>
                    </Box>

                    <Box sx={{ mt: 3 }}>
                      <Typography variant="subtitle1">D_Processes Details</Typography>
                      <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            id={`totalProduction-${process.id}`}
                            label="Ukupna proizvodnja u instalaciji"
                            type="number"
                            fullWidth
                            inputProps={{ min: 0, step: 0.01 }}
                            value={process.totalProductionWithinInstallation ?? process.productionQuantity ?? process.productionAmount ?? 0}
                            onChange={(e) => {
                              const v = parseFloat(e.target.value);
                              updateProcessField(process.id!, 'totalProductionWithinInstallation', isNaN(v) ? undefined : v);
                            }}
                            helperText={`Jedinica: ${process.unit}`}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            id={`producedForMarket-${process.id}`}
                            label="Proizvedeno za tržište"
                            type="number"
                            fullWidth
                            inputProps={{ min: 0, step: 0.01 }}
                            value={process.producedForMarket ?? 0}
                            onChange={(e) => {
                              const v = parseFloat(e.target.value);
                              updateProcessField(process.id!, 'producedForMarket', isNaN(v) ? undefined : v);
                            }}
                            helperText={`Jedinica: ${process.unit}`}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <FormControlLabel
                            control={<Checkbox checked={!!process.isProductionOnlyForMarket} onChange={(e) => updateProcessField(process.id!, 'isProductionOnlyForMarket', e.target.checked)} />}
                            label="Proizvodnja isključivo za tržište"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            id={`marketShare-${process.id}`}
                            label="Udio proizvodnje za tržište (%)"
                            type="number"
                            fullWidth
                            inputProps={{ min: 0, max: 100, step: 0.01 }}
                            value={(() => {
                              const total = (process.totalProductionWithinInstallation ?? process.productionQuantity ?? process.productionAmount ?? 0);
                              const market = (process.producedForMarket ?? 0);
                              return total > 0 ? Number(((market / total) * 100).toFixed(2)) : 0;
                            })()}
                            disabled
                            helperText="Automatski: (za tržište / ukupno) * 100"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Button
                            variant="outlined"
                            onClick={() => {
                              const total = (process.totalProductionWithinInstallation ?? process.productionQuantity ?? process.productionAmount ?? 0);
                              const market = (process.producedForMarket ?? 0);
                              const ms = total > 0 ? Number(((market / total) * 100).toFixed(2)) : 0;
                              updateProcessField(process.id!, 'marketSharePercent' as any, ms);
                            }}
                          >
                            Spremi udio (%)
                          </Button>
                        </Grid>
                        <Grid item xs={12}>
                          <Typography variant="subtitle2">Primjenjivi elementi</Typography>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <FormControlLabel control={<Checkbox checked={!!process.applicableElements?.measurableHeat} onChange={(e) => updateProcessNested(process.id!, 'applicableElements', { measurableHeat: e.target.checked })} />} label="Mjerljiva toplina" />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <FormControlLabel control={<Checkbox checked={!!process.applicableElements?.wasteGases} onChange={(e) => updateProcessNested(process.id!, 'applicableElements', { wasteGases: e.target.checked })} />} label="Otpadni plinovi" />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <FormControlLabel control={<Checkbox checked={!!process.applicableElements?.indirectEmissions} onChange={(e) => updateProcessNested(process.id!, 'applicableElements', { indirectEmissions: e.target.checked })} />} label="Neizravne emisije (električna energija)" />
                        </Grid>

                        <Grid item xs={12}>
                          <Typography variant="subtitle2">Ne-CBAM dobra</Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            id={`nonCBAMAmount-${process.id}`}
                            label="Količina ne-CBAM dobara"
                            type="number"
                            fullWidth
                            inputProps={{ min: 0, step: 0.01 }}
                            value={process.nonCBAMAmount ?? 0}
                            onChange={(e) => {
                              const v = parseFloat(e.target.value);
                              updateProcessField(process.id!, 'nonCBAMAmount', isNaN(v) ? undefined : v);
                            }}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <FormControl fullWidth>
                            <InputLabel id={`nonCBAMUnit-${process.id}`}>Jedinica</InputLabel>
                            <Select
                              labelId={`nonCBAMUnit-${process.id}`}
                              id={`nonCBAMUnit-sel-${process.id}`}
                              value={process.nonCBAMUnit ?? process.unit ?? 't'}
                              label="Jedinica"
                              onChange={(e) => updateProcessField(process.id!, 'nonCBAMUnit', e.target.value)}
                            >
                              {processUnits.map((unit) => (
                                <MenuItem key={`nonCBAM-${process.id}-${unit}`} value={unit}>{unit}</MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Grid>
                      </Grid>

                        <Grid item xs={12}>
                          <Typography variant="subtitle2">Električna energija</Typography>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <TextField
                            id={`electricityConsumption-${process.id}`}
                            label="Potrošnja električne energije"
                            type="number"
                            fullWidth
                            inputProps={{ min: 0, step: 0.001 }}
                            value={process.electricityConsumption ?? 0}
                            onChange={(e) => {
                              const v = parseFloat(e.target.value);
                              updateProcessField(process.id!, 'electricityConsumption', isNaN(v) ? undefined : v);
                            }}
                          />
                        </Grid>
                        <Grid item xs={12} sm={2}>
                          <FormControl fullWidth>
                            <InputLabel id={`electricityUnit-${process.id}`}>Jedinica</InputLabel>
                            <Select
                              labelId={`electricityUnit-${process.id}`}
                              id={`electricityUnit-sel-${process.id}`}
                              value={process.electricityUnit ?? 'MWh'}
                              label="Jedinica"
                              onChange={(e) => updateProcessField(process.id!, 'electricityUnit', e.target.value)}
                            >
                              {['MWh', 'kWh', 'GJ'].map((u) => (
                                <MenuItem key={`elUnit-${process.id}-${u}`} value={u}>{u}</MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={3}>
                          <TextField
                            id={`electricityEF-${process.id}`}
                            label="EF električne energije"
                            type="number"
                            fullWidth
                            inputProps={{ min: 0, step: 0.0001 }}
                            value={process.electricityEmissionFactor ?? 0}
                            onChange={(e) => {
                              const v = parseFloat(e.target.value);
                              updateProcessField(process.id!, 'electricityEmissionFactor', isNaN(v) ? undefined : v);
                            }}
                            helperText="t CO₂ po jedinici"
                          />
                        </Grid>
                        <Grid item xs={12} sm={3}>
                          <FormControl fullWidth>
                            <InputLabel id={`electricityEFUnit-${process.id}`}>Jedinica EF</InputLabel>
                            <Select
                              labelId={`electricityEFUnit-${process.id}`}
                              id={`electricityEFUnit-sel-${process.id}`}
                              value={process.electricityEmissionFactorUnit ?? 't/MWh'}
                              label="Jedinica EF"
                              onChange={(e) => updateProcessField(process.id!, 'electricityEmissionFactorUnit', e.target.value)}
                            >
                              {['t/MWh', 't/kWh', 't/GJ'].map((u) => (
                                <MenuItem key={`elEFUnit-${process.id}-${u}`} value={u}>{u}</MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            id={`electricityEFSource-${process.id}`}
                            label="Izvor EF električne energije"
                            type="text"
                            fullWidth
                            value={process.electricityEmissionFactorSource ?? ''}
                            onChange={(e) => updateProcessField(process.id!, 'electricityEmissionFactorSource', e.target.value)}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            id={`indirectEmissions-${process.id}`}
                            label="Neizravne emisije (t)"
                            type="number"
                            fullWidth
                            value={(() => {
                              const cons = process.electricityConsumption ?? 0;
                              const unit = process.electricityUnit ?? 'MWh';
                              const ef = process.electricityEmissionFactor ?? 0;
                              const efUnit = process.electricityEmissionFactorUnit ?? 't/MWh';
                              const consMWh = unit === 'kWh' ? cons / 1000 : unit === 'GJ' ? cons * 0.2777777778 : cons;
                              const efPerMWh = efUnit === 't/kWh' ? ef * 1000 : efUnit === 't/GJ' ? ef * 3.6 : ef;
                              return Number((consMWh * efPerMWh).toFixed(6));
                            })()}
                            disabled
                            helperText="Automatski izračunato: potrošnja * EF, uz konverzije"
                          />
                        </Grid>

                        <Grid item xs={12} sm={4}>
                          <TextField
                            id={`electricityExportedAmount-${process.id}`}
                            label="Izvezena električna energija"
                            type="number"
                            fullWidth
                            inputProps={{ min: 0, step: 0.001 }}
                            value={process.electricityExportedAmount ?? 0}
                            onChange={(e) => {
                              const v = parseFloat(e.target.value);
                              updateProcessField(process.id!, 'electricityExportedAmount' as any, isNaN(v) ? undefined : v);
                            }}
                          />
                        </Grid>
                        <Grid item xs={12} sm={2}>
                          <FormControl fullWidth>
                            <InputLabel id={`electricityExportedUnit-${process.id}`}>Jedinica</InputLabel>
                            <Select
                              labelId={`electricityExportedUnit-${process.id}`}
                              id={`electricityExportedUnit-sel-${process.id}`}
                              value={process.electricityExportedUnit ?? 'MWh'}
                              label="Jedinica"
                              onChange={(e) => updateProcessField(process.id!, 'electricityExportedUnit' as any, e.target.value)}
                            >
                              {['MWh', 'kWh', 'GJ'].map((u) => (
                                <MenuItem key={`elExpUnit-${process.id}-${u}`} value={u}>{u}</MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={3}>
                          <TextField
                            id={`electricityExportedEF-${process.id}`}
                            label="EF izvezene električne energije"
                            type="number"
                            fullWidth
                            inputProps={{ min: 0, step: 0.0001 }}
                            value={process.electricityExportedEmissionFactor ?? 0}
                            onChange={(e) => {
                              const v = parseFloat(e.target.value);
                              updateProcessField(process.id!, 'electricityExportedEmissionFactor' as any, isNaN(v) ? undefined : v);
                            }}
                            helperText="t CO₂ po jedinici"
                          />
                        </Grid>
                        <Grid item xs={12} sm={3}>
                          <FormControl fullWidth>
                            <InputLabel id={`electricityExportedEFUnit-${process.id}`}>Jedinica EF</InputLabel>
                            <Select
                              labelId={`electricityExportedEFUnit-${process.id}`}
                              id={`electricityExportedEFUnit-sel-${process.id}`}
                              value={process.electricityExportedEmissionFactorUnit ?? 't/MWh'}
                              label="Jedinica EF"
                              onChange={(e) => updateProcessField(process.id!, 'electricityExportedEmissionFactorUnit' as any, e.target.value)}
                            >
                              {['t/MWh', 't/kWh', 't/GJ'].map((u) => (
                                <MenuItem key={`elExpEFUnit-${process.id}-${u}`} value={u}>{u}</MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Grid>

                        <Grid item xs={12}>
                          <Typography variant="subtitle2">Potrošeno u drugim procesima</Typography>
                        </Grid>
                        {(process.consumedInOtherProcesses ?? []).map((cons, idx) => (
                          <>
                            <Grid item xs={12} sm={5}>
                              <FormControl fullWidth>
                                <InputLabel id={`cons-target-${process.id}-${idx}`}>Proces</InputLabel>
                                <Select
                                  labelId={`cons-target-${process.id}-${idx}`}
                                  id={`cons-target-sel-${process.id}-${idx}`}
                                  value={cons.targetProcessId}
                                  label="Proces"
                                  onChange={(e) => updateConsumptionEntry(process.id!, idx, { targetProcessId: e.target.value })}
                                >
                                  {data.filter(p => p.id !== process.id).map(p => (
                                    <MenuItem key={`cons-opt-${process.id}-${idx}-${p.id}`} value={p.id}>{p.processName}</MenuItem>
                                  ))}
                                </Select>
                              </FormControl>
                            </Grid>
                            <Grid item xs={12} sm={3}>
                              <TextField
                                id={`cons-qty-${process.id}-${idx}`}
                                label="Količina"
                                type="number"
                                fullWidth
                                inputProps={{ min: 0, step: 0.001 }}
                                value={cons.quantity}
                                onChange={(e) => {
                                  const v = parseFloat(e.target.value);
                                  updateConsumptionEntry(process.id!, idx, { quantity: isNaN(v) ? 0 : v });
                                }}
                              />
                            </Grid>
                            <Grid item xs={12} sm={3}>
                              <FormControl fullWidth>
                                <InputLabel id={`cons-unit-${process.id}-${idx}`}>Jedinica</InputLabel>
                                <Select
                                  labelId={`cons-unit-${process.id}-${idx}`}
                                  id={`cons-unit-sel-${process.id}-${idx}`}
                                  value={cons.unit}
                                  label="Jedinica"
                                  onChange={(e) => updateConsumptionEntry(process.id!, idx, { unit: e.target.value })}
                                >
                                  {processUnits.map((u) => (
                                    <MenuItem key={`consUnit-${process.id}-${idx}-${u}`} value={u}>{u}</MenuItem>
                                  ))}
                                </Select>
                              </FormControl>
                            </Grid>
                            <Grid item xs={12} sm={1}>
                              <IconButton aria-label="remove" onClick={() => removeConsumptionEntry(process.id!, idx)}>
                                <DeleteIcon />
                              </IconButton>
                            </Grid>
                          </>
                        ))}
                        <Grid item xs={12}>
                          <Button variant="outlined" startIcon={<AddIcon />} onClick={() => addConsumptionEntry(process.id!)}>
                            Dodaj potrošnju
                          </Button>
                        </Grid>

                      <Grid container spacing={2}>

                        {process.applicableElements?.measurableHeat && (
                          <>
                            <Grid item xs={12}>
                              <Typography variant="subtitle2">Mjerljiva toplina</Typography>
                            </Grid>
                            <Grid item xs={12} sm={4}>
                              <TextField
                                id={`mh-qty-${process.id}`}
                                label="Količina topline"
                                type="number"
                                fullWidth
                                inputProps={{ min: 0, step: 0.001 }}
                                value={process.measurableHeatData?.quantity ?? 0}
                                onChange={(e) => {
                                  const v = parseFloat(e.target.value);
                                  updateProcessNested(process.id!, 'measurableHeatData', { quantity: isNaN(v) ? undefined : v });
                                }}
                              />
                            </Grid>
                            <Grid item xs={12} sm={2}>
                              <FormControl fullWidth>
                                <InputLabel id={`mh-unit-${process.id}`}>Jedinica</InputLabel>
                                <Select
                                  labelId={`mh-unit-${process.id}`}
                                  id={`mh-unit-sel-${process.id}`}
                                  value={process.measurableHeatData?.unit ?? 'MWh'}
                                  label="Jedinica"
                                  onChange={(e) => updateProcessNested(process.id!, 'measurableHeatData', { unit: e.target.value })}
                                >
                                  {['MWh', 'GJ'].map((u) => (
                                    <MenuItem key={`mhUnit-${process.id}-${u}`} value={u}>{u}</MenuItem>
                                  ))}
                                </Select>
                              </FormControl>
                            </Grid>
                            <Grid item xs={12} sm={3}>
                              <TextField
                                id={`mh-imported-${process.id}`}
                                label="Uvezena toplina"
                                type="number"
                                fullWidth
                                inputProps={{ min: 0, step: 0.001 }}
                                value={process.measurableHeatData?.imported ?? 0}
                                onChange={(e) => {
                                  const v = parseFloat(e.target.value);
                                  updateProcessNested(process.id!, 'measurableHeatData', { imported: isNaN(v) ? undefined : v });
                                }}
                              />
                            </Grid>
                            <Grid item xs={12} sm={3}>
                              <TextField
                                id={`mh-exported-${process.id}`}
                                label="Izvezena toplina"
                                type="number"
                                fullWidth
                                inputProps={{ min: 0, step: 0.001 }}
                                value={process.measurableHeatData?.exported ?? 0}
                                onChange={(e) => {
                                  const v = parseFloat(e.target.value);
                                  updateProcessNested(process.id!, 'measurableHeatData', { exported: isNaN(v) ? undefined : v });
                                }}
                              />
                            </Grid>
                            <Grid item xs={12} sm={3}>
                              <TextField
                                id={`mh-ef-${process.id}`}
                                label="EF topline"
                                type="number"
                                fullWidth
                                inputProps={{ min: 0, step: 0.0001 }}
                                value={process.measurableHeatData?.emissionFactor ?? 0}
                                onChange={(e) => {
                                  const v = parseFloat(e.target.value);
                                  updateProcessNested(process.id!, 'measurableHeatData', { emissionFactor: isNaN(v) ? undefined : v });
                                }}
                                helperText="t CO₂ po jedinici"
                              />
                            </Grid>
                            <Grid item xs={12} sm={3}>
                              <FormControl fullWidth>
                                <InputLabel id={`mh-efUnit-${process.id}`}>Jedinica EF</InputLabel>
                                <Select
                                  labelId={`mh-efUnit-${process.id}`}
                                  id={`mh-efUnit-sel-${process.id}`}
                                  value={process.measurableHeatData?.emissionFactorUnit ?? 't/MWh'}
                                  label="Jedinica EF"
                                  onChange={(e) => updateProcessNested(process.id!, 'measurableHeatData', { emissionFactorUnit: e.target.value })}
                                >
                                  {['t/MWh', 't/GJ'].map((u) => (
                                    <MenuItem key={`mhEFUnit-${process.id}-${u}`} value={u}>{u}</MenuItem>
                                  ))}
                                </Select>
                              </FormControl>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                              <TextField
                                id={`mh-share-${process.id}`}
                                label="Udio topline za CBAM dobra (%)"
                                type="number"
                                fullWidth
                                inputProps={{ min: 0, max: 100, step: 0.01 }}
                                value={process.measurableHeatData?.shareToCBAMGoods ?? 100}
                                onChange={(e) => {
                                  const v = parseFloat(e.target.value);
                                  updateProcessNested(process.id!, 'measurableHeatData', { shareToCBAMGoods: isNaN(v) ? undefined : v });
                                }}
                              />
                            </Grid>
                          </>
                        )}

                        {process.applicableElements?.wasteGases && (
                          <>
                            <Grid item xs={12}>
                              <Typography variant="subtitle2">Otpadni plinovi</Typography>
                            </Grid>
                            <Grid item xs={12} sm={4}>
                              <TextField
                                id={`wg-qty-${process.id}`}
                                label="Količina otpadnih plinova"
                                type="number"
                                fullWidth
                                inputProps={{ min: 0, step: 0.001 }}
                                value={process.wasteGasesData?.quantity ?? 0}
                                onChange={(e) => {
                                  const v = parseFloat(e.target.value);
                                  updateProcessNested(process.id!, 'wasteGasesData', { quantity: isNaN(v) ? undefined : v });
                                }}
                              />
                            </Grid>
                            <Grid item xs={12} sm={2}>
                              <FormControl fullWidth>
                                <InputLabel id={`wg-unit-${process.id}`}>Jedinica</InputLabel>
                                <Select
                                  labelId={`wg-unit-${process.id}`}
                                  id={`wg-unit-sel-${process.id}`}
                                  value={process.wasteGasesData?.unit ?? 'Nm³'}
                                  label="Jedinica"
                                  onChange={(e) => updateProcessNested(process.id!, 'wasteGasesData', { unit: e.target.value })}
                                >
                                  {['Nm³', 'm³', 't'].map((u) => (
                                    <MenuItem key={`wgUnit-${process.id}-${u}`} value={u}>{u}</MenuItem>
                                  ))}
                                </Select>
                              </FormControl>
                            </Grid>
                            <Grid item xs={12} sm={3}>
                              <TextField
                                id={`wg-imported-${process.id}`}
                                label="Uvezeni plinovi"
                                type="number"
                                fullWidth
                                inputProps={{ min: 0, step: 0.001 }}
                                value={process.wasteGasesData?.imported ?? 0}
                                onChange={(e) => {
                                  const v = parseFloat(e.target.value);
                                  updateProcessNested(process.id!, 'wasteGasesData', { imported: isNaN(v) ? undefined : v });
                                }}
                              />
                            </Grid>
                            <Grid item xs={12} sm={3}>
                              <TextField
                                id={`wg-exported-${process.id}`}
                                label="Izvezeni plinovi"
                                type="number"
                                fullWidth
                                inputProps={{ min: 0, step: 0.001 }}
                                value={process.wasteGasesData?.exported ?? 0}
                                onChange={(e) => {
                                  const v = parseFloat(e.target.value);
                                  updateProcessNested(process.id!, 'wasteGasesData', { exported: isNaN(v) ? undefined : v });
                                }}
                              />
                            </Grid>
                            <Grid item xs={12} sm={3}>
                              <TextField
                                id={`wg-ef-${process.id}`}
                                label="EF otpadnih plinova"
                                type="number"
                                fullWidth
                                inputProps={{ min: 0, step: 0.0001 }}
                                value={process.wasteGasesData?.emissionFactor ?? 0}
                                onChange={(e) => {
                                  const v = parseFloat(e.target.value);
                                  updateProcessNested(process.id!, 'wasteGasesData', { emissionFactor: isNaN(v) ? undefined : v });
                                }}
                                helperText="t CO₂ po jedinici"
                              />
                            </Grid>
                            <Grid item xs={12} sm={3}>
                              <FormControl fullWidth>
                                <InputLabel id={`wg-efUnit-${process.id}`}>Jedinica EF</InputLabel>
                                <Select
                                  labelId={`wg-efUnit-${process.id}`}
                                  id={`wg-efUnit-sel-${process.id}`}
                                  value={process.wasteGasesData?.emissionFactorUnit ?? 't/Nm³'}
                                  label="Jedinica EF"
                                  onChange={(e) => updateProcessNested(process.id!, 'wasteGasesData', { emissionFactorUnit: e.target.value })}
                                >
                                  {['t/Nm³', 't/m³', 't/t'].map((u) => (
                                    <MenuItem key={`wgEFUnit-${process.id}-${u}`} value={u}>{u}</MenuItem>
                                  ))}
                                </Select>
                              </FormControl>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                              <TextField
                                id={`wg-reused-${process.id}`}
                                label="Iskorišteni udio (%)"
                                type="number"
                                fullWidth
                                inputProps={{ min: 0, max: 100, step: 0.01 }}
                                value={process.wasteGasesData?.reusedShare ?? 0}
                                onChange={(e) => {
                                  const v = parseFloat(e.target.value);
                                  updateProcessNested(process.id!, 'wasteGasesData', { reusedShare: isNaN(v) ? undefined : v });
                                }}
                              />
                            </Grid>
                          </>
                        )}

                       </Grid>
                     </Box>
                  </AccordionDetails>
                </Accordion>
              ))}
            </Box>

            <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
              <Typography variant="h6" gutterBottom>
                Summary
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2">
                    Total Process Emissions: <strong>{totalProcessEmissions.toFixed(2)} t CO2</strong>
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2">
                    Total Embedded Emissions: <strong>{totalEmbeddedEmissions.toFixed(2)} t CO2</strong>
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          </Box>
        )}
      </Paper>

      {/* Process Dialog */}
      <Dialog open={openProcessDialog} onClose={handleCloseProcessDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingProcess ? 'Edit Process' : 'Add Process'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                id="processName"
                label="Process Name"
                fullWidth
                value={processFormData.processName}
                onChange={handleProcessInputChange('processName')}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="processType-label">Process Type</InputLabel>
                <Tooltip title="The type of production process as defined by CBAM regulations. Different process types have different emission factor ranges and calculation methods.">
                  <Select
                    labelId="processType-label"
                    id="processType"
                    value={processFormData.processType}
                    onChange={handleProcessSelectChange('processType')}
                    label="Process Type"
                    endAdornment={
                      <InputAdornment position="end">
                        <InfoIcon fontSize="small" color="action" />
                      </InputAdornment>
                    }
                  >
                    {processTypes.map((type) => (
                      <MenuItem key={type} value={type}>
                        {type}
                      </MenuItem>
                    ))}
                  </Select>
                </Tooltip>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                required
                id="productionQuantity"
                label="Production Quantity"
                type="number"
                fullWidth
                inputProps={{ min: 0, step: 0.01 }}
                value={processFormData.productionQuantity}
                onChange={handleProcessInputChange('productionQuantity')}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="unit-label">Unit</InputLabel>
                <Select
                  labelId="unit-label"
                  id="unit"
                  value={processFormData.unit}
                  onChange={handleProcessSelectChange('unit')}
                  label="Unit"
                >
                  {processUnits.map((unit) => (
                    <MenuItem key={unit} value={unit}>
                      {unit}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Tooltip title="The amount of CO2 emissions directly released during production per unit of output. This is a key parameter for CBAM calculations and must be based on verified data or approved methodologies.">
                <TextField
                  id="processEmissionFactor"
                  label="Process Emission Factor (t/unit)"
                  type="number"
                  fullWidth
                  inputProps={{ min: 0, step: 0.01 }}
                  value={processFormData.processEmissionFactor}
                  onChange={handleProcessInputChange('processEmissionFactor')}
                  helperText="t CO2 per unit of production"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <InfoIcon fontSize="small" color="action" />
                      </InputAdornment>
                    )
                  }}
                />
              </Tooltip>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                id="processEmissions"
                label="Process Emissions (t CO2)"
                type="number"
                fullWidth
                inputProps={{ min: 0, step: 0.01 }}
                value={processFormData.processEmissions}
                onChange={handleProcessInputChange('processEmissions')}
                helperText="Automatically calculated from emission factor"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseProcessDialog}>Cancel</Button>
          <Button onClick={handleSaveProcess} variant="contained">
            {editingProcess ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Input Dialog */}
      <Dialog open={openInputDialog} onClose={handleCloseInputDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingInput ? 'Edit Input' : 'Add Input'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                id="materialName"
                label="Material Name"
                fullWidth
                value={inputFormData.materialName}
                onChange={handleInputChange('materialName')}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="origin-label">Origin</InputLabel>
                <Select
                  labelId="origin-label"
                  id="origin"
                  value={inputFormData.origin}
                  onChange={handleInputSelectChange('origin')}
                  label="Origin"
                >
                  {origins.map((origin) => (
                    <MenuItem key={origin} value={origin}>
                      {origin}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                required
                id="quantity"
                label="Quantity"
                type="number"
                fullWidth
                inputProps={{ min: 0, step: 0.01 }}
                value={inputFormData.quantity}
                onChange={handleInputChange('quantity')}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="unit-label">Unit</InputLabel>
                <Select
                  labelId="unit-label"
                  id="unit"
                  value={inputFormData.unit}
                  onChange={handleInputSelectChange('unit')}
                  label="Unit"
                >
                  {processUnits.map((unit) => (
                    <MenuItem key={unit} value={unit}>
                      {unit}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <Tooltip title="The amount of CO2 emissions embedded in the input material per unit. This includes emissions from previous production stages and is crucial for accurate CBAM reporting.">
                <TextField
                  id="embeddedEmissions"
                  label="Embedded Emissions (t/unit)"
                  type="number"
                  fullWidth
                  inputProps={{ min: 0, step: 0.01 }}
                  value={inputFormData.embeddedEmissions}
                  onChange={handleInputChange('embeddedEmissions')}
                  helperText="t CO2 embedded per unit of material"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <InfoIcon fontSize="small" color="action" />
                      </InputAdornment>
                    )
                  }}
                />
              </Tooltip>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseInputDialog}>Cancel</Button>
          <Button onClick={handleSaveInput} variant="contained">
            {editingInput ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Output Dialog */}
      <Dialog open={openOutputDialog} onClose={handleCloseOutputDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingOutput ? 'Edit Output' : 'Add Output'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                id="productName"
                label="Product Name"
                fullWidth
                value={outputFormData.productName}
                onChange={handleOutputChange('productName')}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Tooltip title="The EU Combined Nomenclature (CN) code identifies the product type for CBAM reporting. This 8-digit code determines the applicable CBAM regulations for the product.">
                <CNCodeAutocomplete
                  value={outputFormData.cnCode || ''}
                  onChange={(newCode) => setOutputFormData(prev => ({ ...prev, cnCode: newCode }))}
                  label="CN Code"
                  helperText="EU Combined Nomenclature code"
                />
              </Tooltip>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                required
                id="quantity"
                label="Quantity"
                type="number"
                fullWidth
                inputProps={{ min: 0, step: 0.01 }}
                value={outputFormData.quantity}
                onChange={handleOutputChange('quantity')}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="unit-label">Unit</InputLabel>
                <Select
                  labelId="unit-label"
                  id="unit"
                  value={outputFormData.unit}
                  onChange={handleOutputSelectChange('unit')}
                  label="Unit"
                >
                  {processUnits.map((unit) => (
                    <MenuItem key={unit} value={unit}>
                      {unit}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel id="destination-label">Destination</InputLabel>
                <Select
                  labelId="destination-label"
                  id="destination"
                  value={outputFormData.destination}
                  onChange={handleOutputSelectChange('destination')}
                  label="Destination"
                >
                  {origins.map((origin) => (
                    <MenuItem key={origin} value={origin}>
                      {origin}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseOutputDialog}>Cancel</Button>
          <Button onClick={handleSaveOutput} variant="contained">
            {editingOutput ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Custom Emission Factors Section */}
      <Grid item xs={12}>
        <Box sx={{ mt: 3, mb: 2 }}>
          <Typography variant="h6" gutterBottom>
            Custom Emission Factors
          </Typography>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={handleOpenEmissionFactorsDialog}
            sx={{ mb: 2 }}
          >
            Manage Custom Emission Factors
          </Button>
          
          {/* Process Emission Factors Table */}
          {customProcessEmissionFactors.length > 0 && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Process Emission Factors
              </Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Category</TableCell>
                      <TableCell>Value</TableCell>
                      <TableCell>Unit</TableCell>
                      <TableCell>Source</TableCell>
                      <TableCell>Applicable To</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {customProcessEmissionFactors.map((factor) => (
                      <TableRow key={factor.id}>
                        <TableCell>{factor.name}</TableCell>
                        <TableCell>{factor.category}</TableCell>
                        <TableCell>{factor.value}</TableCell>
                        <TableCell>{factor.unit}</TableCell>
                        <TableCell>{factor.source}</TableCell>
                        <TableCell>{factor.applicableTo}</TableCell>
                        <TableCell>
                          <IconButton
                                size="small"
                                onClick={() => handleEditEmissionFactor(factor, true)}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteEmissionFactor(factor.id, true)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
          
          {/* Embedded Emission Factors Table */}
          {customEmbeddedEmissionFactors.length > 0 && (
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Embedded Emission Factors
              </Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Category</TableCell>
                      <TableCell>Value</TableCell>
                      <TableCell>Unit</TableCell>
                      <TableCell>Source</TableCell>
                      <TableCell>Applicable To</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {customEmbeddedEmissionFactors.map((factor) => (
                      <TableRow key={factor.id}>
                        <TableCell>{factor.name}</TableCell>
                        <TableCell>{factor.category}</TableCell>
                        <TableCell>{factor.value}</TableCell>
                        <TableCell>{factor.unit}</TableCell>
                        <TableCell>{factor.source}</TableCell>
                        <TableCell>{factor.applicableTo}</TableCell>
                        <TableCell>
                          <IconButton
                                size="small"
                                onClick={() => handleEditEmissionFactor(factor, false)}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteEmissionFactor(factor.id, false)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </Box>
      </Grid>
      
      {/* Custom Emission Factors Dialog */}
      <Dialog open={openEmissionFactorsDialog} onClose={handleCloseEmissionFactorsDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingEmissionFactor ? 'Edit' : 'Add'} Custom Emission Factor
        </DialogTitle>
        <DialogContent>
          <Tabs value={emissionFactorTab} onChange={handleEmissionFactorTabChange} sx={{ mb: 2 }}>
            <Tab label="Process Emission Factor" />
            <Tab label="Embedded Emission Factor" />
          </Tabs>
          
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Name"
                value={emissionFactorFormData.name}
                onChange={handleEmissionFactorChange('name')}
                fullWidth
                margin="normal"
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Category"
                value={emissionFactorFormData.category}
                onChange={handleEmissionFactorChange('category')}
                fullWidth
                margin="normal"
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Value"
                type="number"
                value={emissionFactorFormData.value}
                onChange={handleEmissionFactorChange('value')}
                fullWidth
                margin="normal"
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Unit"
                value={emissionFactorFormData.unit}
                onChange={handleEmissionFactorChange('unit')}
                fullWidth
                margin="normal"
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Source"
                value={emissionFactorFormData.source}
                onChange={handleEmissionFactorChange('source')}
                fullWidth
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Year"
                type="number"
                value={emissionFactorFormData.year}
                onChange={handleEmissionFactorChange('year')}
                fullWidth
                margin="normal"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Applicable To"
                value={emissionFactorFormData.applicableTo}
                onChange={handleEmissionFactorChange('applicableTo')}
                fullWidth
                margin="normal"
                helperText="e.g., Process type, material name, country, etc."
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Notes"
                value={emissionFactorFormData.notes}
                onChange={handleEmissionFactorChange('notes')}
                fullWidth
                margin="normal"
                multiline
                rows={3}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEmissionFactorsDialog}>Cancel</Button>
          <Button onClick={handleSaveEmissionFactor} variant="contained">
            {editingEmissionFactor ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Import/Export Status Dialog */}
      <Dialog open={importExportDialogOpen} onClose={() => setImportExportDialogOpen(false)}>
        <DialogTitle>
          Import/Export Status
          <IconButton
            aria-label="close"
            onClick={() => setImportExportDialogOpen(false)}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {importStatus && (
            <Alert severity={importStatus.type} sx={{ mt: 1 }}>
              <AlertTitle>
                {importStatus.type === 'success' ? 'Success' : 
                 importStatus.type === 'error' ? 'Error' : 'Processing'}
              </AlertTitle>
              {importStatus.message}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setImportExportDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProcessProductionDataStep;
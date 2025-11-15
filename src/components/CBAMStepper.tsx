import React from 'react';
import { Stepper, Step, StepLabel, Box, Typography, Chip, Collapse, IconButton } from '@mui/material';
import { ExpandMore, ExpandLess, CheckCircle, Warning, Error } from '@mui/icons-material';
import { DataValidationStatus } from '../types/CBAMData';

interface StepGroup {
  id: string;
  title: string;
  description: string;
  steps: {
    id: number;
    label: string;
    shortLabel: string;
    description: string;
  }[];
}

interface CBAMStepperProps {
  activeStep: number;
  validationStatus: DataValidationStatus;
  onStepClick?: (step: number) => void;
  compact?: boolean;
}

const stepGroups: StepGroup[] = [
  {
    id: 'company',
    title: 'Osnovni podaci',
    description: 'Opći podaci o kompaniji i instalaciji',
    steps: [
      { id: 0, label: 'Podaci o kompaniji', shortLabel: 'Kompanija', description: 'Osnovni podaci o kompaniji' },
      
    ]
  },
  {
    id: 'instdata',
    title: 'Instalacijski podaci',
    description: 'Detaljni podaci o instalaciji iz predloška',
    steps: [
      { id: 1, label: 'Podaci o instalaciji', shortLabel: 'Podaci o instalaciji', description: 'Detaljni podaci o instalaciji' }
    ]
  },
  {
    id: 'processes',
    title: 'Procesi proizvodnje',
    description: 'Proizvodni procesi i emisije',
    steps: [
      { id: 2, label: 'Izvori emisija', shortLabel: 'Izvori emisija', description: 'Izvori emisija po instalacijama' },
      { id: 3, label: 'Bilans emisija', shortLabel: 'Bilans emisija', description: 'Sažetak emisija i bilans goriva (C)' },
      { id: 4, label: 'Energija i gorivo', shortLabel: 'Energija', description: 'Podaci o energiji i gorivu' },
      { id: 5, label: 'Proizvodnja', shortLabel: 'Proizvodnja', description: 'Detaljni procesi (D) i sažetak' }
    ]
  },
  {
    id: 'data',
    title: 'Energetski i proizvodni podaci',
    description: 'Podaci o energiji, gorivu i proizvodnji',
    steps: [
      { id: 6, label: 'Kupljeni prekursori', shortLabel: 'Prekursori', description: 'Kupljeni prekursori (E)' }
    ]
  },
  {
    id: 'results',
    title: 'Rezultati i izvoz',
    description: 'Pregled rezultata i izvoz podataka',
    steps: [
      { id: 7, label: 'Pregled i izvoz', shortLabel: 'Rezultati', description: 'Pregled rezultata i izvoz formata' }
    ]
  }
];

const CBAMStepper: React.FC<CBAMStepperProps> = ({ 
  activeStep, 
  validationStatus, 
  onStepClick,
  compact = false 
}) => {
  const [expandedGroups, setExpandedGroups] = React.useState<string[]>(
    stepGroups.map(group => group.id)
  );

  const toggleGroup = (groupId: string) => {
    setExpandedGroups(prev => 
      prev.includes(groupId) 
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId]
    );
  };

  const getStepStatus = (stepId: number) => {
    if (stepId === activeStep) return 'active';
    if (stepId < activeStep) return 'completed';
    return 'pending';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle color="success" sx={{ fontSize: 16 }} />;
      case 'active':
        return <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" />;
      default:
        return <div className="w-3 h-3 bg-gray-300 rounded-full" />;
    }
  };

  if (compact) {
    return (
      <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 2, boxShadow: 1 }}>
        <Stepper activeStep={activeStep} alternativeLabel>
          {stepGroups.flatMap(group => group.steps).map((step, index) => (
            <Step key={step.id}>
              <StepLabel 
                onClick={() => onStepClick?.(step.id)}
                sx={{ 
                  cursor: onStepClick ? 'pointer' : 'default',
                  '&:hover': { color: 'primary.main', textDecoration: 'underline' },
                  '& .MuiStepLabel-iconContainer': {
                    cursor: onStepClick ? 'pointer' : 'default',
                    borderRadius: '50%',
                    transition: 'all 0.2s ease'
                  },
                  '& .MuiStepLabel-iconContainer:hover svg': {
                    transform: 'scale(1.2)',
                    color: 'primary.main',
                    filter: 'drop-shadow(0 0 6px rgba(25,118,210,0.5))'
                  },
                  '& .MuiStepLabel-iconContainer svg': {
                    transition: 'transform 0.2s ease'
                  }
                }}
              >
                <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>
                  {step.shortLabel}
                </Typography>
              </StepLabel>
            </Step>
          ))}
        </Stepper>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, bgcolor: 'background.paper', borderRadius: 3, boxShadow: 2 }}>
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
        Progres CBAM izvještaja
      </Typography>
      
      {validationStatus.errors.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Chip 
            icon={<Error />}
            label={`${validationStatus.errors.length} grešaka`}
            color="error"
            size="small"
            sx={{ mr: 1 }}
          />
          {validationStatus.warnings.length > 0 && (
            <Chip 
              icon={<Warning />}
              label={`${validationStatus.warnings.length} upozorenja`}
              color="warning"
              size="small"
            />
          )}
        </Box>
      )}

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {stepGroups.map((group) => (
          <Box key={group.id} sx={{ border: 1, borderColor: 'divider', borderRadius: 2, overflow: 'hidden' }}>
            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                p: 2, 
                bgcolor: 'grey.50',
                cursor: 'pointer',
                '&:hover': { bgcolor: 'grey.100' }
              }}
              onClick={() => toggleGroup(group.id)}
            >
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  {group.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {group.description}
                </Typography>
              </Box>
              <IconButton size="small">
                {expandedGroups.includes(group.id) ? <ExpandLess /> : <ExpandMore />}
              </IconButton>
            </Box>
            
            <Collapse in={expandedGroups.includes(group.id)}>
              <Box sx={{ p: 2, bgcolor: 'background.default' }}>
                {group.steps.map((step) => {
                  const status = getStepStatus(step.id);
                  const isClickable = onStepClick && (status === 'completed' || status === 'pending');
                  
                  return (
                    <Box
                      key={step.id}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        p: 1.5,
                        mb: 1,
                        borderRadius: 1,
                        cursor: isClickable ? 'pointer' : 'default',
                        bgcolor: status === 'active' ? 'primary.light' : 'background.paper',
                        border: 1,
                        borderColor: status === 'active' ? 'primary.main' : 'divider',
                        '&:hover': isClickable ? { bgcolor: 'action.hover' } : {},
                        '&:hover .step-icon': { transform: 'scale(1.1)' },
                        transition: 'all 0.2s ease-in-out'
                      }}
                      onClick={() => isClickable && onStepClick?.(step.id)}
                    >
                      <Box sx={{ mr: 2, display: 'flex', alignItems: 'center', transition: 'transform 0.15s ease' }} className="step-icon">
                        {getStatusIcon(status)}
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            fontWeight: status === 'active' ? 600 : 400,
                            color: status === 'active' ? 'primary.main' : 'text.primary'
                          }}
                        >
                          {step.label}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {step.description}
                        </Typography>
                      </Box>
                      {status === 'completed' && (
                        <CheckCircle color="success" sx={{ fontSize: 16 }} />
                      )}
                    </Box>
                  );
                })}
              </Box>
            </Collapse>
          </Box>
        ))}
      </Box>

      <Box sx={{ mt: 3, p: 2, bgcolor: 'primary.light', borderRadius: 2 }}>
        <Typography variant="body2" sx={{ color: 'primary.dark', fontWeight: 500 }}>
          Korak {activeStep + 1} od {stepGroups.flatMap(g => g.steps).length}
        </Typography>
        <Typography variant="caption" sx={{ color: 'primary.dark' }}>
          {stepGroups.flatMap(g => g.steps)[activeStep]?.description}
        </Typography>
      </Box>
    </Box>
  );
};

export default CBAMStepper;
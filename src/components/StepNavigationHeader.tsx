import React, { useState } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Box, 
  IconButton, 
  Drawer,
  useTheme,
  useMediaQuery,
  Chip,
  Tooltip,
  LinearProgress,
  Button
} from '@mui/material';
import { 
  Menu as MenuIcon, 
  ChevronLeft, 
  ChevronRight,
  CheckCircle,
  Warning,
  Error,
  Dashboard,
  Assessment
} from '@mui/icons-material';
import CBAMStepper from './CBAMStepper';
import { DataValidationStatus } from '../types/CBAMData';

interface StepNavigationHeaderProps {
  activeStep: number;
  totalSteps: number;
  validationStatus: DataValidationStatus;
  onStepChange: (step: number) => void;
  onToggleDrawer?: () => void;
  title?: string;
  subtitle?: string;
}

const StepNavigationHeader: React.FC<StepNavigationHeaderProps> = ({
  activeStep,
  totalSteps,
  validationStatus,
  onStepChange,
  onToggleDrawer,
  title = 'CBAM čarobnjak komunikacijskog predloška',
  subtitle = 'Izrada izvještaja o ugrađenim emisijama'
}) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));

  const progressPercentage = ((activeStep + 1) / totalSteps) * 100;

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleStepClick = (step: number) => {
    onStepChange(step);
    if (isMobile) {
      setDrawerOpen(false);
    }
  };

  const getValidationSummary = () => {
    const totalIssues = validationStatus.errors.length + validationStatus.warnings.length;
    if (totalIssues === 0) {
      return { icon: <CheckCircle color="success" />, text: 'Svi podaci ispravni', color: 'success' };
    }
    if (validationStatus.errors.length > 0) {
      return { icon: <Error color="error" />, text: `${validationStatus.errors.length} grešaka`, color: 'error' };
    }
    return { icon: <Warning color="warning" />, text: `${validationStatus.warnings.length} upozorenja`, color: 'warning' };
  };

  const validationSummary = getValidationSummary();
  const maxTooltipItems = 5;
  const errorItems = (validationStatus.errors || []).slice(0, maxTooltipItems);
  const remainingSlots = Math.max(0, maxTooltipItems - errorItems.length);
  const warningItems = (validationStatus.warnings || []).slice(0, remainingSlots);
  const shownCount = errorItems.length + warningItems.length;
  const totalIssues = (validationStatus.errors || []).length + (validationStatus.warnings || []).length;
  const remainingCount = Math.max(0, totalIssues - shownCount);
  const tooltipTitle = (
    <Box sx={{ maxWidth: 360 }}>
      {errorItems.length > 0 && (
        <Box sx={{ mb: 0.5 }}>
          <Typography variant="caption" sx={{ fontWeight: 600 }}>Greške</Typography>
          {errorItems.map((msg, i) => (
            <Typography key={`err-${i}`} variant="caption" display="block">{msg}</Typography>
          ))}
        </Box>
      )}
      {warningItems.length > 0 && (
        <Box>
          <Typography variant="caption" sx={{ fontWeight: 600 }}>Upozorenja</Typography>
          {warningItems.map((msg, i) => (
            <Typography key={`warn-${i}`} variant="caption" display="block">{msg}</Typography>
          ))}
        </Box>
      )}
      {remainingCount > 0 && (
        <Typography variant="caption" display="block">{`+ još ${remainingCount}…`}</Typography>
      )}
    </Box>
  );

  return (
    <>
      <AppBar 
        position="sticky" 
        elevation={2}
        sx={{ 
          bgcolor: 'background.paper', 
          color: 'text.primary',
          borderBottom: 1,
          borderColor: 'divider'
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 1, sm: 2, md: 3 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
            <IconButton
              color="inherit"
              aria-label="toggle navigation"
              onClick={handleDrawerToggle}
              edge="start"
              sx={{ mr: 2, display: { lg: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
            
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography 
                variant="h6" 
                component="h1" 
                sx={{ 
                  fontWeight: 600,
                  fontSize: { xs: '1rem', sm: '1.25rem' },
                  color: 'primary.main'
                }}
                noWrap
              >
                {title}
              </Typography>
              <Typography 
                variant="body2" 
                color="text.secondary"
                sx={{ display: { xs: 'none', sm: 'block' } }}
                noWrap
              >
                {subtitle}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 } }}>
            <Tooltip title={`Korak ${activeStep + 1} od ${totalSteps}`}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Assessment color="primary" />
                <Typography variant="body2" sx={{ display: { xs: 'none', sm: 'block' } }}>
                  {activeStep + 1}/{totalSteps}
                </Typography>
              </Box>
            </Tooltip>

            <Tooltip title={totalIssues > 0 ? tooltipTitle : validationSummary.text}>
              <Chip
                icon={validationSummary.icon}
                label={validationSummary.text}
                color={validationSummary.color as any}
                size="small"
                sx={{ 
                  display: { xs: 'none', sm: 'flex' },
                  '& .MuiChip-icon': { fontSize: 16 }
                }}
              />
            </Tooltip>

            {onToggleDrawer && (
              <Tooltip title="Prikaži pregled">
                <IconButton onClick={onToggleDrawer} sx={{ display: { lg: 'none' } }}>
                  <Dashboard />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </Toolbar>

        <Box sx={{ px: { xs: 2, sm: 3, md: 4 }, pb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mr: 2 }}>
              Progres:
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {Math.round(progressPercentage)}%
            </Typography>
          </Box>
          <LinearProgress 
            variant="determinate" 
            value={progressPercentage}
            sx={{ 
              height: 8, 
              borderRadius: 4,
              bgcolor: 'grey.200',
              '& .MuiLinearProgress-bar': {
                borderRadius: 4,
                bgcolor: 'primary.main'
              }
            }}
          />
        </Box>

        {!isMobile && !isTablet && (
          <Box sx={{ px: { xs: 2, sm: 3, md: 4 }, pb: 2 }}>
            <CBAMStepper
              activeStep={activeStep}
              validationStatus={validationStatus}
              onStepClick={handleStepClick}
              compact={true}
            />
          </Box>
        )}
      </AppBar>

      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={handleDrawerToggle}
        variant={isMobile ? 'temporary' : 'persistent'}
        sx={{
          '& .MuiDrawer-paper': {
            width: { xs: '100%', sm: 400, md: 450 },
            boxSizing: 'border-box',
            bgcolor: 'background.default'
          }
        }}
      >
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Navigacija koraka
          </Typography>
          <IconButton onClick={handleDrawerToggle}>
            <ChevronLeft />
          </IconButton>
        </Box>
        
        <CBAMStepper
          activeStep={activeStep}
          validationStatus={validationStatus}
          onStepClick={handleStepClick}
        />

        <Box sx={{ p: 2, mt: 'auto' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Button
              variant="outlined"
              startIcon={<ChevronLeft />}
              onClick={() => handleStepClick(Math.max(0, activeStep - 1))}
              disabled={activeStep === 0}
              fullWidth
              sx={{ mr: 1 }}
            >
              Prethodni
            </Button>
            <Button
              variant="outlined"
              endIcon={<ChevronRight />}
              onClick={() => handleStepClick(Math.min(totalSteps - 1, activeStep + 1))}
              disabled={activeStep === totalSteps - 1}
              fullWidth
              sx={{ ml: 1 }}
            >
              Sljedeći
            </Button>
          </Box>
          
          <Button
            variant="contained"
            onClick={handleDrawerToggle}
            fullWidth
            startIcon={<Dashboard />}
          >
            Povratak na izvještaj
          </Button>
        </Box>
      </Drawer>
    </>
  );
};

export default StepNavigationHeader;

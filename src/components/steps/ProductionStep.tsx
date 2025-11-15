import React from 'react';
import { Box, Tabs, Tab } from '@mui/material';
import DProcessesStep from './DProcessesStep';
import ProcessProductionDataStep from './ProcessProductionDataStep';
import { DProcessesData } from '../../types/DProcessesTypes';
import { EmissionFactor, ProcessProductionData, DataValidationStatus } from '../../types/CBAMData';

interface ProductionStepProps {
  dData: DProcessesData;
  ppData: ProcessProductionData[];
  emissionFactors?: EmissionFactor[];
  validationStatus?: DataValidationStatus;
  onUpdateDProcesses: (data: DProcessesData) => void;
  onUpdateProcessProduction: (data: ProcessProductionData[]) => void;
}

const ProductionStep: React.FC<ProductionStepProps> = ({
  dData,
  ppData,
  emissionFactors = [],
  validationStatus,
  onUpdateDProcesses,
  onUpdateProcessProduction
}) => {
  const [tab, setTab] = React.useState(0);
  return (
    <Box>
      <Tabs value={tab} onChange={(_, v) => setTab(v)}>
        <Tab label="Detaljni procesi (D)" />
        <Tab label="Sažetak proizvodnje" />
      </Tabs>
      <Box sx={{ mt: 2 }}>
        {tab === 0 && (
          <DProcessesStep
            data={dData}
            onUpdate={onUpdateDProcesses}
            syncProcessProductionData={onUpdateProcessProduction}
          />
        )}
        {tab === 1 && (
          <ProcessProductionDataStep
            data={ppData}
            updateData={onUpdateProcessProduction}
            emissionFactors={emissionFactors}
            validationStatus={validationStatus}
          />
        )}
      </Box>
    </Box>
  );
};

export default ProductionStep;
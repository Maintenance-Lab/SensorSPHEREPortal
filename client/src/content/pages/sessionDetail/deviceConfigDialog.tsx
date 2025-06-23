import React from 'react';
import * as Icons from '@mui/icons-material';
import { TreeView } from '@mui/lab';
import { Dialog, DialogContent, Stepper, Step, StepLabel, Typography, Box, Button, CircularProgress
} from '@mui/material';

interface Props {
  open: boolean;
  device: string;
  activeStep: number;
  steps: string[];
  sampleRate: number | null;
  selectedProperties: string[];
  expandedNodes: string[];
  allProperties: any;
  renderTree: (data: any) => React.ReactNode;
  handleClose: () => void;
  handleNext: () => void;
  handleReconfigure: () => void;
  setExpandedNodes: (nodes: string[]) => void;
}

export const DeviceConfigDialog: React.FC<Props> = ({
  open,
  device,
  activeStep,
  steps,
  sampleRate,
  selectedProperties,
  expandedNodes,
  allProperties,
  renderTree,
  handleClose,
  handleNext,
  handleReconfigure,
  setExpandedNodes,
}) => {

  const deviceConfigTitle = (index: number) => {
    switch (index) {
      case 0:
        return 'Select properties to include in data collection';
      case 1:
        return (
          <>
            Testing for sample rate
            <br />
            <Typography variant="caption" color="textSecondary">
              This may take a few seconds.
            </Typography>
          </>
        );
      case 2:
        return 'Maximum sample rate of this device with selected properties';
    }
  };

  const deviceConfigContent = (index: number) => {
    switch (index) {
      case 0:
        return (
          <TreeView
            multiSelect
            defaultExpandIcon={<Icons.ChevronRight />}
            defaultCollapseIcon={<Icons.ExpandMore />}
            selected={selectedProperties}
            expanded={expandedNodes}
            onNodeToggle={(_, nodeIds) => setExpandedNodes(nodeIds)}
          >
            {allProperties && renderTree(allProperties)}
          </TreeView>
        );
      case 1:
        return <CircularProgress size={100} />;
      case 2:
        return (
          <Typography variant="h4" align="center" sx={{ mt: 2, mb: 1 }}>
            {sampleRate !== null ? `${sampleRate} Hz` : 'No sample rate found'}
          </Typography>
        );
    }
  };

  return (
    <Dialog open={open} maxWidth={false}>
      <DialogContent
        sx={{
          width: '50vw',
          height: '90vh',
          display: 'flex',
          flexDirection: 'column',
          '& .MuiDialog-paper': { width: '50vw', height: '90vh' },
        }}
      >
        <Box sx={{ position: 'sticky', top: 0, backgroundColor: 'white', zIndex: 10 }}>
          <Stepper activeStep={activeStep}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
          <Typography variant="h4" align="center" sx={{ mt: 2, mb: 1 }}>
            {deviceConfigTitle(activeStep)}
          </Typography>
        </Box>

        <Box
          sx={{
            flexGrow: 1,
            overflowY: 'auto',
            padding: 2,
            display: 'flex',
            justifyContent: activeStep === 0 ? 'flex-start' : 'center',
            alignItems: activeStep === 0 ? 'flex-start' : 'center',
          }}
        >
          <Box>{deviceConfigContent(activeStep)}</Box>
        </Box>

        <Box
          sx={{
            position: 'sticky',
            bottom: 0,
            backgroundColor: 'white',
            borderTop: '1px solid #ddd',
            padding: '8px',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 5,
          }}
        >
          {activeStep === 0 && (
            <Typography variant="caption" color="textSecondary" align="center" sx={{ mt: 1 }}>
              Proceeding will start testing for sample rate.
              <br />
              This may take a few seconds.
            </Typography>
          )}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              width: '100%',
            }}
          >
            {activeStep !== 1 && (
              <Button color="inherit" onClick={handleClose} sx={{ ml: 1 }}>
                Cancel
              </Button>
            )}
            {activeStep === 2 && (
              <Button onClick={handleReconfigure} sx={{ mr: 1 }}>
                Reconfigure
              </Button>
            )}
            {activeStep !== 1 && (
              <Button
                onClick={handleNext}
                sx={{ mr: 1 }}
                disabled={activeStep === steps.length - 1 && sampleRate == null}
              >
                {activeStep === steps.length - 1 ? 'Save' : 'Next'}
              </Button>
            )}
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default DeviceConfigDialog;





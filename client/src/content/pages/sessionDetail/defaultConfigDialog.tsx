import React from 'react';
import { Dialog, DialogContent, Typography, Box, Button, CircularProgress
} from '@mui/material';

interface DefaultConfigurationDialogProps {
  devices: any[];
  open: boolean;
  defaultConfigStep: number;
  sampleRates: (number | null)[];
  handleStartSession: (devices: any[]) => void;
  handleCloseDialog3: () => void;
}

const defaultConfigContent = (index: number, devices, sampleRates) => {
    switch (index) {
      case 0:
        return (
          <Box>
          <Typography variant="h5" align="center">
            Some Devices Are Not Configured
          </Typography>

          <Typography variant="body1" align="center" sx={{ mb: 2 }}>
            There {devices.length === 1 ? "is" : "are"} <strong>{devices.length}</strong> device
            {devices.length === 1 ? "" : "s"} without a sample rate configuration.
          </Typography>

          <Typography variant="body2" align="center" sx={{ mt: 1 }}>
            Proceeding will initiate the sample rate detection process. This step may take a few seconds to complete
          </Typography>
          </Box>
      );
      case 1:
        return (
          <CircularProgress size={100}/>
        )
      case 2:
        if (devices.length === 0 && sampleRates.every(rate => rate !== null)) {
          return (
            <Box>
              <Typography variant="h5" align="center" sx={{ mt: 2 }}>
                All devices have been successfully configured.
              </Typography>
              <Typography variant="h6" align="center" sx={{ mt: 3 }}>
                Please click ‘Start Session’ to continue.
              </Typography>
            </Box>
          );
        }
        return (
          <Box>
            <Typography variant="h4" align="center" sx={{ mt: 2, mb: 1 }}>Something went wrong</Typography>
          </Box>
        )
    }
  }

const DefaultConfigDialog: React.FC<DefaultConfigurationDialogProps> = ({
  devices, open, defaultConfigStep, sampleRates, handleStartSession, handleCloseDialog3,
}) => {
    const allSampleRatesValid = sampleRates.length > 0 && sampleRates.every(rate => rate !== null);

  return (
    <Dialog
      open={open}
      maxWidth="sm"
      fullWidth
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <DialogContent
        sx={{
          height: "auto",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          gap: 2,
        }}
      >

      <Box sx={{ display: "flex", justifyContent: defaultConfigStep === 0 ? "flex-start" : "center",
        alignItems: "center" }}>
        {defaultConfigContent(defaultConfigStep, devices, sampleRates)}
      </Box>
        {defaultConfigStep !== 1 && (
          <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}>
              <Button onClick={handleCloseDialog3}>Cancel</Button>
              <Button variant="contained" onClick={() => handleStartSession(devices)}>
                {defaultConfigStep === 0 ? "Continue" : allSampleRatesValid ? "Start Session" : "Try Again"}
              </Button>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default DefaultConfigDialog;








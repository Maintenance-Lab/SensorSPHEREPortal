import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from '@mui/material';

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirm: (sessionId: number) => void;
  sessionId: number;
}

const ConfirmationDialog: React.FC<Props> = ({ open, onClose, onConfirm, sessionId }) => (
  <Dialog open={open} onClose={onClose}>
    <DialogTitle>Confirm Deletion</DialogTitle>
    <DialogContent>
      <Typography>
        Are you sure you want to delete this session? This action cannot be undone.
      </Typography>
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose} color="primary">
        Cancel
      </Button>
      <Button
        onClick={() => {
          onConfirm(sessionId);
          onClose();
        }}
        color="error"
        variant="contained"
      >
        Delete
      </Button>
    </DialogActions>
  </Dialog>
);

export default ConfirmationDialog;








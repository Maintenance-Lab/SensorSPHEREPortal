import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from '@mui/material';

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirm: (sessionId: number) => void;
  sessionId: number;
  title?: string;
  message?: string;
  confirmLabel?: string;
}

const ConfirmationDialog: React.FC<Props> = ({
  open,
  onClose,
  onConfirm,
  sessionId,
  title = 'Confirm Deletion',
  message = 'Are you sure you want to delete this session? This action cannot be undone.',
  confirmLabel = 'Delete'
}) => (
  <Dialog open={open} onClose={onClose}>
    <DialogTitle>{title}</DialogTitle>
    <DialogContent>
      <Typography>{message}</Typography>
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
        {confirmLabel}
      </Button>
    </DialogActions>
  </Dialog>
);

export default ConfirmationDialog;








import { useState, MouseEvent, ChangeEvent, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  Grid,
  ListItem,
  List,
  ListItemText,
  Divider,
  Button,
  ListItemAvatar,
  Avatar,
  Switch,
  CardHeader,
  Tooltip,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  TableContainer,
  useTheme,
  styled,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Snackbar
} from '@mui/material';

import DoneTwoToneIcon from '@mui/icons-material/DoneTwoTone';
import DeleteTwoToneIcon from '@mui/icons-material/DeleteTwoTone';
import { useNavigate } from 'react-router-dom';
import MuiAlert from '@mui/material/Alert';
import zIndex from '@mui/material/styles/zIndex';

const ButtonError = styled(Button)(
  ({ theme }) => `
     background: ${theme.colors.error.main};
     color: ${theme.palette.error.contrastText};

     &:hover {
        background: ${theme.colors.error.dark};
     }
    `
);

const AvatarSuccess = styled(Avatar)(
  ({ theme }) => `
    background: ${theme.colors.success.light};
    width: ${theme.spacing(5)};
    height: ${theme.spacing(5)};
`
);

const AvatarWrapper = styled(Avatar)(
  ({ theme }) => `
    width: ${theme.spacing(5)};
    height: ${theme.spacing(5)};
`
);

interface SecurityTabProps {
  sessions: any;
}

function SecurityTab(props: SecurityTabProps) {
  const theme = useTheme();
  const navigate = useNavigate();

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sessions, setSessions] = useState(props.sessions);
  const [filteredSessions, setFilteredSessions] = useState<any[]>(
    sessions.length > rowsPerPage ? sessions.slice(0, rowsPerPage) : sessions
  );

  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmNewPass, setConfirmNewPass] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'info' | 'warning' | 'error';
    sx?: any;
  }>({ open: false, message: '', severity: 'success' });

  const [openPasswordDialog, setOpenPasswordDialog] = useState(false);

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handlePasswordDialogOpen = () => {
    setOpenPasswordDialog(true);
  };

  const handlePasswordDialogClose = () => {
    setOpenPasswordDialog(false);

    setCurrentPass('');
    setNewPass('');
    setConfirmNewPass('');
    setErrorMessage('');
  };

  const handleChangePassword = async () => {
    // if (newPass !== confirmNewPass) {
    //   setErrorMessage('New passwords do not match');
    //   return;
    // }
    // if (newPass === currentPass) {
    //   setErrorMessage('New password cannot be the same as the current password');
    //   return;
    // }
    // if (!newPass || !currentPass) {
    //   setErrorMessage('Current and new password required');
    //   return;
    // }
    const response = await fetch('/api/account/password', {
      method: 'POST',
      headers: { credentials: 'include', 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPass, newPass, confirmNewPass })
    });
    if (response.status == 401) navigate('/login');
    const data = await response.json();
    if (response.status == 200) {
      setSnackbar({
        open: true,
        message: 'Password updated successfully',
        severity: 'success'
      });
      setCurrentPass('');
      setNewPass('');
      setConfirmNewPass('');
      handlePasswordDialogClose();
    } else {
      setSnackbar({
        open: true,
        message: data.message || 'Failed to update password',
        severity: 'error',
        sx: { zIndex: 1300 }
      });
    }
  };

  const deleteSession = async (id: string) => {
    const response = await fetch(`/api/account/session/${id}`, {
      method: 'DELETE',
      headers: { credentials: 'include' }
    });
    if (response.status == 401) navigate('/login');
    return response.json();
  };

  useEffect(() => {
    setSessions(props.sessions);
  }, [props.sessions]);

  useEffect(() => {
    setFilteredSessions(
      sessions.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
    );
    console.log("sessions ", sessions);
    console.log("filteredSessions ", filteredSessions);
  }, [sessions, page, rowsPerPage]);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('action') === 'change') handlePasswordDialogOpen();
  }, []);

  const handleChangePage = (
    event: MouseEvent<HTMLButtonElement> | null,
    newPage: number
  ) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Box pb={2}>
          <Typography variant="h3">Security</Typography>
          <Typography variant="subtitle2">
            Change your security preferences below
          </Typography>
        </Box>
        <Card>
          <List>
            <ListItem sx={{ p: 3 }}>
              <ListItemText
                primaryTypographyProps={{ variant: 'h5', gutterBottom: true }}
                secondaryTypographyProps={{
                  variant: 'subtitle2',
                  lineHeight: 1
                }}
                primary="Change Password"
                secondary="You can change your password here"
              />
              <Button
                size="large"
                variant="outlined"
                onClick={handlePasswordDialogOpen}
              >
                Change password
              </Button>
            </ListItem>
          </List>
        </Card>
      </Grid>

      <Dialog open={openPasswordDialog} onClose={handlePasswordDialogClose}>
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Current Password"
            type="password"
            fullWidth
            value={currentPass}
            onChange={(e) => setCurrentPass(e.target.value)}
          />
          <TextField
            margin="dense"
            label="New Password"
            type="password"
            fullWidth
            value={newPass}
            onChange={(e) => setNewPass(e.target.value)}
          />
          <TextField
            margin="dense"
            label="Confirm New Password"
            type="password"
            fullWidth
            value={confirmNewPass}
            onChange={(e) => setConfirmNewPass(e.target.value)}
          />
          <Typography variant="caption" id="error-message" color="error" align="center">
              {errorMessage}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handlePasswordDialogClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleChangePassword} color="primary">
            Change Password
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <MuiAlert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          elevation={6}
          variant="filled"
        >
          {snackbar.message}
        </MuiAlert>
      </Snackbar>
    </Grid>
  );
}

export default SecurityTab;

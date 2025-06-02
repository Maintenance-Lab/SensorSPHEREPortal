import { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Button,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Switch,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
  Snackbar
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import { Theme } from '@mui/material/styles';
import { generateRandomString, isEmail } from 'src/Helpers/utils';
import { Helmet } from 'react-helmet-async';
import MuiAlert from '@mui/material/Alert';

const useStyles = makeStyles((theme: Theme) => ({
  toolbar: {
    display: 'flex',
    justifyContent: 'space-between',
    margin: theme.spacing(1)
  },
  table: {
    minWidth: 650
  },
  tableCellHeader: {
    fontWeight: 'bold',
    backgroundColor: theme.palette.action.hover
  },
  whiteInput: {
    color: '#fff',
    borderColor: '#fff',
    '& label.Mui-focused': {
      color: '#fff'
    },
    '& .MuiInput-underline:after': {
      borderBottomColor: '#fff'
    },
    '& .MuiOutlinedInput-root': {
      '& fieldset': {
        borderColor: '#fff'
      },
      '&:hover fieldset': {
        borderColor: '#fff'
      },
      '&.Mui-focused fieldset': {
        borderColor: '#fff'
      }
    }
  },
  whiteSelect: {
    color: '#fff',
    '& .MuiOutlinedInput-notchedOutline': {
      borderColor: '#fff'
    },
    '&:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: '#fff'
    },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: '#fff'
    },
    '& .MuiSvgIcon-root': {
      color: '#fff' // For the dropdown icon
    }
  }
}));

const fetchData = async () => {
  // Fetch data from your API or server
  const res = await fetch('/api/admin/accounts', {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    console.error('Failed to fetch data');
    return [];
  }
  const data = await res.json();
  if (!data.success) {
    console.error(data.error);
    return [];
  } else return data.accounts;
};

const ManageUsers = () => {
  const classes = useStyles();

  const [accounts, setAccounts] = useState([]);
  const [search, setSearch] = useState('');
  const [sortedAccounts, setSortedAccounts] = useState([]);
  const [sortCriteria, setSortCriteria] = useState('_id');
  const [open, setOpen] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    password: generateRandomString(8)
  });
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'info' | 'warning' | 'error';
  }>({ open: false, message: '', severity: 'success' });

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const updateAccount = async (id: number, update: any) => {
    const index = accounts.findIndex((account) => account.accountId === id);
    const account = accounts[index];
    if (!account) return;
    Object.assign(account, update);
    accounts[index] = account;
    setAccounts([...accounts]);

    fetch('/api/admin/accounts/update', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        _id: id,
        ...update
      })
    })
      .then((res) => res.json())
      .then((data) => {
        const { success, error } = data;
        if (!success) {
          console.error(error || 'Failed to update account');
          setSnackbar({
            open: true,
            message: error || 'Failed to update account',
            severity: 'error'
          });
        } else {
          setAccounts([...accounts]);
          const password = update?.password || '';
          setSnackbar({
            open: true,
            message: password
              ? `Password reset to ${password}`
              : 'Account updated successfully',
            severity: 'success'
          });
        }
      })
      .catch((error) => {
        console.error(error);
        setSnackbar({
          open: true,
          message: 'Failed to update account',
          severity: 'error'
        });
      });
  };

  const createAccount = async () => {
    const { name, email, role } = formData;
    if (!name || !email || !role) {
      setError('All fields are required');
      setSnackbar({
        open: true,
        message: 'All fields are required',
        severity: 'error'
      });
      return;
    }
    if (!isEmail(email)) {
      setError('Invalid email address');
      setSnackbar({
        open: true,
        message: 'Invalid email address',
        severity: 'error'
      });
      return;
    }

    fetch('/api/admin/accounts/create', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...formData
      })
    })
      .then((res) => res.json())
      .then((data) => {
        const { success, error, account } = data;
        if (success) {
          handleClose();
          setAccounts([...accounts, account]);
          setFormData({
            name: '',
            email: '',
            role: '',
            password: generateRandomString(8)
          });
          setSnackbar({
            open: true,
            message: 'Account created successfully',
            severity: 'success'
          });
        } else {
          setError(error || 'Failed to create account');
          setSnackbar({
            open: true,
            message: error || 'Failed to create account',
            severity: 'error'
          });
        }
      })
      .catch((error) => {
        console.error(error);
        setSnackbar({
          open: true,
          message: 'Failed to create account',
          severity: 'error'
        });
      });
  };

  const handleResetPassword = (id: number) => {
    const password = generateRandomString(8);
    updateAccount(id, { password, hasChangedPassword: false });
  };

  const handleToggleEnabled = (id: number, currentVal: boolean) => {
    updateAccount(id, { enabled: !currentVal });
  };

  const handleRoleChange = (id: number, role: string) => {
    updateAccount(id, { role });
  };

  const handleSearch = (e: any) => setSearch(e.target.value);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setError('');
    setOpen(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value
    }));
  };

  useEffect(() => {
    fetchData().then((data) => setAccounts(data));
  }, []);

  useEffect(() => {
    accounts.sort((a, b) => {
      let returnvalue = 0;
      if (a[sortCriteria] < b[sortCriteria]) returnvalue = -1;
      if (a[sortCriteria] > b[sortCriteria]) returnvalue = 1;
      if (typeof a[sortCriteria] === 'boolean') returnvalue *= -1;

      return returnvalue;
    });
    const filteredAccounts = accounts.filter((account) =>
      Object.values(account).join(' ').includes(search)
    );
    setSortedAccounts([...filteredAccounts]);
  }, [sortCriteria, accounts, search]);

  return (
    <div>
      <Helmet>
        <title>Manage Users</title>
      </Helmet>
      <AppBar position="static">
        <Toolbar className={classes.toolbar}>
          <Button color="inherit" variant="outlined" onClick={handleClickOpen}>
            Create Account
          </Button>
          <TextField
            label="Search"
            variant="outlined"
            className={classes.whiteInput}
            InputLabelProps={{
              style: { color: '#fff' } // Label style
            }}
            InputProps={{
              style: { color: '#fff' } // Input text style
            }}
            onChange={handleSearch}
          />
          <FormControl
            variant="outlined"
            style={{ minWidth: 120 }}
            className={classes.whiteSelect}
          >
            <InputLabel style={{ color: '#fff' }}>Sort by</InputLabel>
            <Select
              value={sortCriteria}
              onChange={(e) => setSortCriteria(e.target.value)}
              label="Sort by"
            >
              <MenuItem value="_id">ID</MenuItem>
              <MenuItem value="role">Role</MenuItem>
              <MenuItem value="hasChangedPassword">
                Has Changed Password
              </MenuItem>
              <MenuItem value="createdBy">Created By</MenuItem>
              <MenuItem value="createdAt">Created At</MenuItem>
              <MenuItem value="email">Email</MenuItem>
              <MenuItem value="name">Name</MenuItem>
            </Select>
          </FormControl>
        </Toolbar>
      </AppBar>

      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="form-dialog-title"
      >
        <DialogTitle id="form-dialog-title">Create Account</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="name"
            name="name"
            label="Name"
            type="text"
            fullWidth
            value={formData.name}
            onChange={handleChange}
          />
          <TextField
            margin="dense"
            id="email"
            name="email"
            label="Email"
            type="email"
            fullWidth
            value={formData.email}
            onChange={handleChange}
          />
          <FormControl fullWidth margin="dense">
            <InputLabel id="role-label">Role</InputLabel>
            <Select
              labelId="role-label"
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              label="Role"
            >
              <MenuItem value="administrator">Administrator</MenuItem>
              <MenuItem value="student">Student</MenuItem>
              <MenuItem value="teacher">Teacher</MenuItem>
              <MenuItem value="staff">Staff</MenuItem>
            </Select>
            <TextField
              margin="dense"
              id="password"
              name="password"
              label="Password"
              type="text"
              fullWidth
              value={formData.password}
              onChange={handleChange}
            />
            <Typography color="error">{error}</Typography>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Cancel
          </Button>
          <Button onClick={createAccount} color="primary">
            Create
          </Button>
        </DialogActions>
      </Dialog>

      <TableContainer component={Paper}>
        <Table className={classes.table} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell className={classes.tableCellHeader}>Name</TableCell>
              <TableCell className={classes.tableCellHeader}>Email</TableCell>
              <TableCell className={classes.tableCellHeader}>Enabled</TableCell>
              <TableCell className={classes.tableCellHeader}>Role</TableCell>
              <TableCell className={classes.tableCellHeader}>
                Created By
              </TableCell>
              <TableCell className={classes.tableCellHeader}>
                Created At
              </TableCell>
              <TableCell className={classes.tableCellHeader}>
                Reset Password
              </TableCell>
              {/* <TableCell className={classes.tableCellHeader}>
                Has Avatar
              </TableCell> */}
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedAccounts.map((account, index) => (
              <TableRow key={index}>
                <TableCell>{account.name}</TableCell>
                <TableCell>{account.email}</TableCell>
                <TableCell>
                  <Switch
                    checked={account.enabled}
                    onChange={() =>
                      handleToggleEnabled(account._id, account.enabled)
                    }
                  />
                </TableCell>
                <TableCell>
                  <FormControl variant="outlined" fullWidth>
                    <Select
                      value={account.role}
                      onChange={(e) =>
                        handleRoleChange(account._id, e.target.value)
                      }
                    >
                      <MenuItem value="administrator">Administrator</MenuItem>
                      <MenuItem value="student">Student</MenuItem>
                      <MenuItem value="teacher">Teacher</MenuItem>
                      <MenuItem value="staff">Staff</MenuItem>
                    </Select>
                  </FormControl>
                </TableCell>
                <TableCell>{account?.createdBy || 'Unknown'}</TableCell>
                <TableCell>
                  {new Date(account.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Button onClick={() => handleResetPassword(account._id)}>
                    Reset
                  </Button>
                </TableCell>
                {/* <TableCell>
                  {account.hasAvatar ? (
                    <Button onClick={() => handleRemoveAvatar(account._id)}>
                      Remove Avatar
                    </Button>
                  ) : (
                    'No'
                  )}
                </TableCell> */}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

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
    </div>
  );
};

export default ManageUsers;

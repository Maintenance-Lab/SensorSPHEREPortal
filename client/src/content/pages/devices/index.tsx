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
  Snackbar,
  Container,
  Modal,
  Box,
  Grid,
  Autocomplete,
  styled,
  Popper,
  Divider
} from '@mui/material';
import { Helmet } from 'react-helmet-async';
import PageTitleWrapper from 'src/Components/PageTitleWrapper';
import BatteryFullIcon from '@mui/icons-material/BatteryFull';
import Stack from '@mui/material/Stack';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import { DataGrid, GridColDef, GridRowsProp } from '@mui/x-data-grid';
import { id } from 'date-fns/locale';

// const useStyles = makeStyles((theme: Theme) => ({

// }));

const DeviceStatus = ({ status, project, session }) => {
  let statusColor = '';
  let statusLabel = '';

  switch (status) {
    case 'takenFinished':
      statusColor = 'success.main';
      statusLabel = 'Finished Collecting Data';
      break;
    case 'takenCollecting':
      statusColor = 'primary.main';
      statusLabel = 'Collecting Data';
      break;
    case 'takenInactive':
      statusColor = '';
      statusLabel = 'Inactive';
      break;
    case 'unavailable':
      statusColor = 'gray';
      statusLabel = 'Unavailable';
      break;
    default:
      statusColor = '';
      statusLabel = 'Available';
  }

  return (
    <Stack direction="row" spacing={1} sx={{ color: statusColor }} alignItems="center">
      {status === 'takenFinished' && (<CheckCircleIcon fontSize="small" />)}
      {status === 'takenCollecting' && (<MoreHorizIcon fontSize="small" />)}
      <Typography variant="inherit" sx={{ fontWeight: 600 }}>
        {statusLabel}
      </Typography>
      {/* {session && (
        <Typography variant="inherit">{session}</Typography>
      )} */}
      
      {project && (
        <Typography variant="inherit">{project}</Typography>
      )}
    </Stack>
  );
};

const devicesPlaceholder = [
  {
    id: 1,
    name: 'Device 1',
    type: 'M5Stack Core2',
    macAddress: '00:00:00:00:00:01',
    battery: '100',
    project: '',
    session: '',
    status: 'available'
  },
  {
    id: 2,
    name: 'Device 2',
    type: 'M5Stack Core2',
    macAddress: '00:00:00:00:00:02',
    battery: '100',
    project: 'Project 1',
    session: 'Test collection',
    status: 'takenFinished'
  },
  {
    id: 3,
    name: 'Device 3',
    type: 'M5Stack Core2',
    macAddress: '00:00:00:00:00:03',
    battery: '100',
    project: 'Building Temperature Research',
    session: 'Session #2',
    status: 'takenCollecting'
  },
  {
    id: 4,
    name: 'Device 4',
    type: 'M5Stack Core2',
    macAddress: '00:00:00:00:00:04',
    battery: '100',
    project: 'Project 3',
    session: '',
    status: 'takenInactive'
  },
  {
    id: 5,
    name: 'Device 5',
    type: 'M5Stack Core2',
    macAddress: '00:00:00:00:00:05',
    battery: '100',
    project: '',
    session: '',
    status: 'unavailable'
  }
];

const devicesColumns: GridColDef[] = [
  { field: 'id', headerName: '#' },
  { field: 'name', headerName: 'Name' },
  { field: 'type', headerName: 'Type' },
  { field: 'macAddress', headerName: 'MAC Address' },
  {
    field: 'battery', headerName: 'Battery', renderCell: (params) => (
      <Stack direction="row" alignItems="center">
        <BatteryFullIcon fontSize="small" />
        <Typography variant="inherit">{params.value}%</Typography>
      </Stack>
    )
  },
  {
    field: 'status',
    headerName: 'Status',
    renderCell: (params) => (
      <DeviceStatus status={params.value} project={params.row.project} session={params.row.session} />
    )
  }
];

const devicesRows: GridRowsProp = devicesPlaceholder.map((device) => ({
  id: device.id,
  name: device.name,
  type: device.type,
  macAddress: device.macAddress,
  battery: device.battery,
  status: device.status,
  project: device.project,
  session: device.session,
}));

const Devices = () => {
  const [overlayFindDevice, setOverlayFindDevice] = useState(false);

  const handleOpenFindDevice = () => setOverlayFindDevice(true);
  const handleCloseFindDevice = () => setOverlayFindDevice(false);

  return (
    <div>
      <Helmet>
        <title>All Devices</title>
      </Helmet>
      <PageTitleWrapper>
        <Typography variant="h1">All Devices</Typography>
        <Stack direction="row" spacing={2} sx={{ paddingTop: 2 }}>
          <Button variant="outlined" color="primary" onClick={handleOpenFindDevice} size="small">
            <SearchIcon />
            Find Device
          </Button>
          <Dialog
            open={overlayFindDevice}
            onClose={handleCloseFindDevice}
            maxWidth="md"
            fullWidth
          >
            <DialogTitle id="modal-modal-title">Find Device</DialogTitle>
            <DialogContent>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="h5" >
                    Tap <span style={{ color: '#3267A6' }}>Automatic</span> on the screen of the device.
                  </Typography>
                  <Typography variant="body1">
                    The device will show up in the list below.
                  </Typography>
                  <Divider sx={{ my: 1 }} />
                  <Stack direction="row" spacing={1}>
                    <MoreHorizIcon />
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      Searching For Devices
                    </Typography>
                  </Stack>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="h5">
                    Find by MAC Address
                  </Typography>
                  <Typography variant="body1">
                    The MAC address is displayed on the screen of the device.
                  </Typography>
                  <Divider sx={{ my: 1 }} />
                  <Autocomplete
                    id="combo-box-demo"
                    options={devicesPlaceholder.map((device) => device.macAddress)}
                    renderInput={(params) => <TextField {...params} label="MAC Address" />}
                  />
                </Grid>
              </Grid>
            </DialogContent>
          </Dialog>
          <Button variant="outlined" color="primary" size="small">
            <AddIcon />
            Add To Project
          </Button>
          <TextField id="outlined-basic" label="Search" variant="outlined" size="small" />
        </Stack>
      </PageTitleWrapper>
      <Container>
          <Paper>
            <DataGrid
              rows={devicesRows}
              columns={devicesColumns}
              density="compact"
              autosizeOnMount
              autosizeOptions={{
                includeOutliers: true
              }}
              autoHeight
            />
          </Paper>
      </Container>
    </div>
  );
};

export default Devices;

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
    <Stack spacing={1} sx={{ color: statusColor }}>
      <Stack direction="row" spacing={1}>
        {status === 'takenFinished' && (<CheckCircleIcon />)}
        {status === 'takenCollecting' && (<MoreHorizIcon />)}
        <Typography variant="body1" sx={{ fontWeight: 600 }}>
          {statusLabel}
        </Typography>
        {(status === 'takenCollecting' || status === 'takenFinished' || status === 'takenInactive') && (
          <Typography variant="body1">{session}</Typography>
        )}
      </Stack>
      {status !== 'available' && status !== 'unavailable' && (
        <Typography variant="body2">{project}</Typography>
      )}
    </Stack>
  );
};

const Devices = () => {
  // const classes = useStyles();

  const [sortedDevices, setSortedDevices] = useState([]);

  const [overlayFindDevice, setOverlayFindDevice] = useState(false);

  const handleOpenFindDevice = () => setOverlayFindDevice(true);
  const handleCloseFindDevice = () => setOverlayFindDevice(false);

  // Placeholder data for 5 devices
  const devicesPlaceholder = [
    {
      name: 'Device 1',
      type: 'M5Stack Core2',
      macAddress: '00:00:00:00:00:01',
      battery: '100',
      project: '',
      session: '',
      status: 'available'
    },
    {
      name: 'Device 2',
      type: 'M5Stack Core2',
      macAddress: '00:00:00:00:00:02',
      battery: '100',
      project: 'Project 1',
      session: 'Test collection',
      status: 'takenFinished'
    },
    {
      name: 'Device 3',
      type: 'M5Stack Core2',
      macAddress: '00:00:00:00:00:03',
      battery: '100',
      project: 'Building Temperature Research',
      session: 'Session #2',
      status: 'takenCollecting'
    },
    {
      name: 'Device 4',
      type: 'M5Stack Core2',
      macAddress: '00:00:00:00:00:04',
      battery: '100',
      project: 'Project 3',
      session: '',
      status: 'takenInactive'
    },
    {
      name: 'Device 5',
      type: 'M5Stack Core2',
      macAddress: '00:00:00:00:00:05',
      battery: '100',
      project: '',
      session: '',
      status: 'unavailable'
    }
  ];

  useEffect(() => {
    setSortedDevices(devicesPlaceholder);
  }, []);



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
        <Box sx={{paddingInline: 4}}>
          <TableContainer component={Paper}>
            <Table aria-label="simple table">
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>MAC Address</TableCell>
                  <TableCell>Battery</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sortedDevices.map((device, index) => (
                  <TableRow key={index}>
                    <TableCell>{device.name}</TableCell>
                    <TableCell>{device.type}</TableCell>
                    <TableCell>{device.macAddress}</TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                        <BatteryFullIcon /> {device.battery}%
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <DeviceStatus
                        status={device.status}
                        project={device.project}
                        session={device.session}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Container>
    </div>
  );
};

export default Devices;

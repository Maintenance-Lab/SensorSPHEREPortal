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
  Container
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

  // Placeholder data for 3 devices
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
      project: 'Project 2',
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
      project: 'Project 4',
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
      </PageTitleWrapper>
      <Container>
        <Stack direction="column" spacing={2}>
          <Stack direction="row" spacing={2}>
            <Button variant="outlined" color="primary">
              <SearchIcon />
              Find Device
            </Button>
            <Button variant="outlined" color="primary">
              <AddIcon />
              Add To Project
            </Button>
            <TextField id="outlined-basic" label="Search" variant="outlined" />
          </Stack>
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
                      <DeviceStatus status={device.status} project={device.project} session={device.session}/>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Stack>
      </Container>
    </div>
  );
};

export default Devices;

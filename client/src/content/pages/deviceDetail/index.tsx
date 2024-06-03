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

const DeviceStatus = ({ status, project }) => {
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
      </Stack>
    </Stack>
  );
};

const DeviceDetail = () => {

  // Placeholder data for device
  const devicePlaceholder = {
    name: 'Device 3',
    type: 'M5Stack Core2',
    macAddress: '00:00:00:00:00:03',
    battery: '100',
    project: 'Building Temperature Research',
    status: 'takenCollecting'
  }

  return (
    <div>
      <Helmet>
        <title>{devicePlaceholder.name}</title>
      </Helmet>
      <PageTitleWrapper>
        <Stack spacing={1}>
          <Typography variant="h1">
            {devicePlaceholder.name}
          </Typography>
          <Stack direction="row" spacing={1}>
            <Typography variant="body1">{devicePlaceholder.type}</Typography>
            <Divider orientation="vertical" flexItem />
            <Typography variant="body1">{devicePlaceholder.macAddress}</Typography>
            <Divider orientation="vertical" flexItem />
            <Stack direction="row">
              <BatteryFullIcon />
              <Typography variant="body1">{devicePlaceholder.battery}%</Typography>
            </Stack>
            <Divider orientation="vertical" flexItem />
            <DeviceStatus status={devicePlaceholder.status} project={devicePlaceholder.project} />
          </Stack>
        </Stack>
      </PageTitleWrapper>
      <Container>
        <Typography variant="h2">Status (Placeholder)</Typography>
        <Typography variant="h2">Sensors</Typography>
        <Typography variant="h2">Sessions</Typography>
      </Container>
    </div>
  );
};

export default DeviceDetail;

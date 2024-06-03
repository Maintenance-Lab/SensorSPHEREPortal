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
import PlaylistAddOutlinedIcon from '@mui/icons-material/PlaylistAddOutlined';

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
      statusLabel = 'Unknown';
  }

  return (
    <Stack spacing={1} sx={{ color: statusColor }}>
      <Stack direction="row" spacing={1} alignItems="center">
        {status === 'takenFinished' && (<CheckCircleIcon />)}
        {status === 'takenCollecting' && (<MoreHorizIcon />)}
        <Typography variant="inherit" sx={{ fontWeight: 600 }}>
          {statusLabel}
        </Typography>
      </Stack>
    </Stack>
  );
};

const sensorsPlaceholder = [
  {
    id: 1,
    name: 'Air Quality Sensor',
    type: 'ABC123',
    outputs: ['co2', 'pm2.5']
  },
  {
    id: 2,
    name: 'Temperature Sensor',
    type: 'DEF456',
    outputs: ['temperature']
  }
]

const sensorColumns: GridColDef[] = [
  { field: 'id', headerName: '#' },
  { field: 'name', headerName: 'Name' },
  { field: 'type', headerName: 'Type' },
  { field: 'outputs', headerName: 'Outputs' },
];

const sensorRows: GridRowsProp = sensorsPlaceholder.map((sensor) => ({
  id: sensor.id,
  name: sensor.name,
  type: sensor.type,
  outputs: sensor.outputs.join(', '),
}));

const sessionsPlaceholder = [
  {
    id: 1,
    name: 'Session #1',
    status: 'takenFinished'
  },
  {
    id: 2,
    name: 'Session #2',
    status: 'takenCollecting'
  }
];

const sessionColumns: GridColDef[] = [
  { field: 'id', headerName: '#' },
  { field: 'name', headerName: 'Name' },
  {
    field: 'status',
    headerName: 'Status',
    renderCell: (params) => (
      <DeviceStatus status={params.value} project="" />
    )
  }
];

const sessionRows: GridRowsProp = sessionsPlaceholder.map((session) => ({
  id: session.id,
  name: session.name,
  status: session.status
}));

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
        <Stack spacing={2}>
          <Typography variant="h1">
            {devicePlaceholder.name}
          </Typography>
          <Stack
            direction="row"
            spacing={2}
            divider={<Divider orientation="vertical" flexItem />}
          >
            <Typography variant="body1">{devicePlaceholder.type}</Typography>
            <Typography variant="body1">{devicePlaceholder.macAddress}</Typography>
            <Stack direction="row">
              <BatteryFullIcon />
              <Typography variant="body1">{devicePlaceholder.battery}%</Typography>
            </Stack>
            <DeviceStatus status={devicePlaceholder.status} project={devicePlaceholder.project} />
          </Stack>
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" color="primary" size="small" startIcon={<AddIcon />}>
              Create New Session
            </Button>
            <Button variant="outlined" color="primary" size="small" startIcon={<PlaylistAddOutlinedIcon />}>
              Add To Project
            </Button>
          </Stack>
        </Stack>
      </PageTitleWrapper>
      <Container>
        <Stack spacing={2}>
          {/* <Typography variant="h2">Status (Placeholder)</Typography> */}
          <Typography variant="h2" sx={{ paddingInline: 4 }}>Sensors</Typography>
          <Paper>
            <DataGrid
              rows={sensorRows}
              columns={sensorColumns}
              initialState={{
                pagination: { paginationModel: { pageSize: 25 } },
              }}
              density="compact"
              autosizeOnMount
            />
          </Paper>
          <Typography variant="h2" sx={{ pt: 2, paddingInline: 4 }}>Sessions</Typography>
          <Paper>
            <DataGrid
              rows={sessionRows}
              columns={sessionColumns}
              initialState={{
                pagination: { paginationModel: { pageSize: 25 } },
                sorting: {
                  sortModel: [{ field: 'id', sort: 'desc' }],
                },
              }}
              density="compact"
              autosizeOnMount
            />
          </Paper>
        </Stack>
      </Container>

    </div>
  );
};

export default DeviceDetail;

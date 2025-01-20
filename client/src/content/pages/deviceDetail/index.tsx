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
  Chip,
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
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';

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
    name: 'ENV3',
    outputs: {
      t: '123456789',
      hu: '30.31323334',
      te: '24.69420'
    }
  },
  {
    id: 2,
    name: 'IMU',
    outputs: {
      accX: '0.123456789',
      accY: '0.31323334',
      accZ: '0.69420',
      gyroX: '0.123456789',
      gyroY: '0.31323334',
      gyroZ: '0.69420',
      temp: '24.69420'
    }
  }
]

const sensorColumns: GridColDef[] = [
  { field: 'name', headerName: 'Name', flex: 1 },
  {
    field: 'outputs',
    headerName: 'Outputs',
    renderCell: (params) => (
      <TableContainer >
        <Table size="small">
          <TableBody>
            {Object.keys(params.value).map((key) => (
              <TableRow key={key}>
                <TableCell sx={{ fontWeight: '600' }}>{key}</TableCell>
                <TableCell>{params.value[key]}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    ),
    flex: 1
  },
];

const sensorRows: GridRowsProp = sensorsPlaceholder.map((sensor) => ({
  id: sensor.id,
  name: sensor.name,
  outputs: sensor.outputs,
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
  { field: 'name', headerName: 'Name', flex: 1 },
  {
    field: 'status',
    headerName: 'Status',
    renderCell: (params) => (
      <DeviceStatus status={params.value} project="" />
    ),
    flex: 1
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
        <Stack spacing={1}>
          <Stack direction="row" spacing={2}>
            <Typography variant="h1">
              {devicePlaceholder.name}
            </Typography>
            <Button variant="text" color="secondary" size="medium" startIcon={<EditOutlinedIcon />}>
              Add Label
            </Button>
          </Stack>
          <Stack
            direction="row"
            spacing={1}
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
            <Button variant="outlined" color="primary" size="medium" startIcon={<PlaylistAddOutlinedIcon />}>
              Add To Project
            </Button>
          </Stack>
        </Stack>
      </PageTitleWrapper>
      <Container>
        <Stack spacing={2}>
          {/* <Typography variant="h2">Status (Placeholder)</Typography> */}
          <Typography variant="h2">Sensors</Typography>
          <Paper>
            <DataGrid
              rows={sensorRows}
              columns={sensorColumns}
              initialState={{
                pagination: { paginationModel: { pageSize: 25 } },
              }}
              density="compact"
              autosizeOnMount
              autosizeOptions={{
                includeOutliers: true
              }}
              getRowHeight={() => 'auto'}
              sx={{
                '&.MuiDataGrid-root .MuiDataGrid-cell': { py: 1 }
              }}
            />
          </Paper>
          <Typography variant="h2" sx={{ pt: 2 }}>Sessions</Typography>
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" color="primary" size="medium" startIcon={<AddIcon />}>
              Create New Session
            </Button>
            <TextField id="outlined-basic" label="Search" variant="outlined" size="small" />
          </Stack>
          <Paper>
            <DataGrid
              rows={sessionRows}
              columns={sessionColumns}
              initialState={{
                pagination: { paginationModel: { pageSize: 25 } },
              }}
              density="compact"
              autosizeOnMount
              autosizeOptions={{
                includeOutliers: true
              }}
            />
          </Paper>
        </Stack>
      </Container>

    </div>
  );
};

export default DeviceDetail;

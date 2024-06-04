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
import AccountTreeOutlinedIcon from '@mui/icons-material/AccountTreeOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';

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

const devicesPlaceholder = [
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
]

const deviceColumns: GridColDef[] = [
  { field: 'id', headerName: '#' },
  { field: 'name', headerName: 'Name' },
  { field: 'type', headerName: 'Type' },
  { field: 'macAddress', headerName: 'MAC Address' },
  { field: 'battery', headerName: 'Battery', renderCell: (params) => (
    <Stack direction="row" alignItems="center">
      <BatteryFullIcon />
      <Typography variant="inherit">{params.value}%</Typography>
    </Stack>
  ) },
  {
    field: 'status',
    headerName: 'Status',
    renderCell: (params) => (
      <DeviceStatus status={params.value} project="" />
    )
  }
];

const deviceRows: GridRowsProp = devicesPlaceholder.map((device) => ({
  id: device.id,
  name: device.name,
  type: device.type,
  macAddress: device.macAddress,
  battery: device.battery,
  project: device.project,
  session: device.session,
  status: device.status
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

const ProjectDetail = () => {

  // Placeholder data for project
  const projectPlaceholder = {
    name: 'Building Temperature Research',
    description: 'Researching the temperature of buildings on campus. Part of thesis project.'
  }

  return (
    <div>
      <Helmet>
        <title>{projectPlaceholder.name}</title>
      </Helmet>
      <PageTitleWrapper>
        <Stack spacing={2}>
          <Typography variant="h1">
            {projectPlaceholder.name}
          </Typography>
          <Typography variant="body1">
            {projectPlaceholder.description}
          </Typography>
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" color="primary" size="small" startIcon={<AccountTreeOutlinedIcon />}>
              Add Devices
            </Button>
            <Button variant="outlined" color="primary" size="small" startIcon={<PlaylistAddOutlinedIcon />}>
              Create New Session
            </Button>
            {/* Delete button */}
            <Button variant="outlined" color="primary" size="small" startIcon={<DeleteOutlineOutlinedIcon />}>
              Delete Project
            </Button>
          </Stack>
        </Stack>
      </PageTitleWrapper>
      <Container>
        <Stack spacing={2}>
          <Typography variant="h2">Devices</Typography>
          <Paper>
            <DataGrid
              rows={deviceRows}
              columns={deviceColumns}
              initialState={{
                pagination: { paginationModel: { pageSize: 25 } },
              }}
              density="compact"
              autosizeOnMount
            />
          </Paper>
          <Typography variant="h2" sx={{ pt: 2 }}>Sessions</Typography>
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

export default ProjectDetail;

import { useState, useEffect } from 'react';
import {
  Button,
  TextField,
  Link,
  Paper,
  Typography,
  Container,
  Box,
  Divider
} from '@mui/material';
import { Helmet } from 'react-helmet-async';
import PageTitleWrapper from 'src/Components/PageTitleWrapper';
import BatteryFullIcon from '@mui/icons-material/BatteryFull';
import Stack from '@mui/material/Stack';
import { useParams } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import { DataGrid, GridColDef, GridRowsProp } from '@mui/x-data-grid';
import FaceIcon from '@mui/icons-material/Face';
import GroupAddOutlinedIcon from '@mui/icons-material/GroupAddOutlined';
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
  {
    field: 'battery', headerName: 'Battery', renderCell: (params) => (
      <Stack direction="row" alignItems="center">
        <BatteryFullIcon />
        <Typography variant="inherit">{params.value}%</Typography>
      </Stack>
    )
  },
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
    description: 'Researching the temperature of buildings on campus. Part of thesis project.',
    status: 'collecting'
  }

  const { projectId } = useParams();
  const [projectName, setProjectName] = useState('');
  const [isEditingName, setIsEditingName] = useState(false);

  const fetchProject = async () => {
    const res = await fetch('/api/projects/id/' + projectId, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        credentials: 'include'
      }
    });

    if (!res.ok) {
      console.error('Failed to fetch data');
      return [];
    }
    const data = await res.json();
    return data;
  }

  useEffect(() => {
    fetchProject().then((project) => {
      setProjectName(project.name);
    });
  });

  return (
    <div>
      <Helmet>
        <title>{projectName}</title>
      </Helmet>
      <PageTitleWrapper>
        <Stack spacing={1} >
          {isEditingName ? (
            <Box>
              <TextField
                id="project-name"
                defaultValue={projectName}
                variant="outlined"
                color="primary"
                focused
                size="small"
                autoFocus
                // onChange={(event) => setProjectName(event.target.value)}
                onBlur={() => setIsEditingName(false)}
                sx={{
                  marginTop: -1,
                  marginLeft: -1,
                  width: '100%'
                }}
                inputProps={{
                  maxLength: 50,
                  sx: {
                    fontSize: '2rem',
                    fontWeight: 700,
                    lineHeight: 1.167
                  },
                  onFocus: (event) => { event.target.select(); }
                }}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') { setIsEditingName(false); }
                }}
              />
              <Stack direction="row" spacing={1} sx={{ paddingTop: 1 }}>
                <Button variant="contained" color="primary" size="small" onClick={() => setIsEditingName(false)}>
                  Done
                </Button>
              </Stack>
            </Box>
          ) : (
            <Typography
              variant="h1"
              onClick={() => setIsEditingName(true)}
              sx={{
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.05)',
                  outline: '2px solid rgba(0, 0, 0, 0.2)',
                  borderRadius: '8px',
                  padding: 1,
                  margin: -1
                }
              }}>
              {projectName}
            </Typography>
          )}
          <Stack direction="row" spacing={1} divider={<Divider orientation="vertical" flexItem />} alignItems='center'>
            <Stack direction="row" spacing={1} alignItems='center'>
              <FaceIcon />
              <Typography variant="body1">John Doe</Typography>
            </Stack>
            <Stack direction="row" spacing={1} alignItems='center'>
              <Link underline="always">SharePoint</Link>
              <Link underline="always">JIRA</Link>
              <Link color="gray">+ Add Link</Link>
            </Stack>
          </Stack>
          <Typography variant="body1">
            {projectPlaceholder.description}
          </Typography>
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" color="primary" size="medium" startIcon={<GroupAddOutlinedIcon />}>
              Invite People...
            </Button>
            {/* Delete button */}
            <Button variant="outlined" color="primary" size="medium" startIcon={<EditOutlinedIcon />}>
              Edit Project...
            </Button>
          </Stack>
        </Stack>
      </PageTitleWrapper>
      <Container>
        <Stack spacing={2}>
          <Typography variant="h2">Devices</Typography>
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" color="primary" size="medium" startIcon={<AddIcon />}>
              Add Devices...
            </Button>
            <TextField label="Search Devices" variant="outlined" size="small" />
          </Stack>
          <Paper>
            <DataGrid
              rows={deviceRows}
              columns={deviceColumns}
              initialState={{ pagination: { paginationModel: { pageSize: 25 } } }}
              density="compact"
              autosizeOnMount
              autosizeOptions={{ includeOutliers: true }}
            />
          </Paper>
          <Typography variant="h2" sx={{ pt: 2 }}>Sessions</Typography>
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" color="primary" size="medium" startIcon={<AddIcon />}>
              Create New Session...
            </Button>
            <TextField label="Search Sessions" variant="outlined" size="small" />
          </Stack>
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
              autosizeOptions={{ includeOutliers: true }}
            />
          </Paper>
        </Stack>
      </Container>
    </div>
  );
};

export default ProjectDetail;
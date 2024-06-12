import { useState, useEffect } from 'react';
import {
  Button,
  TextField,
  Link,
  Paper,
  Typography,
  Container,
  Box,
  Divider,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Snackbar,
  Alert
} from '@mui/material';
import { Helmet } from 'react-helmet-async';
import PageTitleWrapper from 'src/Components/PageTitleWrapper';
import BatteryFullIcon from '@mui/icons-material/BatteryFull';
import Stack from '@mui/material/Stack';
import { useParams } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import { DataGrid, GridColDef, GridRowsProp, GridToolbarContainer, GridToolbarQuickFilter } from '@mui/x-data-grid';
import FaceIcon from '@mui/icons-material/Face';
import GroupAddOutlinedIcon from '@mui/icons-material/GroupAddOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import { ArchiveOutlined, DeleteOutline, Inventory, UnarchiveOutlined } from '@mui/icons-material';
import { is } from 'date-fns/locale';

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
];

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

const updateProject = async (projectId, name: string, description: string, archived: boolean) => {
  const res = await fetch('/api/projects/update/' + projectId, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      credentials: 'include'
    },
    body: JSON.stringify({
      name: name,
      description: description,
      archived: archived
    })
  });

  if (!res.ok) {
    console.error('Failed to update project');
    return;
  }
};

const addCollaborator = async (projectId, email) => {
  const res = await fetch('/api/project/collaborator/add', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      credentials: 'include'
    },
    body: JSON.stringify({
      projectId: projectId,
      email: email
    })
  });

  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.message || 'Failed to add collaborator');
  }

  return res.json();
};

const deleteProject = async (projectId) => {
  const res = await fetch('/api/projects/delete', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      credentials: 'include'
    },
    body: JSON.stringify({
      ids: [projectId]
    })
  });

  if (!res.ok) {
    console.error('Failed to delete project');
    return;
  }
}

function CustomProjectDevicesToolbar({ selectedDeviceIds, setSelectedDeviceIds }) {
  const activeSelection = selectedDeviceIds.length > 0;

  return (
    <GridToolbarContainer sx={{ padding: 1 }}>
      <Stack direction="row" spacing={1}>
        <Button
          variant="contained"
          color="primary"
          // onClick={handleCreateProject}
          startIcon={<AddIcon />}
        >
          Add Devices...
        </Button>
        <GridToolbarQuickFilter variant="outlined" size='small' sx={{ padding: 0 }} />
      </Stack>
    </GridToolbarContainer>
  );
};

function CustomSessionsToolbar({ selectedSessionIds, setSelectedSessionIds }) {
  const activeSelection = selectedSessionIds.length > 0;

  return (
    <GridToolbarContainer sx={{ padding: 1 }}>
      <Stack direction="row" spacing={1}>
        <Button
          variant="contained"
          color="primary"
          // onClick={handleCreateProject}
          startIcon={<AddIcon />}
        >
          Create New Session...
        </Button>
        <GridToolbarQuickFilter variant="outlined" size='small' sx={{ padding: 0 }} />
      </Stack>
    </GridToolbarContainer>
  );
}

const ProjectDetail = () => {
  const { projectId } = useParams();
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [isArchived, setIsArchived] = useState(false);
  const [selectedDeviceIds, setSelectedDeviceIds] = useState([]);
  const [selectedSessionIds, setSelectedSessionIds] = useState([]);
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [open, setOpen] = useState(false);
  const [collaboratorEmail, setCollaboratorEmail] = useState('');
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'info' | 'warning'>('success');
  const [snackbarOpen, setSnackbarOpen] = useState(false);

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
  };

  const handleNameChange = async (event) => {
    updateProject(projectId, event.target.value, projectDescription, isArchived);
    setIsEditingName(false);
  };

  const handleDescriptionChange = async (event) => {
    updateProject(projectId, projectName, event.target.value, isArchived);
    setIsEditingDescription(false);
  };

  const handleArchiveProject = async (archived: boolean) => {
    updateProject(projectId, projectName, projectDescription, archived);
    setIsArchived(archived);
  };

  const handleDeleteProject = async () => {
    deleteProject(projectId);
    window.location.href = '/projects';
  };

  const handleAddCollaborator = async () => {
    try {
      const { message } = await addCollaborator(projectId, collaboratorEmail);
      setSnackbarMessage(message);
      setSnackbarSeverity('success');
    } catch (error) {
      setSnackbarMessage(error.message);
      setSnackbarSeverity('error');
    } finally {
      setSnackbarOpen(true);
      setOpen(false);
      setCollaboratorEmail('');
    }
  };

  useEffect(() => {
    fetchProject().then((project) => {
      setProjectName(project.name);
      setProjectDescription(project.description);
      setIsArchived(project.archived);
    });
  }, []);

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
                defaultValue={projectName}
                variant="outlined"
                size="small"
                autoFocus
                onBlur={handleNameChange}
                onFocus={(event) => { event.target.select(); }}
                sx={{ marginTop: -1, marginLeft: -1, width: '100%' }}
                inputProps={{ sx: { fontSize: '2rem', fontWeight: 700, lineHeight: 1.167 }, }}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') { handleNameChange(event); }
                }}
              />
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
              }}
            >
              {projectName}
            </Typography>
          )}
          {isEditingDescription ? (
            <Box>
              <TextField
                defaultValue={projectDescription}
                variant="outlined"
                size="small"
                autoFocus
                onBlur={handleDescriptionChange}
                onFocus={(event) => { event.target.select(); }}
                sx={{ marginLeft: -1, width: '100%' }}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') { handleDescriptionChange(event); }
                }}
              />
            </Box>
          ) : (
            <Typography
              variant="body1"
              onClick={() => setIsEditingDescription(true)}
              sx={{
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.05)',
                  outline: '2px solid rgba(0, 0, 0, 0.2)',
                  borderRadius: '8px',
                  paddingX: 1,
                  marginX: -1,
                },
                color: projectDescription ? 'inherit' : 'gray'
              }}
            >
              {projectDescription ? projectDescription : 'Add description...'}
            </Typography>
          )}
          {isArchived &&
            <Stack direction="row" spacing={2} sx={{
              backgroundColor: "warning.main",
              color: "white",
              borderRadius: "8px",
              padding: 1,
              pl: 2,
              alignItems: "center"
            }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Inventory />
                <Typography variant="body1" fontWeight="bold">
                  Archived
                </Typography>
              </Stack>
            </Stack>
          }
          <Stack direction="row" spacing={1}>
            {!isArchived &&
              <Button
                variant="outlined"
                startIcon={<GroupAddOutlinedIcon />}
                onClick={() => setOpen(true)}
              >
                Add Collaborator
              </Button>
            }
            {!isArchived &&
              <Button
                variant="outlined"
                startIcon={<ArchiveOutlined />}
                onClick={() => handleArchiveProject(true)}
              >
                Archive
              </Button>
            }
            {isArchived &&
              <Button
                variant="outlined"
                startIcon={<UnarchiveOutlined />}
                onClick={() => handleArchiveProject(false)}
              >
                Unarchive
              </Button>
            }
            <Button
              variant="outlined"
              startIcon={<DeleteOutline />}
              sx={{
                '&:hover': {
                  color: 'white',
                  borderColor: 'error.main',
                  backgroundColor: 'error.main'
                }
              }}
              onClick={handleDeleteProject}
            >
              Delete
            </Button>
          </Stack>
        </Stack>
      </PageTitleWrapper>
      <Container>
        <Stack spacing={1}>
          <Typography variant="h2">Devices</Typography>
          <Paper>
            <DataGrid
              rows={deviceRows}
              columns={deviceColumns}
              initialState={{ pagination: { paginationModel: { pageSize: 25 } } }}
              density="compact"
              autosizeOnMount
              autosizeOptions={{ includeOutliers: true }}
              onRowSelectionModelChange={(newSelection) => setSelectedDeviceIds(newSelection)}
              slots={{
                toolbar: () => <CustomProjectDevicesToolbar
                  selectedDeviceIds={selectedDeviceIds}
                  setSelectedDeviceIds={setSelectedDeviceIds}
                />,
              }}
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
              autosizeOptions={{ includeOutliers: true }}
              onRowSelectionModelChange={(newSelection) => setSelectedSessionIds(newSelection)}
              slots={{
                toolbar: () => <CustomSessionsToolbar
                  selectedSessionIds={selectedSessionIds}
                  setSelectedSessionIds={setSelectedSessionIds}
                />,
              }}
            />
          </Paper>
        </Stack>
      </Container>
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Add Collaborator</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Collaborator Email"
            fullWidth
            value={collaboratorEmail}
            onChange={(e) => setCollaboratorEmail(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleAddCollaborator} variant="contained" color="primary">
            Add
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default ProjectDetail;

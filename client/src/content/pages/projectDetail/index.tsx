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
  Alert,
  Chip
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
import { Add, ArchiveOutlined, Cancel, DeleteOutline, Devices, Inventory, Remove, UnarchiveOutlined } from '@mui/icons-material';
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

const devicesPlaceholder = {
  '00:00:00:00:00:00': {
    id: 0,
    type: 'This Device',
    macAddress: '00:00:00:00:00:00',
    battery: '',
    project: '',
    sensors: [
      { id: 1, name: 'microphone' },
      { id: 2, name: 'camera' }
    ]
  },
  'e4:72:05:0a:fc:66': {
    id: 1,
    type: 'M5Stack Core2',
    macAddress: 'e4:72:05:0a:fc:66',
    battery: '93',
    project: '',
    sensors: [
      { id: 1, name: 'temperature' },
      { id: 2, name: 'humidity' }
    ]
  },
  '94:b7:ab:57:d4:75': {
    id: 2,
    type: 'M5Stack Core2',
    macAddress: '94:b7:ab:57:d4:75',
    battery: '91',
    project: 'Project 1',
    sensors: [
      { id: 1, name: 'gyroX' },
      { id: 2, name: 'gyroY' },
      { id: 3, name: 'gyroZ' }
    ]
  },
  '5f:ec:07:db:01:6e': {
    id: 3,
    type: 'M5Stack Core2',
    macAddress: '5f:ec:07:db:01:6e',
    battery: '',
    project: 'Building Temperature Research',
    sensors: []
  },
  '1e:e7:31:2e:df:7a': {
    id: 4,
    type: 'M5Stack Core2',
    macAddress: '1e:e7:31:2e:df:7a',
    battery: '',
    project: 'Project 3',
    sensors: []
  },
  '95:8e:53:46:7e:6e': {
    id: 5,
    type: 'M5Stack Core2',
    macAddress: '95:8e:53:46:7e:6e',
    battery: '',
    project: '',
    sensors: []
  }
};

const deviceColumns: GridColDef[] = [
  // { field: 'id', headerName: '#' },
  {
    field: 'type', headerName: 'Type', flex: 2, renderCell: (params) => (
      <Stack direction="row" alignItems="center" spacing={1}>
        {params.value === 'This Device' && (
          <Devices />
        )}
        <Typography variant="inherit">{params.value}</Typography>
      </Stack>
    )
  },
  { field: 'macAddress', headerName: 'MAC Address', flex: 2 },
  {
    field: 'battery', headerName: 'Battery', flex: 1, renderCell: (params) => (
      <Stack direction="row" alignItems="center" sx={params.value ? { color: 'success.main', fontWeight: '500' } : { color: 'gray' }}>
        <BatteryFullIcon fontSize="small" />
        {params.value ? (
          <Typography variant="inherit">{params.value}%</Typography>
        ) : (
          <Typography variant="inherit">?</Typography>
        )}
      </Stack>
    )
  },
  {
    field: 'sensors',
    headerName: 'Sensors',
    flex: 3,
    renderCell: (params) => (
      <Stack direction="row" spacing={1} alignItems="center" sx={{ height: "100%" }}>
        {params.value.map((sensor: { id: number, name: string }) => (
          <Chip key={sensor.id} label={sensor.name} size="small" />
        ))}
        {params.value.length === 0 && (
          <Typography variant="inherit" color="gray">
            No sensors found
          </Typography>
        )}
      </Stack>
    )
  },
];

const sessionColumns: GridColDef[] = [
  { field: 'name', headerName: 'Name', flex: 1 },
  { field: 'status', headerName: 'Status', flex: 1 },
  { field: 'lastActive', headerName: 'Last Active', flex: 1 }
];

const addDevicesColumns: GridColDef[] = [
  { field: 'type', headerName: 'Type', flex: 2 },
  { field: 'macAddress', headerName: 'MAC Address', flex: 2 },
  {
    field: 'battery', headerName: 'Battery', flex: 1, renderCell: (params) => (
      <Stack direction="row" alignItems="center" sx={params.value ? { color: 'success.main', fontWeight: '500' } : { color: 'gray' }}>
        <BatteryFullIcon fontSize="small" />
        {params.value ? (
          <Typography variant="inherit">{params.value}%</Typography>
        ) : (
          <Typography variant="inherit">?</Typography>
        )}
      </Stack>
    )
  },
  {
    field: 'sensors',
    headerName: 'Sensors',
    flex: 3,
    renderCell: (params) => (
      <Stack direction="row" spacing={1} alignItems="center" sx={{ height: "100%" }}>
        {params.value.map((sensor: { id: number, name: string }) => (
          <Chip key={sensor.id} label={sensor.name} size="small" />
        ))}
        {params.value.length === 0 && (
          <Typography variant="inherit" color="gray">
            No sensors found
          </Typography>
        )}
      </Stack>
    )
  },
];

const addDevicesRows: GridRowsProp = Object.keys(devicesPlaceholder).map((macAddress) => ({
  id: macAddress,
  type: devicesPlaceholder[macAddress].type,
  macAddress: macAddress,
  battery: devicesPlaceholder[macAddress].battery,
  sensors: devicesPlaceholder[macAddress].sensors,
}));

const updateProject = async (projectId, name: string, description: string, archived: boolean, sensorUnits) => {
  const res = await fetch('/api/projects/update/' + projectId, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      credentials: 'include'
    },
    body: JSON.stringify({
      name: name,
      description: description,
      archived: archived,
      sensorUnits: sensorUnits
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

const createSession = async (projectId, name, description, sensorUnits) => {
  const res = await fetch('/api/sessions/create', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      credentials: 'include'
    },
    body: JSON.stringify({
      project: projectId,
      name: name,
      description: description,
      sensorUnits: sensorUnits
    })
  });

  if (!res.ok) {
    console.error('Failed to create session');
    return;
  }
};

const updateSession = async (sessionId, archived) => {
  const res = await fetch('/api/sessions/update/' + sessionId, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      credentials: 'include'
    },
    body: JSON.stringify({
      archived: archived
    })
  });

  if (!res.ok) {
    console.error('Failed to update session');
    return;
  }
};

const deleteSession = async (sessionId) => {
  const res = await fetch('/api/sessions/delete/' + sessionId, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      credentials: 'include'
    }
  });

  if (!res.ok) {
    console.error('Failed to delete session');
    return;
  }
};

function CustomProjectSensorUnitsToolbar({ selectedDeviceIds, projectId, projectName, projectDescription, projectSensorUnits, isArchived, fetchProject, handleOpenAddDevices }) {
  const activeSelection = selectedDeviceIds.length > 0;

  const handleRemoveDevices = async () => {
    try {
      await updateProject(projectId, projectName, projectDescription, isArchived, projectSensorUnits.filter((macAddress) => !selectedDeviceIds.includes(macAddress)));
      fetchProject()
    }
    catch (error) {
      console.error(error);
    }
  }

  return (
    <GridToolbarContainer sx={{ padding: 1 }}>
      <Stack direction="row" spacing={1}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleOpenAddDevices}
          startIcon={<AddIcon />}
        >
          Add Devices...
        </Button>
        <GridToolbarQuickFilter variant="outlined" size='small' sx={{ padding: 0 }} />
        <Button
          variant="outlined"
          startIcon={<Remove />}
          disabled={!activeSelection}
          color="error"
          onClick={handleRemoveDevices}
        >
          Remove Devices
        </Button>
      </Stack>
    </GridToolbarContainer>
  );
};

function CustomProjectSessionsToolbar({ selectedSessionIds, setSelectedSessionIds, sensorUnits, projectId, fetchProject }) {
  const activeSelection = selectedSessionIds.length > 0;
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmitCreateSession = async () => {
    try {
      await createSession(projectId, name, description, sensorUnits);
      setOpen(false);
    } catch (error) {
      console.error(error);
    }
  };

  const handleArchiveSessions = async () => {
    try {
      for (const sessionId of selectedSessionIds) {
        await updateSession(sessionId, true);
      }
      fetchProject();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteSessions = async () => {
    try {
      for (const sessionId of selectedSessionIds) {
        await deleteSession(sessionId);
      }
      fetchProject();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <GridToolbarContainer sx={{ padding: 1 }}>
      <Stack direction="row" spacing={1}>
        <Button
          variant="contained"
          color="primary"
          onClick={() => setOpen(true)}
          startIcon={<AddIcon />}
        >
          Create New Session...
        </Button>
        <GridToolbarQuickFilter variant="outlined" size='small' sx={{ padding: 0 }} />
        <Button
          variant="outlined"
          size="medium"
          startIcon={<ArchiveOutlined />}
          disabled={!activeSelection}
          onClick={handleArchiveSessions}
        >
          Archive
        </Button>
        <Button
          variant="outlined"
          size="medium"
          color="error"
          startIcon={<DeleteOutline />}
          disabled={!activeSelection}
          onClick={handleDeleteSessions}
        >
          Delete
        </Button>
      </Stack>
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Create New Session</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Session Name"
            fullWidth
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <TextField
            margin="dense"
            label="Session Description"
            fullWidth
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmitCreateSession} variant="contained" color="primary">
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </GridToolbarContainer>
  );
}

function CustomAddDevicesToolbar() {
  return (
    <GridToolbarContainer sx={{ padding: 1 }}>
      <Stack direction="row" spacing={1}>
        <GridToolbarQuickFilter variant="outlined" size='small' sx={{ padding: 0 }} />
      </Stack>
    </GridToolbarContainer>
  );
}

const ProjectDetail = () => {
  const { projectId } = useParams();
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [projectSensorUnits, setProjectSensorUnits] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [isArchived, setIsArchived] = useState(false);
  const [selectedDeviceIds, setSelectedDeviceIds] = useState([]);
  const [selectedSessionIds, setSelectedSessionIds] = useState([]);
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [openAddDevices, setOpenAddDevices] = useState(false);
  const [selectedDeviceIdsFromAddDevices, setSelectedDeviceIdsFromAddDevices] = useState([]);
  const [open, setOpen] = useState(false);
  const [collaboratorEmail, setCollaboratorEmail] = useState('');
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'info' | 'warning'>('success');
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const deviceRows: GridRowsProp = projectSensorUnits.map((macAddress) => ({
    id: macAddress,
    type: devicesPlaceholder[macAddress].type,
    macAddress: macAddress,
    battery: devicesPlaceholder[macAddress].battery,
    project: devicesPlaceholder[macAddress].project,
    sensors: devicesPlaceholder[macAddress].sensors,
  }));

  const sessionRows: GridRowsProp = sessions.map((session) => ({
    id: session._id,
    name: session.name,
    description: session.description,
    created: session.createdAt,
    sensorUnits: session.sensorUnits,
    lastActive: session.lastActive,
    archived: session.archived,
    status: session.status,
  }));

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
    setProjectName(data.name);
    setProjectDescription(data.description);
    setProjectSensorUnits(data.sensorUnits);
    setIsArchived(data.archived);

    const resSessions = await fetch('/api/sessions/project/' + projectId, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        credentials: 'include'
      }
    });

    if (!resSessions.ok) {
      console.error('Failed to fetch data');
      return [];
    }

    const dataSessions = await resSessions.json();
    setSessions(dataSessions);
    console.log(dataSessions);
  };

  const handleNameChange = async (event) => {
    updateProject(projectId, event.target.value, projectDescription, isArchived, projectSensorUnits);
    setIsEditingName(false);
  };

  const handleDescriptionChange = async (event) => {
    updateProject(projectId, projectName, event.target.value, isArchived, projectSensorUnits);
    setIsEditingDescription(false);
  };

  const handleArchiveProject = async (archived: boolean) => {
    updateProject(projectId, projectName, projectDescription, archived, projectSensorUnits);
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

  const handleAddDevicesToProject = async () => {
    try {
      const updatedSensorUnits = [...new Set([...projectSensorUnits, ...selectedDeviceIdsFromAddDevices])];
      await updateProject(projectId, projectName, projectDescription, isArchived, updatedSensorUnits);
      setOpenAddDevices(false);
      fetchProject();
    } catch (error) {
      console.error(error);
    }

  }

  useEffect(() => {
    fetchProject();
  }, []);

  return (
    <div>
      <Helmet>
        <title>{projectName}</title>
      </Helmet>
      <Dialog open={openAddDevices} onClose={() => setOpenAddDevices(false)} fullWidth maxWidth="lg">
        <DialogTitle>Add Devices To {projectName}</DialogTitle>
        <DialogContent>
          <DataGrid
            rows={addDevicesRows}
            columns={addDevicesColumns}
            density="compact"
            autosizeOnMount
            autosizeOptions={{ includeOutliers: true }}
            autoHeight
            checkboxSelection={true}
            onRowSelectionModelChange={(newSelection) => setSelectedDeviceIdsFromAddDevices(newSelection)}
            slots={{ toolbar: () => <CustomAddDevicesToolbar /> }}
            sx={{
              "& .MuiDataGrid-columnHeader:focus, .MuiDataGrid-cell:focus": {
                outline: "none",
              },
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddDevices(false)} color="secondary" startIcon={<Cancel />}>Cancel</Button>
          <Button onClick={handleAddDevicesToProject} variant="contained" color="primary" startIcon={<Add />}>
            Add Devices
          </Button>
        </DialogActions>
      </Dialog>
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
              onRowSelectionModelChange={(newSelection) => setSelectedDeviceIds(newSelection)}
              checkboxSelection
              slots={{
                toolbar: () => <CustomProjectSensorUnitsToolbar
                  selectedDeviceIds={selectedDeviceIds}
                  projectId={projectId}
                  projectName={projectName}
                  projectDescription={projectDescription}
                  projectSensorUnits={projectSensorUnits}
                  isArchived={isArchived}
                  fetchProject={fetchProject}
                  handleOpenAddDevices={() => setOpenAddDevices(true)}
                />,
              }}
              sx={{
                "& .MuiDataGrid-columnHeader:focus, .MuiDataGrid-cell:focus": {
                  outline: "none",
                },
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
              checkboxSelection
              onRowSelectionModelChange={(newSelection) => setSelectedSessionIds(newSelection)}
              slots={{
                toolbar: () => <CustomProjectSessionsToolbar
                  selectedSessionIds={selectedSessionIds}
                  setSelectedSessionIds={setSelectedSessionIds}
                  sensorUnits={projectSensorUnits}
                  projectId={projectId}
                  fetchProject={fetchProject}
                />,
              }}
              sx={{
                "& .MuiDataGrid-columnHeader:focus, .MuiDataGrid-cell:focus": {
                  outline: "none",
                },
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

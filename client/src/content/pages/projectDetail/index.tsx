import { useState, useEffect, useCallback } from 'react';
import {
  Button,
  TextField,
  Link,
  Paper,
  Tabs,
  Tab,
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
  Chip,
  Card,
  Stepper,
  Step,
  StepLabel,
  List,
  ListItem
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
import ArchiveOutlinedIcon from '@mui/icons-material/ArchiveOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import { Add, ArchiveOutlined, Cancel, DeleteOutline, Devices, InfoOutlined, Inventory, Remove, UnarchiveOutlined, Usb } from '@mui/icons-material';
import { is } from 'date-fns/locale';
import CreateSessionDialog from './CreateSessionDialog';

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
  {
    field: 'name', headerName: 'Name', flex: 1, renderCell: (params) => (
      <Link href={`/sessions/detail/${params.id}`} sx={{ padding: 1, marginX: -1 }}
        onClick={(event) => {
        event.stopPropagation();
      }}>
      {params.value}</Link>
    )
  },
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

const updateProject = async (projectId: number, name: string, description: string, archived: boolean, sensorUnits) => {
  const res = await fetch('/api/projects/update/' + projectId, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      credentials: 'include'
    },
    body: JSON.stringify({
      name: name,
      archived: archived,
      description: description,
      sensorUnits: sensorUnits
    })
  });

  if (!res.ok) {
    console.error('Failed to update project');
    return;
  }
};

const archiveSessions = async (sessionIds, tab) => {
  const archived = tab === '2' ? true : false;
  const response = await fetch('/api/session/update-many', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      credentials: 'include'
    },
    body: JSON.stringify(
      [
        ...sessionIds.map((id) => ({ id, archived: archived }))
      ]
    )
  });
}

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

const deleteProject = async (projectId: number) => {
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

const createSession = async (projectId: number, name, description, sensorUnits) => {
  try {
    const res = await fetch('/api/sessions/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        credentials: 'include'
      },
      body: JSON.stringify({
        projectId: projectId,
        name: name,
        description: description,

      })
    });

    if (!res.ok) {
      console.error('Failed to create session');
      return;
    }

    const data = await res.json();
    window.location.href = `/sessions/detail/${data.sessionId}`;
  } catch (error) {
    console.error(error);
  };
};

const fetchActiveSessions = async (projectId: number) => {
  console.log('op dit project id zoekt ie pt2', projectId)
  const res = await fetch('/api/sessions/project/active/' + projectId, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      credentials: 'include'
    }
  })
  console.log('res', res);

  if (!res.ok) {
    console.error('Failed to fetch data');
    return [];
  }
  const data = await res.json();
  return data;
}

const fetchArchivedSessions = async (projectId) => {
  const res = await fetch('/api/sessions/project/archived/'+ projectId, {
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

const deleteSessions = async (sessionIds) => {
  console.log("in andere delete session");
  const res = await fetch('/api/sessions/delete', {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      credentials: 'include'
    },
    body: JSON.stringify({
      ids: sessionIds
    })
  });

  if (!res.ok) {
    console.error('Failed to delete session');
    return;
  }
  return res.json();
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

function CustomSessionsToolbar({ selectedSessionIds, setSelectedSessionIds, sensorUnits, projectId, fetchData, fetchProject, tab }) {
  const [open, setOpen] = useState(false);
  const activeSelection = selectedSessionIds.length > 0;
  const [name, setName] = useState(`Session ${new Date().toDateString()}`)

  const [description, setDescription] = useState('');
  const [isDialogOpen, setDialogOpen] = useState(false);

  const handleOpenDialog = () => setDialogOpen(true);
  const handleCloseDialog = () => setDialogOpen(false);

  const handleCreateProject = useCallback(async () => {
    try {
      setOpen(true);
    } catch (error) {
      console.error(error);
    }
  }, []);

    const handleSubmitCreateSession = async () => {
    try {
      await createSession(projectId, name, description, sensorUnits);
      setOpen(false);
      fetchProject();
    } catch (error) {
      console.error(error);
    }
  };


  const archiveSessions = async (sessionIds, tab) => {
    const archived = tab === '2' ? true : false;
    const response = await fetch('/api/sessions/update-many', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        credentials: 'include'
      },
      body: JSON.stringify(
        [
          ...sessionIds.map((id) => ({ id, archived: archived }))
        ]
      )
    });
  }

  const handleDeleteProjects = useCallback(async () => {
    try {
      // await deleteSessions(selectedSessionIds);
      fetchData();
    } catch (error) {
      console.error(error);
    }
  }, [selectedSessionIds]);

  const handleArchiveProjects = useCallback(async () => {
    try {
      await archiveSessions(selectedSessionIds, tab);
      console.log("fetching data again")
      fetchData();
    } catch (error) {
      console.error(error);
    }
  }, [selectedSessionIds]);


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
            startIcon={<ArchiveOutlinedIcon />}
            disabled={!activeSelection}
            onClick={handleArchiveProjects}
          >
            {tab === '2' ? "Archive" : "Unarchive"}
          </Button>
          <Button
            variant="outlined"
            size="medium"
            color="error"
            startIcon={<DeleteOutlineOutlinedIcon />}
            disabled={!activeSelection}
            onClick={handleOpenDialog}
          >
            Delete
          </Button>
          <ConfirmationDialog
              open={isDialogOpen}
              onClose={handleCloseDialog}
              onConfirm={async (sessionsIds) => {
                await deleteSessions(sessionsIds);
                setSelectedSessionIds([]); // Optioneel: selectie wissen
                fetchData(); // Herlaad data na verwijdering
              }}
              projectIds={selectedSessionIds}
            />
      </Stack>
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Create New Session</DialogTitle>
        <DialogContent>
          <Stack direction="row" spacing={1} mb={2} color="secondary.main">
            <InfoOutlined />
            <List sx={{ p: 0 }}>
              <ListItem sx={{ px: 0, pt: 0 }}>
                <Typography variant="body1">
                  This project's devices will be used to collect data:
                </Typography>
              </ListItem>
                {sensorUnits?.map((macAddress) => (
                <ListItem key={macAddress} sx={{ px: 0 }}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Usb />
                    <Typography variant="body1" fontWeight="500">
                      {devicesPlaceholder[macAddress].type}
                    </Typography>
                    <Typography variant="body2">
                      {macAddress}
                    </Typography>
                    <Typography variant="body2">
                      {devicesPlaceholder[macAddress].sensors.map((sensor) => sensor.name).join(', ')}
                    </Typography>
                  </Stack>
                </ListItem>
              ))}
            </List>
          </Stack>
          <TextField
            autoFocus
            onFocus={(event) => { event.target.select(); }}
            margin="dense"
            label="Session Name"
            fullWidth
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && document.getElementById('description-input').focus()}
          />
          <TextField
            id="description-input"
            margin="dense"
            label="Session Description"
            fullWidth
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmitCreateSession()}
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
};

function CustomAddDevicesToolbar() {
  return (
    <GridToolbarContainer sx={{ padding: 1 }}>
      <Stack direction="row" spacing={1}>
        <GridToolbarQuickFilter variant="outlined" size='small' sx={{ padding: 0 }} />
      </Stack>
    </GridToolbarContainer>
  );
}

const ConfirmationDialog = ({ open, onClose, onConfirm, projectIds }) => (
  <Dialog open={open} onClose={onClose}>
    <DialogTitle>Confirm Deletion</DialogTitle>
    <DialogContent>
      <Typography>
        Are you sure you want to delete the selected session(s)? This action cannot be undone.
      </Typography>
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose} color="primary">
        Cancel
      </Button>
      <Button
        onClick={() => {
          onConfirm(projectIds);
          onClose();
        }}
        color="error"
        variant="contained"
      >
        Delete
      </Button>
    </DialogActions>
  </Dialog>
);

const ConfirmationDialog2 = ({ open, onClose, onConfirm, projectId }) => (
  <Dialog open={open} onClose={onClose}>
    <DialogTitle>Confirm Deletion</DialogTitle>
    <DialogContent>
      <Typography>
        Are you sure you want to delete this project? This action cannot be undone.
      </Typography>
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose} color="primary">
        Cancel
      </Button>
      <Button
        onClick={() => {
          onConfirm(projectId);
          onClose();
        }}
        color="error"
        variant="contained"
      >
        Delete
      </Button>
    </DialogActions>
  </Dialog>
);


const ProjectDetail = () => {
  const projectId = Number(useParams().projectId);
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
  const [activeStep, setActiveStep] = useState(3);
  const [sortedSessions, setSortedSessions] = useState([]);
  const [currentTab, setTab] = useState('2');
  const [isDialogOpen, setDialogOpen] = useState(false);
  const handleOpenDialog2 = () => setDialogOpen(true);
  const handleCloseDialog2 = () => setDialogOpen(false);


  const handleTabChange = (event: React.SyntheticEvent, newCurrentTab: string) => {
    setTab(newCurrentTab);
  };

  const fetchData = async () => {
    console.log('Fetching data 2.2 ');
    try {
      let sessions = [];
      switch (currentTab) {
        case '2':
          console.log("op dit porjectid zoekt ie",projectId)
          sessions = await fetchActiveSessions(projectId);
          console.log('wat is dit', sessions)
          break;
        case '4':
          sessions = await fetchArchivedSessions(projectId);
          console.log('wat is dit 2', sessions)
          break;
        default:
          sessions = await fetchActiveSessions(projectId);
          console.log('default', sessions)
          break;
      }
      setSortedSessions(sessions);
    } catch (error) {
      console.error('Failed to fetch data', error);
    }
  };

  const dateFormat = (lastActive) => {
    const date = new Date(lastActive);
    return new Intl.DateTimeFormat('nl-NL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date).replace(',', '');
  };

  const sessionRows: GridRowsProp = sortedSessions.map((session) => ({
    id: session.sessionId,
    name: session.name,
    status: session.status,
    scheduledFrom: session.scheduledFrom,
    scheduledTo: session.scheduledTo,
    projectId: session.projectId,
    meta: session.meta,
    createdAt: session.createdAt,
    lastActive: session.lastActive,
    // lastActive: dateFormat(session.lastActive),
    archived: session.archived,
  }));


  const fetchProject = async () => {
    console.log('Fetching project 2', projectId);
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
    console.log("DATA: ", data);
    setProjectName(data.name);
    setProjectDescription(data.description);
    setIsArchived(data.archived);

    console.log("PROJECT ID: ", projectId);


    // if (data.sensorUnits.length === 0) {
    //   setActiveStep(0);
    // } else if (dataSessions.length === 0) {
    //   setActiveStep(1);
    // } else if (dataSessions.filter((session) => session.status != "inactive").length === 0) {
    //   setActiveStep(2);
    // } else {
    //   setActiveStep(3);
    // }
  };

  const handleNameChange = async (event) => {
    await updateProject(projectId, event.target.value, projectDescription, isArchived, projectSensorUnits);
    setIsEditingName(false);
    fetchProject();
  };

  const handleDescriptionChange = async (event) => {
    await updateProject(projectId, projectName, event.target.value, isArchived, projectSensorUnits);
    setIsEditingDescription(false);
    fetchProject();
  };

  const handleArchiveProject = async (archived: boolean) => {
    updateProject(projectId, projectName, projectDescription, archived, projectSensorUnits);
    setIsArchived(archived);
  };

  const handleDeleteProject = async (projectId) => {
    await deleteProject(projectId);
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

  useEffect(() => {
    fetchData();
  }, [currentTab]);

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
            autoHeight
            autosizeOnMount
            autosizeOptions={{ includeOutliers: true }}
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
                onBlur={(event) => {
                  // Check if the value has changed from the initial value
                  if (event.target.value !== projectName) {
                    window.location.reload();
                  }
                  handleNameChange(event);
                }}
                onFocus={(event) => { event.target.select(); }}
                sx={{ marginTop: -1, marginLeft: -1, width: '100%' }}
                inputProps={{ sx: { fontSize: '2rem', fontWeight: 700, lineHeight: 1.167 }, }}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    const target = event.target as HTMLInputElement;
                    if (target.value !== projectName) {
                      window.location.reload();
                    }
                    handleNameChange(event); }
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
                onBlur={(event) => {
                  // Check if the value has changed from the initial value
                  if (event.target.value !== projectDescription) {
                    window.location.reload();
                  }
                  handleDescriptionChange(event);
                }}
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
                Archive Project
              </Button>
            }
            {isArchived &&
              <Button
                variant="outlined"
                startIcon={<UnarchiveOutlined />}
                onClick={() => handleArchiveProject(false)}
              >
                Unarchive Project
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
              onClick={handleOpenDialog2}
            >
              Delete Project
            </Button>
            <ConfirmationDialog2
            open={isDialogOpen}
            onClose={handleCloseDialog2}
            onConfirm={async (projectId) => {
              await handleDeleteProject(projectId);
            }}
            projectId={projectId}
          />
          </Stack>
        </Stack>
      </PageTitleWrapper>
      <Container>
        <Stack spacing={1}>
          {activeStep != 3 && (
            <Stack spacing={2}>
              <Typography variant="h2">Project Setup</Typography>
              <Card>
                <Stepper activeStep={activeStep} sx={{ p: 2 }} >
                  <Step sx={{ flex: 2 }}>
                    <StepLabel>Add Devices</StepLabel>
                    <Typography variant="body2" mt={1} fontWeight={activeStep === 0 ? "500" : "normal"}>
                      Add devices, such as the M5Stack Core2, to your project. Ask your administrator on how to obtain one.
                    </Typography>
                  </Step>
                  <Step sx={{ flex: 2 }}>
                    <StepLabel>Create Data Collection Session</StepLabel>
                    <Typography variant="body2" mt={1} fontWeight={activeStep === 1 ? "500" : "normal"} color={activeStep < 1 ? "gray" : ""}>
                      Create a new data collection session. Your project devices will be added automatically.
                    </Typography>
                  </Step>
                  <Step sx={{ flex: 2 }}>
                    <StepLabel>Start Session</StepLabel>
                    <Typography variant="body2" mt={1} fontWeight={activeStep === 2 ? "500" : "normal"} color={activeStep < 2 ? "gray" : ""}>
                      Start the data collection session to begin recording data from all the sensors on the project's devices.
                    </Typography>
                  </Step>
                </Stepper>
              </Card>
            </Stack>
          )}
          <Typography variant="h2" pt={2} sx={{ position: 'relative', left: '40px' }} >Data Collection Sessions</Typography>
          <Container maxWidth="lg">
            <Stack direction="row" spacing={2} sx={{ height: '100%' }}>
              <Tabs
                orientation="vertical"
                value={currentTab}
                onChange={handleTabChange}
                sx={{ minWidth: 200 }}
              >
                <Tab value="2" label="Active Sessions" sx={{ alignItems: 'start' }} />
                <Tab value="4" label="Archived Sessions" sx={{ alignItems: 'start' }} />
              </Tabs>
              <Paper sx={{ width: "100%", height: "100%" }}>
                <DataGrid
                  rows={sessionRows}
                  columns={sessionColumns}
                  density="compact"
                  pageSizeOptions={[10, 25, 50]}
                  autoHeight
                  initialState={{
                    pagination: { paginationModel: { pageSize: 10 } },
                    sorting: {
                      sortModel: [{ field: 'id', sort: 'desc' }],
                    },
                  }}
                  checkboxSelection
                  onRowSelectionModelChange={(newSelection) => setSelectedSessionIds(newSelection)}
                  slots={{
                    toolbar: () => <CustomSessionsToolbar
                      selectedSessionIds={selectedSessionIds}
                      setSelectedSessionIds={setSelectedSessionIds}
                      projectId={projectId}
                      fetchData={fetchData}
                      fetchProject={fetchProject}
                      sensorUnits={projectSensorUnits}
                      tab={currentTab}
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
            onKeyDown={(e) => e.key === 'Enter' && handleAddCollaborator()}
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

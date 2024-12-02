import { useState, useEffect } from 'react';
import {
  Button,
  TextField,
  Link,
  Typography,
  Container,
  Box,
  Chip,
  Paper,
  List,
  ListItem,
  ListItemButton,
  Checkbox,
  Switch,
  LinearProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle
} from '@mui/material';
import { Helmet } from 'react-helmet-async';
import PageTitleWrapper from 'src/Components/PageTitleWrapper';
import BatteryFullIcon from '@mui/icons-material/BatteryFull';
import Stack from '@mui/material/Stack';
import { DataGrid, GridColDef, GridRowsProp, GridToolbarContainer, GridToolbarQuickFilter } from '@mui/x-data-grid';
import { ArchiveOutlined, DeleteOutline, Devices, Edit, EventNote, InfoOutlined, Inventory, MoreTime, Pause, PlayArrow, Router, Schedule, Stop, UnarchiveOutlined, Usb } from '@mui/icons-material';
import { DesignServicesOutlined } from '@mui/icons-material';
import { useParams } from 'react-router-dom';
import { add } from 'date-fns';




const devicesColumns: GridColDef[] = [
  {
    // field: 'name', headerName: 'Name', renderCell: (params) => (
    //   <Link href={`/devices/detail/${params.id}`} sx={{ padding: 1, marginX: -1 }}>{params.value}</Link>
    field: 'name', headerName: 'Name', renderCell: (params) => (
    <Link href={`/devices/detail/${params.id}`} sx={{ padding: 1, marginX: -1 }}>{params.value}</Link>
    ),
    flex: 1
  },
  // { field: 'macAddress', headerName: 'MAC Address', valueFormatter: (value?: string) => value?.toUpperCase() },
  { field: 'id', headerName: 'MAC Address', flex: 1 },
  {
    field: 'battery', headerName: 'Battery', renderCell: (params) => (
      <Stack direction="row" alignItems="center" sx={params.value ? { color: 'success.main', fontWeight: '500' } : { color: 'gray' }}>
        <BatteryFullIcon fontSize="small" />
        {params.value ? (
          <Typography variant="inherit">{params.value}%</Typography>
        ) : (
          <Typography variant="inherit">?</Typography>
        )}
      </Stack>
    ),
    flex: 1
  },
  { field: 'status', headerName: 'Status', flex: 1 },
  { field: 'maxHz', headerName: 'Max Hz', flex: 1 },
];

const fetchDevices = async () => {
  console.log("in fetchDevices");
  const devices = await fetch('/api/devices/all', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      credentials: 'include'
    }
  });

  if (!devices.ok) {
    console.error('Failed to fetch data');
    return [];
  }

  const devicesData = await devices.json();
  return devicesData;
}

const updateSession = async (sessionId, name, description, archived, status) => {
  const res = await fetch('/api/sessions/update/' + sessionId, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      credentials: 'include'
    },
    body: JSON.stringify({
      name: name,
      description: description,
      archived: archived,
      status: status
    })
  });

  if (!res.ok) {
    console.error('Failed to update session');
    return;
  }
  const data = await res.json();
  return data;
};

const updateSessionStatus = async (sessionId, status) => {
  const res = await fetch('/api/sessions/update/' + sessionId, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      credentials: 'include'
    },
    body: JSON.stringify({
      status: status
    })
  });

  if (!res.ok) {
    console.error('Failed to update session status');
    return;
  }
  const data = await res.json();
  return data;
};

const deleteSession = async (sessionId: number) => {
  console.log("DELETE SESSION ID", sessionId);
  const res = await fetch('/api/sessions/delete', {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      credentials: 'include'
    },
    body: JSON.stringify({
      ids: [sessionId]
    })
  });

  if (!res.ok) {
    console.error('Failed to delete session');
    return;
  }
  console.log("DELETE SESSION RES", res);
  const data = await res.json();
  return data;
};

const SessionStatusCard = ({ sessionId, status }) => {
  const [sessionStatus, setSessionStatus] = useState('');

  const statusLabel = {
    inactive: 'Inactive',
    active: 'Collecting Data',
    activeScheduled: 'Active (Scheduled)',
    paused: 'Paused',
    scheduled: 'Scheduled',
    completed: 'Completed',
    error: 'Error',
    stopped: 'Stopped'
  };

  const statusColor = {
    inactive: '',
    active: 'primary.main',
    activeScheduled: 'primary.main',
    paused: 'secondary.main',
    scheduled: 'primary.main',
    completed: 'success.main',
    error: 'error.main',
    stopped: 'error.main'
  };

  useEffect(() => {
    setSessionStatus(status);
  }, [status]);

  const handleSessionStart = async () => {
    await updateSessionStatus(sessionId, 'active');
    setSessionStatus('active');
  };

  const handleSessionPause = async () => {
    await updateSessionStatus(sessionId, 'paused');
    setSessionStatus('paused');
  };

  const handleSessionStop = async () => {
    await updateSessionStatus(sessionId, 'completed');
    setSessionStatus('completed');
  };

  const handleSessionContinue = async () => {
    await updateSessionStatus(sessionId, 'active');
    setSessionStatus('active');
  };

  return (
    <Stack spacing={1} sx={{ p: 2 }} component={Paper}>
      <Typography variant="h4" color={statusColor[sessionStatus]}>{statusLabel[sessionStatus]}</Typography>
      {sessionStatus == 'inactive' && (
        <Stack direction="row" spacing={1}>
          <InfoOutlined sx={{ color: "gray" }} />
          <Typography sx={{ color: "gray" }} variant="body1">Start this session to collect data.</Typography>
        </Stack>
      )}
      {/* <Stack direction="row" spacing={1}>
        <EventNote />
        <Typography variant="body1">No schedule</Typography>
      </Stack> */}
      {sessionStatus == 'inactive' && (
        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            startIcon={<PlayArrow />}
            onClick={handleSessionStart}
          >
            Start
          </Button>
          {/* <Button
            variant="outlined"
            startIcon={<EventNote />}
          // onClick={handleSessionSchedule}
          >
            Set Schedule...
          </Button> */}
        </Stack>
      )}
      {sessionStatus == 'active' && (
        <Stack spacing={1}>
          <Stack direction="row" spacing={1} alignItems="center" maxWidth="200px">
            <Usb color="primary" />
            <LinearProgress sx={{ flex: 1, transform: "scaleX(-1)" }} variant="buffer" value={0} valueBuffer={0} />
            <Router color="primary" />
          </Stack>
          <Stack direction="row" spacing={1} alignItems="center">
          <InfoOutlined sx={{ color: "secondary.main" }} />
            <Typography sx={{ color: "secondary.main" }} variant="body1">
              The device is collecting data and sending it to the gateway. Ask your supervisor how to access the data.
            </Typography>
          </Stack>
          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              startIcon={<Pause />}
              onClick={handleSessionPause}
            >
              Pause
            </Button>
            <Button
              variant="outlined"
              startIcon={<Stop />}
              onClick={handleSessionStop}
            >
              Stop
            </Button>
          </Stack>
        </Stack>
      )}
      {/* {sessionStatus == 'activeScheduled' && (
        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            startIcon={<Stop />}
            onClick={handleSessionStop}
          >
            Stop
          </Button>
        </Stack>
      )} */}
      {sessionStatus == 'paused' && (
        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            startIcon={<PlayArrow />}
            onClick={handleSessionContinue}
          >
            Continue
          </Button>
          <Button
            variant="outlined"
            startIcon={<Stop />}
            onClick={handleSessionStop}
          >
            Stop
          </Button>
        </Stack>
      )}
      {/* {sessionStatus == 'scheduled' && (
        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            startIcon={<Edit />}
          >
            Edit Schedule...
          </Button>
        </Stack>
      )} */}
    </Stack>
  );
};

function CustomDevicesToolbar({ selectedDeviceIds, setSelectedDeviceIds, sessionId }) {
  const addDeviceToSession = async (sessionId, selectedDeviceIds) => {
    const res = await fetch('/api/sessions/addDevices', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        credentials: 'include'
      },
      body: JSON.stringify({
        sessionId: sessionId,
        deviceIds: selectedDeviceIds
      })
    });

    if (!res.ok) {
      console.error('Failed to add devices to session');
      return;
    }
    const data = await res.json();
    return data;
  }

  return (
    <GridToolbarContainer sx={{ padding: 1 }}>
      <Stack direction="row" spacing={1}>
        <Button
          variant="outlined"
          startIcon={<Devices />}
          onClick={() => addDeviceToSession(sessionId, selectedDeviceIds)}
        >
          Add Devices
        </Button>
        <GridToolbarQuickFilter variant="outlined" size='small' sx={{ padding: 0 }} />
      </Stack>
    </GridToolbarContainer>
  );
}


const SessionDetail = () => {
  const sessionId = Number(useParams().sessionId);
  const [sessionName, setSessionName] = useState('');
  const [sessionDescription, setSessionDescription] = useState('');
  const [sessionStatus, setSessionStatus] = useState('');
  const [projectId, setProjectId] = useState('');
  const [projectName, setProjectName] = useState('');
  const [isArchived, setIsArchived] = useState(false);
  // const [sessionSensorUnits, setSessionSensorUnits] = useState([]);
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);

  const [open, setOpen] = useState(false);
  const [isDialogOpen, setDialogOpen] = useState(false);
  const handleOpenDialog = () => setDialogOpen(true);
  const handleCloseDialog = () => setDialogOpen(false);

  const deviceId = Number(useParams().deviceId);
  const [selectedDeviceIds, setSelectedDeviceIds] = useState([]);
  const [devices, setDevices] = useState([]);

  const allDevices = async () => {
    const devices = await fetchDevices();
    setDevices(devices);
  }

  useEffect(() => {
    allDevices();
  }, []);

  const devicesRows: GridRowsProp = devices.map((device) => ({
    name:     device.manufacturerName,
    id:       device.deviceId,
    status:   device.connectStatus,
    battery:  device.batteryLevel,
    maxHz:    device.maxHz,
  }));

  const fetchSession = async () => {
    console.log("SESSION ID", sessionId);
    const response = await fetch(`/api/sessions/id/${sessionId}`, {
      headers: { credentials: 'include' }
    });

    if (!response.ok) {
      console.error('Failed to fetch data');
      return [];
    }

    const data = await response.json();
    // setSessionId(data.sessionId);
    setProjectId(data.projectId);
    setSessionName(data.name);
    setIsArchived(data.archived);
    setSessionStatus(data.status);
    setSessionDescription(data.description);

    console.log('Fetching project 3', data.projectId);
    const projectResponse = await fetch('/api/projects/id/' + data.projectId, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        credentials: 'include'
      }
    });

    if (!projectResponse.ok) {
      console.error('Failed to fetch data');
      return [];
    }

    const projectData = await projectResponse.json();
    setProjectName(projectData.name);
  }

  const handleNameChange = async (event) => {
    await updateSession(sessionId, event.target.value, sessionDescription, isArchived, sessionStatus);
    setIsEditingName(false);
    fetchSession();
  };

  const handleDescriptionChange = async (event) => {
    await updateSession(sessionId, sessionName, event.target.value, isArchived, sessionStatus);
    setIsEditingDescription(false);
    fetchSession();
  };

  const handleArchiveSession = async (archive) => {
    await updateSession(sessionId, sessionName, sessionDescription, archive, sessionStatus);
    fetchSession();
  };

  const handleDeleteSession = async (sessionId) => {
    console.log("project id in delete session detail", projectId);
    await deleteSession(sessionId);
    if (!projectId) {
      await fetchSession(); // Ensure `projectId` is loaded before proceeding
    }
    window.location.href = '/projects/detail/' + projectId;
  };

  useEffect(() => {
    fetchSession();
  }, []);

  const ConfirmationDialog = ({ open, onClose, onConfirm, sessionId }) => (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Confirm Deletion</DialogTitle>
      <DialogContent>
        <Typography>
          Are you sure you want to delete this session? This action cannot be undone.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Cancel
        </Button>
        <Button
          onClick={() => {
            onConfirm(sessionId);
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

  return (
    <div>
      <Helmet>
        <title>{sessionName}</title>
      </Helmet>
      <PageTitleWrapper>
        <Stack spacing={1} >
          {isEditingName ? (
            <Box>
              <TextField
                defaultValue={sessionName}
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
              {sessionName}
            </Typography>
          )}
          <Stack direction="row" spacing={1}>
            <Link color="primary" underline="hover" variant="body1" href={"../../projects/detail/" + projectId}>
              <Stack direction="row" spacing={1} alignItems="center">
                <DesignServicesOutlined fontSize="small" />
                <Typography variant="body1">{projectName}</Typography>
              </Stack>
            </Link>
          </Stack>
          {isEditingDescription ? (
            <Box>
              <TextField
                defaultValue={sessionDescription}
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
                color: sessionDescription ? 'inherit' : 'gray'
              }}
            >
              {sessionDescription ? sessionDescription : 'Add description...'}
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
                startIcon={<ArchiveOutlined />}
                onClick={() => handleArchiveSession(true)}
              >
                Archive Session
              </Button>
            }
            {isArchived &&
              <Button
                variant="outlined"
                startIcon={<UnarchiveOutlined />}
                onClick={() => handleArchiveSession(false)}
              >
                Unarchive Session
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
              onClick={handleOpenDialog}
            >
              Delete Session
            </Button>
            <ConfirmationDialog
            open={isDialogOpen}
            onClose={handleCloseDialog}
            onConfirm={async (sessionId) => {
              await handleDeleteSession(sessionId);
            }}
            sessionId={sessionId}
          />
          </Stack>
        </Stack>
      </PageTitleWrapper>
      <Container>
        <Stack spacing={2}>
          <Typography variant="h2">Status</Typography>
          <SessionStatusCard status={sessionStatus} sessionId={sessionId} />
          <Typography variant="h2" sx={{ pt: 2 }}>Devices and Sensors</Typography>
          <Paper>
            <DataGrid
              rows={devicesRows}
              columns={devicesColumns}
              density='compact'
              autoHeight
              initialState={{
                pagination: { paginationModel: { pageSize: 10 } },
                sorting: {
                  sortModel: [{ field: 'id', sort: 'desc' }],
                },
              }}
              // getRowHeight={() => 'auto'}
              // disableRowSelectionOnClick
              checkboxSelection
              onRowSelectionModelChange={(newSelection) => setSelectedDeviceIds(newSelection)}
              slots={{
                toolbar: () => <CustomDevicesToolbar
                  selectedDeviceIds={selectedDeviceIds}
                  setSelectedDeviceIds={setSelectedDeviceIds}
                  sessionId={sessionId}
                  // fetchDevices={allDevices}
                />}}
              sx={{
                "& .MuiDataGrid-columnHeader:focus, .MuiDataGrid-cell:focus, .MuiDataGrid-cell:focus-within": {
                  outline: "none !important",
                },
                "& .MuiDataGrid-row:hover": {
                  backgroundColor: "rgba(0, 0, 0, 0)",
                }
              }}
            />
          </Paper>
        </Stack>
      </Container>
    </div>
  );
};

export default SessionDetail;



{/* <DataGrid
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
/> */}

import { useState, useEffect } from 'react';
import {
  Button,
  Paper,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
  Container,
  List,
  Link,
  ListItem,
  ListItemButton,
  ListItemText,
  Divider,
  Stack,
  Snackbar,
  Alert,

} from '@mui/material';
import { Helmet } from 'react-helmet-async';
import PageTitleWrapper from 'src/components/pageTitleWrapper';
import BatteryFullIcon from '@mui/icons-material/BatteryFull';
import QueueOutlinedIcon from '@mui/icons-material/QueueOutlined';
import { DataGrid, GridColDef, GridRowsProp, GridToolbarContainer, GridToolbarQuickFilter } from '@mui/x-data-grid';
import DevicesIcon from '@mui/icons-material/Devices';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';  // Import the expand/collapse icon
import ExpandLessIcon from '@mui/icons-material/ExpandLess';  // Import the collapse icon
import { Link as RouterLink } from 'react-router-dom';

// Fetch active projects
const fetchActiveProjects = async () => {
  const res = await fetch('/api/projects/active', {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    console.error('Failed to fetch data');
    return [];
  }
  const data = await res.json();
  return data;
};

// Fetch sessions for a project
const fetchSessionsForProject = async (projectId: number) => {
  const res = await fetch(`/api/sessions/project/${projectId}`, {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    console.error('Failed to fetch sessions');
    return [];
  }

  const data = await res.json();
  return data;
};

// Fetch devices
const fetchDevices = async () => {
  const devices = await fetch('/api/devices/all', {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!devices.ok) {
    console.error('Failed to fetch data');
    return [];
  }

  const devicesData = await devices.json();
  return devicesData;
};

const devicesColumns: GridColDef[] = [
  { field: 'name', headerName: 'Name', flex: 1, renderCell: (params) => (
    <Link to={`/devices/detail/${params.id}`} component={RouterLink} sx={{ padding: 1, marginX: -1 }}>{params.value}</Link>
  )},
  { field: 'id', headerName: 'MAC Address', flex: 1 },
  {
    field: 'battery', headerName: 'Battery', flex: 1, renderCell: (params) => (
      <Stack direction="row" alignItems="center" sx={params.value ? { color: 'success.main', fontWeight: '500' } : { color: 'gray' }}>
        <BatteryFullIcon fontSize="small" />
        {params.value ? <Typography variant="inherit">{params.value}%</Typography> : <Typography variant="inherit">?</Typography>}
      </Stack>
    )
  },
  { field: 'status', headerName: 'Status', flex: 1 },
];

function CustomDevicesToolbar({ selectedDeviceIds, handleOpenAddToProjects }) {
  const activeSelection = selectedDeviceIds.length > 0;

  return (
    <GridToolbarContainer sx={{ padding: 1 }}>
      <Stack direction="row" spacing={1}>
        <GridToolbarQuickFilter variant="outlined" size='small' sx={{ padding: 0 }} />
        <Button
          variant="outlined"
          size="medium"
          startIcon={<QueueOutlinedIcon />}
          disabled={!activeSelection}
          onClick={() => {
            console.log("Button clicked!");
            handleOpenAddToProjects();
          }}
        >
          Add Devices To Session...
        </Button>
      </Stack>
    </GridToolbarContainer>
  );
}

const Devices = () => {
  const [selectedDeviceIds, setSelectedDeviceIds] = useState([]);
  const [openAddToProjects, setOpenAddToProjects] = useState(false);
  const [activeProjects, setActiveProjects] = useState([]);
  const [selectedSessions, setSelectedSessions] = useState({});
  const [sessions, setSessions] = useState({});
  const [devices, setDevices] = useState([]);
  const [expandedProject, setExpandedProject] = useState<number | null>(null); // Track expanded project
  const [snackbarOpen, setSnackbarOpen] = useState(false);  // Snackbar open state
  const [snackbarMessage, setSnackbarMessage] = useState('');  // Snackbar message
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'warning' | 'error' | 'info'>('success');



  const allDevices = async () => {
    const devices = await fetchDevices();
    setDevices(devices);
  };

  useEffect(() => {
    allDevices();
  }, []);

  const handleOpenAddToProjects = async () => {
    console.log("handleOpenAddToProjects called");
    const projects = await fetchActiveProjects();
    setActiveProjects(projects);
    console.log("Fetched projects:", projects);

    const sessionsData = {};
    for (const project of projects) {
      const projectSessions = await fetchSessionsForProject(project.projectId);
      console.log(`Sessions for project ${project.projectId}:`, projectSessions);
      sessionsData[project.projectId] = projectSessions;  // Store sessions for each project
    }
    setSessions(sessionsData);

    setOpenAddToProjects(true);
  };

  const handleSessionChange = (projectId: number, sessionId: number) => {
    setSelectedSessions((prev) => ({
      ...prev,
      [projectId]: sessionId,
    }));
  };

  const toggleProjectExpansion = (projectId: number) => {
    setExpandedProject((prev) => (prev === projectId ? null : projectId)); // Toggle project expansion
  };

  const handleAddDevicesToSession = async (sessionId: number) => {
    if (selectedDeviceIds.length === 0) {
      setSnackbarSeverity('warning');
      setSnackbarMessage("Please select at least one device.");
      setSnackbarOpen(true);
      return;
    }

    try {
      const response = await fetch('/api/devices/addToSession', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          deviceIds: selectedDeviceIds,
        }),
      });

      if (response.ok) {
        setSnackbarSeverity('success');
        setSnackbarMessage("Device(s) successfully added to session!");
      } else {
        const errorData = await response.json();
        setSnackbarSeverity('error');
        setSnackbarMessage(`Failed to add devices: ${errorData.message}`);
      }
    } catch (error) {
      console.error("Error adding devices:", error);
      setSnackbarSeverity('error');
      setSnackbarMessage("An error occurred while adding devices.");
    } finally {
      setSnackbarOpen(true);
      setOpenAddToProjects(false);

    }
  };


  const devicesRows: GridRowsProp = devices.map((device) => ({
    name: device.manufacturer,
    id: device.deviceId,
    status: device.connectStatus,
    battery: device.batteryLevel,
  }));

  return (
    <div>
      <Helmet>
        <title>All Devices</title>
      </Helmet>
      <PageTitleWrapper>
        <Typography variant="h1">All Devices</Typography>
      </PageTitleWrapper>

      <Dialog open={openAddToProjects} onClose={() => setOpenAddToProjects(false)} sx={{"& .MuiDialog-paper": {width: '500px', maxWidth: '80%', zIndex: 1000}, backdropFilter: 'none',}}>
        <DialogTitle>Select Project to Add Device(s) to</DialogTitle>
        <DialogContent>
          {activeProjects.length === 0 ? (
            <Typography variant="body1" sx={{ mt: 2 }}>
              No projects found.
            </Typography>
          ) : (
            <List sx={{ width: "100%" }} disablePadding>
              {activeProjects.map((project) => (
                <div key={project.projectId}>
                  {/* Project Row with Expand/Collapse Icon */}
                  <ListItem sx={{ py: 1 }} disablePadding>
                    <ListItemButton
                      disableGutters
                      sx={{ px: 2 }}
                      onClick={() => toggleProjectExpansion(project.projectId)}
                    >
                      <ListItemText primary={project.name} secondary={project.description} />
                      {expandedProject === project.projectId ? (
                        <ExpandLessIcon />
                      ) : (
                        <ExpandMoreIcon />
                      )}
                    </ListItemButton>
                  </ListItem>

                  {/* Sessions list under the project */}
                  {expandedProject === project.projectId && (
                    <List sx={{ pl: 4 }}>
                      {sessions[project.projectId]?.map((session) => (
                        <ListItem key={session.sessionId} sx={{ py: 1 }} secondaryAction={
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => handleAddDevicesToSession(session.sessionId)}
                          >
                            Add
                          </Button>
                        }>
                          <ListItemText primary={session.name} />
                        </ListItem>
                      ))}
                    </List>
                  )}
                  <Divider />
                </div>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddToProjects(false)} color="secondary">
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      <Container>
        <Paper>
          <DataGrid
            rows={devicesRows}
            columns={devicesColumns}
            density="compact"
            autoHeight
            checkboxSelection={true}
            onRowSelectionModelChange={(newSelection) => setSelectedDeviceIds(newSelection)}
            slots={{
              toolbar: () => <CustomDevicesToolbar
                selectedDeviceIds={selectedDeviceIds}
                handleOpenAddToProjects={handleOpenAddToProjects}
              />,
            }}
            sx={{
              "& .MuiDataGrid-columnHeader:focus, .MuiDataGrid-cell:focus": {
                outline: "none",
              },
            }}
          />
        </Paper>
      </Container>
      {/* Snackbar for showing messages */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        sx={{ zIndex: 1100 }}  // Ensure it appears above Dialog
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default Devices;

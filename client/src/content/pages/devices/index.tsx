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
  Chip,
  Link,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Divider,
  TextField,
} from '@mui/material';
import { Helmet } from 'react-helmet-async';
import PageTitleWrapper from 'src/Components/PageTitleWrapper';
import BatteryFullIcon from '@mui/icons-material/BatteryFull';
import Stack from '@mui/material/Stack';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import { DataGrid, GridColDef, GridRenderCellParams, GridRowsProp, GridToolbarContainer, GridToolbarQuickFilter } from '@mui/x-data-grid';
import DevicesIcon from '@mui/icons-material/Devices';
import QueueOutlinedIcon from '@mui/icons-material/QueueOutlined';
import { set } from 'date-fns';

const fetchActiveProjects = async () => {
  const res = await fetch('/api/projects/active', {
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

const updateProject = async (projectId: number, selectedSensorUnits) => {
  console.log('Updating project', projectId, selectedSensorUnits);
  const projectResponse = await fetch('/api/projects/id/' + projectId, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      credentials: 'include'
    }
  });

  if (!projectResponse.ok) {
    console.error('Failed to fetch data');
    return;
  }

  const projectData = await projectResponse.json();
  const updatedSensorUnits = [...new Set([...projectData.sensorUnits, ...selectedSensorUnits])];

  const updateResponse = await fetch('/api/projects/update/' + projectId, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      credentials: 'include'
    },
    body: JSON.stringify({
      sensorUnits: updatedSensorUnits
    })
  });

  if (!updateResponse.ok) {
    console.error('Failed to update project');
    return;
  }
  const updateData = await updateResponse.json();
  return updateData;
}

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

const devicesColumns: GridColDef[] = [
  {
    field: 'name', headerName: 'Name', renderCell: (params) => (
      <Link href={`/devices/detail/${params.id}`} sx={{ padding: 1, marginX: -1 }}>{params.value}</Link>
    )
  },
  // { field: 'macAddress', headerName: 'MAC Address', valueFormatter: (value?: string) => value?.toUpperCase() },
  { field: 'id', headerName: 'MAC Address' },
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
    )
  },
  { field: 'status', headerName: 'Status' },
  { field: 'maxHz', headerName: 'Max Hz' },
];

function CustomDevicesToolbar({ selectedDeviceIds, setSelectedDeviceIds, handleOpenAddToProjects }) {
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
          onClick={handleOpenAddToProjects}
        >
          Add Devices To Project...
        </Button>
      </Stack>
    </GridToolbarContainer>
  );
};

const Devices = () => {
  const [selectedDeviceIds, setSelectedDeviceIds] = useState([]);
  const [openAddToProjects, setOpenAddToProjects] = useState(false);
  const [activeProjects, setActiveProjects] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [devices, setDevices] = useState([]);

  const allDevices = async () => {
    const devices = await fetchDevices();
    setDevices(devices);
  }

  useEffect(() => {
    allDevices();
  }, []);

  // log device.deviceId from object from list of devices
  console.log(devices.map(device => device.deviceId));

  const devicesRows: GridRowsProp = devices.map((device) => ({
    name:     device.manufacturerName,
    id:       device.deviceId,
    status:   device.connectStatus,
    battery:  device.batteryLevel,
    maxHz:    device.maxHz,
  }));



  const handleAddDevicesToProject = async (projectId) => {
    // const macAddresses = selectedDeviceIds.map((id) => devices.find((device) => device.deviceId === id).macAddress);
    // await updateProject(projectId, macAddresses);
    // setOpenAddToProjects(false);
    // console.log(" we gaan naar project id", projectId);
    // window.location.href = '/projects/detail/' + projectId;
  }

  // useEffect(() => {
  //   fetchActiveProjects().then((data) => {
  //     setActiveProjects(data);
  //     setSearchResults(data);
  //   });
  // }, []);

  // useEffect(() => {
  //   if (searchText) {
  //     const results = activeProjects.filter((project) => project.name.toLowerCase().includes(searchText.toLowerCase()));
  //     setSearchResults(results);
  //   } else {
  //     setSearchResults(activeProjects);
  //   }
  // }, [searchText]);

  return (
    <div>
      <Helmet>
        <title>All Devices</title>
      </Helmet>
      <PageTitleWrapper>
        <Typography variant="h1">All Devices</Typography>
      </PageTitleWrapper>
      <Dialog open={openAddToProjects} onClose={() => setOpenAddToProjects(false)}>
        <DialogTitle>Add Devices To Project</DialogTitle>
        <DialogContent>
          <Stack direction="row" spacing={1} sx={{ mt: 1, mb: 2 }}>
            <TextField
              label="Search Projects"
              variant="outlined"
              fullWidth
              sx={{ flex: 2 }}
              size="small"
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
            />
          </Stack>
          <Typography variant="caption" fontWeight="700" sx={{ pl: 2 }}>{searchResults.length} projects</Typography>
          <Divider sx={{ mt: 1 }} />
          <List sx={{ width: "100%" }} disablePadding>
            {searchResults.map((project) => (
              <ListItem key={project.projectId} sx={{ py: 1 }} disablePadding divider={true}>
                <ListItemButton
                  disableGutters
                  sx={{ px: 2 }}
                  onClick={() => handleAddDevicesToProject(project.projectId)}
                >
                  <ListItemText primary={project.name} secondary={project.description} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddToProjects(false)} color="secondary">Cancel</Button>
        </DialogActions>
      </Dialog>
      <Container>
        <Paper>
          <DataGrid
            rows={devicesRows}
            columns={devicesColumns}
            // map divices to rows
            density="compact"
            autosizeOnMount
            autosizeOptions={{ includeOutliers: true }}
            autoHeight
            checkboxSelection={true}
            onRowSelectionModelChange={(newSelection) => setSelectedDeviceIds(newSelection)}
            slots={{
              toolbar: () => <CustomDevicesToolbar
                selectedDeviceIds={selectedDeviceIds}
                setSelectedDeviceIds={setSelectedDeviceIds}
                handleOpenAddToProjects={() => setOpenAddToProjects(true)}
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
    </div>
  );
};

export default Devices;

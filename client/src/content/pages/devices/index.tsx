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

const updateProject = async (projectId: string, selectedSensorUnits) => {
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

const devicesPlaceholder = [
  {
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
  {
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
  {
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
  {
    id: 3,
    type: 'M5Stack Core2',
    macAddress: '5f:ec:07:db:01:6e',
    battery: '',
    project: 'Building Temperature Research',
    sensors: []
  },
  {
    id: 4,
    type: 'M5Stack Core2',
    macAddress: '1e:e7:31:2e:df:7a',
    battery: '',
    project: 'Project 3',
    sensors: []
  },
  {
    id: 5,
    type: 'M5Stack Core2',
    macAddress: '95:8e:53:46:7e:6e',
    battery: '',
    project: '',
    sensors: []
  }
];

const devicesColumns: GridColDef[] = [
  // { field: 'id', headerName: '#' },
  {
    field: 'type', headerName: 'Type', renderCell: (params) => (
      <Stack direction="row" alignItems="center" spacing={1}>
        {params.value === 'This Device' && (
          <DevicesIcon />
        )}
        <Typography variant="inherit">{params.value}</Typography>
      </Stack>
    )
  },
  { field: 'macAddress', headerName: 'MAC Address', valueFormatter: (value?: string) => value?.toUpperCase() },
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
  {
    field: 'sensors',
    headerName: 'Sensors',
    renderCell: (params) => (
      <Stack direction="row" spacing={1} alignItems="center" sx={{ height: "100%" }}>
        {params.value.map((sensor: { id: number, name: string }) => (
          <Chip key={sensor.id} label={sensor.name} size="small" />
        ))}
      </Stack>
    )
  },
  // {
  //   field: 'project',
  //   headerName: 'Project',
  //   renderCell: (params) => (
  //     <Typography variant="inherit">{params.value}</Typography>
  //   )
  // },
  // {
  //   field: 'status',
  //   headerName: 'Status',
  //   renderCell: (params) => (
  //     <DeviceStatus status={params.value} project={params.row.project} session={params.row.session} />
  //   )
  // }
];

const devicesRows: GridRowsProp = devicesPlaceholder.map((device) => ({
  id: device.id,
  type: device.type,
  macAddress: device.macAddress,
  battery: device.battery,
  project: device.project,
  sensors: device.sensors,
}));

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

  const handleAddDevicesToProject = async (projectId) => {
    const macAddresses = selectedDeviceIds.map((id) => devicesPlaceholder.find((device) => device.id === id).macAddress);
    await updateProject(projectId, macAddresses);
    setOpenAddToProjects(false);
    window.location.href = '/projects/detail/' + projectId;
  }

  useEffect(() => {
    fetchActiveProjects().then((data) => {
      setActiveProjects(data);
      setSearchResults(data);
    });
  }, []);

  useEffect(() => {
    if (searchText) {
      const results = activeProjects.filter((project) => project.name.toLowerCase().includes(searchText.toLowerCase()));
      setSearchResults(results);
    } else {
      setSearchResults(activeProjects);
    }
  }, [searchText]);

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
            <Button startIcon={<AddIcon />} variant="outlined" size="medium" sx={{ flex: 1 }}>New Project</Button>
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
              <ListItem key={project._id} sx={{ py: 1 }} disablePadding divider={true}>
                <ListItemButton
                  disableGutters
                  sx={{ px: 2 }}
                  onClick={() => handleAddDevicesToProject(project._id)}
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

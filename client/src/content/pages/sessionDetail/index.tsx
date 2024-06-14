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
  Switch
} from '@mui/material';
import { Helmet } from 'react-helmet-async';
import PageTitleWrapper from 'src/Components/PageTitleWrapper';
import BatteryFullIcon from '@mui/icons-material/BatteryFull';
import Stack from '@mui/material/Stack';
import { DataGrid, GridColDef, GridRowsProp } from '@mui/x-data-grid';
import { ArchiveOutlined, DeleteOutline, Devices, Inventory, UnarchiveOutlined } from '@mui/icons-material';
import { DesignServicesOutlined } from '@mui/icons-material';
import { useParams } from 'react-router-dom';

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
      <Stack direction="row" alignItems="center" spacing={1} sx={{ py: 1 }}>
        {params.value === 'This Device' && (
          <Devices />
        )}
        <Typography variant="inherit">{params.value}</Typography>
      </Stack>
    )
  },
  {
    field: 'macAddress', headerName: 'MAC Address', flex: 2, renderCell: (params) => (
      <Typography variant="inherit" sx={{ py: 1 }}>{params.value}</Typography>
    )
  },
  {
    field: 'battery', headerName: 'Battery', flex: 2, renderCell: (params) => (
      <Stack direction="row" alignItems="center" sx={params.value ? { color: 'success.main', fontWeight: '500', py: 1 } : { color: 'gray', py: 1 }}>
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
    flex: 6,
    renderCell: (params) => (
      <Box alignItems="center" sx={{ height: "100%" }}>
        <List disablePadding sx={{ py: 0.5 }}>
          {params.value.map((sensor: { id: number, name: string }) => (
            <ListItem key={sensor.id} disableGutters disablePadding sx={{ py: 0.5 }}>
              {/* <ListItemButton disableGutters sx={{ p: 0 }}> */}
                {/* <Switch
                  edge="start"
                  checked=
                  disableRipple
                /> */}
                <Chip label={sensor.name} size="small" />
              {/* </ListItemButton> */}
            </ListItem>
          ))}
        </List>
        {
          params.value.length === 0 && (
            <Typography variant="inherit" color="gray">
              No sensors found
            </Typography>
          )
        }
      </Box >
    )
  },
];

const updateSession = async (sessionId, name, description, archived, sensorUnits) => {
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
      sensorUnits: sensorUnits
    })
  });

  if (!res.ok) {
    console.error('Failed to update session');
    return;
  }
  const data = await res.json();
  return data;
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
  const data = await res.json();
  return data;
};

const SessionDetail = () => {
  const { sessionId } = useParams();
  const [sessionName, setSessionName] = useState('');
  const [sessionDescription, setSessionDescription] = useState('');
  const [projectId, setProjectId] = useState('');
  const [projectName, setProjectName] = useState('');
  const [isArchived, setIsArchived] = useState(false);
  const [sessionSensorUnits, setSessionSensorUnits] = useState([]);
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);

  const deviceRows: GridRowsProp = sessionSensorUnits.map((macAddress) => ({
    id: macAddress,
    type: devicesPlaceholder[macAddress].type,
    macAddress: macAddress,
    battery: devicesPlaceholder[macAddress].battery,
    project: devicesPlaceholder[macAddress].project,
    sensors: devicesPlaceholder[macAddress].sensors,
  }));

  const fetchSession = async () => {
    const response = await fetch(`/api/sessions/id/${sessionId}`, {
      headers: { credentials: 'include' }
    });

    if (!response.ok) {
      console.error('Failed to fetch data');
      return [];
    }

    const data = await response.json();
    setSessionName(data.name);
    setSessionDescription(data.description);
    setIsArchived(data.archived);
    setSessionSensorUnits(data.sensorUnits);
    setProjectId(data.project);

    const projectResponse = await fetch('/api/projects/id/' + data.project, {
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
    await updateSession(sessionId, event.target.value, sessionDescription, isArchived, sessionSensorUnits);
    setIsEditingName(false);
    fetchSession();
  };

  const handleDescriptionChange = async (event) => {
    await updateSession(sessionId, sessionName, event.target.value, isArchived, sessionSensorUnits);
    setIsEditingDescription(false);
    fetchSession();
  };

  const handleArchiveSession = async (archive) => {
    await updateSession(sessionId, sessionName, sessionDescription, archive, sessionSensorUnits);
    fetchSession();
  };

  const handleDeleteSession = async () => {
    await deleteSession(sessionId);
    window.location.href = '/projects/detail/' + projectId;
  };

  useEffect(() => {
    fetchSession();
  }, []);

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
                Archive
              </Button>
            }
            {isArchived &&
              <Button
                variant="outlined"
                startIcon={<UnarchiveOutlined />}
                onClick={() => handleArchiveSession(false)}
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
              onClick={handleDeleteSession}
            >
              Delete
            </Button>
          </Stack>
        </Stack>
      </PageTitleWrapper>
      <Container>
        <Stack spacing={2}>
          <Typography variant="h2">Devices and Sensors</Typography>
          <Paper>
            <DataGrid
              rows={deviceRows}
              columns={deviceColumns}
              density='compact'
              autoHeight
              getRowHeight={() => 'auto'}
              disableRowSelectionOnClick
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

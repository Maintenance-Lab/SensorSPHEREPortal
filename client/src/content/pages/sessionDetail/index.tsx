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
  Link,
  TableBody,
  List,
  ListItem,
  ListItemIcon,
  TableCell,
  Card,
  CardContent,
  Checkbox,
  Collapse,
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
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import FaceIcon from '@mui/icons-material/Face';
import { Face } from '@mui/icons-material';
import GroupAddOutlinedIcon from '@mui/icons-material/GroupAddOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import { DesignServicesOutlined } from '@mui/icons-material';
import { useParams } from 'react-router-dom';
import { set } from 'date-fns';

const devicesPlaceholder = {
  id: 3,
  name: 'Device 3',
  type: 'M5Stack Core2',
  macAddress: '00:00:00:00:00:03',
  battery: '100',
  status: 'collecting'
}

const fetchProject = async (projectId) => {
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
      sensorUnits: sensorUnits })
  });

  if (!res.ok) {
    console.error('Failed to update session');
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
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" color="primary" startIcon={<DeleteOutlinedIcon />} disabled>
              Delete Session...
            </Button>
          </Stack>
        </Stack>
      </PageTitleWrapper>
      <Container>
        <Stack spacing={2}>
          <Typography variant="h2">Sensors</Typography>
          <List component={Paper} dense>
            <ListItem >
              <ListItemIcon>
                <Checkbox />
              </ListItemIcon>
              <Stack spacing={1}>
                <Typography variant="h5">{devicesPlaceholder.name}</Typography>
                <Stack direction="row" spacing={1} divider={<Divider orientation="vertical" flexItem />} alignItems='center'>
                  <Typography variant="body2">{devicesPlaceholder.macAddress}</Typography>
                  <Stack direction="row" alignItems="center">
                    <BatteryFullIcon fontSize='small' />
                    <Typography variant="body2">{devicesPlaceholder.battery}%</Typography>
                  </Stack>
                </Stack>
              </Stack>
            </ListItem>
            <Collapse in={true} timeout="auto" unmountOnExit sx={{ pl: 6 }}>
              <List disablePadding dense>
                <ListItem >
                  <ListItemIcon >
                    <Checkbox />
                  </ListItemIcon>
                  <Typography variant="h6">ENV3</Typography>
                </ListItem>
              </List>
              <Collapse in={true} timeout="auto" unmountOnExit sx={{ pl: 6 }}>
                <List disablePadding dense>
                  <ListItem >
                    <ListItemIcon>
                      <Checkbox />
                    </ListItemIcon>
                    <Typography variant="body1">t</Typography>
                  </ListItem>
                  <ListItem >
                    <ListItemIcon>
                      <Checkbox />
                    </ListItemIcon>
                    <Typography variant="body1">hu</Typography>
                  </ListItem>
                  <ListItem >
                    <ListItemIcon>
                      <Checkbox />
                    </ListItemIcon>
                    <Typography variant="body1">te</Typography>
                  </ListItem>
                </List>
              </Collapse>
            </Collapse>
          </List>
        </Stack>
      </Container>

    </div>
  );
};

export default SessionDetail;

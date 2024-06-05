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

// const DeviceStatus = ({ status, project }) => {
//   let statusColor = '';
//   let statusLabel = '';

//   switch (status) {
//     case 'takenFinished':
//       statusColor = 'success.main';
//       statusLabel = 'Finished Collecting Data';
//       break;
//     case 'takenCollecting':
//       statusColor = 'primary.main';
//       statusLabel = 'Collecting Data';
//       break;
//     case 'takenInactive':
//       statusColor = '';
//       statusLabel = 'Inactive';
//       break;
//     case 'unavailable':
//       statusColor = 'gray';
//       statusLabel = 'Unavailable';
//       break;
//     default:
//       statusColor = '';
//       statusLabel = 'Unknown';
//   }

//   return (
//     <Stack spacing={1} sx={{ color: statusColor }}>
//       <Stack direction="row" spacing={1} alignItems="center">
//         {status === 'takenFinished' && (<CheckCircleIcon />)}
//         {status === 'takenCollecting' && (<MoreHorizIcon />)}
//         <Typography variant="inherit" sx={{ fontWeight: 600 }}>
//           {statusLabel}
//         </Typography>
//       </Stack>
//     </Stack>
//   );
// };

const devicesPlaceholder = {
  id: 3,
  name: 'Device 3',
  type: 'M5Stack Core2',
  macAddress: '00:00:00:00:00:03',
  battery: '100',
  status: 'collecting'
}

// const deviceColumns: GridColDef[] = [
//   { field: 'id', headerName: '#' },
//   { field: 'name', headerName: 'Name' },
//   { field: 'type', headerName: 'Type' },
//   { field: 'macAddress', headerName: 'MAC Address' },
//   {
//     field: 'battery', headerName: 'Battery', renderCell: (params) => (
//       <Stack direction="row" alignItems="center">
//         <BatteryFullIcon />
//         <Typography variant="inherit">{params.value}%</Typography>
//       </Stack>
//     )
//   },
//   {
//     field: 'status',
//     headerName: 'Status',
//     renderCell: (params) => (
//       <DeviceStatus status={params.value} project="" />
//     )
//   }
// ];

// const deviceRows: GridRowsProp = devicesPlaceholder.map((device) => ({
//   id: device.id,
//   name: device.name,
//   type: device.type,
//   macAddress: device.macAddress,
//   battery: device.battery,
//   project: device.project,
//   session: device.session,
//   status: device.status
// }));

// const sessionsPlaceholder = [
//   {
//     id: 1,
//     name: 'Session #1',
//     status: 'takenFinished'
//   },
//   {
//     id: 2,
//     name: 'Session #2',
//     status: 'takenCollecting'
//   }
// ];

// const sessionColumns: GridColDef[] = [
//   { field: 'id', headerName: '#' },
//   { field: 'name', headerName: 'Name' },
//   {
//     field: 'status',
//     headerName: 'Status',
//     renderCell: (params) => (
//       <DeviceStatus status={params.value} project="" />
//     )
//   }
// ];

// const sessionRows: GridRowsProp = sessionsPlaceholder.map((session) => ({
//   id: session.id,
//   name: session.name,
//   status: session.status
// }));

const SessionDetail = () => {

  // Placeholder data for session
  const sessionPlaceholder = {
    name: 'Session #2',
    description: 'First collection with ENV3.',
    status: 'collecting'
  }

  const [sessionName, setSessionName] = useState(sessionPlaceholder.name);
  const [isEditingName, setIsEditingName] = useState(false);

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
                value={sessionName}
                variant="outlined"
                color="primary"
                focused
                size="small"
                autoFocus
                onChange={(event) => setSessionName(event.target.value)}
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
                  onFocus: (event) => {
                    event.target.select();
                  }
                }}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    setIsEditingName(false);
                  }
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
              {sessionName}
            </Typography>
          )}
          <Stack direction="row" spacing={1}>
            <Link color="primary" underline="hover" variant="body1" href="../projects/detail">
              <Stack direction="row" spacing={1} alignItems="center">
                <DesignServicesOutlined fontSize="small" />
                <Typography variant="body1">Building Temperature Research</Typography>
              </Stack>
            </Link>
          </Stack>
          <Typography variant="body1">
            {sessionPlaceholder.description}
          </Typography>
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

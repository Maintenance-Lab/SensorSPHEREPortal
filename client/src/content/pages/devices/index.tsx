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
  TableBody,
  TableCell,
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
  Container
} from '@mui/material';
import { Helmet } from 'react-helmet-async';
import PageTitleWrapper from 'src/Components/PageTitleWrapper';
import BatteryFullIcon from '@mui/icons-material/BatteryFull';
import Stack from '@mui/material/Stack';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';

// const useStyles = makeStyles((theme: Theme) => ({
  
// }));

const Devices = () => {
  // const classes = useStyles();
  
  const [sortedDevices, setSortedDevices] = useState([]);

  // Placeholder data for 3 devices
  const devicesPlaceholder = [
    {
      name: 'Device 1',
      macAddress: '00:00:00:00:00:01',
      battery: '100',
      project: 'Project 1',
      status: 'Active'
    },
    {
      name: 'Device 2',
      macAddress: '00:00:00:00:00:02',
      battery: '100',
      project: 'Project 2',
      status: 'Active'
    },
    {
      name: 'Device 3',
      macAddress: '00:00:00:00:00:03',
      battery: '100',
      project: 'Project 3',
      status: 'Active'
    }
  ];

  useEffect(() => {
    setSortedDevices(devicesPlaceholder);
  }, []);

  return (
    <div>
      <Helmet>
        <title>All Devices</title>
      </Helmet>
      <PageTitleWrapper>
        <Typography variant="h1">All Devices</Typography>
      </PageTitleWrapper>
      <Container>
        <Stack direction="column" spacing={2}>
          <Stack direction="row" spacing={2}>
            <Button variant="outlined" color="primary">
              <SearchIcon />
              Find Device
            </Button>
            <Button variant="outlined" color="primary">
              <AddIcon />
              Add To Project
            </Button>
            <TextField id="outlined-basic" label="Search" variant="outlined" />
          </Stack>
          <TableContainer>
            <Table aria-label="simple table">
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>MAC Address</TableCell>
                  <TableCell>Battery</TableCell>
                  <TableCell>Project</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sortedDevices.map((device, index) => (
                  <TableRow key={index}>
                    <TableCell>{device.name}</TableCell>
                    <TableCell>{device.macAddress}</TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                        <BatteryFullIcon /> {device.battery}%
                      </Stack>
                    </TableCell>
                    <TableCell>{device.project}</TableCell>
                    <TableCell>{device.status}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Stack>
      </Container>
    </div>
  );
};

export default Devices;

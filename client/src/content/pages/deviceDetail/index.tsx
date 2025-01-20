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
  Chip,
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
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import { useParams } from 'react-router-dom';
import { id } from 'date-fns/locale';

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

const sensorsPlaceholder = [
  {
    id: 1,
    name: 'ENV3',
    outputs: {
      t: '123456789',
      hu: '30.31323334',
      te: '24.69420'
    }
  },
  {
    id: 2,
    name: 'IMU',
    outputs: {
      accX: '0.123456789',
      accY: '0.31323334',
      accZ: '0.69420',
      gyroX: '0.123456789',
      gyroY: '0.31323334',
      gyroZ: '0.69420',
      temp: '24.69420'
    }
  }
]

const DeviceDetail = () => {
  interface GridRow {
    id: string; // Unique identifier for each row
    manufacturer: string;
    model: string;
    outputs: string[];
  }

  const { deviceId } = useParams();
  const [properties, setProperties] = useState<any>(null);
  const [deviceManufacturer, setDeviceManufacturer] = useState('');
  const [deviceBatteryLevel, setDeviceBatteryLevel] = useState('');
  const [sensorRows, setSensorRows] = useState([]);

  const getDeviceProperties = async (deviceId: string) => {
    console.log("in getDeviceDetails api call");
    const res:any = await fetch('/api/devices/properties/' + deviceId, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        credentials: 'include'
      },
    });

    if (!res.ok) {
      throw new Error('Failed to fetch device properties');
    }

    const data = await res.json();
    return data;
  };

  const getDeviceDetails = async (deviceId: string) => {
    console.log("in getdevice by id api call");
    const res:any = await fetch('/api/devices/id/' + deviceId, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        credentials: 'include'
      },
    });

    if (!res.ok) {
      throw new Error('Failed to fetch device details');
    }

    const data = await res.json();
    return data;
  };

  const handleDeviceDetails = async (deviceId: string) => {
    getDeviceDetails(deviceId).then((data) => {
      setDeviceManufacturer(data.manufacturerName);
      setDeviceBatteryLevel(data.batteryLevel);
    });
  }

  const deviceProperties = async (deviceId: string) => {
      getDeviceProperties(deviceId).then((data) => {
      setProperties(data);
      console.log("properties: ", data);
    });
  };

  const loadRows = async (properties) => {
    console.log("properties ---------------: ", properties);
    const sensorRows:GridRow[] = Object.keys(properties).flatMap((manufacturer) => {
      const { model, properties: modelProperties } = properties[manufacturer];

      return model.map((modelName, index) => ({
        id: `${manufacturer}_${modelName}`, // Unique ID based on manufacturer and model
        manufacturer,
        model: modelName,
        outputs: modelProperties[index].map(output => output.value || '')
      }));
    });

    setSensorRows(sensorRows);
    // return sensorRows;
  }

  useEffect(() => {
    deviceProperties(deviceId);
    handleDeviceDetails(deviceId);
    // mapPropertiesToGridRows();
  }, [deviceId]);

  useEffect(() => {
     loadRows(properties);
  }, [properties]);

  const sensorColumns: GridColDef[] = [
    { headerName: 'Manufacturer', field: 'manufacturer' },
    { headerName: 'Model', field: 'model' },
    { headerName: 'Outputs', field: 'outputs' }
  ]
  //   { field: 'manufacturer', headerName: 'Manufacturer', flex: 1 },
  //   { field: 'model', headerName: 'Model',
  //     renderCell: (params) => (
  //       <TableContainer >
  //         <Table size="small">
  //           <TableBody>
  //             {params.value.map((model) => (
  //               <TableRow key={model}>
  //                 <TableCell>{model}</TableCell>
  //               </TableRow>
  //             ))}
  //           </TableBody>
  //         </Table>
  //       </TableContainer>
  //     ),
  //     flex: 1
  //   },
  //   {
  //     field: 'outputs',
  //     headerName: 'Outputs',
  //     renderCell: (params) => (
  //       <TableContainer >
  //         <Table size="small">
  //           <TableBody>
  //             {/* console.log("KEEEEEEY: ", key), */}
  //             {Object.keys(params.value).map((key) => (
  //               <TableRow key={key}>
  //                 <TableCell sx={{ fontWeight: '600' }}>{key}</TableCell>
  //                 <TableCell>{params.value[key]}</TableCell>
  //               </TableRow>
  //             ))}
  //           </TableBody>
  //         </Table>
  //       </TableContainer>
  //     ),
  //     flex: 1
  //   },
  // ];

  // const sensorRows: GridRowsProp = sensorsPlaceholder.map((sensor) => ({
  //     id: sensor.id,
  //     manufacturer: 'M5Stack',
  //     outputs: sensor.outputs,
  // }));

  return (
    <div>
      <Helmet>
        <title>{deviceManufacturer}</title>
      </Helmet>
      <PageTitleWrapper>
        <Stack spacing={1}>
          <Stack direction="row" spacing={2}>
            <Typography variant="h1">
              {deviceManufacturer}
            </Typography>
          </Stack>
          <Stack
            direction="row"
            spacing={1}
            divider={<Divider orientation="vertical" flexItem />}
          >
            <Typography variant="body1">{deviceId}</Typography>
            <Stack direction="row">
              <BatteryFullIcon />
              <Typography variant="body1">{deviceBatteryLevel}%</Typography>
            </Stack>
          </Stack>
        </Stack>
      </PageTitleWrapper>
      <Container>
        <Stack spacing={2}>
          <Typography variant="h2">Sensors</Typography>
          <Paper>
            <DataGrid
              rows={sensorRows}
              columns={sensorColumns}
              initialState={{
                pagination: { paginationModel: { pageSize: 25 } },
              }}
              density="compact"
              autosizeOnMount
              autosizeOptions={{
                includeOutliers: true
              }}
              getRowHeight={() => 'auto'}
              sx={{
                '&.MuiDataGrid-root .MuiDataGrid-cell': { py: 1 }
              }}
            />
          </Paper>
        </Stack>
      </Container>

    </div>
  );
};

export default DeviceDetail;

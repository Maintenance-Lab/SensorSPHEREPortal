import { useState, useEffect } from 'react';
import { Paper, Typography, Container, Divider } from '@mui/material';
import { Helmet } from 'react-helmet-async';
import PageTitleWrapper from 'src/Components/PageTitleWrapper';
import BatteryFullIcon from '@mui/icons-material/BatteryFull';
import Stack from '@mui/material/Stack';
import { DataGrid, GridColDef} from '@mui/x-data-grid';
import { useParams } from 'react-router-dom';

const DeviceDetail = () => {
  interface GridRow {
    id: string;
    manufacturer: string;
    model: string;
    outputs: string[];
  }

  const { deviceId } = useParams();
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
    const data = await getDeviceDetails(deviceId);
    setDeviceManufacturer(data.manufacturer);
    setDeviceBatteryLevel(data.batteryLevel);
  };

  const deviceProperties = async (deviceId: string) => {
    let properties = {};
    try {
      properties = await getDeviceProperties(deviceId);
    }
    catch (e) {
      console.error(e);
    }
    return properties;
  };

  const loadRows = async (properties) => {
    const sensorRows:GridRow[] = Object.keys(properties).flatMap((manufacturer) => {
      const { model, properties: modelProperties } = properties[manufacturer];

      return model.map((modelName, index) => ({
        id: `${manufacturer}_${modelName}`,
        manufacturer: manufacturer,
        model: modelName,
        outputs: modelProperties[index]
      }));
    });

    setSensorRows(sensorRows);
  }

  const onLoad = async () => {
    const properties = await deviceProperties(deviceId);
    loadRows(properties);
  }

  useEffect(() => {
    handleDeviceDetails(deviceId);
    try {
      onLoad();
    }
    catch (e) {
      console.error(e);
    }
  }, [deviceId]);

  const sensorColumns: GridColDef[] = [
    { headerName: 'Manufacturer', field: 'manufacturer', flex: 1 },
    { headerName: 'Model', field: 'model', flex: 1 },
    { headerName: 'Outputs', field: 'outputs', flex: 1 }
  ];

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
              pageSizeOptions={[25]}
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

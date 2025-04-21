import { useState, useEffect } from 'react';
import { Paper, Typography, Container, Divider, Box } from '@mui/material';
import { Helmet } from 'react-helmet-async';
import PageTitleWrapper from 'src/Components/PageTitleWrapper';
import BatteryFullIcon from '@mui/icons-material/BatteryFull';
import Stack from '@mui/material/Stack';
import { useParams } from 'react-router-dom';

import { TreeView, TreeItem } from '@mui/lab';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

const DeviceDetail = () => {
  const { deviceId } = useParams();
  const [deviceManufacturer, setDeviceManufacturer] = useState('');
  const [deviceBatteryLevel, setDeviceBatteryLevel] = useState('');
  const [sensorTree, setSensorTree] = useState<React.ReactNode[]>([]);

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

  const buildTree = (data) => {
    const tree = [];

    const grouped = {};

    data.forEach(item => {
      const moduleKey = `${item.moduleManufacturer} - ${item.moduleName}`;
      if (!grouped[moduleKey]) grouped[moduleKey] = {};
      if (!grouped[moduleKey][item.sensorType]) grouped[moduleKey][item.sensorType] = new Set();
      grouped[moduleKey][item.sensorType].add(item.propertyName);
    });

    for (const mod in grouped) {
      const sensorTypes = grouped[mod];
      const children = [];

      for (const type in sensorTypes) {
        const propertyNodes = Array.from(sensorTypes[type]).map((prop, i) => (
          <TreeItem key={`${mod}-${type}-prop-${i}`} nodeId={`${mod}-${type}-${prop}`} label={prop} />
        ));

        children.push(
          <TreeItem key={`${mod}-${type}`} nodeId={`${mod}-${type}`} label={type}>
            {propertyNodes}
          </TreeItem>
        );
      }

      tree.push(
        <TreeItem key={mod} nodeId={mod} label={mod}>
          {children}
        </TreeItem>
      );
    }

    return tree;
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
    const treeNodes = buildTree(properties);
    setSensorTree(treeNodes);
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
            <Box sx={{ display: "flex", justifyContent: "flex-start" }}>
              <TreeView
                defaultCollapseIcon={<ExpandMoreIcon />}
                defaultExpandIcon={<ChevronRightIcon />}
              >
                {sensorTree}
              </TreeView>
            </Box>
          </Paper>
        </Stack>
      </Container>

    </div>
  );
};

export default DeviceDetail;

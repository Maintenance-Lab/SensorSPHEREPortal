import { useState, useEffect, useCallback } from 'react';
import { Paper, Typography, Container, Divider, Box } from '@mui/material';
import { Helmet } from 'react-helmet-async';
import PageTitleWrapper from 'src/components/pageTitleWrapper';
import BatteryFullIcon from '@mui/icons-material/BatteryFull';
import CableIcon from '@mui/icons-material/Cable';
import Stack from '@mui/material/Stack';
import { useParams } from 'react-router-dom';

import { TreeView, TreeItem } from '@mui/lab';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { useGatewaySocket } from '../../../helpers/useGatewaySocket';

const DeviceDetail = () => {
  const { deviceId } = useParams();
  const [deviceManufacturer, setDeviceManufacturer] = useState('');
  const [deviceBatteryLevel, setDeviceBatteryLevel] = useState<number | null>(null);
  const [deviceConnectStatus, setDeviceConnectStatus] = useState('connected');
  const [sensorTree, setSensorTree] = useState<React.ReactNode[]>([]);

  const getDeviceProperties = async (deviceId: string) => {
    const res:any = await fetch('/api/devices/properties/' + deviceId, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      throw new Error('Failed to fetch device properties');
    }

    const data = await res.json();
    return data;
  };

  const getDeviceDetails = async (deviceId: string) => {
    const res:any = await fetch('/api/devices/id/' + deviceId, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
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
      const moduleKey = `${item.moduleManufacturer}:${item.moduleName}`;
      if (!grouped[moduleKey]) grouped[moduleKey] = {};
      if (!grouped[moduleKey][item.sensorType]) grouped[moduleKey][item.sensorType] = new Set();
      grouped[moduleKey][item.sensorType].add(item.propertyName);
    });

    for (const mod in grouped) {
      const sensorTypes = grouped[mod];
      const children = [];

      const modLabel = mod.replace(/:/g, ' ');

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
        <TreeItem key={mod} nodeId={mod} label={modLabel}>
          {children}
        </TreeItem>
      );
    }

    return tree;
  };


  const handleDeviceDetails = async (deviceId: string) => {
    const data = await getDeviceDetails(deviceId);
    setDeviceManufacturer(data.manufacturer);
    setDeviceBatteryLevel(data.batteryLevel ?? null);
    setDeviceConnectStatus(data.connectStatus ?? 'connected');
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

  const handleGatewayEvent = useCallback((data: any) => {
    if (!data || data.event !== 'list_units' || !Array.isArray(data.units)) return;
    const unit = data.units.find((u: any) => u.mac === deviceId);
    if (!unit) {
      setDeviceConnectStatus('disconnected');
      return;
    }
    setDeviceBatteryLevel(unit.batteryLevel ?? null);
    setDeviceConnectStatus('connected');
  }, [deviceId]);

  useGatewaySocket(handleGatewayEvent);

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
            {deviceBatteryLevel === null || deviceBatteryLevel === undefined || deviceBatteryLevel < 0 ? (
              <Stack direction="row" alignItems="center" spacing={0.5}>
                <CableIcon fontSize="small" sx={{ color: deviceConnectStatus === 'connected' ? 'success.main' : 'text.disabled' }} />
                <Typography variant="body1" color={deviceConnectStatus === 'connected' ? 'success.main' : 'text.disabled'}>
                  {deviceConnectStatus === 'connected' ? 'Cable' : 'Offline'}
                </Typography>
              </Stack>
            ) : (
              <Stack direction="row">
                <BatteryFullIcon />
                <Typography variant="body1">{deviceBatteryLevel}%</Typography>
              </Stack>
            )}
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

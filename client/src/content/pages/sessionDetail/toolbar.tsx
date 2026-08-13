import * as Icons from '@mui/icons-material';
import { GridToolbarContainer, GridToolbarQuickFilter, GridColDef, GridRowsProp } from '@mui/x-data-grid';
import { Button, Chip, IconButton, Link, Typography, Box, Stack, Tooltip } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

import { addDevices, removeDevicesFromSession } from "./api";
import { renderBatteryCell, calculateLastSeen, formatLastSeenDevice, ConnectedCell } from './startSessionHelpers';
import { ConfigurationDialog } from './dialogs/configurationDialog';

const renderTruncatedCell = (value) => (
  <Tooltip title={value} arrow>
    <Box sx={{ display: 'flex', alignItems: 'center', height: '100%', width: '100%', overflow: 'hidden' }}>
      <Typography variant="body2" noWrap>{value}</Typography>
    </Box>
  </Tooltip>
);

const statusSortComparator = (v1, v2, p1, p2) => {
  const key = (value, p) => (value === 'connected' ? 0 : 1);
  const k1 = key(v1, p1);
  const k2 = key(v2, p2);
  if (k1 !== k2) return k1 - k2;
  const r1 = p1?.row?.lastSeenRaw ?? Infinity;
  const r2 = p2?.row?.lastSeenRaw ?? Infinity;
  return r1 - r2;
};

const getCommonColumns = (sessionId) => [
  { field: 'connected', headerName: 'Status', flex: 2, sortable: true, sortComparator: statusSortComparator,
      renderCell: (params) => ( <ConnectedCell deviceId={params.row.id} status={params.value} sessionId={sessionId} lastSeen={params.row.lastSeen} lastHeartbeat={params.row.lastHeartbeat}/>)
  },
  { field: 'id', headerName: 'MAC Address', flex: 2, sortable: true,
    renderCell: (params) => (
      <Link
        to={`/devices/detail/${params.id}`}
        component={RouterLink}
        onClick={(event) => event.stopPropagation()}
        sx={{ fontFamily: 'monospace', display: 'inline-flex', alignItems: 'center', height: '100%' }}
      >
        {params.value}
      </Link>
    ),
  },
  { field: 'manufacturer', headerName: 'Manufacturer', flex: 1, sortable: true, renderCell: (params) => renderTruncatedCell(params.value) },
  { field: 'model', headerName: 'Model', flex: 2, minWidth: 160, sortable: true, renderCell: (params) => renderTruncatedCell(params.value) },
  { field: 'battery', headerName: 'Power', flex: 1, sortable: true, sortComparator: (v1, v2) => (v1 ?? -1) - (v2 ?? -1), renderCell: renderBatteryCell },
  {
    field: 'lastSeenRaw',
    headerName: 'Last Seen Raw',
    sortable:true,
    renderCell: (params) => (
      <Box sx={{ display: 'flex', alignItems: 'center', height: '100%', width: '100%' }}>
        <Typography variant="body2" color="text.secondary">
          {params.value}
        </Typography>
      </Box>
    ),
  }
];

export const getDevicesColumns = (props: {
  handleRowClick: (id: string, event: React.MouseEvent) => void;
  sessionId: number;
  selectedDevice: string;
  loading: boolean;
  configurationDialogOpen: boolean;
  activeStep: number;
  steps: string[];
  sampleRate: number;
  selectedProperties: any[];
  expandedNodes: string[];
  allProperties: any;
  sessionStatus: string;
  renderTree: (data: any) => React.ReactNode;
  handleCloseConfigurationDialog: () => void;
  handleNext: () => void;
  handleReconfigure: () => void;
  setExpandedNodes: (nodes: string[]) => void;
}): GridColDef[] => {
  const {
    handleRowClick, sessionId, selectedDevice, loading, configurationDialogOpen,
    activeStep, steps, sampleRate, selectedProperties,
    expandedNodes, allProperties, sessionStatus, renderTree,
    handleCloseConfigurationDialog, handleNext, handleReconfigure,
    setExpandedNodes,
  } = props;

  return [
    ...getCommonColumns(sessionId),
    {
      field: 'configured', headerName: 'Configuration', flex: 1, sortable: true,
      sortComparator: (v1, v2) => Number(v1) - Number(v2),
      renderCell: (params) => (
        params.value
          ? <Chip size="small" color="success" label="Configured" icon={<Icons.CheckCircleOutline />} sx={{ height: 24 }} />
          : <Chip size="small" color="error" variant="outlined" label="Not configured" icon={<Icons.WarningAmber />} sx={{ height: 24 }} />
      ),
    },
    {
      field: 'sampleRate', headerName: 'Sample Rate', flex: 1, sortable: true,
      sortComparator: (v1, v2) => {
        const parse = (v) => (typeof v === 'string' && v !== '-' ? parseFloat(v) : Infinity);
        return parse(v1) - parse(v2);
      },
      renderCell: (params) => (
        params.value === '-'
          ? <Chip size="small" color="error" variant="outlined" label="Not set" sx={{ height: 24 }} />
          : <Chip size="small" color="primary" variant="outlined" label={params.value} sx={{ height: 24 }} />
      ),
    },
    {
      field: 'configureButton', headerName: "Configure", flex: 1, sortable: false, align: "center", headerAlign: "center",
      renderCell: (params) => {
        const isConnected = params.row.connected === "connected";
        const disabled = sessionStatus === "Measuring" || !isConnected;

        return (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "95%",
              width: "100%",
            }}
          >
            <div>
              <Tooltip
                title={
                  !isConnected
                    ? "Device must be connected to configure"
                    : sessionStatus === "Measuring"
                      ? "Cannot configure device while measuring"
                      : ""
                }
                disableHoverListener={isConnected && sessionStatus !== "Measuring"}
              >
                <span>
                  <Button
                    color="primary"
                    size="small"
                    disabled={disabled}
                    onClick={(event) => {
                      event.stopPropagation();
                      handleRowClick(params.row.id, event);
                    }}
                    sx={{
                      textTransform: "none",
                      fontWeight: "bold",
                      display: "flex",
                      alignItems: "center",
                      height: "auto",
                      margin: "auto",
                    }}
                  >
                    <Icons.Settings />
                  </Button>
                </span>
              </Tooltip>

              {selectedDevice === params.row.id && !loading && (
                <ConfigurationDialog
                  open={configurationDialogOpen}
                  device={selectedDevice}
                  activeStep={activeStep}
                  steps={steps}
                  sampleRate={sampleRate}
                  selectedProperties={selectedProperties}
                  expandedNodes={expandedNodes}
                  allProperties={allProperties}
                  renderTree={renderTree}
                  handleClose={handleCloseConfigurationDialog}
                  handleNext={handleNext}
                  handleReconfigure={handleReconfigure}
                  setExpandedNodes={setExpandedNodes}
                />
              )}
            </div>
          </Box>
        );
      },
    }
  ];
};

export const availableDevicesColumns = (sessionId): GridColDef[] => [
  ...getCommonColumns(sessionId),
  {
    field: 'sampleRatePadding', headerName: '', flex: 1,sortable: false,
    renderCell: () => null, disableColumnMenu: true,
  },
  {
    field: 'configurePadding', headerName: '', flex: 1, sortable: false,
    renderCell: () => null, disableColumnMenu: true,
  },
];

export const getAvailableDevicesRows = (availableDevices: any[]): GridRowsProp => {
  return availableDevices.map((device) => {
    const lastSeenRaw = calculateLastSeen(device);
    const lastSeen = formatLastSeenDevice(device);

    return {
      name: device.manufacturer,
      id: device.deviceId,
      manufacturer: device.manufacturer,
      model: device.model,
      connected: device.connectStatus,
      battery: device.batteryLevel,
      lastSeen,
      lastSeenRaw,
    };
  });
};



interface AvailableDevicesToolbarProps {
  selectedAddDeviceIds: string[];
  sessionId: number;
  fetchSessionDevices: () => Promise<void>;
  setAvailableDevices: React.Dispatch<React.SetStateAction<any[]>>;
  setDevices: React.Dispatch<React.SetStateAction<any[]>>;
  sessionStatus: string;
  handleAvailableDevices: (sessionId, setAvailableDevices) => Promise<void>;
  handleCheckStartingConditions: () => Promise<void>;
  availableCount: number;
}

export const AvailableDevicesToolbar: React.FC<AvailableDevicesToolbarProps> = ({
  selectedAddDeviceIds,
  sessionId,
  fetchSessionDevices,
  setAvailableDevices,
  setDevices,
  sessionStatus,
  handleAvailableDevices,
  handleCheckStartingConditions,
  availableCount,
}) => {

    const handleAddDevices = async (sessionId, selectedAddDeviceIds, fetchSessionDevices, setAvailableDevices, setDevices, sessionStatus) => {
        const success = await addDevices(sessionId, selectedAddDeviceIds);

        if (success) {
        await fetchSessionDevices(sessionId, setDevices);
        await handleAvailableDevices(sessionId, setAvailableDevices);
        await handleCheckStartingConditions();
        }
    }

  const activeSelection = selectedAddDeviceIds.length > 0;

  return (
    <GridToolbarContainer sx={{ padding: 1 }}>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ width: '100%', justifyContent: 'space-between' }}>
        <Button
          variant="outlined"
          startIcon={<Icons.Devices />}
          onClick={() =>
            handleAddDevices(
              sessionId,
              selectedAddDeviceIds,
              fetchSessionDevices,
              setAvailableDevices,
              setDevices,
              sessionStatus,
            )
          }
          disabled={!activeSelection || sessionStatus === 'Measuring'}
        >
          Add Devices to Session
        </Button>
        {availableCount > 10 && (
          <GridToolbarQuickFilter variant="outlined" size="small" sx={{ padding: 0 }} />
        )}
      </Stack>
    </GridToolbarContainer>
  );
}

interface ConnectedDevicesToolbarProps {
  selectedDeviceIds: string[];
  sessionId: number;
  fetchSessionDevices: () => Promise<void>;
  setAvailableDevices: React.Dispatch<React.SetStateAction<any[]>>;
  setDevices: React.Dispatch<React.SetStateAction<any[]>>;
  sessionStatus: string;
  handleAvailableDevices: (sessionId, setAvailableDevices) => Promise<void>;
  handleCheckStartingConditions: () => Promise<void>;
  deviceCount: number;
}

export const ConnectedDevicesToolbar: React.FC<ConnectedDevicesToolbarProps> = ({
  selectedDeviceIds,
  sessionId,
  fetchSessionDevices,
  setAvailableDevices,
  setDevices,
  sessionStatus,
  handleAvailableDevices,
  handleCheckStartingConditions,
  deviceCount,
}) => {

  const handleRemoveDevices = async (sessionId, selectedDeviceIds, fetchSessionDevices, setAvailableDevices, setDevices, sessionStatus) => {
    const success = await removeDevicesFromSession(sessionId, selectedDeviceIds);

    if (success) {
      await fetchSessionDevices(sessionId, setDevices);
      await handleAvailableDevices(sessionId, setAvailableDevices);
      await handleCheckStartingConditions();
    }
  };

  const activeSelection = selectedDeviceIds.length > 0;

  return (
    <GridToolbarContainer sx={{ padding: 1 }}>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ width: '100%', justifyContent: 'space-between' }}>
        {activeSelection && (
          <Tooltip title="Remove selected devices from session">
            <span>
              <IconButton
                disabled={sessionStatus === 'Measuring'}
                onClick={() =>
                  handleRemoveDevices(
                    sessionId,
                    selectedDeviceIds,
                    fetchSessionDevices,
                    setAvailableDevices,
                    setDevices,
                    sessionStatus,
                  )
                }
              >
                <Icons.PlaylistRemoveOutlined />
              </IconButton>
            </span>
          </Tooltip>
        )}
        {deviceCount > 10 && (
          <GridToolbarQuickFilter variant="outlined" size="small" sx={{ padding: 0 }} />
        )}
      </Stack>
    </GridToolbarContainer>
  );
}

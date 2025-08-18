import * as Icons from '@mui/icons-material';
import { GridToolbarContainer, GridToolbarQuickFilter, GridColDef, GridRowsProp } from '@mui/x-data-grid';
import { Button, Link, Typography, Box, Stack } from '@mui/material';

import { addDevices, removeDevicesFromSession } from "./api";
import {renderBatteryCell, renderConnectedCell, calculateLastSeen, formatLastSeen } from './startSessionHelpers'
import { ConfigurationDialog } from './dialogs/configurationDialog';

const commonColumns: GridColDef[] = [
  { field: 'id', headerName: 'MAC Address', flex: 2, sortable: false,
    renderCell: (params) => (
      <Link
        href={`/devices/detail/${params.id}`}
        sx={{ padding: 1, marginX: -1 }}
        onClick={(event) => event.stopPropagation()}
      >
        {params.value}
      </Link>
    ),
  },
  { field: 'lastSeen', headerName: 'Last Seen', flex: 1, sortable: false,
    renderCell: (params) => (
      <Box sx={{ display: 'flex', alignItems: 'center', height: '100%', width: '100%' }}>
        <Typography variant="body2" color="text.secondary">
          {params.value}
        </Typography>
      </Box>
    ),
  },
  { field: 'battery', headerName: 'Battery', flex: 1, sortable: false, renderCell: renderBatteryCell },
  { field: 'connected', headerName: 'Connected',flex: 1, sortable: false,
    renderCell: renderConnectedCell
  },
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
  selectedDevice: string;
  loading: boolean;
  configurationDialogOpen: boolean;
  activeStep: number;
  steps: string[];
  sampleRate: number;
  selectedProperties: any[];
  expandedNodes: string[];
  allProperties: any;
  renderTree: (data: any) => React.ReactNode;
  handleCloseConfigurationDialog: () => void;
  handleNext: () => void;
  handleReconfigure: () => void;
  setExpandedNodes: (nodes: string[]) => void;
}): GridColDef[] => {
  const {
    handleRowClick, selectedDevice, loading, configurationDialogOpen,
    activeStep, steps, sampleRate, selectedProperties,
    expandedNodes, allProperties, renderTree,
    handleCloseConfigurationDialog, handleNext, handleReconfigure,
    setExpandedNodes,
  } = props;

  return [
    ...commonColumns,
    {
      field: 'sampleRate', headerName: 'Sample Rate', flex: 1, sortable: false
    },
    {
      field: 'configureButton', headerName: 'Configure', flex: 1, sortable: false, align: 'center', headerAlign: 'center',
      renderCell: (params) => (
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: "95%", width: "100%" }}>
          <div>
            <Button
              color="primary"
              size="small"
              onClick={(event) => {
                event.stopPropagation();
                handleRowClick(params.row.id, event);
              }}
              sx={{ textTransform: "none", fontWeight: "bold", display: "flex", alignItems: "center", height: "auto", margin: "auto" }}
            >
              <Icons.Settings />
            </Button>
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
      )
    }
  ];
};

export const availableDevicesColumns: GridColDef[] = [
  ...commonColumns,
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
    const lastSeen = formatLastSeen(device);

    return {
      name: device.manufacturer,
      id: device.deviceId,
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
  handleAvailableDevices: (sessionId, setAvailableDevices) => Promise<void>;
  handleCheckStartingConditions: () => Promise<void>;
}

export const AvailableDevicesToolbar: React.FC<AvailableDevicesToolbarProps> = ({
  selectedAddDeviceIds,
  sessionId,
  fetchSessionDevices,
  setAvailableDevices,
  setDevices,
  handleAvailableDevices,
  handleCheckStartingConditions,
}) => {

    const handleAddDevices = async (sessionId, selectedAddDeviceIds, fetchSessionDevices, setAvailableDevices, setDevices) => {
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
      <Stack direction="row" spacing={1}>
        <GridToolbarQuickFilter variant="outlined" size="small" sx={{ padding: 0 }} />
        <Button
          variant="outlined"
          startIcon={<Icons.Devices />}
          onClick={() =>
            handleAddDevices(
              sessionId,
              selectedAddDeviceIds,
              fetchSessionDevices,
              setAvailableDevices,
              setDevices
            )
          }
          disabled={!activeSelection}
        >
          Add Devices to Session
        </Button>
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
  handleAvailableDevices: (sessionId, setAvailableDevices) => Promise<void>;
  handleCheckStartingConditions: () => Promise<void>;
}

export const ConnectedDevicesToolbar: React.FC<ConnectedDevicesToolbarProps> = ({
  selectedDeviceIds,
  sessionId,
  fetchSessionDevices,
  setAvailableDevices,
  setDevices,
  handleAvailableDevices,
  handleCheckStartingConditions,
}) => {

  const handleRemoveDevices = async (sessionId, selectedDeviceIds, fetchSessionDevices, setAvailableDevices, setDevices) => {
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
      <Stack direction="row" spacing={1}>
        <GridToolbarQuickFilter variant="outlined" size="small" sx={{ padding: 0 }} />
        <Button
          variant="outlined"
          size="medium"
          color="error"
          startIcon={<Icons.DeleteOutlineOutlined />}
          disabled={!activeSelection}
          onClick={() =>
            handleRemoveDevices(
              sessionId,
              selectedDeviceIds,
              fetchSessionDevices,
              setAvailableDevices,
              setDevices
            )
          }
        >
          Remove Devices from Session
        </Button>
      </Stack>
    </GridToolbarContainer>
  );
}

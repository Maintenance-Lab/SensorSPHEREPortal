import * as Icons from '@mui/icons-material';
import { useState, useRef, useEffect } from 'react';
import { GridToolbarContainer, GridToolbarQuickFilter, GridColDef, GridRowsProp } from '@mui/x-data-grid';
import { Button, Chip, Link, Typography, Box, Stack, Tooltip } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

import { renderBatteryCell, calculateLastSeen, formatLastSeenDevice, ConnectedCell } from './startSessionHelpers';
import { ConfigurationDialog } from './dialogs/configurationDialog';

const TruncatedCell = ({ value, justifyContent = 'flex-start' }) => {
  const textRef = useRef<HTMLSpanElement>(null);
  const [truncated, setTruncated] = useState(false);

  useEffect(() => {
    const el = textRef.current;
    if (el) setTruncated(el.scrollWidth > el.clientWidth);
  }, [value]);

  return (
    <Tooltip title={truncated ? value : ''} arrow disableHoverListener={!truncated}>
      <Box sx={{ display: 'flex', alignItems: 'center', height: '100%', width: '100%', overflow: 'hidden', justifyContent }}>
        <Typography variant="body2" noWrap ref={textRef}>{value}</Typography>
      </Box>
    </Tooltip>
  );
};

const renderTruncatedCell = (value, justifyContent = 'flex-start') => (
  <TruncatedCell value={value} justifyContent={justifyContent} />
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
  { field: 'battery', headerName: 'Power', flex: 1, sortable: true, sortComparator: (v1, v2) => (v1 ?? -1) - (v2 ?? -1), renderCell: renderBatteryCell },
  { field: 'connected', headerName: 'Status', flex: 2, sortable: true, sortComparator: statusSortComparator,
      renderCell: (params) => ( <ConnectedCell deviceId={params.row.id} status={params.value} sessionId={sessionId} lastSeen={params.row.lastSeen} lastHeartbeat={params.row.lastHeartbeat}/>)
  },
  { field: 'id', headerName: 'Identifier (MAC)', flex: 2, sortable: true,
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

export interface ConfigColumnProps {
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
  onInclude?: (deviceId: string) => void;
  onExclude?: (deviceId: string) => void;
}

const ConfigTag = ({ isConfigured, disabled, onOpen }) => {
  const [hovered, setHovered] = useState(false);

  const textColor = isConfigured ? 'success.main' : 'error.main';
  const hoverColor = 'text.primary';
  const primary = isConfigured ? "Configured" : "Not configured";
  const hoverText = isConfigured ? "Reconfigure" : "Configure";
  const Icon = isConfigured ? Icons.CheckCircleOutline : Icons.WarningAmber;
  const HoverIcon = Icons.Settings;

  return (
    <Chip
      size="small"
      variant="outlined"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={disabled ? undefined : onOpen}
      sx={{
        height: 24,
        minWidth: 170,
        borderRadius: 0,
        cursor: disabled ? 'default' : 'pointer',
        backgroundColor: '#fff',
        borderColor: hovered ? hoverColor : textColor,
        color: hovered ? hoverColor : textColor,
        transition: 'color 0.2s ease, border-color 0.2s ease',
        '& .MuiChip-icon': { color: 'inherit' },
        '& .MuiChip-label': { display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', px: 1.5 },
      }}
      label={
        <Box sx={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', lineHeight: 1 }}>
          <Box sx={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, opacity: hovered ? 0 : 1, transition: 'opacity 0.2s ease' }}>
            <Icon sx={{ fontSize: 16 }} />
            <Typography variant="body2" noWrap sx={{ lineHeight: 1 }}>{primary}</Typography>
          </Box>
          <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, opacity: hovered ? 1 : 0, transition: 'opacity 0.2s ease' }}>
            <HoverIcon sx={{ fontSize: 16 }} />
            <Typography variant="body2" noWrap sx={{ lineHeight: 1 }}>{hoverText}</Typography>
          </Box>
        </Box>
      }
    />
  );
};

const configColumn = (props: ConfigColumnProps): GridColDef => {
  const {
    handleRowClick, selectedDevice, loading, configurationDialogOpen,
    activeStep, steps, sampleRate, selectedProperties,
    expandedNodes, allProperties, sessionStatus, renderTree,
    handleCloseConfigurationDialog, handleNext, handleReconfigure,
    setExpandedNodes,
  } = props;

  return {
    field: 'configured', headerName: 'Config', flex: 0.6, minWidth: 180, sortable: true, align: 'center', headerAlign: 'center',
    sortComparator: (v1, v2) => Number(v1) - Number(v2),
    renderCell: (params) => {
      const isConnected = params.row.connected === "connected";
      const isConfigured = params.value;
      const disabled = sessionStatus === "Measuring" || !isConnected;

      const openConfig = (event) => {
        event.stopPropagation();
        handleRowClick(params.row.id, event);
      };

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
            <ConfigTag isConfigured={isConfigured} disabled={disabled} onOpen={openConfig} />

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
  };
};

const sampleRateColumn = (): GridColDef => ({
  field: 'sampleRate', headerName: 'Sample Rate', width: 110, sortable: true, align: 'center', headerAlign: 'center',
  sortComparator: (v1, v2) => {
    const parse = (v) => (typeof v === 'string' && v !== '-' ? parseFloat(v) : Infinity);
    return parse(v1) - parse(v2);
  },
  renderCell: (params) => (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', width: '100%' }}>
{params.value === '-'
            ? <Chip size="small" color="default" variant="outlined" label="???" sx={{ height: 24 }} />
            : <Chip size="small" color="primary" variant="outlined" label={params.value} sx={{ height: 24 }} />}
    </Box>
  ),
});

const actionColumn = ({ onInclude, onExclude, sessionStatus }: ConfigColumnProps): GridColDef => {
  const include = Boolean(onInclude);

  return {
    field: 'action',
    headerName: include ? 'Include' : 'Exclude',
    width: 110,
    sortable: false,
    align: 'center',
    headerAlign: 'center',
    renderCell: (params) => (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', width: '100%' }}>
        <Button
          size="small"
          variant="outlined"
          color={include ? 'primary' : 'error'}
          disabled={sessionStatus === 'Measuring'}
          onClick={(event) => {
            event.stopPropagation();
            if (include) {
              onInclude(params.row.id);
            } else {
              onExclude(params.row.id);
            }
          }}
          sx={{ height: 28, minWidth: 80 }}
        >
          {include ? 'Include' : 'Exclude'}
        </Button>
      </Box>
    ),
  };
};

export const getDevicesColumns = (props: ConfigColumnProps): GridColDef[] => [
  actionColumn(props),
  ...getCommonColumns(props.sessionId),
  configColumn(props),
  sampleRateColumn(),
];

export const availableDevicesColumns = (props: ConfigColumnProps): GridColDef[] => [
  actionColumn(props),
  ...getCommonColumns(props.sessionId),
  configColumn(props),
  sampleRateColumn(),
];

export const getAvailableDevicesRows = (availableDevices: any[], sampleRateMap: Record<string, number> = {}): GridRowsProp => {
  return availableDevices.map((device) => {
    const lastSeenRaw = calculateLastSeen(device);
    const lastSeen = formatLastSeenDevice(device);
    const sampleRate = sampleRateMap[device.deviceId];

    return {
      name: device.manufacturer,
      id: device.deviceId,
      manufacturer: device.manufacturer,
      model: device.model,
      connected: device.connectStatus,
      battery: device.batteryLevel,
      sampleRate: sampleRate ? sampleRate + " Hz" : "-",
      configured: sampleRate != null,
      lastSeen,
      lastSeenRaw,
    };
  });
};



interface AvailableDevicesToolbarProps {
  availableCount: number;
}

export const AvailableDevicesToolbar: React.FC<AvailableDevicesToolbarProps> = ({
  availableCount,
}) => {
  const showQuickFilter = availableCount > 2;

  if (!showQuickFilter) return null;

  return (
    <GridToolbarContainer sx={{ padding: 1 }}>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ width: '100%', justifyContent: 'flex-end' }}>
        <GridToolbarQuickFilter variant="outlined" size="small" sx={{ padding: 0 }} />
      </Stack>
    </GridToolbarContainer>
  );
}

interface ConnectedDevicesToolbarProps {
  deviceCount: number;
}

export const ConnectedDevicesToolbar: React.FC<ConnectedDevicesToolbarProps> = ({
  deviceCount,
}) => {
  const showQuickFilter = deviceCount > 2;

  if (!showQuickFilter) return null;

  return (
    <GridToolbarContainer sx={{ padding: 1 }}>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ width: '100%', justifyContent: 'flex-end' }}>
        <GridToolbarQuickFilter variant="outlined" size="small" sx={{ padding: 0 }} />
      </Stack>
    </GridToolbarContainer>
  );
}

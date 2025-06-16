import { Helmet } from 'react-helmet-async';
import PageTitleWrapper from 'src/Components/PageTitleWrapper';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Button, TextField, Link, Typography, Container, Box, Paper, Dialog,
  DialogActions, DialogContent, DialogTitle, Stack, Checkbox, FormControlLabel,
  Stepper, Step, StepLabel, CircularProgress } from '@mui/material';
import { DataGrid, GridColDef, GridRowsProp, GridToolbarContainer,
  GridToolbarQuickFilter } from '@mui/x-data-grid';
import { ArchiveOutlined, DeleteOutline, Devices, Inventory,
  UnarchiveOutlined, DesignServicesOutlined } from '@mui/icons-material';
import { TreeView, TreeItem } from '@mui/lab';
import { useNavigate } from 'react-router-dom';


import InfoIcon from '@mui/icons-material/Info';
import Tooltip from '@mui/material/Tooltip';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';


import * as Icons from '@mui/icons-material';

// Imports from functions moved to different files
import { RenderTree } from "./types";
import { loadRows, getOnChange, updateSelection } from "./treeView";
import { fetchDevices, removeDevicesFromSession, sendConfiguration, updateSession, deleteSession, addDevices,
  getDeviceProperties, getSelectedProperties, updateSelectedProperties, fetchAvailableDevices, fetchSession, projectData,
  listUnits, getSampleRate, saveSampleRate, startBatch, stopBatch
 } from "./api";

//  Api calls in api.tsx
 const handleAvailableDevices = async (sessionId, setAvailableDevices) => {
    const availableDevicesData = await fetchAvailableDevices(sessionId);
    setAvailableDevices(availableDevicesData);
    return availableDevicesData;
 };

// const handleRemoveDevices = async (sessionId, selectedDeviceIds, fetchSessionDevices, setAvailableDevices, setDevices) => {
//   const success = await removeDevicesFromSession(sessionId, selectedDeviceIds);

//   if (success) {
//     await fetchSessionDevices(sessionId, setDevices);
//     await handleAvailableDevices(sessionId, setAvailableDevices);
//   }
// };

// const handleAddDevices = async (sessionId, selectedAddDeviceIds, fetchSessionDevices, setAvailableDevices, setDevices) => {
//   const success = await addDevices(sessionId, selectedAddDeviceIds);

//   if (success) {
//     await fetchSessionDevices(sessionId, setDevices);
//     await handleAvailableDevices(sessionId, setAvailableDevices);
//   }
// }

const handleFetchSession = async (sessionId, setSessionName, setSessionDescription, setProjectId, setProjectName, setIsArchived) => {
  const sessionData = await fetchSession(sessionId);
  setProjectId(sessionData.projectId);
  setSessionName(sessionData.name);
  setIsArchived(sessionData.archived);
  setSessionDescription(sessionData.description);

  await handleProjectData(sessionData.projectId, setProjectName);
}

const handleProjectData = async (projectId, setProjectName) => {
  const data = await projectData(projectId);
  setProjectName(data.name);
}

const fetchSessionDevices = async (sessionId, setDevices) => {
  const devices = await fetchDevices(sessionId);
  setDevices(devices);

  return devices;
};


// function ConnectedDevicesToolbar({ selectedDeviceIds, sessionId, fetchSessionDevices, setAvailableDevices, setDevices }) {
//   const activeSelection = selectedDeviceIds.length > 0;

//   return (
//     <GridToolbarContainer sx={{ padding: 1 }}>
//       <Stack direction="row" spacing={1}>
//         <GridToolbarQuickFilter variant="outlined" size='small' justify-content="space-between" sx={{ padding: 0 }} />
//           <Button
//             variant="outlined"
//             size="medium"
//             color="error"
//             startIcon={<Icons.DeleteOutlineOutlined />}
//             disabled={!activeSelection}
//             // onClick={() => removeDevicesFromSession(sessionId, selectedDeviceIds, fetchSessionDevices, fetchAvailableDevices)}
//             onClick={() => handleRemoveDevices(sessionId, selectedDeviceIds, fetchSessionDevices, setAvailableDevices, setDevices)}

//           >
//             Remove Devices from Session
//           </Button>
//       </Stack>
//     </GridToolbarContainer>
//   );
// }



const SessionDetail = () => {
  const sessionId = Number(useParams().sessionId);
  const [sessionName, setSessionName] = useState('');
  const [sessionDescription, setSessionDescription] = useState('');
  const [projectId, setProjectId] = useState('');
  const [projectName, setProjectName] = useState('');
  const [isArchived, setIsArchived] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [isDialogOpen2, setDialogOpen2] = useState(false);
  const [isDialogOpen3, setDialogOpen3] = useState(false);
  const [selectedDeviceIds, setSelectedDeviceIds] = useState([]);
  const [selectedAddDeviceIds, setSelectedAddDeviceIds] = useState([]);
  const [devices, setDevices] = useState([]);
  const [devicesRows, setDevicesRows] = useState<GridRowsProp>([]);
  const [availableDevices, setAvailableDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [allProperties, setAllProperties] = useState<RenderTree>();
  const [selectedProperties, setSelectedProperties] = useState(['root']);
  const [expandedNodes, setExpandedNodes] = useState<string[]>(['root']);
  const [loading, setLoading] = useState(false);


  const [activeStep, setActiveStep] = useState(0);
  const [defaultConfigStep, setDefaultConfigStep] = useState(0);
  const [sampleRate, setSampleRate] = useState(null);
  const [sampleRates, setSampleRates] = useState([]);
  const steps = ['Select Properties', 'Find sample rate', 'Save configuration'];
  const [devicesWithoutSampleRate, setDevicesWithoutSampleRate] = useState([]);

  const [progress, setProgress] = useState(0);
  const [sessionStatus, setSessionStatus] = useState('Not started');
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isStartDisabled, setIsStartDisabled] = useState(true);
  const [startRequirements, setStartRequirements] = useState([]);


  const navigate = useNavigate();


  // New rows when new devices added from mqtt
  // const [newDevices, setNewDevices] = useState([]);

  const handleOpenDialog = () => setDialogOpen(true);
  const handleCloseDialog = () => setDialogOpen(false);

  const handleAddDevices = async (sessionId, selectedAddDeviceIds, fetchSessionDevices, setAvailableDevices, setDevices) => {
    const success = await addDevices(sessionId, selectedAddDeviceIds);

    if (success) {
      await fetchSessionDevices(sessionId, setDevices);
      await handleAvailableDevices(sessionId, setAvailableDevices);
      await checkStartingConditions();
    }
  }

  const handleRemoveDevices = async (sessionId, selectedDeviceIds, fetchSessionDevices, setAvailableDevices, setDevices) => {
    const success = await removeDevicesFromSession(sessionId, selectedDeviceIds);

    if (success) {
      await fetchSessionDevices(sessionId, setDevices);
      await handleAvailableDevices(sessionId, setAvailableDevices);
      await checkStartingConditions();
    }
  };

  function AvailableDevicesToolbar({ selectedAddDeviceIds, sessionId, fetchSessionDevices,  setAvailableDevices, setDevices}) {
    const activeSelection = selectedAddDeviceIds.length > 0;

    return (
      <GridToolbarContainer sx={{ padding: 1 }}>
        <Stack direction="row" spacing={1}>
        <GridToolbarQuickFilter variant="outlined" size="small" sx={{ padding: 0 }} />
          <Button
            variant="outlined"
            startIcon={<Devices />}
            onClick={() =>  handleAddDevices(sessionId, selectedAddDeviceIds, fetchSessionDevices, setAvailableDevices, setDevices)}
            disabled={!activeSelection}
          >
            Add Devices to Session
          </Button>
        </Stack>
      </GridToolbarContainer>
    );
  }

  function ConnectedDevicesToolbar({ selectedDeviceIds, sessionId, fetchSessionDevices, setAvailableDevices, setDevices }) {
    const activeSelection = selectedDeviceIds.length > 0;

    return (
      <GridToolbarContainer sx={{ padding: 1 }}>
        <Stack direction="row" spacing={1}>
          <GridToolbarQuickFilter variant="outlined" size='small' justify-content="space-between" sx={{ padding: 0 }} />
            <Button
              variant="outlined"
              size="medium"
              color="error"
              startIcon={<Icons.DeleteOutlineOutlined />}
              disabled={!activeSelection}
              // onClick={() => removeDevicesFromSession(sessionId, selectedDeviceIds, fetchSessionDevices, fetchAvailableDevices)}
              onClick={() => handleRemoveDevices(sessionId, selectedDeviceIds, fetchSessionDevices, setAvailableDevices, setDevices)}

            >
              Remove Devices from Session
            </Button>
        </Stack>
      </GridToolbarContainer>
    );
  }

  const formatTime = (seconds) => {
    if (!seconds && seconds !== 0) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };


  const MemoizedTreeItem = React.memo(TreeItem);
  const renderTree = useCallback((nodes: RenderTree) => {
    if (!nodes || !nodes.id) return null;
    return (
      <MemoizedTreeItem
        key={nodes.id}
        nodeId={String(nodes.id)}
        label={
          <FormControlLabel
            control={
              <Checkbox
                checked={selectedProperties.includes(nodes.id)}
                onChange={(event) =>
                  getOnChange(
                    event.currentTarget.checked,
                    nodes,
                    allProperties,
                    setSelectedProperties
                  )
                }
              />
            }
            label={nodes.name}
          />
        }
      >
        {nodes.children &&
          Object.values(nodes.children).map((child) => renderTree(child))}
      </MemoizedTreeItem>
    );
  }, [selectedProperties, getOnChange]);

  const handleSelectedProperties = async (deviceId:string) => {
    const properties = await getSelectedProperties(deviceId, sessionId);
    const selectedPropertiesIds = properties.map((property) => {
      return `${property.moduleManufacturer}:${property.moduleName}:${property.sensorType}:${property.propertyName}`;
    });

    const allProperties = await loadRows( await getDeviceProperties(deviceId), setAllProperties);
    const updatedSelection = updateSelection(selectedPropertiesIds, allProperties);
    setSelectedProperties(updatedSelection);

    setLoading(false);

    // return updatedSelection;
    return selectedPropertiesIds;
  }

  const handleOpenDialog2 = async (deviceId) => {
    setLoading(true);
    setSelectedDevice(deviceId);
    await handleSelectedProperties(deviceId);
    setDialogOpen2(true);
  };

  const handleReconfigure = async () => {
    setActiveStep(0);
    setSampleRate(null);
  }

  const handleCloseDialog2 = async (step) => {
    if (step === 2 && sampleRate !== null) {
      await saveSampleRate(sessionId, selectedDevice, sampleRate);
      // await updateSelectedProperties(selectedDevice, sessionId, selectedProperties);
    }

    setDialogOpen2(false);
    setActiveStep(0);
    setSampleRate(null);
  };

    const handleCloseDialog3 = async () => {
    setDialogOpen3(false);
    setDefaultConfigStep(0);
    setSampleRates([]);
  };

  const handleNext = async (sessionId, selectedDevice) => {
    if (activeStep === steps.length - 1) {
      if (sampleRate !== null) {
        handleCloseDialog2(activeStep);
        return;
      }
      else {
        setActiveStep(0);
        return;
      }
    }

    const newStep = activeStep + 1;
    setActiveStep(newStep);

    if (newStep === 1) {
      await updateSelectedProperties(selectedDevice, sessionId, selectedProperties);
      const sampleRate = await sendConfiguration(sessionId, selectedDevice);
      if (sampleRate !== null) {
        setSampleRate(sampleRate);
      }

      setActiveStep((prev) => prev + 1);
    }
  };

  const deviceConfigTitle = (index: number) => {
    switch (index) {
      case 0:
        return 'Select properties to include in data collection';
      case 1:
        return (
          <>
            Testing for sample rate
            <br />
            <Typography variant="caption" color="textSecondary">
              This may take a few seconds.
            </Typography>
          </>
      );
        // return 'Finding maximum sample rate';
      case 2:
        return 'Maximum sample rate of this device with selected properties';
    }
  };

  const deviceConfigContent = (index: number) => {
    switch (index) {
      case 0:
        return (
          <TreeView
            multiSelect={true}
            defaultExpandIcon={<Icons.ChevronRight/>}
            defaultCollapseIcon={<Icons.ExpandMore/>}
            defaultSelected={selectedProperties}
            expanded={expandedNodes}
            onNodeToggle={(e, nodeIds) => {
              setExpandedNodes(nodeIds);
            }}>
            {allProperties && renderTree(allProperties)}
          </TreeView>
      );
      case 1:
        return (
          <CircularProgress size={100}/>
        )
      case 2:
        if (sampleRate !== null) {
          return (
            <Typography variant="h4" align="center" sx={{ mt: 2, mb: 1 }}>{sampleRate} Hz</Typography>)
          }
        return (
          <Typography variant="h4" align="center" sx={{ mt: 2, mb: 1 }}>No sample rate found</Typography>
        )
    }
  }

  const defaultConfigContent = (index: number) => {
    // console.log("DEFAULT CONFIG STEP: ", index)
    switch (index) {
      case 0:
        return (
          <Box>
          <Typography variant="h5" align="center">
            Some Devices Are Not Configured
          </Typography>

          <Typography variant="body1" align="center" sx={{ mb: 2 }}>
            There {devices.length === 1 ? "is" : "are"} <strong>{devices.length}</strong> device
            {devices.length === 1 ? "" : "s"} without a sample rate configuration.
          </Typography>

          <Typography variant="body2" align="center" sx={{ mt: 1 }}>
            Proceeding will initiate the sample rate detection process. This step may take a few seconds to complete
          </Typography>
          </Box>
      );
      case 1:
        return (
          <CircularProgress size={100}/>
        )
      case 2:
        if (sampleRates.length === devices.length && sampleRates.every(rate => rate !== null)) {
          return (
            <Box>
              <Typography variant="h5" align="center" sx={{ mt: 2 }}>
                The following sample rates were found?returned?:
              </Typography>
              {devices.map((device, index) => (
                <Typography key={device.deviceId || index} align="center" sx={{ mt: 1 }}>
                  <strong>{device.deviceId || `Device ${index + 1}`}:</strong> {sampleRates[index]} Hz
                </Typography>
              ))}
              <Typography variant="h6" align="center" sx={{ mt: 3 }}>
                Click 'Start Session' to proceed with these sample rates.
              </Typography>
            </Box>
          );
          // return (
          //   <Typography variant="h4" align="center" sx={{ mt: 2, mb: 1 }}>{sampleRate} Hz</Typography>)
        }
        return (
          <Typography variant="h4" align="center" sx={{ mt: 2, mb: 1 }}>No sample rate found</Typography>
        )
    }
  }



  const handleRowClick = async (deviceId: string, event) => {
    event.stopPropagation();
    setLoading(true);
    try {
      await handleOpenDialog2(deviceId);
    } catch (error) {
      console.error("Error opening dialog:", error);
    } finally {
      setLoading(false);
    }
  };

  const DeviceConfigDialog = ({ device, open }) => {
    return (
    <Dialog
      open={open}
      maxWidth={false}
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <DialogContent
        sx={{width: "50vw", height: "90vh", display: "flex", flexDirection: "column",
          "& .MuiDialog-paper": { width: "50vw", height: "90vh" }}}
      >
        <Box sx={{ position: "sticky", top: 0, backgroundColor: "white", zIndex: 10 }}>
          <Stepper activeStep={activeStep}>
            {steps.map((label, index) => {
              const stepProps: { completed?: boolean } = {};
              const labelProps: { optional?: React.ReactNode } = {};
              return (
                <Step key={label} {...stepProps}>
                  <StepLabel {...labelProps}>{label}</StepLabel>
                </Step>
              );
            })}
          </Stepper>
          <Typography variant="h4" align="center" sx={{ mt: 2, mb: 1 }}>
            {deviceConfigTitle(activeStep)}
          </Typography>
        </Box>
        <Box sx={{ flexGrow: 1, overflowY: "auto", padding: 2, display: "flex", justifyContent: activeStep === 0 ? "flex-start" : "center",
            alignItems: activeStep === 0 ? "flex-start" : "center" }}>
          <Box sx={{ display: "flex", justifyContent: activeStep === 0 ? "flex-start" : "center",
            alignItems: activeStep === 0 ? "flex-start" : "center" }}>
            {deviceConfigContent(activeStep)}
          </Box>
        </Box>
        <Box sx={{ position: "sticky", bottom: 0, backgroundColor: "white", borderTop: "1px solid #ddd",
            padding: "8px", display: "flex", flexDirection: "column", zIndex: 5 }}>
          {activeStep === 0 && (
            <Typography
              variant="caption"
              color="textSecondary"
              align="center"
              sx={{ mt: 1 }}
            >
              Proceeding will start testing for sample rate. <br />
              This may take a few seconds.
            </Typography>
          )}
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
            {activeStep !== 1 && (
              <Button color="inherit" onClick={handleCloseDialog2} sx={{ ml: 1 }}>
                Cancel
              </Button>
            )}

            {activeStep === 2 && (
              <Button
                onClick={() => {
                  handleReconfigure();
                }}
                sx={{ mr: 1 }}
              >
                Reconfigure
              </Button>
            )}

            {activeStep !== 1 && (
              <Button
                onClick={() => {
                  handleNext(sessionId, device);
                }}
                sx={{ mr: 1 }}
                disabled={activeStep === steps.length - 1 && sampleRate == null}
              >
                {activeStep === steps.length - 1 ? "Save" : "Next"}
              </Button>
            )}
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  )
};

const DefaultConfigurationDialog = ({ devices, open }) => {
  return (
    <Dialog
      open={open}
      maxWidth="sm"
      fullWidth
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <DialogContent
        sx={{
          height: "auto",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          gap: 2,
        }}
      >

      <Box sx={{ display: "flex", justifyContent: defaultConfigStep === 0 ? "flex-start" : "center",
        alignItems: "center" }}>
        {defaultConfigContent(defaultConfigStep)}
      </Box>


        {defaultConfigStep !== 1 && (
          <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}>
              <Button onClick={handleCloseDialog3}>Cancel</Button>
              <Button variant="contained" onClick={() => handleStartSession(devices, defaultConfigStep)}>
                {defaultConfigStep === 0 ? "Continue" : "Start Session"}
              </Button>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

const isValidDate = (dateString: any) => {
  const date = new Date(dateString);
  return !isNaN(date.getTime());
};

const calculateLastSeen = (device) => {
  const timestamp = device.lastHeartbeat;
  if (!timestamp || typeof timestamp !== 'string') return Infinity;

  if (device.connectStatus === 'connected') {
    return 0;
  }

  // Format the timestamp into a valid ISO string
  const iso = timestamp
    .replace(' ', 'T')
    .replace(/ ([+-]\d{2}:\d{2})$/, '$1')
    .replace(/ ([+-]\d{4})$/, (_, offset) => {
      return offset.slice(0, 3) + ':' + offset.slice(3);
    });

  const date = new Date(iso);

  // If it's an invalid date, return Infinity
    if (!isValidDate(date)) return Infinity;

  const now = new Date();
  if (now.getTime() - date.getTime()) {
    return now.getTime() - date.getTime();
  }
  return Infinity;
};

const formatLastSeen = (device): string => {
  const timestamp = device.lastHeartbeat;
  if (!timestamp || typeof timestamp !== 'string') return 'Unknown';
  if (device.connectStatus === 'connected') {
    return 'Now';
  }
  const diffInSeconds = Math.floor(calculateLastSeen(device) / 1000);

  if (diffInSeconds === Infinity) return 'A long time ago';

  if (diffInSeconds < 60) {
    return `${diffInSeconds} second${diffInSeconds === 1 ? '' : 's'} ago`;
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes === 1 ? '' : 's'} ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`;
};

const renderBatteryCell = (params) => {
  const level = params.value;
  let IconComponent = Icons.BatteryAlert;
  let color = 'error.main';

  if (level === null || level === undefined) {
    IconComponent = Icons.BatteryAlert;
    color = 'gray';
  } else if (level > 90) {
    IconComponent = Icons.BatteryFull;
    color = 'success.main';
  } else if (level > 75) {
    IconComponent = Icons.Battery80;
    color = 'success.main';
  } else if (level > 50) {
    IconComponent = Icons.Battery60;
    color = 'warning.main';
  } else if (level > 30) {
    IconComponent = Icons.Battery50;
    color = 'warning.main';
  } else if (level > 15) {
    IconComponent = Icons.Battery30;
    color = 'error.main';
  } else {
    IconComponent = Icons.Battery20;
    color = 'error.main';
  }

  return (
    <Stack direction="row" alignItems="center" sx={{ color, fontWeight: 500 }}>
      <IconComponent fontSize="small" />
      <Typography variant="inherit" sx={{ ml: 0.5 }}>
        {level != null ? `${level}%` : '?'}
      </Typography>
    </Stack>
  );
};

const renderConnectedCell = (params) => {
  const status = params.value;

  let Icon = null;
  if (status === 'connected') {
    Icon =  <Icons.Sensors sx={{ color: 'success.main' }} />;
  } else if (status === 'disconnected') {
    Icon = <Icons.SensorsOff sx={{ color: 'error.main' }} />;
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', height: '100%', width: '100%' }}>
      {Icon}
    </Box>
  );
};

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

const devicesColumns: GridColDef[] = [
  ...commonColumns,
  { field: 'sampleRate', headerName: 'Sample Rate', flex: 1, sortable: false},
  {field: 'configureButton', headerName: 'Configure', flex: 1, sortable: false, align: 'center', headerAlign: 'center',
    renderCell: (params) => (
      <Box
        sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: "95%",
          width: "100%" }}>
        <div>
          <Button
            color="primary"
            size="small"
            onClick={(event) => {
              event.stopPropagation();
              handleRowClick(params.row.id, event);
            }}
            sx={{ textTransform: "none", fontWeight: "bold", display: "flex", alignItems: "center",
              height: "auto", margin: "auto"}}>
            <Icons.Settings />
          </Button>
          {selectedDevice === params.row.id && open && loading === false && (
            <DeviceConfigDialog open={isDialogOpen2} device={selectedDevice} />
          )}
        </div>
      </Box>
    ),
  },
];

const availableDevicesColumns: GridColDef[] = [
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

const availableDevicesRows: GridRowsProp = useMemo(() => {
  const rows = availableDevices.map((device) => {
    const lastSeenRaw = calculateLastSeen(device);
    const lastSeen = formatLastSeen(device);;
      return {
        name:     device.manufacturer,
        id:       device.deviceId,
        connected:   device.connectStatus,
        battery:  device.batteryLevel,
        lastSeen: lastSeen,
        lastSeenRaw: lastSeenRaw,
      }
  });

  return rows;
}, [availableDevices]);

  const handleNameChange = async (event) => {
    await updateSession(sessionId, event.target.value, sessionDescription, isArchived);
    setIsEditingName(false);
    handleFetchSession(sessionId, setSessionName, setSessionDescription, setProjectId, setProjectName, setIsArchived);
  };

  const handleDescriptionChange = async (event) => {
    await updateSession(sessionId, sessionName, event.target.value, isArchived);
    setIsEditingDescription(false);
    handleFetchSession(sessionId, setSessionName, setSessionDescription, setProjectId, setProjectName, setIsArchived);
  };

  const handleArchiveSession = async (archive) => {
    await updateSession(sessionId, sessionName, sessionDescription, archive);
    handleFetchSession(sessionId, setSessionName, setSessionDescription, setProjectId, setProjectName, setIsArchived);
  };

  const handleDeleteSession = async (sessionId) => {
    if (!projectId) {
      await handleFetchSession(sessionId, setSessionName, setSessionDescription, setProjectId, setProjectName, setIsArchived);
    }
    await deleteSession(sessionId);
    navigate('/projects/detail/' + projectId);
  };

  useEffect(() => {
    fetchSessionDevices(sessionId, setDevices);
    handleAvailableDevices(sessionId, setAvailableDevices);
    handleFetchSession(sessionId, setSessionName, setSessionDescription, setProjectId, setProjectName, setIsArchived);
  }, [sessionId]);

  const renewAvailableDevices = async () => {
    await listUnits();
    console.log("listunits gehad")
    await handleAvailableDevices(sessionId, setAvailableDevices);
    console.log("handle available devices gehad")
    await checkStartingConditions();
  }

  useEffect(() => {
    renewAvailableDevices();
  }, []);


  const fetchSampleRates = async () => {
    const rows = await Promise.all(
      devices.map(async (device) => {
        const sampleRate = await getSampleRate(sessionId, device.deviceId);
        const lastSeenRaw = calculateLastSeen(device);
        const lastSeen = formatLastSeen(device);

        return {
          name: device.manufacturer,
          id: device.deviceId,
          connected: device.connectStatus,
          battery: device.batteryLevel,
          sampleRate: sampleRate ? sampleRate + ' Hz' : '-',
          lastSeen: lastSeen,
          lastSeenRaw: lastSeenRaw
        };
      })
    );
    setDevicesRows(rows);
  };

  useEffect(() => {
    fetchSampleRates();
  }, [devices, sessionId, sampleRate]);

  useEffect(() => {
    let interval;
    if (sessionStatus === 'Running') {
      interval = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [sessionStatus]);

  const checkStartingConditions = async () => {
    const devices = await fetchDevices(sessionId);
    const sampleRates = await Promise.all(
      devices.map(async (device) => {
        const sampleRate = await getSampleRate(sessionId, device.deviceId);
        return {
          deviceId: device.deviceId,
          sampleRate,
        };
      })
    );

    const requirements = [
      {
        text: "Add at least one device",
        done: devices.length > 0,
      },
      {
        text: "Charge all devices to at least 10% battery",
        done: devices.every(device => device.batteryLevel >= 10),
      },
      {
        text: "Make sure all added devices are connected",
        done: devices.every(device => device.connectStatus === 'connected'),
      },
      {
        text: "Make sure all devices are configured",
        done: sampleRates.every(device => device.sampleRate !== null),
      },
    ];

    console.log("requirements: ", requirements)
    // const allPassed = requirements.every(req => req.done);
    const allPassed = requirements.filter(req => req.text !== "Make sure all devices are configured")
      .every(req => req.done);
    console.log("all passed: ", allPassed)
    setIsStartDisabled(!allPassed);
    setStartRequirements(requirements);
  };

  const checkSampleRates = async () => {
    const devices = await fetchDevices(sessionId);
    const sampleRates = await Promise.all(
      devices.map(async (device) => {
        const sampleRate = await getSampleRate(sessionId, device.deviceId);
        return {
          deviceId: device.deviceId,
          sampleRate: sampleRate
        };
      })
    );

    const devicesWithoutSampleRate = sampleRates.filter(device => device.sampleRate === null).map(device => device.deviceId);
    setDevicesWithoutSampleRate(devicesWithoutSampleRate)
    return devicesWithoutSampleRate
  }

  const handleOpenDialog3 = async () => {
    // Check if there are devices without sample rate
    const devicesWithoutSampleRate = await checkSampleRates();

    if (devicesWithoutSampleRate.length > 0) {
      setDialogOpen3(true);
    }
  }

  const handleStartSession = async (devices, defaultConfigStep) => {
    var startStep = defaultConfigStep
    const sampleRates = []

    if (startStep === 0) {
      setDefaultConfigStep((prev) => prev + 1);
      for (const device of devices) {
        console.log("////////////////////////DEVICE: ", device)
        const sampleRate = await sendConfiguration(sessionId, device);
        if (sampleRate !== null) {
          sampleRates.push(sampleRate)
          setSampleRates(sampleRates);
        }
      }

      startStep = startStep + 1
      await setDefaultConfigStep((prev) => prev + 1);
    }

    // console.log("TESTING IS DONE ", sampleRates);

    if (startStep === 2) {
      // TODO: save samplerates
      // startBatch(sessionId);
      // setElapsedTime(0);
      // setSessionStatus('Running');
      handleCloseDialog3();
    }

  }

  // const handlePauseSession = async () => {
  //   // continue doing nothing
  // }

  const handleStopSession = async () => {
    stopBatch(sessionId);
    setSessionStatus('Stopped');
  }

  const ConfirmationDialog = ({ open, onClose, onConfirm, sessionId }) => (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Confirm Deletion</DialogTitle>
      <DialogContent>
        <Typography>
          Are you sure you want to delete this session? This action cannot be undone.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Cancel
        </Button>
        <Button
          onClick={() => {
            onConfirm(sessionId);
            onClose();
          }}
          color="error"
          variant="contained"
        >
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );

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
          {isArchived &&
            <Stack direction="row" spacing={2} sx={{
              backgroundColor: "warning.main",
              color: "white",
              borderRadius: "8px",
              padding: 1,
              pl: 2,
              alignItems: "center"
            }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Inventory />
                <Typography variant="body1" fontWeight="bold">
                  Archived
                </Typography>
              </Stack>
            </Stack>
          }
          <Stack direction="row" spacing={1}>
            {!isArchived &&
              <Button
                variant="outlined"
                startIcon={<ArchiveOutlined />}
                onClick={() => handleArchiveSession(true)}
              >
                Archive Session
              </Button>
            }
            {isArchived &&
              <Button
                variant="outlined"
                startIcon={<UnarchiveOutlined />}
                onClick={() => handleArchiveSession(false)}
              >
                Unarchive Session
              </Button>
            }
            <Button
              variant="outlined"
              startIcon={<DeleteOutline />}
              sx={{
                '&:hover': {
                  color: 'white',
                  borderColor: 'error.main',
                  backgroundColor: 'error.main'
                }
              }}
              onClick={handleOpenDialog}
            >
              Delete Session
            </Button>
            <ConfirmationDialog
              open={isDialogOpen}
              onClose={handleCloseDialog}
              onConfirm={async (sessionId) => {
                await handleDeleteSession(sessionId);
              }}
              sessionId={sessionId}
            />
          </Stack>
        </Stack>
      </PageTitleWrapper>



      <Container>
        <Stack spacing={2}>
          <Paper elevation={3} sx={{ p: 2, borderRadius: 2 }}>
            <Stack spacing={2}>
              <Typography variant="h6" fontWeight="bold">
                Session Overview
              </Typography>

              {/* Status and Elapsed Time */}
              <Stack direction="row" spacing={3} justifyContent="space-between" alignItems="center">
                <Typography variant="body2">
                  Elapsed Time: {formatTime(elapsedTime)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Status: {sessionStatus}
                </Typography>
              </Stack>
              {(sessionStatus === 'Not started' || sessionStatus === 'Stopped') && (
              <Stack direction="row" spacing={1} justifyContent="flex-end" alignItems="center">
                <Tooltip
                title={
                  <List dense sx={{ p: 0, m: 0 }}>
                    {startRequirements.map(({ text, done }) => (
                      <ListItem key={text} sx={{ py: 0.5 }}>
                        <ListItemIcon sx={{ minWidth: 30 }}>
                          {done ? (
                            <CheckCircleIcon color="success" fontSize="small" />
                          ) : (
                            <RadioButtonUncheckedIcon color="disabled" fontSize="small" />
                          )}
                        </ListItemIcon>
                        <ListItemText
                          primary={text}
                          sx={{ color: done ? 'text.primary' : 'text.disabled', fontSize: '0.875rem' }}
                        />
                      </ListItem>
                    ))}
                  </List>
                }
                placement="top"
                arrow
                componentsProps={{
                  tooltip: {
                    sx: (theme) => ({
                      backgroundColor: theme.palette.background.paper,
                      color: theme.palette.text.primary,
                      boxShadow: theme.shadows[3],
                      maxWidth: 300,
                    }),
                  },
                }}
              >
                <InfoIcon color="action" sx={{ cursor: 'pointer' }} />
              </Tooltip>
              <Button
                variant="contained"
                color="primary"
                onClick={handleOpenDialog3}
                disabled={isStartDisabled}
              >
                Start Session
              </Button>
              <DefaultConfigurationDialog
                devices={devicesWithoutSampleRate}
                open={isDialogOpen3}
              />
            </Stack>
              )}

              {sessionStatus === 'Running' && (
                <Stack direction="row" spacing={1} justifyContent="flex-end">
                  <Button variant="outlined" color="error" onClick={handleStopSession}>
                    Stop Session
                  </Button>
                </Stack>
              )}
            </Stack>
          </Paper>
        </Stack>
      </Container>

      <Container>
        <Stack spacing={2}>
          <Typography variant="h2" sx={{ pt: 2 }}>Connected Devices in Session</Typography>
          <Paper>
            <DataGrid
              rows={devicesRows}
              columns={devicesColumns}
              sortingOrder={['asc']}
              density='compact'
              autoHeight
              pageSizeOptions={[10]}
              columnVisibilityModel={{
                lastSeenRaw: false,
              }}
              disableColumnMenu
              disableColumnResize
              initialState={{
                pagination: { paginationModel: { pageSize: 10 } },
                sorting: {
                  sortModel: [{ field: 'lastSeenRaw', sort: 'asc' }],
                },
              }}
              checkboxSelection
              onRowSelectionModelChange={(newSelection) => setSelectedDeviceIds(newSelection)}
              slots={{
                toolbar: () => <ConnectedDevicesToolbar
                  selectedDeviceIds={selectedDeviceIds}
                  sessionId={sessionId}
                  fetchSessionDevices={fetchSessionDevices}
                  setAvailableDevices={setAvailableDevices}
                  setDevices={setDevices}
                />}}
              sx={{
                "& .MuiDataGrid-columnHeader:focus, .MuiDataGrid-cell:focus, .MuiDataGrid-cell:focus-within": {
                  outline: "none !important",
                },
                "& .MuiDataGrid-row:hover": {
                  backgroundColor: "rgba(0, 0, 0, 0)",
                }
              }}
            />
          </Paper>
        </Stack>
      </Container>
      <Container>
        <Stack spacing={2} sx={{ mt: 4 }}>
          <Typography variant="h2">Available Devices to Add</Typography>
          <Paper>
            <DataGrid
              rows={availableDevicesRows}
              columns={availableDevicesColumns}
              sortModel={[{ field: 'lastSeenRaw', sort: 'asc' }]}
              columnVisibilityModel={{
                lastSeenRaw: false,
              }}
              density='compact'
              autoHeight
              disableColumnMenu
              disableColumnResize
              checkboxSelection
              onRowSelectionModelChange={(newSelection) => setSelectedAddDeviceIds(newSelection)}
              slots={{
                toolbar: () => <AvailableDevicesToolbar
                  selectedAddDeviceIds={selectedAddDeviceIds}
                  sessionId={sessionId}
                  fetchSessionDevices={fetchSessionDevices}
                  setAvailableDevices={setAvailableDevices}
                  setDevices={setDevices}
                />}}
                sx={{
                "& .MuiDataGrid-columnHeader:focus, .MuiDataGrid-cell:focus, .MuiDataGrid-cell:focus-within": {
                  outline: "none !important",
                },
                "& .MuiDataGrid-row:hover": {
                  backgroundColor: "rgba(0, 0, 0, 0)",
                }
              }}
            />
          </Paper>
        </Stack>
      </Container>
    </div>
  );
};

export default SessionDetail;
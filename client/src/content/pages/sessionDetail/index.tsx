// React & Routing
import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

// MUI Components
import {
  Box, Button, Checkbox, Container, FormControlLabel, Link, List, ListItem,
  ListItemIcon, ListItemText, Paper, Stack, TextField, Tooltip, Typography
} from '@mui/material';

import { DataGrid, GridRowsProp } from '@mui/x-data-grid';
import { TreeItem } from '@mui/lab';
import * as Icons from '@mui/icons-material';

// Utilities
import { Helmet } from 'react-helmet-async';

// Local Components & Helpers
import PageTitleWrapper from '../../../Components/PageTitleWrapper';
import ConfirmationDialog from './confirmationDialog';
import DefaultConfigurationDialog from './defaultConfigDialog';

import { RenderTree } from './types';
import { calculateLastSeen, checkStartingConditions, formatLastSeen } from './startSessionHelpers';
import * as api from './api';
import * as toolbar from './toolbar';
import { getOnChange, loadRows, updateSelection } from './treeView';


//  Api calls in api.tsx
 const handleAvailableDevices = async (sessionId, setAvailableDevices) => {
    const availableDevicesData = await api.fetchAvailableDevices(sessionId);
    setAvailableDevices(availableDevicesData);
    return availableDevicesData;
 };

const handleFetchSession = async (sessionId, setSessionName, setSessionDescription, setProjectId, setProjectName, setIsArchived) => {
  const sessionData = await api.fetchSession(sessionId);
  setProjectId(sessionData.projectId);
  setSessionName(sessionData.name);
  setIsArchived(sessionData.archived);
  setSessionDescription(sessionData.description);

  await handleProjectData(sessionData.projectId, setProjectName);
}

const handleProjectData = async (projectId, setProjectName) => {
  const data = await api.projectData(projectId);
  setProjectName(data.name);
}

const fetchSessionDevices = async (sessionId, setDevices) => {
  const devices = await api.fetchDevices(sessionId);
  setDevices(devices);

  return devices;
};

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
  const [sessionStatus, setSessionStatus] = useState('Not started');
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isStartDisabled, setIsStartDisabled] = useState(true);
  const [startRequirements, setStartRequirements] = useState([]);

  const navigate = useNavigate();

  const handleOpenDialog = () => setDialogOpen(true);
  const handleCloseDialog = () => setDialogOpen(false);

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

  // Device Configurtion Dialog
  const handleCloseDialog2 = async () => {
  if (activeStep === 2 && sampleRate !== null) {
    await api.saveSampleRate(sessionId, selectedDevice, sampleRate);
  }
  setDialogOpen2(false);
  setActiveStep(0);
  setSampleRate(null);
};

const handleReconfigure = async () => {
  setActiveStep(0);
  setSampleRate(null);
};

const formatTime = (seconds) => {
    if (!seconds && seconds !== 0) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

const handleNext = async () => {
  if (activeStep === steps.length - 1) {
    if (sampleRate !== null) {
      handleCloseDialog2();
      return;
    } else {
      setActiveStep(0);
      return;
    }
  }

  const newStep = activeStep + 1;
  setActiveStep(newStep);

  if (newStep === 1) {
    await api.updateSelectedProperties(selectedDevice, sessionId, selectedProperties);
    const sr = await api.sendConfiguration(sessionId, selectedDevice);

    if (sr !== null) {
      setSampleRate(sr);
    }
    setActiveStep((prev) => prev + 1);
  }
};

  const handleSelectedProperties = async (deviceId:string) => {
    const properties = await api.getSelectedProperties(deviceId, sessionId);
    const selectedPropertiesIds = properties.map((property) => {
      return `${property.moduleManufacturer}:${property.moduleName}:${property.sensorType}:${property.propertyName}`;
    });

    const allProperties = await loadRows( await api.getDeviceProperties(deviceId), setAllProperties);
    const updatedSelection = updateSelection(selectedPropertiesIds, allProperties);
    setSelectedProperties(updatedSelection);

    setLoading(false);
    return selectedPropertiesIds;
  }

  const handleOpenDialog2 = async (deviceId) => {
    setLoading(true);
    setSelectedDevice(deviceId);
    await handleSelectedProperties(deviceId);
    setDialogOpen2(true);
  };

  const handleCloseDialog3 = async () => {
    setDialogOpen3(false);
    setDefaultConfigStep(0);
    setSampleRates([]);
  };

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

  const handleNameChange = async (event) => {
    await api.updateSession(sessionId, event.target.value, sessionDescription, isArchived);
    setIsEditingName(false);
    handleFetchSession(sessionId, setSessionName, setSessionDescription, setProjectId, setProjectName, setIsArchived);
  };

  const handleDescriptionChange = async (event) => {
    await api.updateSession(sessionId, sessionName, event.target.value, isArchived);
    setIsEditingDescription(false);
    handleFetchSession(sessionId, setSessionName, setSessionDescription, setProjectId, setProjectName, setIsArchived);
  };

  const handleArchiveSession = async (archive) => {
    await api.updateSession(sessionId, sessionName, sessionDescription, archive);
    handleFetchSession(sessionId, setSessionName, setSessionDescription, setProjectId, setProjectName, setIsArchived);
  };

  const handleDeleteSession = async (sessionId) => {
    if (!projectId) {
      await handleFetchSession(sessionId, setSessionName, setSessionDescription, setProjectId, setProjectName, setIsArchived);
    }
    await api.deleteSession(sessionId);
    navigate('/projects/detail/' + projectId);
  };

  useEffect(() => {
    fetchSessionDevices(sessionId, setDevices);
    handleAvailableDevices(sessionId, setAvailableDevices);
    handleFetchSession(sessionId, setSessionName, setSessionDescription, setProjectId, setProjectName, setIsArchived);
  }, [sessionId]);

  const renewAvailableDevices = async () => {
    await api.listUnits();
    console.log("listunits gehad")
    await handleAvailableDevices(sessionId, setAvailableDevices);
    console.log("handle available devices gehad")
    await handleCheckStartingConditions();
  }

  useEffect(() => {
    renewAvailableDevices();
  }, []);


  const fetchSampleRates = async () => {
    const rows = await Promise.all(
      devices.map(async (device) => {
        const sampleRate = await api.getSampleRate(sessionId, device.deviceId);
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
  }, [devices, sessionId, sampleRate, devicesWithoutSampleRate]);

  useEffect(() => {
    let interval;
    if (sessionStatus === 'Running') {
      interval = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [sessionStatus]);

const handleCheckStartingConditions = async () => {
    const data = await checkStartingConditions(sessionId);
    setIsStartDisabled(!data.allPassed);
    setStartRequirements(data.requirements);
  };

  const checkSampleRates = async () => {
    const devices = await api.fetchDevices(sessionId);
    const sampleRates = await Promise.all(
      devices.map(async (device) => {
        const sampleRate = await api.getSampleRate(sessionId, device.deviceId);
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
    else {
      api.startBatch(sessionId);
      setElapsedTime(0);
      setSessionStatus('Running');
    }
  }

  const handleStartSession = async (devices) => {
    let step = defaultConfigStep;
    let newSampleRates = [];

    if (step === 0) {
      step = 1;
      setDefaultConfigStep(1);
    }

    if (step === 1) {
      newSampleRates = [];

      for (const device of devices) {
        const sampleRate = await api.sendConfiguration(sessionId, device);

        if (!sampleRate) {
          step = 2;
          setDefaultConfigStep(2);
          return;
        }
        newSampleRates.push(sampleRate);

        // Save new default sampleRate
        await api.saveSampleRate(sessionId, device, sampleRate);
        setDevicesWithoutSampleRate(devices.filter(d => d !== device))
      }

      setSampleRates(newSampleRates);
      setDefaultConfigStep(2);
      step = 2;
      return;
    }

    if (step === 2) {
      const allValid = devices.length === 0 && newSampleRates.every(rate => rate !== null && rate !== 0);

      if (allValid) {
        api.startBatch(sessionId);
        setElapsedTime(0);
        setSessionStatus('Running');
        handleCloseDialog3();
        handleCheckStartingConditions();
      } else {
        setDefaultConfigStep(0);
        step = 0;
        return;
      }
    }
  };

  const handleStopSession = async () => {
    api.stopBatch(sessionId);
    setSessionStatus('Stopped');
  }

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
                <Icons.DesignServicesOutlined fontSize="small" />
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
                <Icons.Inventory />
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
                startIcon={<Icons.ArchiveOutlined />}
                onClick={() => handleArchiveSession(true)}
              >
                Archive Session
              </Button>
            }
            {isArchived &&
              <Button
                variant="outlined"
                startIcon={<Icons.UnarchiveOutlined />}
                onClick={() => handleArchiveSession(false)}
              >
                Unarchive Session
              </Button>
            }
            <Button
              variant="outlined"
              startIcon={<Icons.DeleteOutline />}
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
                            <Icons.CheckCircle color="success" fontSize="small" />
                          ) : (
                            <Icons.RadioButtonUnchecked color="disabled" fontSize="small" />
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
                <Icons.Info color="action" sx={{ cursor: 'pointer' }} />
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
                open={isDialogOpen3}
                devices={devicesWithoutSampleRate}
                defaultConfigStep={defaultConfigStep}
                sampleRates={sampleRates}
                handleStartSession={handleStartSession}
                handleCloseDialog3={handleCloseDialog3}
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
              columns={toolbar.getDevicesColumns({
                  handleRowClick,
                  selectedDevice,
                  loading,
                  isDialogOpen2,
                  activeStep,
                  steps,
                  sampleRate,
                  selectedProperties,
                  expandedNodes,
                  allProperties,
                  renderTree,
                  handleCloseDialog2,
                  handleNext,
                  handleReconfigure,
                  setExpandedNodes
              })}
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
                toolbar: () => <toolbar.ConnectedDevicesToolbar
                  selectedDeviceIds={selectedDeviceIds}
                  sessionId={sessionId}
                  fetchSessionDevices={() => fetchSessionDevices(sessionId, setDevices)}
                  setAvailableDevices={setAvailableDevices}
                  setDevices={setDevices}
                  handleAvailableDevices={() => handleAvailableDevices(sessionId, setAvailableDevices)}
                  handleCheckStartingConditions={handleCheckStartingConditions}
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
              rows={toolbar.getAvailableDevicesRows(availableDevices)}
              columns={toolbar.availableDevicesColumns}
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
                toolbar: () => <toolbar.AvailableDevicesToolbar
                  selectedAddDeviceIds={selectedAddDeviceIds}
                  sessionId={sessionId}
                  fetchSessionDevices={() => fetchSessionDevices(sessionId, setDevices)}
                  setAvailableDevices={setAvailableDevices}
                  setDevices={setDevices}
                  handleAvailableDevices={() => handleAvailableDevices(sessionId, setAvailableDevices)}
                  handleCheckStartingConditions={handleCheckStartingConditions}
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

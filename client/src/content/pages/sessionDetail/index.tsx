// React & Routing
import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

// MUI Components
import {
  Box, Button, Checkbox, Container, Divider, FormControlLabel, IconButton, Link, List, ListItem,
  ListItemIcon, ListItemText, Menu, MenuItem, Paper, Stack, TextField, Tooltip, Typography
} from '@mui/material';

import { DataGrid, GridRowsProp } from '@mui/x-data-grid';
import { TreeItem } from '@mui/lab';
import * as Icons from '@mui/icons-material';

// Utilities
import { Helmet } from 'react-helmet-async';

// Local Components & Helpers
import PageTitleWrapper from '../../../components/pageTitleWrapper';
import ConfirmationDialog from './dialogs/confirmationDialog';
import StartSessionDialog from './dialogs/startSessionDialog';

import { RenderTree } from './types';
import { checkStartingConditions, formatTime } from './startSessionHelpers';
import { formatDeviceRow, fetchDevicesWithSampleRates } from './utils';
import * as api from './api';
import * as toolbar from './toolbar';
import { getOnChange, loadRows, updateSelection } from './treeView';
import { useGatewaySocket } from '../../../helpers/useGatewaySocket';
import { patchDevicesFromUnits } from '../../../helpers/gatewayUnits';

//  Api calls in api.tsx
const handleAvailableDevices = async (sessionId: number, setAvailableDevices: Function) => {
  const availableDevicesData = await api.fetchAvailableDevices(sessionId);
  setAvailableDevices(availableDevicesData);
  return availableDevicesData;
};

const handleFetchSession = async(
  sessionId: number,
  setSessionName: Function,
  setSessionDescription: Function,
  setProjectId: Function,
  setProjectName: Function,
  setIsArchived: Function
) => {
  const sessionData = await api.fetchSession(sessionId);
  setProjectId(sessionData.projectId);
  setSessionName(sessionData.name);
  setIsArchived(sessionData.archived);
  setSessionDescription(sessionData.description);

  await handleProjectData(sessionData.projectId, setProjectName);
}

const handleProjectData = async (projectId: number, setProjectName: Function) => {
  const data = await api.projectData(projectId);
  setProjectName(data.name);
}

const fetchSessionDevices = async (sessionId: number, setDevices: Function) => {
  const devices = await api.fetchDevices(sessionId);
  setDevices(devices);

  return devices;
};

const fetchSessionStatus = async (sessionId: number, setSessionStatus: Function) => {
  const status = await api.getSessionStatus(sessionId);
  setSessionStatus(status);
  return status;
}

const SessionStatusTag = ({ status }: { status: string }) => {
  const recording = status === 'Measuring';

  return (
    <Stack
      direction="row"
      alignItems="center"
      spacing={1}
      sx={{
        px: 1.5,
        py: 0.5,
        borderRadius: '16px',
        bgcolor: recording ? 'rgba(211, 47, 47, 0.08)' : 'action.hover',
      }}
    >
      <Box
        sx={{
          width: 10,
          height: 10,
          borderRadius: '50%',
          bgcolor: recording ? 'error.main' : 'text.disabled',
          ...(recording && {
            animation: 'pulse 1.5s ease-in-out infinite',
            '@keyframes pulse': {
              '0%': { boxShadow: '0 0 0 0 rgba(211, 47, 47, 0.6)' },
              '70%': { boxShadow: '0 0 0 8px rgba(211, 47, 47, 0)' },
              '100%': { boxShadow: '0 0 0 0 rgba(211, 47, 47, 0)' },
            },
          }),
        }}
      />
      <Typography
        variant="button"
        fontWeight="bold"
        color={recording ? 'error.main' : 'text.secondary'}
      >
        {recording ? 'Recording' : status}
      </Typography>
    </Stack>
  );
};

const SessionDetail = () => {
  // Session Info
  const sessionId = Number(useParams().sessionId);
  const [sessionName, setSessionName] = useState('');
  const [sessionDescription, setSessionDescription] = useState('');
  const [projectId, setProjectId] = useState(null);
  const [projectName, setProjectName] = useState('');
  const [isArchived, setIsArchived] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);

  // Dialog States
  const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false);
  const [archiveDialogOpen, setArchiveDialogOpen] = useState(false);
  const [archiveTarget, setArchiveTarget] = useState(false);
  const [configurationDialogOpen, setConfigurationDialogOpen] = useState(false);
  const [StartSessionDialogOpen, setStartSessionDialogOpen] = useState(false);
  const [sessionMenuAnchor, setSessionMenuAnchor] = useState<null | HTMLElement>(null);

  // Device Selection and Properties
  const [devices, setDevices] = useState([]);
  const [availableDevices, setAvailableDevices] = useState([]);
  const [devicesRows, setDevicesRows] = useState<GridRowsProp>([]);
  const [availableDevicesRows, setAvailableDevicesRows] = useState<GridRowsProp>([]);
  const [selectedDevice, setSelectedDevice] = useState(null);

  // Tree Properties
  const [allProperties, setAllProperties] = useState<RenderTree>();
  const [selectedProperties, setSelectedProperties] = useState(['root']);
  const [expandedNodes, setExpandedNodes] = useState<string[]>(['root']);
  const [loading, setLoading] = useState(false);

  // Config and Setup
  const [activeStep, setActiveStep] = useState(0);
  const [defaultConfigStep, setDefaultConfigStep] = useState(0);
  const [sampleRate, setSampleRate] = useState(null);
  const [sampleRates, setSampleRates] = useState([]);
  const [devicesWithoutSampleRate, setDevicesWithoutSampleRate] = useState([]);
  const steps = ['Select Properties', 'Find sample rate', 'Save configuration'];

  // Session Status
  const [sessionStatus, setSessionStatus] = useState("");
  // const [sessionStatus, setSessionStatus] = useState(initialSessionStatus);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isStartDisabled, setIsStartDisabled] = useState(true);
  const [startRequirements, setStartRequirements] = useState([]);

  const navigate = useNavigate();

  const handleOpenDialog = () => setConfirmationDialogOpen(true);
  const handleCloseDialog = () => setConfirmationDialogOpen(false);

  const handleOpenArchiveDialog = (archive: boolean) => {
    setArchiveTarget(archive);
    setArchiveDialogOpen(true);
  };
  const handleCloseArchiveDialog = () => setArchiveDialogOpen(false);

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

  // Device Configuration Dialog
  const handleCloseConfigurationDialog = async () => {
  if (activeStep === 2 && sampleRate !== null) {
    await api.saveSampleRate(sessionId, selectedDevice, sampleRate);
  }
  setConfigurationDialogOpen(false);
  setActiveStep(0);
  setSampleRate(null);
};

  const handleReconfigure = async () => {
    setActiveStep(0);
    setSampleRate(null);
  };

  const handleNext = async () => {
    if (activeStep === steps.length - 1) {
      if (sampleRate !== null) {
        handleCloseConfigurationDialog();
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
      const sr = await api.sendConfiguration(selectedDevice);

      if (sr !== null) {
        setSampleRate(sr);
      }
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleSelectedProperties = async (deviceId: string) => {
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

  const handleOpenConfigurationDialog = async (deviceId) => {
    setLoading(true);
    setSelectedDevice(deviceId);
    await handleSelectedProperties(deviceId);
    setConfigurationDialogOpen(true);
  };

  const handleCloseStartSessionDialog = async () => {
    setStartSessionDialogOpen(false);
    setDefaultConfigStep(0);
    setSampleRates([]);
  };

  const handleRowClick = async (deviceId: string, event) => {
    event.stopPropagation();
    setLoading(true);
    try {
      await handleOpenConfigurationDialog(deviceId);
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

  // const handleGetSessionStatus = async () => {
  //   const status = await api.getSessionStatus(sessionId);
  //   setSessionStatus(status);
  // };

  useEffect(() => {
    // handleGetSessionStatus();
    fetchSessionStatus(sessionId, setSessionStatus);
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

  const handleGatewayEvent = useCallback((data: any) => {
    if (!data || data.event !== 'list_units' || !Array.isArray(data.units)) return;
    setDevices((current) => patchDevicesFromUnits(current, data.units));
    setAvailableDevices((current) => patchDevicesFromUnits(current, data.units));
  }, []);

  useGatewaySocket(handleGatewayEvent);

  useEffect(() => {
    // The gateway only reports status when asked (interface/listUnits).
    // Poll periodically so the WebSocket pushes fresh heartbeats and the
    // "last seen / (last: Ns)" indicators stay live.
    let mounted = true;
    const poll = async () => {
      if (!mounted) return;
      try {
        await api.listUnits();
      } catch {
        // Gateway unreachable; the next poll will retry.
      }
    };
    poll();
    const interval = setInterval(poll, 30000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const fetchSampleRates = async () => {
    const rows = await Promise.all(
      devices.map(async (device) => {
        const sampleRate = await api.getSampleRate(sessionId, device.deviceId);
        return formatDeviceRow(device, sampleRate);
      })
    );
    setDevicesRows(rows);
  };

  useEffect(() => {
    fetchSampleRates();
  }, [devices, sessionId, sampleRate, devicesWithoutSampleRate]);

  useEffect(() => {
    const buildRows = async () => {
      const sampleRateMap = {};
      await Promise.all(
        availableDevices.map(async (device) => {
          try {
            const sr = await api.getSampleRate(sessionId, device.deviceId);
            if (sr != null) sampleRateMap[device.deviceId] = sr;
          } catch {
            // Device not in session yet; leave as not set.
          }
        })
      );
      setAvailableDevicesRows(toolbar.getAvailableDevicesRows(availableDevices, sampleRateMap));
    };
    buildRows();
  }, [availableDevices, sessionId, sampleRate]);


const handleCheckStartingConditions = async () => {
    const data = await checkStartingConditions(sessionId);
    setIsStartDisabled(!data.allPassed);
    setStartRequirements(data.requirements);
  };

  const fetchDevicesWithoutSampleRates = async () => {
    const sampleRates = await fetchDevicesWithSampleRates(api, sessionId);
    const devicesWithoutSampleRate = sampleRates
      .filter(device => device.sampleRate === null)
      .map(device => device.deviceId);
    setDevicesWithoutSampleRate(devicesWithoutSampleRate)
    return devicesWithoutSampleRate
  }

  const handleOpenStartSessionDialog = async () => {
    // Check if there are devices without sample rate
    const devicesWithoutSampleRate = await fetchDevicesWithoutSampleRates();

    if (devicesWithoutSampleRate.length > 0) {
      setStartSessionDialogOpen(true);
    }
    else {
      api.startBatch(sessionId);
      setElapsedTime(0);
      setSessionStatus('Measuring');
      api.updateSessionStatus(sessionId, 'Measuring')
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
        const sampleRate = await api.sendConfiguration(device);

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
      const allValid = sampleRates.length > 0 && sampleRates.every(rate => rate !== null && rate !== 0);


      if (allValid) {
        api.startBatch(sessionId);
        setElapsedTime(0);
        setSessionStatus('Measuring');
        handleCloseStartSessionDialog();
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
    setSessionStatus('Idle');
    api.updateSessionStatus(sessionId, "Idle");
  }

  const refreshDeviceLists = async () => {
    await fetchSessionDevices(sessionId, setDevices);
    await handleAvailableDevices(sessionId, setAvailableDevices);
    await handleCheckStartingConditions();
  };

  const handleIncludeDevice = async (deviceId: string) => {
    await api.addDevices(sessionId, [deviceId]);
    await refreshDeviceLists();
  };

  const handleExcludeDevice = async (deviceId: string) => {
    await api.removeDevicesFromSession(sessionId, [deviceId]);
    await refreshDeviceLists();
  };

  return (
    <div>
      <Helmet>
        <title>{sessionName}</title>
      </Helmet>
      <PageTitleWrapper>
        <Stack spacing={2}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="flex-start"
            spacing={2}
          >
            <Stack spacing={1} sx={{ flexGrow: 1, minWidth: 0 }}>
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
              <Link color="primary" underline="hover" variant="body1" href={"../../projects/detail/" + projectId}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Icons.DesignServicesOutlined fontSize="small" />
                  <Typography variant="body1">{projectName}</Typography>
                </Stack>
              </Link>
              {isEditingDescription ? (
                <Box>
                  <TextField
                    defaultValue={sessionDescription}
                    variant="outlined"
                    size="small"
                    autoFocus
                    multiline
                    minRows={3}
                    maxRows={10}
                    onBlur={async (event) => {
                      // Save only if changed
                      if (event.target.value !== sessionDescription) {
                        await handleDescriptionChange(event);
                      }
                      setIsEditingDescription(false);
                    }}
                    onFocus={(event) => event.target.select()}
                    sx={{ ml: -1, width: "100%" }}
                  />
                </Box>
              ) : (
                <Typography
                  variant="body1"
                  onClick={() => setIsEditingDescription(true)}
                  sx={{
                    "&:hover": {
                      backgroundColor: "rgba(0, 0, 0, 0.05)",
                      outline: "2px solid rgba(0, 0, 0, 0.2)",
                      borderRadius: "8px",
                      px: 1,
                      mx: -1,
                    },
                    color: sessionDescription ? "inherit" : "gray",
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {sessionDescription ? sessionDescription : "Add description..."}
                </Typography>
              )}
            </Stack>
            <Stack direction="row" spacing={1} alignItems="center">
              <SessionStatusTag status={sessionStatus} />
              <Tooltip title="Session options">
                <span>
                  <IconButton
                    onClick={(event) => setSessionMenuAnchor(event.currentTarget)}
                  >
                    <Icons.MoreVert />
                  </IconButton>
                </span>
              </Tooltip>
              <Menu
                anchorEl={sessionMenuAnchor}
                open={Boolean(sessionMenuAnchor)}
                onClose={() => setSessionMenuAnchor(null)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              >
                <MenuItem
                  disabled={sessionStatus === 'Measuring'}
                  onClick={() => {
                    setSessionMenuAnchor(null);
                    handleOpenArchiveDialog(!isArchived);
                  }}
                >
                  <ListItemIcon>
                    {isArchived ? <Icons.UnarchiveOutlined fontSize="small" /> : <Icons.ArchiveOutlined fontSize="small" />}
                  </ListItemIcon>
                  <ListItemText primary={isArchived ? 'Unarchive Session' : 'Archive Session'} />
                </MenuItem>
                <MenuItem
                  disabled={sessionStatus === 'Measuring'}
                  onClick={() => {
                    setSessionMenuAnchor(null);
                    handleOpenDialog();
                  }}
                >
                  <ListItemIcon>
                    <Icons.DeleteOutline fontSize="small" color="error" />
                  </ListItemIcon>
                  <ListItemText primary="Delete Session" sx={{ color: 'error.main' }} />
                </MenuItem>
              </Menu>
            </Stack>
          </Stack>

          {isArchived &&
            <Stack
              direction="row"
              spacing={2}
              sx={{
                backgroundColor: "warning.main",
                color: "white",
                borderRadius: "8px",
                padding: 1,
                pl: 2,
                alignItems: "center"
              }}
            >
              <Stack direction="row" spacing={1} alignItems="center">
                <Icons.Inventory />
                <Typography variant="body1" fontWeight="bold">
                  Archived
                </Typography>
              </Stack>
            </Stack>
          }

          <Divider />

          {sessionStatus === 'Idle' && (
            <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
              <List dense sx={{ p: 0, m: 0 }}>
                {startRequirements.map(({ text, done }) => (
                  <ListItem key={text} sx={{ py: 0.25 }}>
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
              <Button
                variant="contained"
                color="primary"
                onClick={handleOpenStartSessionDialog}
                disabled={isStartDisabled}
              >
                Start Session
              </Button>
            </Stack>
          )}

          {sessionStatus === 'Measuring' && (
            <Stack direction="row" spacing={1} justifyContent="flex-end">
              <Button variant="outlined" color="error" onClick={handleStopSession}>
                Stop Session
              </Button>
            </Stack>
          )}

          <StartSessionDialog
            open={StartSessionDialogOpen}
            devices={devicesWithoutSampleRate}
            defaultConfigStep={defaultConfigStep}
            sampleRates={sampleRates}
            handleStartSession={handleStartSession}
            handleCloseDialog3={handleCloseStartSessionDialog}
          />

          <DataGrid
            rows={devicesRows}
            columns={toolbar.getDevicesColumns({
                handleRowClick,
                sessionId,
                selectedDevice,
                loading,
                configurationDialogOpen,
                activeStep,
                steps,
                sampleRate,
                selectedProperties,
                expandedNodes,
                allProperties,
                sessionStatus,
                renderTree,
                handleCloseConfigurationDialog,
                handleNext,
                handleReconfigure,
                setExpandedNodes,
                onExclude: handleExcludeDevice,
            })}
            sortingOrder={['asc', 'desc']}
            density='compact'
            autoHeight
            hideFooter={devicesRows.length <= 10}
            pageSizeOptions={[10]}
            columnVisibilityModel={{
              lastSeenRaw: false,
            }}
            disableColumnMenu
            initialState={{
              pagination: { paginationModel: { pageSize: 10 } },
              sorting: {
                sortModel: [{ field: 'lastSeenRaw', sort: 'asc' }],
              },
            }}
            disableRowSelectionOnClick
            slots={{
              toolbar: () => <toolbar.ConnectedDevicesToolbar
                deviceCount={devicesRows.length}
              />}}
            sx={{
              "& .MuiDataGrid-columnHeader:focus, .MuiDataGrid-cell:focus, .MuiDataGrid-cell:focus-within": {
                outline: "none !important",
              },
              "& .MuiDataGrid-row": {
                cursor: "pointer",
              },
              "& .MuiDataGrid-row:hover": {
                backgroundColor: "rgba(0, 0, 0, 0.04)",
              }
            }}
          />

          <ConfirmationDialog
            open={archiveDialogOpen}
            onClose={handleCloseArchiveDialog}
            onConfirm={async () => {
              await handleArchiveSession(archiveTarget);
            }}
            sessionId={sessionId}
            title={archiveTarget ? 'Confirm Archiving' : 'Confirm Unarchiving'}
            message={
              archiveTarget
                ? 'Are you sure you want to archive this session? It will no longer appear in the active sessions list.'
                : 'Are you sure you want to unarchive this session?'
            }
            confirmLabel={archiveTarget ? 'Archive' : 'Unarchive'}
          />
          <ConfirmationDialog
            open={confirmationDialogOpen}
            onClose={handleCloseDialog}
            onConfirm={async (sessionId) => {
              await handleDeleteSession(sessionId);
            }}
            sessionId={sessionId}
          />
        </Stack>
      </PageTitleWrapper>
      <Container>
        <Stack spacing={2} sx={{ mt: 4 }}>
          <Typography variant="h4">Available Devices</Typography>
          <Paper>
            <DataGrid
              rows={availableDevicesRows}
              columns={toolbar.availableDevicesColumns({
                handleRowClick,
                sessionId,
                selectedDevice,
                loading,
                configurationDialogOpen,
                activeStep,
                steps,
                sampleRate,
                selectedProperties,
                expandedNodes,
                allProperties,
                sessionStatus,
                renderTree,
                handleCloseConfigurationDialog,
                handleNext,
                handleReconfigure,
                setExpandedNodes,
                onInclude: handleIncludeDevice,
              })}
              sortModel={[{ field: 'lastSeenRaw', sort: 'asc' }]}
              columnVisibilityModel={{
                lastSeenRaw: false,
              }}
              density='compact'
              autoHeight
              hideFooter={availableDevices.length <= 10}
              pageSizeOptions={[10]}
              initialState={{
                pagination: { paginationModel: { pageSize: 10 } },
              }}
              disableColumnMenu
              disableRowSelectionOnClick
              slots={{
                toolbar: () => <toolbar.AvailableDevicesToolbar
                  availableCount={availableDevices.length}
                />}}
                sx={{
                "& .MuiDataGrid-columnHeader:focus, .MuiDataGrid-cell:focus, .MuiDataGrid-cell:focus-within": {
                  outline: "none !important",
                },
                "& .MuiDataGrid-row": {
                  cursor: "pointer",
                },
                "& .MuiDataGrid-row:hover": {
                  backgroundColor: "rgba(0, 0, 0, 0.04)",
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

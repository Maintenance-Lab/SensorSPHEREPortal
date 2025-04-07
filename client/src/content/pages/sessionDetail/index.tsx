import { useState, useEffect } from 'react';
import { Button, TextField, Link, Typography, Container, Box, Paper, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { Helmet } from 'react-helmet-async';
import PageTitleWrapper from 'src/Components/PageTitleWrapper';
import BatteryFullIcon from '@mui/icons-material/BatteryFull';
import Stack from '@mui/material/Stack';
import { DataGrid, GridColDef, GridRowsProp, GridToolbarContainer, GridToolbarQuickFilter } from '@mui/x-data-grid';
import { ArchiveOutlined, DeleteOutline, Devices, Inventory, UnarchiveOutlined, DesignServicesOutlined, DoNotStepOutlined } from '@mui/icons-material';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import { useParams } from 'react-router-dom';
import EditIcon from '@mui/icons-material/Edit';
import { TreeView, TreeItem } from '@mui/lab'
import { Checkbox, FormControlLabel } from '@mui/material'
import React from 'react';
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { useCallback } from 'react';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import CircularProgress from '@mui/material/CircularProgress';
import { useMemo } from 'react';

// Imports from functions moved to different files
import { RenderTree } from "./types";
import { loadRows, getOnChange, updateSelection } from "./treeView";
import { fetchDevices, removeDevicesFromSession, sendConfiguration, updateSession, deleteSession, addDevices,
  getDeviceProperties, getSelectedProperties, updateSelectedProperties, fetchAvailableDevices, fetchSession, projectData,
  listUnits
 } from "./api";

//  Api calls in api.tsx
 const handleAvailableDevices = async (sessionId, setAvailableDevices) => {
    const availableDevicesData = await fetchAvailableDevices(sessionId);
    setAvailableDevices(availableDevicesData);
    return availableDevicesData;
 };

const handleRemoveDevices = async (sessionId, selectedDeviceIds, fetchSessionDevices, setAvailableDevices, setDevices) => {
  const success = await removeDevicesFromSession(sessionId, selectedDeviceIds);

  if (success) {
    fetchSessionDevices(sessionId, setDevices);
    handleAvailableDevices(sessionId, setAvailableDevices);
  }
};

const handleAddDevices = async (sessionId, selectedAddDeviceIds, fetchSessionDevices, setAvailableDevices, setDevices) => {
  const success = await addDevices(sessionId, selectedAddDeviceIds);

  if (success) {
    fetchSessionDevices(sessionId, setDevices);
    handleAvailableDevices(sessionId, setAvailableDevices);
  }
}

const handleFetchSession = async (sessionId, setSessionName, setSessionDescription, setProjectId, setProjectName, setIsArchived) => {
  const sessionData = await fetchSession(sessionId);
  setProjectId(sessionData.projectId);
  setSessionName(sessionData.name);
  setIsArchived(sessionData.archived);
  setSessionDescription(sessionData.description);

  handleProjectData(sessionData.projectId, setProjectName);
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
            startIcon={<DeleteOutlineOutlinedIcon />}
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
  const [selectedDeviceIds, setSelectedDeviceIds] = useState([]);
  const [selectedAddDeviceIds, setSelectedAddDeviceIds] = useState([]);
  const [devices, setDevices] = useState([]);
  const [availableDevices, setAvailableDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [allProperties, setAllProperties] = useState<RenderTree>();
  const [selectedProperties, setSelectedProperties] = useState(['root']);
  const [expandedNodes, setExpandedNodes] = useState<string[]>(['root']);
  const [loading, setLoading] = useState(false);
  const [isSaveDisabled, setIsSaveDisabled] = useState(false);

  const [activeStep, setActiveStep] = React.useState(0);
  const [maxHz, setMaxHz] = React.useState(null);
  const steps = ['Select Properties', 'Find frequency', 'Save configuration'];

  // New rows when new devices added from mqtt
  // const [newDevices, setNewDevices] = useState([]);

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

  const handleSelectedProperties = async (deviceId:string) => {
    const properties = await getSelectedProperties(deviceId, sessionId);
    const selectedPropertiesIds = properties.map((property) => {
      return `${property.manufacturerName}:${property.model}:${property.propertyName}`;
    });

    const allProperties = await loadRows( await getDeviceProperties(deviceId), setAllProperties);
    const updatedSelection = updateSelection(selectedPropertiesIds, allProperties);

    setSelectedProperties(updatedSelection);
    setLoading(false);

    return updatedSelection;
  }

  const handleOpenDialog2 = async (deviceId) => {
    setLoading(true);
    setSelectedDevice(deviceId);
    await handleSelectedProperties(deviceId);
    setDialogOpen2(true);
  };

  const handleCloseDialog2 = async () => {
    setDialogOpen2(false);
    setActiveStep(0);
    setMaxHz(null);
  };

  const handleNext = async (sessionId, selectedDevice) => {
    const newStep = activeStep + 1;
    setActiveStep(newStep);

    if (newStep === 1) {
      await updateSelectedProperties(selectedDevice, sessionId, selectedProperties);
      const frequency = await sendConfiguration(sessionId, selectedDevice);
      if (frequency !== null) {
        setIsSaveDisabled(false);
        setMaxHz(frequency);
      }
      else {
        setIsSaveDisabled(true);
      }
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = async () => {
    if (activeStep === 0) {
      await handleCloseDialog2();
    }
    else if (activeStep === 2) {
      setMaxHz(null);
      setActiveStep(0);
    }
    else {
      setActiveStep((prevActiveStep) => prevActiveStep - 1);
    }
  };

  const stepTitle = (index: number) => {
    switch (index) {
      case 0:
        return 'Select properties to include in data collection';
      case 1:
        return 'Finding maximum frequency';
      case 2:
        return 'Maximum frequency of this device with selected properties';
    }
  };

  const stepContent = (index: number) => {
    switch (index) {
      case 0:
        return (
          <TreeView
            multiSelect={true}
            defaultExpandIcon={<ChevronRightIcon/>}
            defaultCollapseIcon={<ExpandMoreIcon />}
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
          <CircularProgress />
        )
      case 2:
        if (maxHz !== null) {
          return (
            <Typography variant="h4" align="center" sx={{ mt: 2, mb: 1 }}>{maxHz} Hz</Typography>)
          }
        return (
          <Typography variant="h4" align="center" sx={{ mt: 2, mb: 1 }}>No frequency found</Typography>
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
        sx={{width: "50vw", height: "70vh", display: "flex", flexDirection: "column",
          "& .MuiDialog-paper": { width: "50vw", height: "70vh" }}}
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
            {stepTitle(activeStep)}
          </Typography>
        </Box>
        <Box sx={{ flexGrow: 1, overflowY: "auto", padding: 2 }}>
          <Box sx={{ display: "flex", justifyContent: activeStep === 0 ? "flex-start" : "center" }}>
            {stepContent(activeStep)}
          </Box>
        </Box>
        <Box
          sx={{position: "sticky", bottom: 0, backgroundColor: "white", borderTop: "1px solid #ddd",
            padding: "8px", display: "flex", justifyContent: "space-between", alignItems: "center",
            zIndex: 5 }}
        >
        <Button
          color="inherit"
          onClick={handleBack}
          sx={{ ml: 1 }}
        >
          {activeStep === 0 ? "Cancel" : activeStep === 1 ? "Back" : "Reconfigure"}
        </Button>
        {activeStep !== 1 && (
          <Button
            disabled={isSaveDisabled && activeStep === steps.length - 1}
            onClick={() => {
              if (activeStep === steps.length - 1) {
                handleCloseDialog2();
              } else {
                handleNext(sessionId, device);
              }
            }}
            sx={{ mr: 1 }}
          >
            {activeStep === steps.length - 1 ? "Save configuration" : "Next"}
          </Button>
        )}
        </Box>
      </DialogContent>
    </Dialog>
  )
};

  const devicesColumns: GridColDef[] = [
    {
      field: 'id', headerName: 'MAC Address', renderCell: (params) => (
      <Link href={`/devices/detail/${params.id}`} sx={{ padding: 1, marginX: -1 }}
        onClick={(event) => {
        event.stopPropagation();
      }}>
        {params.value}
      </Link>
      ),
      flex: 1
    },
    {
      field: 'battery', headerName: 'Battery', renderCell: (params) => (
        <Stack direction="row" alignItems="center" sx={params.value ? { color: 'success.main', fontWeight: '500' } : { color: 'gray' }}>
          <BatteryFullIcon fontSize="small" />
          {params.value ? (
            <Typography variant="inherit">{params.value}%</Typography>
          ) : (
            <Typography variant="inherit">?</Typography>
          )}
        </Stack>
      ),
      flex: 1
    },
    { field: 'status', headerName: 'Status', flex: 1 },
    { field: 'maxHz', headerName: 'Max Hz', flex: 1 },
    {
      field: "configureButton", headerName: "", width: 150, renderCell: (params) => (
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
          <Button
            variant="outlined"
            startIcon={<EditIcon />}
            color="primary"
            size="small"
            onClick={(event) => {
              event.stopPropagation();

              // handleOpenDialog2(params.row.id);
              handleRowClick(params.row.id, event);
              // DeviceConfigDialog({ device: params.row.id, open: isDialogOpen2 });
            }}
            sx={{
              textTransform: "none", fontWeight: "bold", display: "flex",
              alignItems: "center", height: "auto", margin: "auto",
            }}
          >
            Configure
          </Button>
          {/* <DeviceConfigDialog
            open={isDialogOpen2}
            device={selectedDevice}
          /> */}

          {/* only open dialog on selection row */}
          { selectedDevice === params.row.id && open && loading === false && (
            <DeviceConfigDialog
              open={isDialogOpen2}
              device={selectedDevice}
            />
          )}
          </div>
        </Box>
      ),
      sortable: false,
      filterable: false,
    }
  ];

  const availableDevicesColumns: GridColDef[] = [
    {
      field: 'id', headerName: 'MAC Address', renderCell: (params) => (
      <Link href={`/devices/detail/${params.id}`} sx={{ padding: 1, marginX: -1 }}
        onClick={(event) => {
        event.stopPropagation();
      }}>
        {params.value}
      </Link>
      ),
      flex: 1
    },
    {
      field: 'battery', headerName: 'Battery', renderCell: (params) => (
        <Stack direction="row" alignItems="center" sx={params.value ? { color: 'success.main', fontWeight: '500' } : { color: 'gray' }}>
          <BatteryFullIcon fontSize="small" />
          {params.value ? (
            <Typography variant="inherit">{params.value}%</Typography>
          ) : (
            <Typography variant="inherit">?</Typography>
          )}
        </Stack>
      ),
      flex: 1
    },
    { field: 'status', headerName: 'Status', flex: 1 },
    { field: 'maxHz', headerName: 'Max Hz', flex: 1 },
  ];

  const devicesRows: GridRowsProp = useMemo(() => {
    const rows = devices.map((device) => ({
      name:     device.manufacturerName,
      id:       device.deviceId,
      status:   device.connectStatus,
      battery:  device.batteryLevel,
      maxHz:    device.maxHz,
    }));

    return rows;
  }, [devices]);

  const availableDevicesRows: GridRowsProp = useMemo(() => {
    const rows = availableDevices.map((device) => ({
      name:     device.manufacturerName,
      id:       device.deviceId,
      status:   device.connectStatus,
      battery:  device.batteryLevel,
      maxHz:    device.maxHz,
    }));

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
    await deleteSession(sessionId);
    if (!projectId) {
      handleFetchSession(sessionId, setSessionName, setSessionDescription, setProjectId, setProjectName, setIsArchived);
    }
    window.location.href = '/projects/detail/' + projectId;
  };

  useEffect(() => {
    fetchSessionDevices(sessionId, setDevices);
    handleAvailableDevices(sessionId, setAvailableDevices);
    handleFetchSession(sessionId, setSessionName, setSessionDescription, setProjectId, setProjectName, setIsArchived);
  }, [sessionId]);

  const renewAvailableDevices = async () => {
    // // Opvragen units
    // console.log("wrm vragen we deze nu op")
    // const devices = await listUnits();
    await handleAvailableDevices(sessionId, setAvailableDevices);
  }

  useEffect(() => {
    renewAvailableDevices();
  }, []);

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
          <Typography variant="h2" sx={{ pt: 2 }}>Connected Devices in Session</Typography>
          <Paper>
            <DataGrid
              rows={devicesRows}
              columns={devicesColumns}
              density='compact'
              autoHeight
              pageSizeOptions={[10]}
              initialState={{
                pagination: { paginationModel: { pageSize: 10 } },
                sorting: {
                  sortModel: [{ field: 'id', sort: 'desc' }],
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
              density='compact'
              autoHeight
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
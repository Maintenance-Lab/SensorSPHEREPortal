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

const fetchDevices = async (sessionId) => {
  const devices = await fetch('/api/devices/all/' + sessionId, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      credentials: 'include',
    },
  });

  if (!devices.ok) {
    console.error('Failed to fetch devices 22');
    return [];
  }

  const devicesData = await devices.json();
  return devicesData;
};

const removeDevicesFromSession = async (sessionId, selectedDeviceIds, fetchSessionDevices, fetchAvailableDevices) => {
  const res = await fetch('/api/sessions/removeFromSession', {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      credentials: 'include',
    },
    body: JSON.stringify({
      sessionId: sessionId,
      deviceIds: selectedDeviceIds,
    }),
  });

  if (!res.ok) {
    console.error('Failed to remove devices from session');
    return;
  }

  fetchSessionDevices();
  fetchAvailableDevices(sessionId);
};

const sendConfiguration = async (sessionId, selectedDeviceId) => {
  console.log("in send configuration ", sessionId, selectedDeviceId);
  const res = await fetch('/api/devices/sendConfiguration', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      credentials: 'include'
    },
    body: JSON.stringify({
      sessionId: sessionId,
      selectedDevice: selectedDeviceId,
    })
  });

  if (!res.ok) {
    console.error('Failed to update selected properties');
    return;
  }

  const data = await res.json();
  console.log("sent configuration ", data);
  return data;
}

const updateSession = async (sessionId, name, description, archived) => {
  const res = await fetch('/api/sessions/update/' + sessionId, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      credentials: 'include'
    },
    body: JSON.stringify({
      name: name,
      description: description,
      archived: archived,
    })
  });

  if (!res.ok) {
    console.error('Failed to update session');
    return;
  }
  const data = await res.json();
  return data;
};

const deleteSession = async (sessionId: number) => {
  const res = await fetch('/api/sessions/delete', {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      credentials: 'include'
    },
    body: JSON.stringify({
      ids: [sessionId]
    })
  });

  if (!res.ok) {
    console.error('Failed to delete session');
    return;
  }

  const data = await res.json();
  return data;
};

function CustomDevicesToolbar({ selectedDeviceIds, sessionId, fetchSessionDevices, fetchAvailableDevices, devices }) {
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
            onClick={() => removeDevicesFromSession(sessionId, selectedDeviceIds, fetchSessionDevices, fetchAvailableDevices)}
          >
            Remove Devices from Session
          </Button>
          <Button
            variant="outlined"
            startIcon={<Devices />}
            // onClick={() => sendConfiguration(sessionId, devices.map((device) => device.deviceId))}
            onClick={() => sendConfiguration(sessionId, selectedDeviceIds)}
          >
            Test configuration
          </Button>
      </Stack>
    </GridToolbarContainer>
  );

}

function CustomDevicesToolbar2({ selectedAddDeviceIds, sessionId, fetchSessionDevices,  fetchAvailableDevices}) {
  const addDevices = async () => {
    const res = await fetch("/api/devices/addToSession", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        credentials: "include",
      },
      body: JSON.stringify({
        sessionId,
        deviceIds: selectedAddDeviceIds,
      }),
    });

    if (!res.ok) {
      console.error("Failed to add devices to session");
      return;
    }

    fetchSessionDevices();
    fetchAvailableDevices(sessionId);
  };


  const activeSelection = selectedAddDeviceIds.length > 0;

  return (
    <GridToolbarContainer sx={{ padding: 1 }}>
      <Stack direction="row" spacing={1}>
      <GridToolbarQuickFilter variant="outlined" size="small" sx={{ padding: 0 }} />
        <Button
          variant="outlined"
          startIcon={<Devices />}
          onClick={() =>  addDevices()}
          disabled={!activeSelection}
        >
          Add Devices to Session
        </Button>
      </Stack>
    </GridToolbarContainer>
  );

}

const SessionDetail = () => {
  type RenderTree = {
    id: string;
    name: string;
    children?: { [key: string]: RenderTree };
  };

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
  const [selectedProperties, setSelectedProperties] = useState([]);
  const [expandedNodes, setExpandedNodes] = useState<string[]>(['root']);

  const [activeStep, setActiveStep] = React.useState(0);
  const [maxHz, setMaxHz] = React.useState(null);
  const steps = ['Select Properties', 'Find frequency', 'Save configuration'];

  const handleOpenDialog = () => setDialogOpen(true);
  const handleCloseDialog = () => setDialogOpen(false);


  const loadRows = async (properties) => {
    const root: RenderTree = {
      id: "root",
      name: "All Properties",
      children: Object.keys(properties).reduce((acc, manufacturer) => {
        const { model, properties: modelProperties } = properties[manufacturer];

        // Add each manufacturer as a child to the root
        acc[manufacturer] = {
          id: `${manufacturer}`,
          name: manufacturer,
          children: model.reduce((modelAcc, modelName, modelIndex) => {
            // Add each model as a child to the manufacturer
            modelAcc[modelName] = {
              id: `${manufacturer}:${modelName}`,
              name: modelName,
              children: modelProperties[modelIndex].reduce((propertyAcc, property) => {
                // Add each property as a child to the model
                propertyAcc[property] = {
                  id: `${manufacturer}:${modelName}:${property}`,
                  name: property
                };
                return propertyAcc;
              }, {})
            };
            return modelAcc;
          }, {})
        };

        return acc;
      }, {})
    };

    setAllProperties(root);
    return root;
  };

  const getAllChild = (nodes: RenderTree | null): string[] => {
    if (!nodes) return [];

    let array = [nodes.id];
    // Recursively get all children
    if (nodes.children && typeof nodes.children === "object") {
      Object.values(nodes.children).forEach((child) => {
        array = [...array, ...getAllChild(child)];
      });
    }

    // Remove duplicates
    return [...new Set(array)];
  };

  const findParent = (nodeId: string, nodes: RenderTree): RenderTree | null => {
    if (!nodes || !nodes.children) return null;

    for (const key in nodes.children) {
      if (nodes.children[key].id === nodeId) {
        return nodes;
      }
      const found = findParent(nodeId, nodes.children[key]);
      if (found) return found;
    }
    return null;
  };

  const areAllChildrenSelected = (parent: RenderTree, selectedSet: Set<string>): boolean => {
    if (!parent.children) return false;
    return Object.values(parent.children).every(child => selectedSet.has(child.id));
  };

  const getOnChange = async (checked: boolean, nodes: RenderTree) => {
    const allNodeIds = getAllChild(nodes);

    setSelectedProperties((prevSelected) => {
      let newSelection = new Set(prevSelected);

      if (checked) {
        // Selecting node: Add itself and all its children
        allNodeIds.forEach((id) => newSelection.add(id));

        // Check and update parent nodes recursively
        let parent = findParent(nodes.id, allProperties);
        while (parent) {
          if (areAllChildrenSelected(parent, newSelection)) {
            newSelection.add(parent.id);
          }
          parent = findParent(parent.id, allProperties);
        }
      } else {
        // Deselecting node: Remove itself and all children
        allNodeIds.forEach((id) => newSelection.delete(id));

        // Also deselect parent if necessary
        let parent = findParent(nodes.id, allProperties);
        while (parent) {
          if (!areAllChildrenSelected(parent, newSelection)) {
            newSelection.delete(parent.id);
          }
          parent = findParent(parent.id, allProperties);
        }
      }

      return [...newSelection];
    });
  };

  const renderTree = React.useCallback((nodes: RenderTree) => {
      if (!nodes || !nodes.id) return null;
        return (
          <TreeItem
          key={nodes.id}
          nodeId={String(nodes.id)}
          label={
            <FormControlLabel
              control={
                <Checkbox
                  checked={selectedProperties.includes(nodes.id)}
                  onChange={(event) =>
                    getOnChange(event.currentTarget.checked, nodes)
                  }
                />
              }
              label={nodes.name}
            />
          }
        >
          {nodes.children &&
            Object.values(nodes.children).map((child) =>
              renderTree(child)
            )}
        </TreeItem>
      );
    }, [selectedProperties, getOnChange]
  );

  const getDeviceProperties = async (deviceId: string) => {
    const res: any = await fetch('/api/devices/properties/' + deviceId, {
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

  const deviceProperties = async (deviceId: string) => {
    const properties = await getDeviceProperties(deviceId);
    return properties;
  };

  const getSelectedProperties = async (deviceId:string) => {
    const res: any = await fetch('/api/devices/selectedProperties', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        credentials: 'include'
      },
      body: JSON.stringify({
        deviceId: deviceId,
        sessionId: sessionId
      }),
    });

    if (!res.ok) {
      throw new Error('Failed to fetch device properties');
    }

    const data = await res.json();
    return data;
  }

  const updateSelection = (selectedIds: string[], allProperties: RenderTree) => {
    const newSelection = [...selectedIds];

    const checkAndSelectParent = (node: RenderTree) => {
      if (!node || !node.children) return;

      Object.values(node.children).forEach((child) => {
        checkAndSelectParent(child);

        if (!child?.children) return;

        // Check if all children of this node are selected
        const allChildrenSelected = Object.values(child.children).every((c) =>
          newSelection.includes(c.id)
        );

        if (allChildrenSelected && !newSelection.includes(child.id)) {
          newSelection.push(child.id);
        }
      });
    };

    checkAndSelectParent(allProperties);

    const allRootChildrenSelected = Object.values(allProperties.children || {}).every((child) =>
      newSelection.includes(child.id)
    );

    if (allRootChildrenSelected && !newSelection.includes(allProperties.id)) {
      newSelection.push(allProperties.id);
    }

    return newSelection;
  };

  const handleSelectedProperties= async (deviceId:string) => {
    const properties = await getSelectedProperties(deviceId);
    const selectedPropertiesIds = properties.map((property) => {
      return `${property.manufacturerName}:${property.model}:${property.propertyName}`;
    });

    const allProperties = await loadRows( await getDeviceProperties(deviceId));
    const updatedSelection = updateSelection(selectedPropertiesIds, allProperties);

    setSelectedProperties(updatedSelection);
  }

  const handleOpenDialog2 = async (deviceId) => {
    setSelectedDevice(deviceId);
    const properties = await deviceProperties(deviceId);
    try {
      handleSelectedProperties(deviceId);
      loadRows(properties);
    } catch (error) {
      console.error('Error fetching device details:', error);
    } finally {
      setDialogOpen2(true);
    }
  };

  const handleCloseDialog2 = async () => {
    // save selected properties to database
    const selectedPropertiesIds = await selectedProperties.filter((id) => id !== 'root');
    const res = await fetch('/api/devices/updateSelectedProperties', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        credentials: 'include'
      },
      body: JSON.stringify({
        sessionId: sessionId,
        deviceId: selectedDevice,
        selectedProperties: selectedPropertiesIds
      })
    });
    if (!res.ok) {
      console.error('Failed to update selected properties');
      return;
    }

    setDialogOpen2(false);
    setActiveStep(0);
    setMaxHz(null);
  };

  // const handleSendConfiguration = async (sessionId, selectedDevice) => {
  //     const maxHz = await sendConfiguration(sessionId, selectedDevice);
  //     if (maxHz !== null) {
  //       setMaxHz(maxHz);
  //     }

  // }

  // ---------------------------------------------------------

  const handleNext = async (sessionId, selectedDevice) => {
    const newStep = activeStep + 1;
    setActiveStep(newStep);

    if (newStep === 1) {
      const frequency = await sendConfiguration(sessionId, selectedDevice);
      console.log("gevonden frequencyyyy letsgo ", frequency);

      if (frequency !== null) {
        setMaxHz(frequency);
        setActiveStep((prev) => prev + 1);
      }
    }
  };

  const handleBack = () => {
    if (activeStep === 2) {
      console.log("active step 2");
      setMaxHz(null);
      setActiveStep(0);
    }
    else {
      setActiveStep((prevActiveStep) => prevActiveStep - 1);
    }

  };

  const getMaxFrequency = async (selectedProperties) => {
    // const res = await fetch('/api/devices/maxHz', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     credentials: 'include'
    //   },
    //   body: JSON.stringify({
    //     sessionId: sessionId,
    //     selectedProperties: selectedProperties
    //   })
    // });
    // if (!res.ok) {
    //   console.error('Failed to fetch max frequency');
    //   return null;
    // }

    if (activeStep === 1) {
      setMaxHz(100);
    }
  }

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
        // { open && allProperties && selectedProperties !== null && (
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
        // )};
      );
      case 1:
        // return 'Finding maximum frequency';
        return (
          // loading component
          <CircularProgress />
        )
      case 2:
        return 'Maximum frequency of this device with selected properties';
    }
  }

// ---------------------------------------------------------

  const DeviceConfigDialog = ({ device, open }) => (
    // <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
    <Dialog open={open} maxWidth="sm" fullWidth>
      <DialogContent>
      <Stepper activeStep={activeStep}>
        {steps.map((label, index) => {
          const stepProps: { completed?: boolean } = {};
          const labelProps: {
            optional?: React.ReactNode;
          } = {};
          return (
            <Step key={label} {...stepProps}>
              <StepLabel {...labelProps}>{label}</StepLabel>
            </Step>
          );
        })}
      </Stepper>
          <React.Fragment>
            <Typography variant="h4" align="center" sx={{ mt: 2, mb: 1 }}>{stepTitle(activeStep)}</Typography>
            <Box sx={{ display: 'flex', justifyContent: activeStep === 0 ? 'flex-start' : 'center' }} >
              {stepContent(activeStep)}
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2 }}>
              <Button
                color="inherit"
                disabled={activeStep === 0}
                onClick={handleBack}
                sx={{ mr: 1 }}>
                Back
              </Button>
              <Box sx={{ flex: '1 1 auto' }} />
              {activeStep !== 1 && (
                <Button
                onClick={() => {
                  if (activeStep === steps.length - 1) {
                    handleCloseDialog2();
                  }
                  // else if (activeStep === 1) {
                  //   // handleSendConfiguration(sessionId, device);
                  // }
                  else {
                    handleNext(sessionId, device);
                  }
                  }}>
                  {/* {activeStep === steps.length - 1 ? 'Finish' : 'Next'} */}
                  {activeStep === steps.length - 1 ? 'Finish' : activeStep === 1 ? '' : 'Next'}
                </Button>
              )}
            </Box>
          </React.Fragment>
      </DialogContent>
    </Dialog>
  );

  const devicesColumns: GridColDef[] = [
    {
      field: 'name', headerName: 'Name', renderCell: (params) => (
      <Link href={`/devices/detail/${params.id}`} sx={{ padding: 1, marginX: -1 }}
        onClick={(event) => {
        event.stopPropagation();
      }}>
        {params.value}
      </Link>
      ),
      flex: 1
    },
    { field: 'id', headerName: 'MAC Address', flex: 1 },
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
      field: "info",
      headerName: "",
      width: 150,
      renderCell: (params) => (
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
              // Prevent row selection
              event.stopPropagation();
              handleOpenDialog2(params.row.id);
            }}
            sx={{
              textTransform: "none",
              fontWeight: "bold",
              display: "flex",
              alignItems: "center", // Centreert de inhoud verticaal
              height: "auto", // Laat de knop zich aanpassen aan de inhoud
              margin: "auto", // Zorgt ervoor dat de knop gecentreerd blijft in de cel
            }}
          >
            Configure
          </Button>
          <DeviceConfigDialog
            open={isDialogOpen2}
            // onClose={handleCloseDialog2}
            device={selectedDevice}
          />
          </div>
        </Box>
      ),
      sortable: false,
      filterable: false,
    }
  ];

  const fetchAvailableDevices = async (sessionId) => {
    const availableDevices = await fetch('/api/devices/available/' + sessionId, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        credentials: 'include',
      },
    });

    if (!availableDevices.ok) {
      console.error('Failed to fetch available devices');
      return [];
    }

    const availableDevicesData = await availableDevices.json();
    setAvailableDevices(availableDevicesData);
  };

  const fetchSessionDevices = async () => {
    const devices = await fetchDevices(sessionId);
    setDevices(devices);
  };

  const devicesRows: GridRowsProp = devices.map((device) => ({
    name:     device.manufacturerName,
    id:       device.deviceId,
    status:   device.connectStatus,
    battery:  device.batteryLevel,
    maxHz:    device.maxHz,
  }));

  const availableDevicesRows: GridRowsProp = availableDevices.map((device) => ({
    name:     device.manufacturerName,
    id:       device.deviceId,
    status:   device.connectStatus,
    battery:  device.batteryLevel,
    maxHz:    device.maxHz,
  }));

  const fetchSession = async () => {
    const response = await fetch(`/api/sessions/id/${sessionId}`, {
      headers: { credentials: 'include' }
    });

    if (!response.ok) {
      console.error('Failed to fetch data');
      return [];
    }

    const data = await response.json();
    setProjectId(data.projectId);
    setSessionName(data.name);
    setIsArchived(data.archived);
    setSessionDescription(data.description);

    const projectResponse = await fetch('/api/projects/id/' + data.projectId, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        credentials: 'include'
      }
    });

    if (!projectResponse.ok) {
      console.error('Failed to fetch data');
      return [];
    }

    const projectData = await projectResponse.json();
    setProjectName(projectData.name);
  }

  const handleNameChange = async (event) => {
    await updateSession(sessionId, event.target.value, sessionDescription, isArchived);
    setIsEditingName(false);
    fetchSession();
  };

  const handleDescriptionChange = async (event) => {
    await updateSession(sessionId, sessionName, event.target.value, isArchived);
    setIsEditingDescription(false);
    fetchSession();
  };

  const handleArchiveSession = async (archive) => {
    await updateSession(sessionId, sessionName, sessionDescription, archive);
    fetchSession();
  };

  const handleDeleteSession = async (sessionId) => {
    await deleteSession(sessionId);
    if (!projectId) {
      // Ensure `projectId` is loaded before proceeding
      await fetchSession();
    }
    window.location.href = '/projects/detail/' + projectId;
  };

  useEffect(() => {
    fetchSessionDevices();
    fetchAvailableDevices(sessionId);
    fetchSession();
  }, [sessionId]);

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
              initialState={{
                pagination: { paginationModel: { pageSize: 10 } },
                sorting: {
                  sortModel: [{ field: 'id', sort: 'desc' }],
                },
              }}
              checkboxSelection
              onRowSelectionModelChange={(newSelection) => setSelectedDeviceIds(newSelection)}
              slots={{
                toolbar: () => <CustomDevicesToolbar
                  selectedDeviceIds={selectedDeviceIds}
                  sessionId={sessionId}
                  fetchSessionDevices={fetchSessionDevices}
                  fetchAvailableDevices={fetchAvailableDevices}
                  devices={devices}
                  // fetchDevices={allDevices}
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
              columns={devicesColumns}
              density='compact'
              autoHeight
              checkboxSelection
              onRowSelectionModelChange={(newSelection) => setSelectedAddDeviceIds(newSelection)}
              slots={{
                toolbar: () => <CustomDevicesToolbar2
                  selectedAddDeviceIds={selectedAddDeviceIds}
                  sessionId={sessionId}
                  fetchSessionDevices={fetchSessionDevices}
                  fetchAvailableDevices={fetchAvailableDevices}

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
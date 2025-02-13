import { useState, useEffect } from 'react';
import {
  Button,
  TextField,
  Link,
  Typography,
  Container,
  Box,
  Paper,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@mui/material';
import { Helmet } from 'react-helmet-async';
import PageTitleWrapper from 'src/Components/PageTitleWrapper';
import BatteryFullIcon from '@mui/icons-material/BatteryFull';
import Stack from '@mui/material/Stack';
import { DataGrid, GridColDef, GridRowsProp, GridToolbarContainer, GridToolbarQuickFilter } from '@mui/x-data-grid';
import { ArchiveOutlined, DeleteOutline, Devices, Inventory, UnarchiveOutlined} from '@mui/icons-material';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import { DesignServicesOutlined } from '@mui/icons-material';
import { useParams } from 'react-router-dom';
import EditIcon from '@mui/icons-material/Edit';
// import { Treeview } from '@mui/x-treeview';
import { TreeView, TreeItem } from '@mui/lab'
import { Checkbox, FormControlLabel } from '@mui/material'
import { set } from 'date-fns';
import { render } from 'react-dom';
import React from 'react';

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

  const data = await res.json();

  fetchSessionDevices();
  fetchAvailableDevices(sessionId);
};

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
  console.log("DELETE SESSION ID", sessionId);
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


function CustomDevicesToolbar({ selectedDeviceIds, setSelectedDeviceIds, sessionId, sessionDevices, fetchSessionDevices, fetchAvailableDevices }) {
  const [open, setOpen] = useState(false);
  const [allDevices, setAllDevices] = useState([]);

  const activeSelection = selectedDeviceIds.length > 0;

  return (
    <GridToolbarContainer sx={{ padding: 1 }}>
      <Stack direction="row" spacing={1}>
        <GridToolbarQuickFilter variant="outlined" size='small' sx={{ padding: 0 }} />
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
      </Stack>
    </GridToolbarContainer>
  );

}

function CustomDevicesToolbar2({ selectedAddDeviceIds, setSelectedAddDeviceIds, sessionId, availableDevices, fetchSessionDevices,  fetchAvailableDevices}) {
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
  const handleOpenDialog = () => setDialogOpen(true);
  const handleCloseDialog = () => setDialogOpen(false);

  const [selectedDeviceIds, setSelectedDeviceIds] = useState([]);
  const [selectedAddDeviceIds, setSelectedAddDeviceIds] = useState([]);
  const [devices, setDevices] = useState([]);
  const [availableDevices, setAvailableDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [loading, setLoading] = useState(false);
  const [allProperties, setAllProperties] = useState<RenderTree>();
  const [sensorTree, setSensorTree] = useState<{ id: string; name: string; children: any[] }[]>([]);
  const [selectedProperties, setSelectedProperties] = useState([]);

  const loadRows = async (properties) => {
    console.log("in load rows: ");

    // Create a root object
    const root: RenderTree = {
      id: "root",
      name: "Root",
      children: Object.keys(properties).reduce((acc, manufacturer) => {
        const { model, properties: modelProperties } = properties[manufacturer];

        // Add each manufacturer as a child to the root
        acc[manufacturer] = {
          id: `manufacturer_${manufacturer.replace(/\s+/g, '_')}`,
          name: manufacturer,
          children: model.reduce((modelAcc, modelName, modelIndex) => {
            // Add each model as a child to the manufacturer
            modelAcc[modelName] = {
              id: `model_${manufacturer.replace(/\s+/g, '_')}_${modelName.replace(/\s+/g, '_')}`,
              name: modelName,
              children: modelProperties[modelIndex].reduce((propertyAcc, property) => {
                // Add each property as a child to the model
                propertyAcc[property] = {
                  id: `property_${manufacturer.replace(/\s+/g, '_')}_${modelName.replace(/\s+/g, '_')}_${property.replace(/\s+/g, '_')}`,
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

    console.log("root: ", root);
    setAllProperties(root);
    return root;
  };

  const getChildById = (node: RenderTree, id: string) => {
    console.log("in getChildById: ", node, id);
    let array: string[] = [];

    const getAllChild = (nodes: RenderTree | null) => {
      if (nodes === null) return [];
      array.push(nodes.id);
      if (Array.isArray(nodes.children)) {
        nodes.children.forEach(node => {
          array = [...array, ...getAllChild(node)];
          array = array.filter((v, i) => array.indexOf(v) === i);
        });
      }
      return array;
    }

    const getNodeById = (nodes: RenderTree, id: string) => {
      if (nodes.id === id) {
        return nodes;
      } else if (Array.isArray(nodes.children)) {
        let result = null;
        nodes.children.forEach(node => {
          if (!!getNodeById(node, id)) {
            result = getNodeById(node, id);
          }
        });
        return result;
      }

      return null;
    }

    return getAllChild(getNodeById(node, id));
  }

  const getOnChange = async (checked: boolean, nodes: RenderTree) => {
    console.log("in getOnChange: ", checked, nodes);
    const allNode = getChildById(allProperties, nodes.id);

    let array = checked
    ? [...selectedProperties, ...allNode]
    : selectedProperties.filter(value => !allNode.includes(value));

    array = array.filter((v, i) => array.indexOf(v) === i);
    setSelectedProperties(array);
  }

  const renderTree = React.useCallback((nodes: RenderTree) => {
      if (!nodes || !nodes.id) return null;
        console.log("IN RENDER TREE: ", nodes);
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
                  onClick={(e) => e.stopPropagation()}
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
    console.log("in getDeviceDetails api call: ", deviceId);
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
    console.log("in getselectedrows api call: ", deviceId);
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


  // TODO: adjust to tree view
  const handleSelectedProperties= async (deviceId:string) => {
    const properties = await getSelectedProperties(deviceId);
    console.log("sensors that are activee: ", properties);

    const selectedPropertiesIds = properties.map((property) => {
      return `${property.manufacturer}_${property.model}_${property.property}`;
    });

    setSelectedProperties(selectedPropertiesIds);
  }

  const handleOpenDialog2 = async (deviceId) => {
    console.log("IN OPEN DIALOG 2: ", deviceId);
    const properties = await deviceProperties(deviceId);
    try {
      handleSelectedProperties(deviceId);
      loadRows(properties);
    } catch (error) {
      console.error('Error fetching device details:', error);
    } finally {
      setLoading(false);
      setDialogOpen2(true);
    }
  };

  const handleCloseDialog2 = () => {
    setDialogOpen2(false);
  };

  const DeviceConfigDialog = ({ device, open, onClose }) => (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogContent>
        <Typography variant="h4">Select properties to include in data collection</Typography>
      </DialogContent>
      <DialogContent>
        {loading ? (
          <Typography>Loading...</Typography>
        ) : (
          <TreeView
            multiSelect={true}
            selected={selectedProperties}
            >
            {open && allProperties && renderTree(allProperties)}

          </TreeView>
        )}
      </DialogContent>
      <DialogActions>
      <Button onClick={handleCloseDialog2} color="primary">
          Save configuration
        </Button>
        <Button onClick={handleCloseDialog2} color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );

  const devicesColumns: GridColDef[] = [
    {
      field: 'name', headerName: 'Name', renderCell: (params) => (
      <Link href={`/devices/detail/${params.id}`} sx={{ padding: 1, marginX: -1 }}>{params.value}</Link>
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
          }}
        >
          Configure
        </Button>
        <DeviceConfigDialog
          open={isDialogOpen2}
          onClose={handleCloseDialog2}
          device={selectedDevice}
        />
        </div>
      ),
      sortable: false,
      filterable: false,
    }
  ];

  const sensorColumns: GridColDef[] = [
    { headerName: 'Manufacturer', field: 'manufacturer', flex: 1 },
    { headerName: 'Model', field: 'model', flex: 1 },
    { headerName: 'Outputs', field: 'outputs', flex: 1 }
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

    console.log('Fetching project step 3', data.projectId);
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
    console.log("project id in delete session detail", projectId);
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
                  setSelectedDeviceIds={setSelectedDeviceIds}
                  sessionId={sessionId}
                  sessionDevices={fetchSessionDevices}
                  fetchSessionDevices={fetchSessionDevices}
                  fetchAvailableDevices={fetchAvailableDevices}
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
                  setSelectedAddDeviceIds={setSelectedAddDeviceIds}
                  sessionId={sessionId}
                  availableDevices={fetchAvailableDevices}
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
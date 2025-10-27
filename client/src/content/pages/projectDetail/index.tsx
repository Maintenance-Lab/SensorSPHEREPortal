import { useState, useEffect, useCallback } from 'react';
import { Button, TextField, Link, Paper, Tabs, Tab, Typography, Container, Box, Dialog, DialogActions,
  DialogContent, DialogTitle, Snackbar, Alert } from '@mui/material';
import { Helmet } from 'react-helmet-async';
import PageTitleWrapper from 'src/Components/PageTitleWrapper';
import Stack from '@mui/material/Stack';
import { useParams } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import { DataGrid, GridColDef, GridRowsProp, GridToolbarContainer, GridToolbarQuickFilter, GridRowSelectionModel } from '@mui/x-data-grid';
import ArchiveOutlinedIcon from '@mui/icons-material/ArchiveOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import { ArchiveOutlined, DeleteOutline, Devices, Inventory, UnarchiveOutlined } from '@mui/icons-material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { formatLastSeen } from '../sessionDetail/startSessionHelpers';

const sessionColumns: GridColDef[] = [
  {
    field: 'name', headerName: 'Name', flex: 1, renderCell: (params) => (
      <Link to={`/sessions/detail/${params.id}`}
        component={RouterLink}
        sx={{ padding: 1, marginX: -1 }}
        onClick={(event) => {event.stopPropagation()}}
      >
      {params.value}</Link>
    )
  },
  { field: 'status', headerName: 'Status', flex: 1 },
  { field: 'lastActive', headerName: 'Last Active', flex: 1 }
];

const updateProject = async (projectId: number, name: string, description: string, archived: boolean) => {
  const res = await fetch('/api/projects/update/' + projectId, {
    method: 'PUT',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: name,
      archived: archived,
      description: description
    })
  });

  if (!res.ok) {
    console.error('Failed to update project');
    return;
  }
};

// const addCollaborator = async (projectId, email) => {
//   const res = await fetch('/api/project/collaborator/add', {
//     method: 'POST',
//     credentials: 'include',
//     headers: {
//       'Content-Type': 'application/json',
//     },
//     body: JSON.stringify({
//       projectId: projectId,
//       email: email
//     })
//   });

//   if (!res.ok) {
//     const data = await res.json();
//     throw new Error(data.message || 'Failed to add collaborator');
//   }

//   return res.json();
// };

const deleteProject = async (projectId: number) => {
  const res = await fetch('/api/projects/delete', {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ids: [projectId]
    })
  });

  if (!res.ok) {
    console.error('Failed to delete project');
    return;
  }
}

const createSession = async (projectId: number, name, description, navigate) => {
  try {
    const res = await fetch('/api/sessions/create', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        projectId: projectId,
        name: name,
        description: description,

      })
    });

    if (!res.ok) {
      console.error('Failed to create session');
      return;
    }

    const data = await res.json();
    navigate(`/sessions/detail/${data.sessionId}`);
  } catch (error) {
    console.error(error);
  };
};

const fetchActiveSessions = async (projectId: number) => {
  const res = await fetch('/api/sessions/project/active/' + projectId, {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  })

  if (!res.ok) {
    console.error('Failed to fetch data');
    return [];
  }
  const data = await res.json();
  return data;
}

const fetchArchivedSessions = async (projectId) => {
  const res = await fetch('/api/sessions/project/archived/'+ projectId, {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    console.error('Failed to fetch data');
    return [];
  }
  const data = await res.json();
  return data;
}

const deleteSessions = async (sessionIds) => {
  const res = await fetch('/api/sessions/delete', {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ids: sessionIds
    })
  });

  if (!res.ok) {
    console.error('Failed to delete session');
    return;
  }
  return res.json();
};

function CustomSessionsToolbar({ selectedSessionIds, setSelectedSessionIds, projectId, fetchData, fetchProject, tab, selectionHasMeasuring }) {
  const [open, setOpen] = useState(false);
  const activeSelection = selectedSessionIds.length > 0;
  const [name, setName] = useState(`Session ${new Date().toDateString()}`)

  const [description, setDescription] = useState('');
  const [isDialogOpen, setDialogOpen] = useState(false);

  const handleOpenDialog = () => setDialogOpen(true);
  const handleCloseDialog = () => setDialogOpen(false);

  const navigate = useNavigate();

  const handleSubmitCreateSession = async () => {
    try {
      setOpen(false);
      await fetchProject();
      await createSession(projectId, name, description, navigate);
    } catch (error) {
      console.error(error);
    }
  };

  const archiveSessions = async (sessionIds, tab) => {
    const archived = tab === '2' ? true : false;
    const response = await fetch('/api/sessions/update-many', {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(
        [
          ...sessionIds.map((id) => ({ id, archived: archived }))
        ]
      )
    });
  }

  const handleArchiveProjects = useCallback(async () => {
    try {
      await archiveSessions(selectedSessionIds, tab);
      fetchData();
    } catch (error) {
      console.error(error);
    }
  }, [selectedSessionIds]);


  return (
    <GridToolbarContainer sx={{ padding: 1 }}>
      <Stack direction="row" spacing={1}>
        <Button
          variant="contained"
          color="primary"
          onClick={() => setOpen(true)}
          startIcon={<AddIcon />}
        >
          Create New Session
        </Button>
        <GridToolbarQuickFilter variant="outlined" size='small' sx={{ padding: 0 }} />
          <Button
            variant="outlined"
            size="medium"
            startIcon={<ArchiveOutlinedIcon />}
            // disabled={!activeSelection}
            disabled={!activeSelection || selectionHasMeasuring}
            onClick={handleArchiveProjects}
          >
            {tab === '2' ? "Archive" : "Unarchive"}
          </Button>
          <Button
            variant="outlined"
            size="medium"
            color="error"
            startIcon={<DeleteOutlineOutlinedIcon />}
            // disabled={!activeSelection}
            disabled={!activeSelection || selectionHasMeasuring}
            onClick={handleOpenDialog}
          >
            Delete
          </Button>
          <ConfirmationDialog
              open={isDialogOpen}
              onClose={handleCloseDialog}
              onConfirm={async (sessionsIds) => {
                await deleteSessions(sessionsIds);
                setSelectedSessionIds([]);
                fetchData();
              }}
              projectIds={selectedSessionIds}
            />
      </Stack>
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Create New Session</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            onFocus={(event) => { event.target.select(); }}
            margin="dense"
            label="Session Name"
            fullWidth
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && document.getElementById('description-input').focus()}
          />
          <TextField
            id="description-input"
            margin="dense"
            label="Session Description"
            fullWidth
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmitCreateSession()}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmitCreateSession} variant="contained" color="primary">
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </GridToolbarContainer>
  );
};

const ConfirmationDialog = ({ open, onClose, onConfirm, projectIds }) => (
  <Dialog open={open} onClose={onClose}>
    <DialogTitle>Confirm Deletion</DialogTitle>
    <DialogContent>
      <Typography>
        Are you sure you want to delete the selected session(s)? This action cannot be undone.
      </Typography>
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose} color="primary">
        Cancel
      </Button>
      <Button
        onClick={() => {
          onConfirm(projectIds);
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

const ConfirmationDialog2 = ({ open, onClose, onConfirm, projectId }) => (
  <Dialog open={open} onClose={onClose}>
    <DialogTitle>Confirm Deletion</DialogTitle>
    <DialogContent>
      <Typography>
        Are you sure you want to delete this project? This action cannot be undone.
      </Typography>
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose} color="primary">
        Cancel
      </Button>
      <Button
        onClick={() => {
          onConfirm(projectId);
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


const ProjectDetail = () => {
  const projectId = Number(useParams().projectId);
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [isArchived, setIsArchived] = useState(false);
  const [selectedSessionIds, setSelectedSessionIds] = useState<GridRowSelectionModel>([]);
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  // const [collaboratorEmail, setCollaboratorEmail] = useState('');
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'info' | 'warning'>('success');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [sortedSessions, setSortedSessions] = useState([]);
  const [currentTab, setTab] = useState('2');
  const [isDialogOpen, setDialogOpen] = useState(false);
  const handleOpenDialog2 = () => setDialogOpen(true);
  const handleCloseDialog2 = () => setDialogOpen(false);

  const [projectHasMeasuring, setProjectHasMeasuring] = useState(false);
  const [selectionHasMeasuring, setSelectionHasMeasuring] = useState(false);

  const handleTabChange = (event: React.SyntheticEvent, newCurrentTab: string) => {
    setTab(newCurrentTab);
  };

  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      const activeSessions = await fetchActiveSessions(projectId);
      const archivedSessions = await fetchArchivedSessions(projectId);

      // Load sessions based on the current tab
      switch (currentTab) {
        case '2':
          setSortedSessions(activeSessions);
          break;
        case '4':
          setSortedSessions(archivedSessions);
          break;
        default:
          setSortedSessions(activeSessions);
          break;
      }

      // Check if any session is measuring to prevent deletion and archiving
      const allSessions = [...activeSessions, ...archivedSessions];
      const hasMeasuring = allSessions.some(s => s.status === 'Measuring');
      setProjectHasMeasuring(hasMeasuring);

      return allSessions;
    } catch (error) {
      console.error('Failed to fetch data', error);
    }
  };

  const sessionRows: GridRowsProp = sortedSessions.map((session) => ({
    id: session.sessionId,
    name: session.name,
    status: session.status,
    scheduledFrom: session.scheduledFrom,
    scheduledTo: session.scheduledTo,
    projectId: session.projectId,
    meta: session.meta,
    createdAt: session.createdAt,
    lastActive: formatLastSeen(session.lastActive),
    archived: session.archived,
  }));

  const fetchProject = async () => {
      const res = await fetch('/api/projects/id/' + projectId, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) {
        console.error('Failed to fetch data');
        return [];
      }

      const data = await res.json();
      setProjectName(data.name);
      setProjectDescription(data.description);
      setIsArchived(data.archived);
  };

  const handleNameChange = async (event) => {
    await updateProject(projectId, event.target.value, projectDescription, isArchived);
    setIsEditingName(false);
    fetchProject();
  };

  const handleDescriptionChange = async (event) => {
    await updateProject(projectId, projectName, event.target.value, isArchived);
    setIsEditingDescription(false);
    fetchProject();
  };

  const handleArchiveProject = async (archived: boolean) => {
    updateProject(projectId, projectName, projectDescription, archived,);
    setIsArchived(archived);
  };

  const handleDeleteProject = async (projectId) => {
    await deleteProject(projectId);
    navigate('/projects', { replace: true });

    window.history.pushState(null, '', '/projects');
    window.addEventListener('popstate', () => {
      window.history.pushState(null, '', '/projects');
    });
  };

  const handleSelection = async (selectedIds) => {
    setSelectedSessionIds(selectedIds);
    const allSessions = await fetchData();
    const selectedSessions = allSessions.filter(session => selectedIds.includes(session.sessionId));
    const selectedStatuses = selectedSessions.map(session => session.status);
    const hasMeasuring = selectedStatuses.includes('Measuring');
    setSelectionHasMeasuring(hasMeasuring);
  }

  // const handleAddCollaborator = async () => {
  //   try {
  //     const { message } = await addCollaborator(projectId, collaboratorEmail);
  //     setSnackbarMessage(message);
  //     setSnackbarSeverity('success');
  //   } catch (error) {
  //     setSnackbarMessage(error.message);
  //     setSnackbarSeverity('error');
  //   } finally {
  //     setSnackbarOpen(true);
  //     setOpen(false);
  //     setCollaboratorEmail('');
  //   }
  // };

  useEffect(() => {
    fetchProject();
  }, []);

  useEffect(() => {
    fetchData();
  }, [currentTab]);

  return (
    <div>
      <Helmet>
        <title>{projectName}</title>
      </Helmet>
      <PageTitleWrapper>
        <Stack spacing={1} >
          {isEditingName ? (
            <Box>
              <TextField
                defaultValue={projectName}
                variant="outlined"
                size="small"
                autoFocus
                onBlur={(event) => {
                  // Check if the value has changed from the initial value
                  if (event.target.value !== projectName) {
                    window.location.reload();
                  }
                  handleNameChange(event);
                }}
                onFocus={(event) => { event.target.select(); }}
                sx={{ marginTop: -1, marginLeft: -1, width: '100%' }}
                inputProps={{ sx: { fontSize: '2rem', fontWeight: 700, lineHeight: 1.167 }, }}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    const target = event.target as HTMLInputElement;
                    if (target.value !== projectName) {
                      window.location.reload();
                    }
                    handleNameChange(event); }
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
              {projectName}
            </Typography>
          )}
          {isEditingDescription ? (
            <Box>
              <TextField
                defaultValue={projectDescription}
                variant="outlined"
                size="small"
                autoFocus
                multiline
                minRows={3}
                maxRows={10}
                onBlur={async (event) => {
                  // Save only if changed
                  if (event.target.value !== projectDescription) {
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
                color: projectDescription ? "inherit" : "gray",
                whiteSpace: "pre-wrap",
              }}
            >
              {projectDescription ? projectDescription : "Add description..."}
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
            {/* {!isArchived &&
              <Button
                variant="outlined"
                startIcon={<GroupAddOutlinedIcon />}
                onClick={() => setOpen(true)}
              >
                Add Collaborator
              </Button>
            } */}
            {!isArchived &&
              <Button
                variant="outlined"
                startIcon={<ArchiveOutlined />}
                onClick={() => handleArchiveProject(true)}
                disabled={projectHasMeasuring}
              >
                Archive Project
              </Button>
            }
            {isArchived &&
              <Button
                variant="outlined"
                startIcon={<UnarchiveOutlined />}
                onClick={() => handleArchiveProject(false)}
              >
                Unarchive Project
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
              onClick={handleOpenDialog2}
              disabled={projectHasMeasuring}
            >
              Delete Project
            </Button>
            <ConfirmationDialog2
            open={isDialogOpen}
            onClose={handleCloseDialog2}
            onConfirm={async (projectId) => {
              await handleDeleteProject(projectId);
            }}
            projectId={projectId}
          />
          </Stack>
        </Stack>
      </PageTitleWrapper>
      <Container>
        <Stack spacing={1}>
          <Typography variant="h2" pt={2} sx={{ position: 'relative', left: '40px' }} >Data Collection Sessions</Typography>
          <Container maxWidth="lg">
            <Stack direction="row" spacing={2} sx={{ height: '100%' }}>
              <Tabs
                orientation="vertical"
                value={currentTab}
                onChange={handleTabChange}
                sx={{ minWidth: 200 }}
              >
                <Tab value="2" label="Active Sessions" sx={{ alignItems: 'start' }} />
                <Tab value="4" label="Archived Sessions" sx={{ alignItems: 'start' }} />
              </Tabs>
              <Paper sx={{ width: "100%", height: "100%" }}>
                <DataGrid
                  rows={sessionRows}
                  columns={sessionColumns}
                  density="compact"
                  pageSizeOptions={[10, 25, 50]}
                  autoHeight
                  initialState={{
                    pagination: { paginationModel: { pageSize: 10 } },
                    sorting: {
                      sortModel: [{ field: 'id', sort: 'desc' }],
                    },
                  }}
                  checkboxSelection
                  onRowSelectionModelChange={(newSelection) => handleSelection(newSelection)}
                  slots={{
                    toolbar: () => <CustomSessionsToolbar
                      selectedSessionIds={selectedSessionIds}
                      setSelectedSessionIds={setSelectedSessionIds}
                      projectId={projectId}
                      fetchData={fetchData}
                      fetchProject={fetchProject}
                      tab={currentTab}
                      selectionHasMeasuring={selectionHasMeasuring}
                    />,
                  }}
                  sx={{
                    "& .MuiDataGrid-columnHeader:focus, .MuiDataGrid-cell:focus": {
                      outline: "none",
                    },
                  }}
                />
              </Paper>
            </Stack>
          </Container>
        </Stack>
      </Container>
      {/* <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Add Collaborator</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Collaborator Email"
            fullWidth
            value={collaboratorEmail}
            onChange={(e) => setCollaboratorEmail(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddCollaborator()}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleAddCollaborator} variant="contained" color="primary">
            Add
          </Button>
        </DialogActions>
      </Dialog> */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default ProjectDetail;

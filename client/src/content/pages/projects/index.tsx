import { useState, useEffect, useCallback } from 'react';
import { Box, Container, Button, Paper, Tab, Link, Tabs, Typography, Stack, Dialog,
  DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { Helmet } from 'react-helmet-async';
import PageTitleWrapper from 'src/components/pageTitleWrapper';
import AddIcon from '@mui/icons-material/Add';
import ArchiveOutlinedIcon from '@mui/icons-material/ArchiveOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import { DataGrid, GridColDef, GridRowsProp, GridToolbarContainer, GridToolbarQuickFilter
  } from '@mui/x-data-grid';
import CreateProjectDialog from './createProjectDialog';
import { GridColumnVisibilityModel } from '@mui/x-data-grid';
import { Link as RouterLink, useSearchParams } from 'react-router-dom';


const fetchActiveProjects = async () => {
  const res = await fetch('/api/projects/active', {
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

const fetchArchivedProjects = async () => {
  const res = await fetch('/api/projects/archived', {
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

// const fetchPendingProjects = async () => {
//   const res = await fetch('/api/projects/pending', {
//     method: 'GET',
//     credentials: 'include',
//     headers: {
//       'Content-Type': 'application/json',
//     },
//   });

//   if (!res.ok) {
//     console.error('Failed to fetch data');
//     return [];
//   }

//   const data = await res.json();
//   return data;
// }

// const createProject = async (name, description) => {
//   const response = await fetch('/api/projects/create', {
//     method: 'POST',
//     credentials: 'include',
//     headers: {
//       'Content-Type': 'application/json',
//     },
//     body: JSON.stringify({ name, description })
//   });

//   if (!response.ok) {
//     throw new Error('Failed to create project');
//   }

//   const data = await response.json();
//   return data;
// };

const deleteProjects = async (projectIds) => {
  const response = await fetch('/api/projects/delete', {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ids: projectIds
    })
  });
};

const archiveProjects = async (projectIds, tab) => {
  const archived = tab === '2' ? true : false;
  const response = await fetch('/api/projects/update-many', {
    method: 'PUT',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(
      [
        ...projectIds.map((id) => ({ id, archived: archived }))
      ]
    )
  });
}

// const accept = async (projectId) => {
//   const response = await fetch('/api/projects/accept', {
//     method: 'POST',
//     credentials: 'include',
//     headers: {
//       'Content-Type': 'application/json',
//     },
//     body: JSON.stringify({ projectId })
//   });

//   if (!response.ok) {
//     console.error('Failed to accept project');
//   }
// }

// const decline = async (projectId) => {
//   const response = await fetch('/api/projects/decline', {
//     method: 'POST',
//     credentials: 'include',
//     headers: {
//       'Content-Type': 'application/json',
//     },
//     body: JSON.stringify({ projectId })
//   });

//   if (!response.ok) {
//     console.error('Failed to decline project');
//   }
// }

function CustomProjectsToolbar({ selectedProjectIds, setSelectedProjectIds, fetchData, tab }) {
  const [open, setOpen] = useState(false);
  const activeSelection = selectedProjectIds.length > 0;
  const [isDialogOpen, setDialogOpen] = useState(false);

  const handleOpenDialog = () => setDialogOpen(true);
  const handleCloseDialog = () => setDialogOpen(false);

  const handleCreateProject = useCallback(async () => {
    try {
      setOpen(true);
    } catch (error) {
      console.error(error);
    }
  }, []);

  // const handleDeleteProjects = useCallback(async () => {
  //   try {
  //     await deleteProjects(selectedProjectIds);
  //     fetchData();
  //   } catch (error) {
  //     console.error(error);
  //   }
  // }, [selectedProjectIds]);

  const handleArchiveProjects = useCallback(async () => {
    try {
      await archiveProjects(selectedProjectIds, tab);
      fetchData();
    } catch (error) {
      console.error(error);
    }
  }, [selectedProjectIds]);

  return (
    <GridToolbarContainer sx={{ padding: 1 }}>
      <Stack direction="row" spacing={1}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleCreateProject}
          startIcon={<AddIcon />}
        >
          Create Project
        </Button>
        <GridToolbarQuickFilter variant="outlined" size='small' sx={{ padding: 0 }} />

        {tab !== '6' && (
          <>
          <Button
            variant="outlined"
            size="medium"
            startIcon={<ArchiveOutlinedIcon />}
            disabled={!activeSelection}
            onClick={handleArchiveProjects}
          >
            {tab === '2' ? "Archive" : "Unarchive"}
          </Button>
          <Button
            variant="outlined"
            size="medium"
            color="error"
            startIcon={<DeleteOutlineOutlinedIcon />}
            disabled={!activeSelection}
            onClick={handleOpenDialog}
          >
            Delete
          </Button>
          <ConfirmationDialog
            open={isDialogOpen}
            onClose={handleCloseDialog}
            onConfirm={async (projectIds) => {
              await deleteProjects(projectIds);
              setSelectedProjectIds([]); // Optioneel: selectie wissen
              fetchData(); // Herlaad data na verwijdering
            }}
            projectIds={selectedProjectIds}
          />
          </>
        )}

      </Stack>
      <CreateProjectDialog
        open={open}
        setOpen={setOpen}
      />
    </GridToolbarContainer>
  );
};

const ConfirmationDialog = ({ open, onClose, onConfirm, projectIds }) => (
  <Dialog open={open} onClose={onClose}>
    <DialogTitle>Confirm Deletion</DialogTitle>
    <DialogContent>
      <Typography>
        Are you sure you want to delete the selected project(s)? This action cannot be undone.
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


const Projects = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTabParam = searchParams.get('tab');
  const [sortedProjects, setSortedProjects] = useState([]);
  const [selectedProjectIds, setSelectedProjectIds] = useState([]);
  const [currentTab, setTab] = useState(currentTabParam === 'archived' ? '4' : '2');
  const [loading, setLoading] = useState(true);
  const [columnVisibilityModel, setColumnVisibilityModel] = useState<GridColumnVisibilityModel>({lastActive: false, actions: false});

  const handleTabChange = (event: React.SyntheticEvent, newCurrentTab: string) => {
    setTab(newCurrentTab);
    setLoading(true);
    setSearchParams({ tab: newCurrentTab === '4' ? 'archived' : 'active' }, { replace: true });

    // // Only show actions column for pending projects
    // if (newCurrentTab === '6') {
    //   setColumnVisibilityModel((prev) => ({ ...prev, actions: true }));
    // } else {
    //   setColumnVisibilityModel((prev) => ({ ...prev, actions: false }));
    // }
  };

  // const handleAccept = async (projectId) => {
  //   try {
  //     await accept(projectId);
  //     fetchData();
  //   } catch (error) {
  //     console.error(error);
  //   }
  // }

  // const handleDecline = async (projectId) => {
  //   try {
  //     await decline(projectId);
  //     fetchData();
  //   } catch (error) {
  //     console.error(error);
  //   }
  // }

  const fetchData = async () => {
    console.log('Fetching data');
    try {
      let projects = [];
      console.log('Current tab:', currentTab);
      switch (currentTab) {
        case '2':
          projects = await fetchActiveProjects();
          break;
        case '4':
          projects = await fetchArchivedProjects();
          break;
        // case '6':
        //   projects = await fetchPendingProjects();
        //   break;
        default:
          projects = await fetchActiveProjects();
          break;
      }
      setSortedProjects(projects);

      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch data', error);
      setLoading(false);
    }
  };

  const projectsColumns: GridColDef[] = [
    {
      field: 'name', headerName: 'Name', flex: 1, renderCell: (params) => (
        <Link to={`/projects/detail/${params.id}`}
          sx={{ padding: 1, marginX: -1 }}
          component={RouterLink}
          onClick={(event) => {
            event.stopPropagation();
          }}>
        {params.value}</Link>
      )
    },
    { field: 'lastActive', headerName: 'Last Activity', flex: 1 },
    // {
    //   field: 'actions',
    //   headerName: 'Actions',
    //   flex: 1,
    //   sortable: false,

    //   renderCell: (params) => {
    //     if (currentTab === '6' && params.row && !loading) {
    //       return (
    //         <Box display="flex" gap={1}>
    //           <Button
    //             variant="contained"
    //             color="primary"
    //             size="small"
    //             onClick={() => handleAccept(params.id)}
    //           >
    //             Accept
    //           </Button>
    //           <Button
    //             variant="outlined"
    //             color="error"
    //             size="small"
    //             onClick={() => handleDecline(params.id)}
    //           >
    //             Decline
    //           </Button>
    //         </Box>
    //       );
    //     }
    //     return null;
    //   },
    // },
  ];

  const projectsRows: GridRowsProp = sortedProjects.map((project) => ({
    id: project.projectId,
    name: project.name,
    lastActive: project.lastActive,
  }));

  useEffect(() => {
    fetchData();
  }, [currentTab]);

  useEffect(() => {
    setTab(currentTabParam === 'archived' ? '4' : '2');
  }, [currentTabParam]);

  return (
    <div>
      <Helmet>
        <title>All Projects</title>
      </Helmet>
      <PageTitleWrapper>
        <Stack spacing={2}>
          <Typography variant="h1">All Projects</Typography>
        </Stack>
      </PageTitleWrapper>
      <Container maxWidth="lg">
        <Stack direction="row" spacing={2} sx={{ height: '100%' }}>
          <Tabs
            orientation="vertical"
            value={currentTab}
            onChange={handleTabChange}
            sx={{ minWidth: 150 }}
          >
            <Tab value="2" label="My Projects" sx={{ alignItems: 'start' }} />
            <Tab value="4" label="Archived" sx={{ alignItems: 'start' }} />
            {/* <Tab value="6" label="Pending" sx={{ alignItems: 'start' }} /> */}
          </Tabs>
          <Paper sx={{ width: "100%", height: "100%" }}>
            <DataGrid
              rows={projectsRows}
              columns={projectsColumns}
              density="compact"
              autoHeight
              autosizeOnMount
              autosizeOptions={{ includeOutliers: true }}
              checkboxSelection={true}
              columnVisibilityModel={columnVisibilityModel}
              onColumnVisibilityModelChange={(newModel) => setColumnVisibilityModel(newModel)}
              onRowSelectionModelChange={(newSelection) => setSelectedProjectIds(newSelection)}
              initialState={{
                columns: {
                  columnVisibilityModel: {
                    lastActive: false,
                    actions: false,
                  },
                },
                sorting: {
                  sortModel: [{ field: 'lastActive', sort: 'desc' }],
                },
              }}
              slots={{
                toolbar: () => <CustomProjectsToolbar
                  selectedProjectIds={selectedProjectIds}
                  setSelectedProjectIds={setSelectedProjectIds}
                  fetchData={fetchData}
                  tab={currentTab}
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
    </div>
  );
};

export default Projects;

import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Container,
  Button,
  TextField,
  Paper,
  Tab,
  Link,
  Tabs,
  Typography,
  Stack,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle
} from '@mui/material';
import { Helmet } from 'react-helmet-async';
import PageTitleWrapper from 'src/Components/PageTitleWrapper';
import AddIcon from '@mui/icons-material/Add';
import ArchiveOutlinedIcon from '@mui/icons-material/ArchiveOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import {
  DataGrid,
  GridColDef,
  GridRowsProp,
  GridToolbarContainer,
  GridToolbarQuickFilter
} from '@mui/x-data-grid';
import CreateProjectDialog from './CreateProjectDialog';

const fetchActiveProjects = async () => {
  const res = await fetch('/api/projects/active', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      credentials: 'include'
    }
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
    headers: {
      'Content-Type': 'application/json',
      credentials: 'include'
    }
  });

  if (!res.ok) {
    console.error('Failed to fetch data');
    return [];
  }
  const data = await res.json();
  return data;
}

const createProject = async (name, description) => {
  const response = await fetch('/api/projects/create', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      credentials: 'include'
    },
    body: JSON.stringify({ name, description })
  });

  if (!response.ok) {
    throw new Error('Failed to create project');
  }


  const data = await response.json();
  return data;
};

const deleteProjects = async (projectIds) => {
  const response = await fetch('/api/projects/delete', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      credentials: 'include'
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
    headers: {
      'Content-Type': 'application/json',
      credentials: 'include'
    },
    body: JSON.stringify(
      [
        ...projectIds.map((id) => ({ id, archived: archived }))
      ]
    )
  });
}

function CustomProjectsToolbar({ selectedProjectIds, setSelectedProjectIds, fetchData, tab }) {
  const [open, setOpen] = useState(false);
  const activeSelection = selectedProjectIds.length > 0;

  const handleCreateProject = useCallback(async () => {
    try {
      setOpen(true);
    } catch (error) {
      console.error(error);
    }
  }, []);

  const handleDeleteProjects = useCallback(async () => {
    try {
      await deleteProjects(selectedProjectIds);
      fetchData();
    } catch (error) {
      console.error(error);
    }
  }, [selectedProjectIds]);

  const handleArchiveProjects = useCallback(async () => {
    try {
      await archiveProjects(selectedProjectIds, tab);
      console.log("fetching data again")
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
          onClick={handleDeleteProjects}
        >
          Delete
        </Button>
      </Stack>
      <CreateProjectDialog
        open={open}
        setOpen={setOpen}
      />
    </GridToolbarContainer>
  );
};

const Projects = () => {
  const [sortedProjects, setSortedProjects] = useState([]);
  const [selectedProjectIds, setSelectedProjectIds] = useState([]);
  const [currentTab, setTab] = useState('2');

  const handleTabChange = (event: React.SyntheticEvent, newCurrentTab: string) => {
    setTab(newCurrentTab);
  };

  const fetchData = async () => {
    console.log('Fetching data');
    try {
      let projects = [];
      switch (currentTab) {
        case '2':
          projects = await fetchActiveProjects();
          break;
        case '4':
          projects = await fetchArchivedProjects();
          break;
        default:
          projects = await fetchActiveProjects();
          break;
      }
      setSortedProjects(projects);
    } catch (error) {
      console.error('Failed to fetch data', error);
    }
  };

  const projectsColumns: GridColDef[] = [
    {
      field: 'name', headerName: 'Name', flex: 1, renderCell: (params) => (
        <Link href={`/projects/detail/${params.id}`} sx={{ padding: 1, marginX: -1 }}>{params.value}</Link>
      )
    },
    { field: 'lastActive', headerName: 'Last Activity', flex: 1 },
  ];

  const projectsRows: GridRowsProp = sortedProjects.map((project) => ({
    id: project.projectId,
    name: project.name,
    lastActive: project.lastActive,
  }));

  useEffect(() => {
    fetchData();
  }, [currentTab]);

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
            sx={{ flex: '0 0 auto' }}
          >
            <Tab value="2" label="My Projects" sx={{ alignItems: 'start' }} />
            <Tab value="4" label="Archived" sx={{ alignItems: 'start' }} />
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
              onRowSelectionModelChange={(newSelection) => setSelectedProjectIds(newSelection)}
              initialState={{
                columns: {
                  columnVisibilityModel: {
                    lastActive: false
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

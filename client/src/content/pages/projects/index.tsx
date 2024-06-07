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
  Stack
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
  GridToolbar,
  GridToolbarContainer,
  GridToolbarColumnsButton,
  GridToolbarFilterButton,
  GridToolbarExport,
  GridToolbarDensitySelector,
  useGridApiContext
} from '@mui/x-data-grid';

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

const createProject = async () => {
  //Default values
  const response = await fetch('/api/projects/create', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      credentials: 'include'
    },
    body: JSON.stringify({})
  });
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

const archiveProjects = async (projectIds) => {
  const response = await fetch('/api/projects/update-many', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      credentials: 'include'
    },
    body: JSON.stringify(
      [
        ...projectIds.map((id) => ({ id, archived: true }))
      ]
    )
  });
}

function CustomProjectsToolbar({ selectedProjectIds, setSelectedProjectIds, fetchData }) {
  const activeSelection = selectedProjectIds.length > 0;

  const handleCreateProject = useCallback(async () => {
    try {
      await createProject();
      fetchData();
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
      await archiveProjects(selectedProjectIds);
      fetchData();
    } catch (error) {
      console.error(error);
    }
  }, [selectedProjectIds]);

  return (
    <GridToolbarContainer sx={{ padding: 1 }}>
      <Stack direction="row" spacing={1}>
      <Button variant="contained" color="primary" onClick={handleCreateProject} startIcon={<AddIcon />}>
        Create Project
      </Button>
      <TextField id="outlined-basic" label="Search" variant="outlined" size="small" />
      <Button
        variant="outlined"
        size="medium"
        startIcon={<ArchiveOutlinedIcon />}
        disabled={!activeSelection}
        onClick={handleArchiveProjects}
      >
        Archive
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
    // { field: 'id', headerName: '#' },
    {
      field: 'name', headerName: 'Name', flex: 1, renderCell: (params) => (
        <Link href={`/projects/detail/${params.id}`}>{params.value}</Link>
      )
    },
    { field: 'lastActive', headerName: 'Last Activity', flex: 1 },
  ];

  const projectsRows: GridRowsProp = sortedProjects.map((project) => ({
    id: project._id,
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
            {/* <Tab value="1" label="Recents" sx={{ alignItems: 'start' }} /> */}
            <Tab value="2" label="My Projects" sx={{ alignItems: 'start' }} />
            {/* <Tab value="3" label="Shared With Me" sx={{ alignItems: 'start' }} /> */}
            <Tab value="4" label="Archived" sx={{ alignItems: 'start' }} />
          </Tabs>
          <Paper sx={{ width: "100%", height: "100%" }}>
            <DataGrid
              rows={projectsRows}
              columns={projectsColumns}
              density="compact"
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
                />,
              }}
            />
          </Paper>
        </Stack>
      </Container>
    </div>
  );
};

export default Projects;
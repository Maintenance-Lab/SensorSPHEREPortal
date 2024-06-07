import { useState, useEffect } from 'react';
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
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
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

const ProjectStatus = ({ status, session }) => {
  let statusColor = '';
  let statusLabel = '';

  switch (status) {
    case 'finished':
      statusColor = 'success.main';
      statusLabel = 'Finished Collecting Data';
      break;
    case 'collecting':
      statusColor = 'primary.main';
      statusLabel = 'Collecting Data';
      break;
    case 'inactive':
      statusColor = 'gray';
      statusLabel = 'No Activity';
      break;
    default:
      statusColor = '';
      statusLabel = 'Unknown';
  }

  return (
    <Stack spacing={1} sx={{ color: statusColor }}>
      <Stack direction="row" spacing={1}>
        {status === 'finished' && (<CheckCircleIcon />)}
        {status === 'collecting' && (<MoreHorizIcon />)}
        <Typography variant="body1" sx={{ fontWeight: 600 }}>
          {statusLabel}
        </Typography>
        {session && (
          <Typography variant="body1">{session}</Typography>
        )}
      </Stack>
    </Stack>
  );
};

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

function CustomToolbar() {
  const apiRef = useGridApiContext();

  const selectedRows = apiRef.current.getSelectedRows();
  const activeSelection = selectedRows.size > 0;

  return (
    <GridToolbarContainer sx={{ padding: 1 }}>
      <TextField
        id="outlined-basic"
        label="Search"
        variant="outlined"
        size="small"
      />
      <Button
        variant="outlined"
        size="medium"
        startIcon={<ArchiveOutlinedIcon />}
        disabled={!activeSelection}
      >
        Archive
      </Button>
      <Button
        variant="outlined"
        size="medium"
        color="error"
        startIcon={<DeleteOutlineOutlinedIcon />}
        disabled={!activeSelection}
      >
        Delete
      </Button>
      {/* <GridToolbarColumnsButton />
      <GridToolbarFilterButton />
      <GridToolbarDensitySelector
        slotProps={{ tooltip: { title: 'Change density' } }}
      />
      <Box sx={{ flexGrow: 1 }} />
      <GridToolbarExport
        slotProps={{
          tooltip: { title: 'Export data' },
          button: { variant: 'outlined' },
        }}
      /> */}
    </GridToolbarContainer>
  );
}

const Projects = () => {
  const [sortedProjects, setSortedProjects] = useState([]);
  const [currentTab, setTab] = useState('2');

  const handleTabChange = (event: React.SyntheticEvent, newCurrentTab: string) => {
    setTab(newCurrentTab);

    switch (newCurrentTab) {
      case '2':
        fetchActiveProjects().then((projects) => {
          setSortedProjects(projects);
        });
        break;
      case '4':
        fetchArchivedProjects().then((projects) => {
          setSortedProjects(projects);
        });
        break;
      default:
        fetchActiveProjects().then((projects) => {
          setSortedProjects(projects);
        });
    }
  };

  const createProject = async () => {
    //Default values
    const response = await fetch('/api/projects/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        credentials: 'include'
      },
      body: JSON.stringify({

      })
    });

    fetchActiveProjects().then((projects) => {
      setSortedProjects(projects);
    })
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
    fetchActiveProjects().then((projects) => {
      setSortedProjects(projects);
    });
  }, []);

  return (
    <div>
      <Helmet>
        <title>All Projects</title>
      </Helmet>
      <PageTitleWrapper>
        <Stack spacing={2}>
          <Typography variant="h1">All Projects</Typography>
          <Stack direction="row" spacing={2}>
            <Button variant="contained" color="primary" onClick={createProject} startIcon={<AddIcon />}>
              Create Project
            </Button>
          </Stack>
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
          <Stack sx={{ width: "100%", height: "100%" }}>

            <Paper>
              <DataGrid
                rows={projectsRows}
                columns={projectsColumns}
                density="compact"
                autosizeOnMount
                autosizeOptions={{ includeOutliers: true }}
                checkboxSelection={true}
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
                  toolbar: CustomToolbar,
                }}
              />
            </Paper>
          </Stack>
        </Stack>
      </Container>
    </div>
  );
};

export default Projects;

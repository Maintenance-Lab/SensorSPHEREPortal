import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Button,
  TextField,
  Paper,
  Tab,
  Tabs,
  Typography,
  Stack
} from '@mui/material';
import { Helmet } from 'react-helmet-async';
import PageTitleWrapper from 'src/Components/PageTitleWrapper';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import AddIcon from '@mui/icons-material/Add';
import { DataGrid, GridColDef, GridRowsProp } from '@mui/x-data-grid';
import { Link } from 'react-router-dom';

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

const fetchAllProjects = async () => {
  const res = await fetch('/api/projects/all', {
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

const Projects = () => {
  //   const classes = useStyles();

  const [sortedProjects, setSortedProjects] = useState([]);
  const [currentTab, setTab] = useState('0');

  const handleChange = (event: React.SyntheticEvent, newCurrentTab: string) => {
    setTab(newCurrentTab);
  };

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

    fetchAllProjects().then((projects) => {
      setSortedProjects(projects);
    })
  };

  const projectsColumns: GridColDef[] = [
    // { field: 'id', headerName: '#' },
    {
      field: 'name', headerName: 'Name', flex: 1, renderCell: (params) => (
        <Link to={`/projects/detail/${params.id}`}>{params.value}</Link>
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
    fetchAllProjects().then((projects) => {
      setSortedProjects(projects);
    })
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
            <TextField id="outlined-basic" label="Search" variant="outlined" size="small" />
          </Stack>
        </Stack>
      </PageTitleWrapper>
      <Container maxWidth="lg">
        <Stack direction="row" spacing={2} sx={{ height: '100%' }}>
          <Tabs
            orientation="vertical"
            value={currentTab}
            onChange={handleChange}
            sx={{ flex: '0 0 auto' }}

          >
            <Tab value="0" label="Recents" sx={{ alignItems: 'start' }} />
            <Tab value="1" label="My Projects" sx={{ alignItems: 'start' }} />
            <Tab value="2" label="Shared With Me" sx={{ alignItems: 'start' }} />
          </Tabs>
          <Paper sx={{ width: "100%" }}>
            <DataGrid
              rows={projectsRows}
              columns={projectsColumns}
              density="compact"
              autosizeOnMount
              autosizeOptions={{
                includeOutliers: true
              }}
            />
          </Paper>
        </Stack>
      </Container>
    </div>
  );
};

export default Projects;

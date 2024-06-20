import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Stack,
  Grid,
  Chip,
  CardActionArea,
  Skeleton
} from '@mui/material';
import { Helmet } from 'react-helmet-async';
import Card from '@mui/material/Card';
import PageTitleWrapper from 'src/Components/PageTitleWrapper';
import { DesignServices, Inventory, PushPin, Usb } from '@mui/icons-material';
import CreateProjectDialog from '../projects/CreateProjectDialog';

const Home = () => {
  const [pinnedProjects, setPinnedProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openCreateProjectDialog, setOpenCreateProjectDialog] = useState(false);

  const fetchPinnedProjects = async () => {
    const res = await fetch('/api/account/pinned', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        credentials: 'include'
      }
    });

    if (!res.ok) {
      console.error('Failed to fetch pinned projects');
      return [];
    };

    const data = await res.json();

    const projects = data.map(async (projectId) => {
      const projectRes = await fetch('/api/projects/id/' + projectId, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          credentials: 'include'
        }
      });

      if (!projectRes.ok) {
        console.error('Failed to fetch project');
        return null;
      };

      const projectData = await projectRes.json();
      return projectData;
    });

    const projectsData = await Promise.all(projects);
    setPinnedProjects(projectsData);
    setLoading(false);
  };

  useEffect(() => {
    fetchPinnedProjects();
  }, []);

  return (
    <div>
      <Helmet>
        <title>Home</title>
      </Helmet>
      <PageTitleWrapper>
        <Typography variant="h1">Home</Typography>
      </PageTitleWrapper>
      <CreateProjectDialog open={openCreateProjectDialog} setOpen={setOpenCreateProjectDialog} />
      <Container>
        <Grid container spacing={2} >
          {loading && (
            <Grid item xs={6} lg={4}>
              <Skeleton variant="rounded" height={120} animation="wave" />
            </Grid>
          )}
          {pinnedProjects.map((project) => (
            <Grid item xs={6} lg={4} key={project._id}>
              <Card>
                <CardActionArea sx={{ p: 2 }} onClick={() => window.location.href = '/projects/detail/' + project._id}>
                  <Stack direction="row" spacing={1} mb={1}>
                    <Chip label="Pinned" icon={<PushPin />} size="small" sx={{ px: 0.5 }} />
                    {project.archived && (
                      <Chip label="Archived" icon={<Inventory />} size="small" color="warning" sx={{ px: 0.5 }} />
                    )}
                  </Stack>
                  <Typography variant="h6">{project.name}</Typography>
                  {project.description && (
                    <Typography variant="subtitle1">{project.description}</Typography>
                  )}
                </CardActionArea>
              </Card>
            </Grid>
          ))}
          {pinnedProjects.length === 0 && !loading && (
            <Grid item xs={6} lg={4} height="130px">
              <PushPin fontSize="small" sx={{ color: 'gray' }} />
              <Typography variant="body2" color='gray'>Pinned projects will show up here.</Typography>
            </Grid>
          )}
        </Grid>

        <Stack spacing={2} mt={4}>
          <Typography variant="h2">Getting Started</Typography>
        </Stack>
        <Grid container spacing={2} mt={1}  py={2}>
          <Grid item xs={12} lg={4}>
              <Typography variant="h2" color="primary.main">1</Typography>
              <Typography variant="body1" mt={1}>Create a data collection project.</Typography>
          </Grid>
          <Grid item xs={12} lg={4}>
            <Typography variant="h2" color="primary.main">2</Typography>
            <Typography variant="body1" mt={1}>Find and add your devices.</Typography>
          </Grid>
          <Grid item xs={12} lg={4}>
            <Typography variant="h2" color="primary.main">3</Typography>
            <Typography variant="body1" mt={1}>Start a data collection session in the project.</Typography>
          </Grid>
        </Grid>
        <Stack direction="row" spacing={2} mt={3}>
          <Card sx={{ flex: 1 }}>
            <CardActionArea
              sx={{ p: 2 }}
              onClick={() => window.location.href = '/devices'}
            >
              <Stack spacing={1}>
                <Usb fontSize='large' />
                <Typography variant="h6">Find Devices</Typography>
                <Typography variant="subtitle1">Search and find devices, view sensors, and use them in your projects.</Typography>
              </Stack>
            </CardActionArea>
          </Card>
          <Card sx={{ flex: 1 }}>
            <CardActionArea
              sx={{ p: 2 }}
              onClick={() => setOpenCreateProjectDialog(true)}
            >
              <Stack spacing={1}>
                <DesignServices fontSize='large' />
                <Typography variant="h6">Create a New Project</Typography>
                <Typography variant="subtitle1">Create a new project, add devices, and start data collection sessions.</Typography>
              </Stack>
            </CardActionArea>
          </Card>
        </Stack>
      </Container>
    </div>
  );
};

export default Home;

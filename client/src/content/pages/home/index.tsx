import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Stack,
  Grid,
  Chip,
  CardActionArea,
  Skeleton,
  Divider
} from '@mui/material';
import { Helmet } from 'react-helmet-async';
import Card from '@mui/material/Card';
import PageTitleWrapper from 'src/Components/PageTitleWrapper';
import { Add, DesignServices, DesignServicesOutlined, Inventory, PlayCircleOutline, PlusOne, Usb, Schedule } from '@mui/icons-material';
import CreateProjectDialog from '../projects/CreateProjectDialog';
import { lastDayOfDecade, set } from 'date-fns';

const Home = () => {
  const [latestProjects, setLatestProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openCreateProjectDialog, setOpenCreateProjectDialog] = useState(false);

  const fetchLatestProjects = async () => {
    const res = await fetch('/api/projects/latest', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        credentials: 'include'
      }
    });

    if (!res.ok) {
      console.error('Failed to fetch latest projects');
      return [];
    };

    const data = await res.json();

    const projects = data.map(async (projectId) => {
      console.log('Fetching project 1', projectId);
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
    setLatestProjects(projectsData);
    setLoading(false);
  };

  useEffect(() => {
    fetchLatestProjects();
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
          {latestProjects.map((project) => (
            <Grid item xs={6} lg={4} key={project.projectId}>
              <Card>
                <CardActionArea sx={{ p: 2 }} onClick={() => window.location.href = '/projects/detail/' + project.projectId}>
                  <Stack direction="row" spacing={1} mb={1}>
                    <Chip label="Recent" icon={<Schedule />} size="small" sx={{ px: 0.5 }} />
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
          {latestProjects.length === 0 && !loading && (
            <Grid item xs={6} lg={4} height="130px">
              <Schedule fontSize="small" sx={{ color: 'gray' }} />
              <Typography variant="body2" color='gray'>Latest projects will show up here.</Typography>
            </Grid>
          )}
        </Grid>

        <Stack spacing={2} mt={4}>
          <Typography variant="h2">Getting Started</Typography>
        </Stack>
        <Stack spacing={2} mt={2} py={2} direction="row" divider={<Divider orientation="vertical" flexItem />}>
          <Stack spacing={2}>
            <DesignServicesOutlined fontSize='large' />
            <Typography variant="body1" mt={1}>Create a data collection project.</Typography>
          </Stack>
          <Stack spacing={2}>
            <Usb fontSize='large' />
            <Typography variant="body1" mt={1}>Find and add your devices.</Typography>
          </Stack>
          <Stack spacing={2}>
            <PlayCircleOutline fontSize='large' />
            <Typography variant="body1" mt={1}>Start a data collection session in your project.</Typography>
          </Stack>
        </Stack>
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

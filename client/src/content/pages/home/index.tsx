import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Stack,
  Grid,
  Chip,
  CardActionArea
} from '@mui/material';
import { Helmet } from 'react-helmet-async';
import Card from '@mui/material/Card';
import PageTitleWrapper from 'src/Components/PageTitleWrapper';
import { Inventory, PushPin } from '@mui/icons-material';

const Home = () => {
  const [pinnedProjects, setPinnedProjects] = useState([]);

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
      <Container>
        <Grid container spacing={2} >
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
        </Grid>
        <Stack spacing={2} mt={4}>
          <Typography variant="h2">Getting Started</Typography>
        </Stack>
      </Container>
    </div>
  );
};

export default Home;

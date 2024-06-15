import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Stack,
  Grid,
  Chip
} from '@mui/material';
import { Helmet } from 'react-helmet-async';
import Card from '@mui/material/Card';
import PageTitleWrapper from 'src/Components/PageTitleWrapper';
import { Inventory, PushPin } from '@mui/icons-material';

const Home = () => {

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
          <Grid item xs={6} lg={4}>
            <Card sx={{ p: 2 }}>
              <Stack direction="row" spacing={1} mb={1}>
                <Chip label="Pinned" icon={<PushPin />} size="small" sx={{ px: 0.5 }} />
                <Chip label="Archived" icon={<Inventory />} size="small" color="warning" sx={{ px: 0.5 }} />
              </Stack>
              <Typography variant="h6">Project Name</Typography>
              <Typography variant="subtitle1">Description</Typography>
              <Stack direction="row" spacing={1} mt={0.5}>
                <Typography variant="body2" fontWeight="600">2</Typography>
                <Typography variant="body2">Devices</Typography>
              </Stack>
            </Card>
          </Grid>
        </Grid>
        <Stack spacing={2} mt={4}>
        <Typography variant="h2">Getting Started</Typography>
        </Stack>
      </Container>
    </div>
  );
};

export default Home;

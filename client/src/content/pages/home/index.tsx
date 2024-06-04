import { useState, useEffect } from 'react';
import {
  AppBar,
  Box,
  Container,
  Toolbar,
  Button,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Switch,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Tab,
  Tabs,
  Typography,
  Snackbar,
  Stack,
  Grid
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import { Theme } from '@mui/material/styles';
import { Helmet } from 'react-helmet-async';
import MuiAlert from '@mui/material/Alert';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import PageTitleWrapper from 'src/Components/PageTitleWrapper';

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
          <Typography variant="h2">Pinned</Typography>
          <Grid container spacing={2} sx={{ py: 2 }}>
            <Grid item xs={4}>
              <Card>
                <CardContent>
                  <Typography variant="h4">Project</Typography>
                  <Typography variant="h3">Name Of Project</Typography>
                  <Typography variant="body1">Current Status</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={4}>
              <Card>
                <CardContent>
                  <Typography variant="h4">Device</Typography>
                  <Typography variant="h3">Name Of Device</Typography>
                  <Typography variant="body1">Current Status</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={4}>
              <Card>
                <CardContent>
                  <Typography variant="h4">Session</Typography>
                  <Typography variant="h3">Name Of Session</Typography>
                  <Typography variant="body1">Current Status</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
          <Typography variant="h2">Latest Activity</Typography>
      </Container>
    </div>
  );
};

export default Home;

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
  Stack
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import { Theme } from '@mui/material/styles';
import { Helmet } from 'react-helmet-async';
import MuiAlert from '@mui/material/Alert';
import PageTitleWrapper from 'src/Components/PageTitleWrapper';

// const useStyles = makeStyles((theme: Theme) => ({
  
// }));

const Projects = () => {
//   const classes = useStyles();

  const [sortedProjects, setSortedProjects] = useState([]);

  // Placeholder data for 3 projects
  const projectsPlaceholder = [
    {
      name: 'Project 1',
      people: 'John Doe',
      status: 'Unknown'
    },
    {
      name: 'Project 2',
      people: 'Jane Doe',
      status: 'Unknown'
    },
    {
      name: 'Project 3',
      people: 'John Doe, Jane Doe',
      status: 'Unknown'
    }
  ];

  useEffect(() => {
    setSortedProjects(projectsPlaceholder);
  }, []);

  const [currentTab, setTab] = useState('0');

  const handleChange = (event: React.SyntheticEvent, newCurrentTab: string) => {
    setTab(newCurrentTab);
  };

  return (
    <div>
      <Helmet>
        <title>All Projects</title>
      </Helmet>
      <PageTitleWrapper>
          <Typography variant="h1">All Projects</Typography>
      </PageTitleWrapper>
      <Stack direction="row" spacing={2} sx={{ height: '100%' }}>
          <Tabs
            orientation="vertical"
            value={currentTab}
            onChange={handleChange}
            sx={{ height: '100%' }}
          >
            <Tab value="0" label="Recents" sx={{ whiteSpace: 'nowrap', alignItems: 'start' }} />
            <Tab value="1" label="My Projects" sx={{ whiteSpace: 'nowrap', alignItems: 'start' }} />
            <Tab value="2" label="Shared With Me" sx={{ whiteSpace: 'nowrap', alignItems: 'start' }} />
          </Tabs>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>People</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
                {sortedProjects.map((project, index) => (
                  <TableRow key={index}>
                    <TableCell>{project.name}</TableCell>
                    <TableCell>{project.people}</TableCell>
                    <TableCell>{project.status}</TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Stack>
    </div>
  );
};

export default Projects;

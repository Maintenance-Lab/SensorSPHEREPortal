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
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';

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

const Projects = () => {
  //   const classes = useStyles();

  const [sortedProjects, setSortedProjects] = useState([]);

  // Placeholder data for 3 projects
  const projectsPlaceholder = [
    {
      name: 'Building Temperature Research',
      people: 'John Doe',
      session: 'Session #2',
      status: 'collecting'
    },
    {
      name: 'Project 1',
      people: 'Jane Doe',
      session: 'Test Collection',
      status: 'finished'
    },
    {
      name: 'Project 3',
      people: 'John Doe, Jane Doe',
      session: '',
      status: 'inactive'
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
      <Container>
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
                    <TableCell>
                      <ProjectStatus status={project.status} session={project.session} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Stack>
      </Container>
    </div>
  );
};

export default Projects;

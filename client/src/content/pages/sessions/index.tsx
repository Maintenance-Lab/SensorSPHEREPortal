import { useState, useEffect } from 'react';
import {
  AppBar,
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
  Typography,
  Snackbar,
  Container,
  Stack
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import { Theme } from '@mui/material/styles';
import { Helmet } from 'react-helmet-async';
import MuiAlert from '@mui/material/Alert';
import PageTitleWrapper from 'src/Components/PageTitleWrapper';
import AddIcon from '@mui/icons-material/Add';

import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';

const SessionStatus = ({ status, project }) => {
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
    case 'notStarted':
      statusColor = 'gray';
      statusLabel = 'Not Started';
      break;
    default:
      statusColor = '';
      statusLabel = 'Unknown';
  }

  return (
    <Stack direction="row" spacing={1} sx={{ color: statusColor }}>
      {status === 'finished' && (<CheckCircleIcon />)}
      {status === 'collecting' && (<MoreHorizIcon />)}
      <Typography variant="body1" sx={{ fontWeight: 600 }}>
        {statusLabel}
      </Typography>
    </Stack>
  );
};

const Sessions = () => {

  const [sortedSessions, setSortedSessions] = useState([]);

  // Placeholder data for 3 sessions
  const sessionsPlaceholder = [
    {
      name: 'Test Collection',
      project: 'Project 1',
      status: 'finished'
    },
    {
      name: 'Session #2',
      project: 'Building Temperature Research',
      status: 'collecting'
    },
    {
      name: 'Tester Session',
      project: '',
      status: 'notStarted'
    }
  ];

  useEffect(() => {
    setSortedSessions(sessionsPlaceholder);
  }, []);

  return (
    <div>
      <Helmet>
        <title>All Sessions</title>
      </Helmet>
      <PageTitleWrapper>
        <Typography variant="h1">All Sessions</Typography>
      </PageTitleWrapper>
      <Container>
        <Stack direction="column" spacing={2}>
          <Stack direction="row" spacing={2}>
            <Button variant="outlined" color="primary">
              <AddIcon />
              Create New Session
            </Button>
            <TextField id="outlined-basic" label="Search" variant="outlined" />
          </Stack>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Project</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sortedSessions.map((session, index) => (
                  <TableRow key={index}>
                    <TableCell>{session.name}</TableCell>
                    <TableCell>{session.project ? session.project : '-'}</TableCell>
                    <TableCell>
                      <SessionStatus status={session.status} project={session.project} />
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

export default Sessions;

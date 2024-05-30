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

// const useStyles = makeStyles((theme: Theme) => ({
  
// }));

const Sessions = () => {
//   const classes = useStyles();

const [sortedSessions, setSortedSessions] = useState([]);

  // Placeholder data for 3 devices
  const sessionsPlaceholder = [
    {
      name: 'Session 1',
      project: 'Project 1',
      status: 'Active'
    },
    {
      name: 'Session 2',
      project: 'Project 2',
      status: 'Active'
    },
    {
      name: 'Session 3',
      project: 'Project 3',
      status: 'Active'
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
          <TableContainer>
            <Table aria-label="simple table">
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
                    <TableCell>{session.project}</TableCell>
                    <TableCell>{session.status}</TableCell>
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

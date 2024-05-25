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
  Snackbar
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import { Theme } from '@mui/material/styles';
import { Helmet } from 'react-helmet-async';
import MuiAlert from '@mui/material/Alert';
import PageTitleWrapper from 'src/Components/PageTitleWrapper';

// const useStyles = makeStyles((theme: Theme) => ({
  
// }));

const Sessions = () => {
//   const classes = useStyles();

  return (
    <div>
      <Helmet>
        <title>All Sessions</title>
      </Helmet>
       <PageTitleWrapper>
            <Typography variant="h1">All Sessions</Typography>
       </PageTitleWrapper>
    </div>
  );
};

export default Sessions;

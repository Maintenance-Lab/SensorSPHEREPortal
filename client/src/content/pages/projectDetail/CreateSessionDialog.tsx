import { useState, useCallback } from 'react';
import {
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
  Stack
} from '@mui/material';
import { Info, InfoOutlined } from '@mui/icons-material';

const projectId = window.location.href.split('/').pop();

const CreateSessionDialog = ({ open, setOpen }) => {
  const [name, setName] = useState(`Session ${new Date().toDateString()}`);
  const [description, setDescription] = useState('');

  const handleSubmitCreateSession = useCallback(async () => {
    console.log('Creating session', name, description);
    try {
      const response = await fetch('/api/sessions/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          credentials: 'include'
        },
        body: JSON.stringify({ name, description, projectId })
      });

      console.log('Response', response);

      if (!response.ok) {
        throw new Error('Failed to create session');
      }

      const data = await response.json();
      console.log('Created session', data);
      window.location.href = `/projects/detail/${data.projectId}`;
    } catch (error) {
      console.log("ERROR");
      console.error(error);
    };
  }, [name, description]);

  return (
    <Dialog open={open} onClose={() => setOpen(false)}>
      <DialogTitle>Create New Session</DialogTitle>
      <DialogContent>
        <Stack direction="row" spacing={1} mb={2} color="secondary.main">
          <InfoOutlined />
          <Typography variant="body1">
            You can add devices, invite collaborators, and start data collection sessions after creating a project.
          </Typography>
        </Stack>
        <TextField
          autoFocus
          onFocus={(event) => { event.target.select(); }}
          margin="dense"
          label="Project Name"
          fullWidth
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && document.getElementById('description-input').focus()}
        />
        <TextField
          id="description-input"
          margin="dense"
          label="Project Description"
          fullWidth
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmitCreateSession()}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setOpen(false)}>Cancel</Button>
        <Button onClick={handleSubmitCreateSession} variant="contained" color="primary">
          Create
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateSessionDialog;
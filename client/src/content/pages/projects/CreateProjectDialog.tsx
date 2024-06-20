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

const CreateProjectDialog = ({ open, setOpen }) => {
  const [name, setName] = useState(`Project ${new Date().toDateString()}`);
  const [description, setDescription] = useState('');

  const handleSubmitCreateProject = useCallback(async () => {
    try {
      const response = await fetch('/api/projects/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          credentials: 'include'
        },
        body: JSON.stringify({ name, description })
      });

      if (!response.ok) {
        throw new Error('Failed to create project');
      }

      const data = await response.json();
      window.location.href = `/projects/detail/${data._id}`;
    } catch (error) {
      console.error(error);
    };
  }, [name, description]);

  return (
    <Dialog open={open} onClose={() => setOpen(false)}>
      <DialogTitle>Create New Project</DialogTitle>
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
          onKeyDown={(e) => e.key === 'Enter' && handleSubmitCreateProject()}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setOpen(false)}>Cancel</Button>
        <Button onClick={handleSubmitCreateProject} variant="contained" color="primary">
          Create
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateProjectDialog;
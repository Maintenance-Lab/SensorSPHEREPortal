import { useState, useCallback } from 'react';
import {
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle
} from '@mui/material';

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
        <TextField
          autoFocus
          margin="dense"
          label="Project Name"
          fullWidth
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <TextField
          margin="dense"
          label="Project Description"
          fullWidth
          value={description}
          onChange={(e) => setDescription(e.target.value)}
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
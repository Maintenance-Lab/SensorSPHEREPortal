import { Theme } from '@mui/material/styles';
import {
  Button,
  TextField,
  Typography,
  Paper,
  Grid,
  Container
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import { getUser } from 'src/Helpers/cookies';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const useStyles = makeStyles((theme: Theme) => ({
  container: {
    height: '90vh', // Ensure this is actually being applied
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  paper: {
    padding: theme.spacing(3),
    width: '90%',
    maxWidth: 500,
    textAlign: 'center',
    borderRadius: 10
  },
  form: {
    padding: theme.spacing(3),
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2)
  },
  submit: {
    marginTop: theme.spacing(2)
  },
  logo: {
    width: '100px',
    height: '100px',
    marginTop: theme.spacing(2)
  }
}));

const Login = () => {
  const user = getUser();
  const navigate = useNavigate();
  if (user) navigate('/projects'); // Redirect to home if already logged in

  const classes = useStyles();
  const [error, setError] = useState('');

  const handleLogin = () => {
    const usernameInput = document.getElementById(
      'username'
    ) as HTMLInputElement | null;
    const passwordInput = document.getElementById(
      'password'
    ) as HTMLInputElement | null;
    if (!usernameInput || !passwordInput) return;

    const username = usernameInput.value;
    const password = passwordInput.value;
    if (!username || !password) {
      setError('Username and password are required');
      return;
    }

    setError(''); // Clear any existing errors before new login attempt

    fetch('/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username,
        password
      })
    })
      .then((res) => res.json())
      .then((data) => {
        const { success, error, location } = data;
        if (success) navigate(location);
        else setError(error || 'Invalid login credentials');
      })
      .catch((error) => console.error(error));
  };

  return (
    <Container className={classes.container} style={{ display: 'flex' }}>
      <Paper className={classes.paper} elevation={2}>
        <img src={'icon.png'} alt="SensorSphere" className={classes.logo} />
        <Typography variant="h1" component="h1" gutterBottom>
          SensorSphere Portal
        </Typography>
        <form
          className={classes.form}
          onSubmit={handleLogin}
          action="javascript:void(0);"
        >
          <TextField id="username" label="Username" fullWidth />
          <TextField id="password" label="Password" type="password" fullWidth />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            className={classes.submit}
          >
            Login
          </Button>
          {error && <Typography color="error">{error}</Typography>}
        </form>
      </Paper>
    </Container>
  );
};

export default Login;

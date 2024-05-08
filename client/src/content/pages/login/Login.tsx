import { Theme } from '@mui/material/styles';
import { Button, TextField, Typography, Paper, Grid, Container } from "@mui/material";
import { makeStyles } from "@mui/styles";

// Step 2: Use the theme with makeStyles
const useStyles = makeStyles((theme: Theme) => ({
  container: {
    height: '90vh', // Ensure this is actually being applied
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  paper: {
    padding: theme.spacing(3),
    width: 400,
    textAlign: 'center',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
  },
  submit: {
    marginTop: theme.spacing(2),
  },
}));

const Login = () => {
  const classes = useStyles();

  const handleLogin = () => {
    const usernameInput = document.getElementById("username") as HTMLInputElement | null;
    const passwordInput = document.getElementById("password") as HTMLInputElement | null;
    if (!usernameInput || !passwordInput) {
      return;
    }

    const username = usernameInput.value;
    const password = passwordInput.value;
    if (!username || !password) {
      return;
    }

    fetch("/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username,
        password,
      }),
    })
    .then((res) => res.json())
    .then((data) => {
      const { success, error, location } = data;
      if (success) window.location.href = location;
      else console.error(error);
    })
    .catch((error) => console.error(error));
  };

  return (
    <Container style={{display: "flex"}} className={classes.container}>

      <Paper className={classes.paper} elevation={2}>
        <Typography variant="h5" component="h1" gutterBottom>
          SensorSphere Portal
        </Typography>
        <form className={classes.form} noValidate autoComplete="off">
          <TextField id="username" label="Username" fullWidth />
          <TextField id="password" label="Password" type="password" fullWidth />
          <Button variant="contained" color="primary" onClick={handleLogin} className={classes.submit}>
            Login
          </Button>
        </form>
      </Paper>
    </Container>
  );
};

export default Login;

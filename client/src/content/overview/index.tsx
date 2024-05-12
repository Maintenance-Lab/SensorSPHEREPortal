import { Box, Container, Card, Typography, Button } from '@mui/material';
import { Helmet } from 'react-helmet-async';
import { Theme } from '@mui/material/styles';
import { makeStyles } from '@mui/styles';
import { getUser } from 'src/Helpers/cookies';

const useStyles = makeStyles((theme: Theme) => ({
  logo: {
    width: '150',
    height: '150'
  },
  card: {
    padding: theme.spacing(5),
    marginBottom: theme.spacing(10),
    borderRadius: 12,
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  buttonBox: {
    display: 'flex',
    justifyContent: 'space-around',
    width: '50%',
    marginTop: theme.spacing(1)
  },
  actionButton: {
    width: '40%',
    margin: theme.spacing(5)
  }
}));

function Overview() {
  const classes = useStyles();
  const user = getUser();

  const loginButton = user ? (
    <Button className={classes.actionButton} variant="contained" color="primary">
      Go to Projects
    </Button>
  ) : (
    <Button className={classes.actionButton} variant="contained" color="primary">
      Login
    </Button>
  );

  return (
    <>
      <Helmet>
        <title>SensorSphere Portal</title>
      </Helmet>
      <Container maxWidth="lg" style={{marginTop: 100}} className='test'>
        <Card className={classes.card} style={{padding: 50}}>
          <img src="icon.png" className={classes.logo}></img>
          <Typography variant="h1" component="h1" gutterBottom>
            SensorSphere Portal
          </Typography>
          <Typography variant="subtitle1" gutterBottom>
            Welcome to SensorSphere, your gateway to managing and observing your
            sensory data.
          </Typography>
          <Box className={classes.buttonBox}>
            {loginButton}
            <Button className={classes.actionButton} variant="contained" color="secondary">
              Contact Us
            </Button>
          </Box>
        </Card>
      </Container>
    </>
  );
}

export default Overview;

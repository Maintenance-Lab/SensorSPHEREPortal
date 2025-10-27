import { Box, Container, Card, Typography, Button } from '@mui/material';
import { Helmet } from 'react-helmet-async';
import { Theme } from '@mui/material/styles';
import { makeStyles } from '@mui/styles';
import { getUser } from 'src/helpers/cookies';
import { useNavigate } from 'react-router-dom';
import React, { useEffect, useState } from 'react'
import { set } from 'date-fns';

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
    alignItems: 'center'
  },
  buttonBox: {
    display: 'flex',
    justifyContent: 'space-around',
    width: '50%',
    marginTop: theme.spacing(5)
  },
  actionButton: {
    width: '40%',
    margin: theme.spacing(5)
  }
}));


export const Overview = () => {
  const classes = useStyles();
  const user = getUser();
  const navigate = useNavigate();
  // const data = fetchTest();

  const redirectToLogin = () => navigate('/login');
  const redirectToProjects = () => navigate('/projects');

  const loginButton = user ? (
    <Button
      className={classes.actionButton}
      variant="contained"
      color="primary"
      onClick={redirectToProjects}
    >
      Go to Projects
    </Button>
  ) : (
    <Button
      className={classes.actionButton}
      variant="contained"
      color="primary"
      onClick={redirectToLogin}
    >
      Login
    </Button>
  );

  return (
    <>
      <Helmet>
        <title>SensorSPHERE Portal</title>
      </Helmet>
      <Container maxWidth="lg" style={{ marginTop: 100 }} className="test">
        <Card className={classes.card} style={{ padding: 50 }}>
          <Box display="flex" alignItems="center">
            <img
              src="icon.png"
              className={classes.logo}
              style={{
                borderRadius: '50%',
                width: '200px',
                marginRight: '50px',
              }}
            />
            <Box>
              <Typography variant="h1" component="h1" gutterBottom>
                SensorSphere Portal
              </Typography>
              <Typography variant="subtitle1" gutterBottom>
                Welcome to SensorSphere, your gateway to manage your projects
              </Typography>
            </Box>
          </Box>
          <Box className={classes.buttonBox}>
            {loginButton}
          </Box>
        </Card>
      </Container>
    </>
  );
};

export default Overview;

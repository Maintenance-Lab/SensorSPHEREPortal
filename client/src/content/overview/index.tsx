import { Box, Container, Card, Typography, Button } from '@mui/material';
import { Helmet } from 'react-helmet-async';
import { Theme } from '@mui/material/styles';
import { makeStyles } from '@mui/styles';
import { getUser } from 'src/Helpers/cookies';
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

// const data: GridRowsProp = sortedProjects.map((project) => ({
// interface DataProps {
//   id: number;
//   title: string;
//   author_id: number;
//   published_year: number;
// }

export const Overview = () => {
  // export const bookData = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true)

    useEffect(() => {
      fetchTest()
    }, [])

  const fetchTest = async () => {
    const res = await fetch('/api/test/testing/', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        credentials: 'include'
      }
    });

    if (!res.ok) {
      console.error('Failed to fetch data');
      return [];
    }
    const data = await res.json();
    setData(data);
    console.log(data);
    // return data.title;
  }


  const classes = useStyles();
  const user = getUser();
  const navigate = useNavigate();
  // const data = fetchTest();
  // data = fetchTest();

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
        <title>SensorSphere Portal</title>
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
              <Box>
                {data.length > 0 ? (
                  data.map((Project, index) => (
                    <Typography key={index} variant="body1">
                      {Project.Name}
                    </Typography>
                  ))
                ) : (
                  <Typography variant="body1">No projects available</Typography>
                )}
              </Box>
            </Box>
          </Box>
          <Box className={classes.buttonBox}>
            {loginButton}
            <Button
              className={classes.actionButton}
              variant="contained"
              color="secondary"
            >
              Contact Us
            </Button>
          </Box>
        </Card>
      </Container>
    </>
  );
};

export default Overview;

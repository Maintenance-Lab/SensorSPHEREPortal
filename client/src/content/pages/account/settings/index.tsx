import { useState, ChangeEvent, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import PageHeader from './PageHeader';
import PageTitleWrapper from 'src/components/pageTitleWrapper';
import { Container, Tabs, Tab, Grid, Typography } from '@mui/material';
import Footer from 'src/components/footer';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';

import EditProfileTab from './EditProfileTab';
import SecurityTab from './SecurityTab';

const TabsWrapper = styled(Tabs)(
  () => `
    .MuiTabs-scrollableX {
      overflow-x: auto !important;
    }
`
);

function ManagementUserSettings() {
  const navigate = useNavigate();
  const [currentTab, setCurrentTab] = useState<string>('edit_profile');
  const [account, setAccount] = useState<any | null>(null);
  const [loginSessions, setLoginSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const getAccount = async () => {
    const response = await fetch('/api/account', {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    if (response.status === 401) {
      navigate('/login');
      return null;
    }
    const data = await response.json();
    return data;
  };

  useEffect(() => {
    getAccount().then((data) => {
      if (!data) return;
      setAccount(data.account);
      setLoginSessions(data.sessions);
      setLoading(false);
    });

    // if ?action=change is present in the URL, redirect to the security tab and open the password change dialog
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('action') === 'change') setCurrentTab('security');
  }, []);

  const tabs = [
    { value: 'edit_profile', label: 'Your Profile' },
    // { value: 'notifications', label: 'Notifications' },
    { value: 'security', label: 'Passwords/Security' }
  ];

  const handleTabsChange = (_, value: string): void => setCurrentTab(value);

  const elements = loading ? (
    <Container maxWidth="lg">
      <Grid
        container
        direction="row"
        justifyContent="center"
        alignItems="center"
        spacing={3}
      >
        <Grid item xs={12}>
          <Typography variant="h4" align="center">
            Loading...
          </Typography>
        </Grid>
      </Grid>
    </Container>
  ) : (
    <Container maxWidth="lg">
      <Grid
        container
        direction="row"
        justifyContent="center"
        alignItems="stretch"
        spacing={3}
      >
        <Grid item xs={12}>
          <TabsWrapper
            onChange={handleTabsChange}
            value={currentTab}
            variant="scrollable"
            scrollButtons="auto"
            textColor="primary"
            indicatorColor="primary"
          >
            {tabs.map((tab) => (
              <Tab key={tab.value} label={tab.label} value={tab.value} />
            ))}
          </TabsWrapper>
        </Grid>
        <Grid item xs={12}>
          {currentTab === 'edit_profile' && (
            <EditProfileTab account={account} />
          )}
          {/* {currentTab === 'notifications' && <NotificationsTab />} */}
          {currentTab === 'security' && (
            <SecurityTab sessions={loginSessions} />
          )}
        </Grid>
      </Grid>
    </Container>
  );

  return (
    <>
      <Helmet>
        <title>User Settings - SensorSphere</title>
      </Helmet>
      <PageTitleWrapper>
        <PageHeader />
      </PageTitleWrapper>
      {elements}
      <Footer />
    </>
  );
}

export default ManagementUserSettings;

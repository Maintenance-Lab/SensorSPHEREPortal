import { useContext, useEffect, useState } from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import {
  Box,
  alpha,
  Stack,
  lighten,
  Divider,
  IconButton,
  Tooltip,
  styled,
  useTheme,
  Breadcrumbs,
  Link,
  Typography,
  Skeleton
} from '@mui/material';
import MenuTwoToneIcon from '@mui/icons-material/MenuTwoTone';
import { SidebarContext } from 'src/contexts/SidebarContext';
import CloseTwoToneIcon from '@mui/icons-material/CloseTwoTone';
import HeaderButtons from './Buttons';
import HeaderUserbox from './Userbox';
import HeaderMenu from './Menu';
import { set } from 'date-fns';

const HeaderWrapper = styled(Box)(
  ({ theme }) => `
        height: ${theme.header.height};
        color: ${theme.header.textColor};
        padding: ${theme.spacing(0, 2)};
        right: 0;
        z-index: 6;
        background-color: ${alpha(theme.header.background, 0.95)};
        backdrop-filter: blur(3px);
        position: fixed;
        justify-content: space-between;
        width: 100%;
        @media (min-width: ${theme.breakpoints.values.lg}px) {
            left: ${theme.sidebar.width};
            width: auto;
        }
`
);

const mapBreadcrumbName = (pathname: string) => {
  switch (pathname) {
    case '/home':
      return 'Home';
    case '/projects':
      return 'Projects';
    case '/projects/overview':
      return 'Projects';
    case '/devices':
      return 'Devices';
    case '/devices/overview':
      return 'Devices';
    case '/sessions':
      return 'Sessions';
    case '/admin':
      return 'Admin';
    case '/admin/users':
      return 'Manage Users';
    case '/account':
      return 'User Settings';
    default:
      if (/^\/(.*)\/detail\/(.*)$/.test(pathname)) {
        const id = pathname.split('/')[3];
        return id;
      } else {
        return pathname;
      };
  };
};

const fetchProjectName = async (id: number) => {
  try {
    const response = await fetch(`/api/projects/id/${id}`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch project name');
    }

    const data = await response.json();
    return data.name;
  } catch (error) {
    console.error(error);
  };
};

const fetchSession = async (id: number) => {
    const response = await fetch(`/api/sessions/id/${id}`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch session name');
    }

    const data = await response.json();
    return data;
};

function Header() {
  const [projectId, setProjectId] = useState('');
  const [projectName, setProjectName] = useState('');
  const [sessionName, setSessionName] = useState('');
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const { sidebarToggle, toggleSidebar } = useContext(SidebarContext);
  const theme = useTheme();
  const pathnames = location.pathname.split('/').filter((x) => x);

  const fetchData = async () => {
    if (location.pathname.includes('/projects/detail/')) {
      const projectId = Number(location.pathname.split('/')[3]);
      await fetchProjectName(projectId).then((name) => setProjectName(name));
    } else if (location.pathname.includes('/sessions/detail/')) {
      const sessionId = Number(location.pathname.split('/')[3]);
      await fetchSession(sessionId).then(async (data) => {
        setSessionName(data.name);
        setProjectId(data.projectId);
        await fetchProjectName(data.projectId).then((name) => setProjectName(name));
      });
    };
    setLoading(false);
  }

  useEffect(() => {
    fetchData();
  }, [location]);

  const excludedRoutes = ['/home', '/account'];
  const hideBreadcrumbs = excludedRoutes.includes(location.pathname);

  return (
    <HeaderWrapper
      display="flex"
      alignItems="center"
      sx={{
        boxShadow:
          theme.palette.mode === 'dark'
            ? `0 1px 0 ${alpha(
              lighten(theme.colors.primary.main, 0.7),
              0.15
            )}, 0px 2px 8px -3px rgba(0, 0, 0, 0.2), 0px 5px 22px -4px rgba(0, 0, 0, .1)`
            : `0px 2px 8px -3px ${alpha(
              theme.colors.alpha.black[100],
              0.2
            )}, 0px 5px 22px -4px ${alpha(
              theme.colors.alpha.black[100],
              0.1
            )}`
      }}
    >
      <Stack
        direction="row"
        divider={<Divider orientation="vertical" flexItem />}
        alignItems="center"
        spacing={2}
      >
        {/* Sessions get custom breadcrumbs, as they do not have an overview 'Sessions' page.
            They are part of projects, so it shows the session path as part of the project. */}
        {!hideBreadcrumbs && (
          location.pathname.includes('/sessions/detail') ? (
          <Breadcrumbs separator="/">
            <Link component={RouterLink} to="/projects" color="inherit">
              {loading ? <Skeleton width="100px" /> : "Projects"}
            </Link>
            <Link component={RouterLink} to={"/projects/detail/" + projectId} color="inherit">
              {loading ? <Skeleton width="100px" /> : projectName}
            </Link>
            <Typography color="text.primary">
              {loading ? <Skeleton width="100px" /> : sessionName}
            </Typography>
          </Breadcrumbs>
        ) : (
          // Default breadcrumbs
          <Breadcrumbs separator="/">
            {pathnames.map((value, index) => {
              const last = index === pathnames.length - 1;
              const to = `/${pathnames.slice(0, index + 1).join('/')}`;
              let label = mapBreadcrumbName(to);

              // Prevent showing breadcrumbs for non-existant/duplicate pages
              const skipConditions = [
                pathnames.includes('overview') && value === 'projects',
                pathnames.includes('overview') && value === 'devices',
                value === 'detail'
              ];

              if (skipConditions.some(Boolean)) {
                return;
              } else if (last && /^\/projects\/detail\/(.*)$/.test(location.pathname)) {
                label = projectName;
              };

              return last ? (
                <Typography color="text.primary" key={to}>
                  {loading ? <Skeleton width="100px" /> : label}
                </Typography>
              ) : (
                <Link component={RouterLink} to={to} key={to} color="inherit">
                  {loading ? <Skeleton width="100px" /> : label}
                </Link>
              );
            })}
          </Breadcrumbs>
          )
        )}
        {/* <HeaderMenu /> */}
      </Stack>
      <Box display="flex" alignItems="center">
        {/* <HeaderButtons /> */}
        <HeaderUserbox />
        <Box
          component="span"
          sx={{
            ml: 2,
            display: { lg: 'none', xs: 'inline-block' }
          }}
        >
          <Tooltip arrow title="Toggle Menu">
            <IconButton color="primary" onClick={toggleSidebar}>
              {!sidebarToggle ? (
                <MenuTwoToneIcon fontSize="small" />
              ) : (
                <CloseTwoToneIcon fontSize="small" />
              )}
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
    </HeaderWrapper>
  );
}

export default Header;

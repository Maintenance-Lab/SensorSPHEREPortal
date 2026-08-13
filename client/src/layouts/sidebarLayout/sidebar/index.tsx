import { useContext } from 'react';
import Scrollbar from 'src/components/scrollbar';
import { SidebarContext } from 'src/contexts/sidebarContext';

import {
  Box,
  Drawer,
  alpha,
  styled,
  Divider,
  useTheme,
  lighten,
  darken,
  Button
} from '@mui/material';
import { NavLink as RouterLink } from 'react-router-dom';

import SidebarMenu from './sidebarMenu';
import Logo from 'src/components/logoSign';
import Typography from '@mui/material/Typography';
import ArchiveOutlinedIcon from '@mui/icons-material/ArchiveOutlined';

const SidebarWrapper = styled(Box)(
  ({ theme }) => `
        width: ${theme.sidebar.width};
        min-width: ${theme.sidebar.width};
        color: ${theme.colors.alpha.trueWhite[70]};
        position: relative;
        z-index: 7;
        height: 100%;
        padding-bottom: 68px;
`
);

function SidebarFooter({ onNavigate }) {
  const theme = useTheme();
  return (
    <>
      <Divider
        sx={{
          background: theme.colors.alpha.trueWhite[10]
        }}
      />
      <Box p={2}>
        <Button
          component={RouterLink}
          to="/projects/overview?tab=archived"
          variant="contained"
          size="small"
          fullWidth
          startIcon={<ArchiveOutlinedIcon />}
          onClick={onNavigate}
        >
          Archived
        </Button>
      </Box>
    </>
  );
}

function Sidebar() {
  const { sidebarToggle, toggleSidebar } = useContext(SidebarContext);
  const closeSidebar = () => toggleSidebar();
  const theme = useTheme();

  return (
    <>
      <SidebarWrapper
        sx={{
          display: {
            xs: 'none',
            lg: 'inline-block'
          },
          position: 'fixed',
          left: 0,
          top: 0,
          background:
            theme.palette.mode === 'dark'
              ? alpha(lighten(theme.header.background, 0.1), 0.5)
              : darken(theme.colors.alpha.black[100], 0.5),
          boxShadow:
            theme.palette.mode === 'dark' ? theme.sidebar.boxShadow : 'none'
        }}
      >
        <Scrollbar>
          <Box mt={3}>
            <Box mt={3} textAlign="left" mx={2}>
              <Typography
                variant="h3"
                fontWeight="bold"
                color="primary.main"
                sx={{
                  letterSpacing: 1,
                  userSelect: 'none',
                }}
              >
                SensorSPHERE
              </Typography>
              <Typography
                variant="caption"
                color="secondary.main"
                sx={{ letterSpacing: 1 }}
              >
                Portal
              </Typography>
            </Box>

          </Box>
          <Divider
            sx={{
              mt: theme.spacing(3),
              mx: theme.spacing(2),
              background: theme.colors.alpha.trueWhite[10]
            }}
          />
          <SidebarMenu />
        </Scrollbar>
        <SidebarFooter onNavigate={closeSidebar} />
      </SidebarWrapper>
      <Drawer
        sx={{
          boxShadow: `${theme.sidebar.boxShadow}`
        }}
        anchor={theme.direction === 'rtl' ? 'right' : 'left'}
        open={sidebarToggle}
        onClose={closeSidebar}
        variant="temporary"
        elevation={9}
      >
        <SidebarWrapper
          sx={{
            background:
              theme.palette.mode === 'dark'
                ? theme.colors.alpha.white[100]
                : darken(theme.colors.alpha.black[100], 0.5)
          }}
        >
          <Scrollbar>
            <Box mt={3}>
              <Box
                mx={2}
                sx={{
                  width: 52
                }}
              >
                <Logo />
              </Box>
            </Box>
            <Divider
              sx={{
                mt: theme.spacing(3),
                mx: theme.spacing(2),
                background: theme.colors.alpha.trueWhite[10]
              }}
            />
            <SidebarMenu />
          </Scrollbar>
          <SidebarFooter onNavigate={closeSidebar} />
        </SidebarWrapper>
      </Drawer>
    </>
  );
}

export default Sidebar;

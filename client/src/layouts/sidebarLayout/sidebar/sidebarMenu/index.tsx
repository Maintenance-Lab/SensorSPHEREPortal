import { useContext, useEffect, useState } from 'react';

import {
  ListSubheader,
  alpha,
  Box,
  List,
  styled,
  Button,
  ListItem,
  Link,
  Collapse
} from '@mui/material';
import { NavLink as RouterLink, useLocation } from 'react-router-dom';
import { SidebarContext } from 'src/contexts/sidebarContext';

import HomeIcon from '@mui/icons-material/Home';
import DesignServicesTwoToneIcon from '@mui/icons-material/DesignServicesTwoTone';
import BrightnessLowTwoToneIcon from '@mui/icons-material/BrightnessLowTwoTone';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { getUser } from 'src/helpers/cookies';

const MenuWrapper = styled(Box)(
  ({ theme }) => `
  .MuiList-root {
    padding: ${theme.spacing(1)};

    & > .MuiList-root {
      padding: 0 ${theme.spacing(0)} ${theme.spacing(1)};
    }
  }

    .MuiListSubheader-root {
      text-transform: uppercase;
      font-weight: bold;
      font-size: ${theme.typography.pxToRem(12)};
      color: ${theme.colors.alpha.trueWhite[50]};
      padding: ${theme.spacing(0, 2.5)};
      line-height: 1.4;
    }
`
);

const SubMenuWrapper = styled(Box)(
  ({ theme }) => `
    .MuiList-root {

      .MuiListItem-root {
        padding: 1px 0;

        .MuiBadge-root {
          position: absolute;
          right: ${theme.spacing(3.2)};

          .MuiBadge-standard {
            background: ${theme.colors.primary.main};
            font-size: ${theme.typography.pxToRem(10)};
            font-weight: bold;
            text-transform: uppercase;
            color: ${theme.palette.primary.contrastText};
          }
        }

        .MuiButton-root {
          display: flex;
          color: ${theme.colors.alpha.trueWhite[70]};
          background-color: transparent;
          width: 100%;
          justify-content: flex-start;
          padding: ${theme.spacing(1.2, 3)};

          .MuiButton-startIcon,
          .MuiButton-endIcon {
            transition: ${theme.transitions.create(['color'])};

            .MuiSvgIcon-root {
              font-size: inherit;
              transition: none;
            }
          }

          .MuiButton-startIcon {
            color: ${theme.colors.alpha.trueWhite[30]};
            font-size: ${theme.typography.pxToRem(20)};
            margin-right: ${theme.spacing(1)};
          }

          .MuiButton-endIcon {
            color: ${theme.colors.alpha.trueWhite[50]};
            margin-left: auto;
            opacity: .8;
            font-size: ${theme.typography.pxToRem(20)};
          }

          &.active,
          &:hover {
            background-color: ${alpha(theme.colors.alpha.trueWhite[100], 0.06)};
            color: ${theme.colors.alpha.trueWhite[100]};

            .MuiButton-startIcon,
            .MuiButton-endIcon {
              color: ${theme.colors.alpha.trueWhite[100]};
            }
          }
        }

        &.Mui-children {
          flex-direction: column;

          .MuiBadge-root {
            position: absolute;
            right: ${theme.spacing(7)};
          }
        }

        .MuiCollapse-root {
          width: 100%;

          .MuiList-root {
            padding: ${theme.spacing(1, 0)};
          }

          .MuiListItem-root {
            padding: 1px 0;

            .MuiButton-root {
              padding: ${theme.spacing(0.8, 3)};

              .MuiBadge-root {
                right: ${theme.spacing(3.2)};
              }

              &:before {
                content: ' ';
                background: ${theme.colors.alpha.trueWhite[100]};
                opacity: 0;
                transition: ${theme.transitions.create([
    'transform',
    'opacity'
  ])};
                width: 6px;
                height: 6px;
                transform: scale(0);
                transform-origin: center;
                border-radius: 20px;
                margin-right: ${theme.spacing(1.8)};
              }

              &.active,
              &:hover {

                &:before {
                  transform: scale(1);
                  opacity: 1;
                }
              }
            }
          }
        }
      }
    }
`
);

function SidebarMenu() {
  const { closeSidebar } = useContext(SidebarContext);
  const location = useLocation();
  const user = getUser();
  const [activeProjects, setActiveProjects] = useState([]);
  const [expandedProjectIds, setExpandedProjectIds] = useState({});
  const [sessionsByProject, setSessionsByProject] = useState({});

  const handleToggleProject = async (projectId) => {
    const expanded = !!expandedProjectIds[projectId];
    setExpandedProjectIds((prev) => ({ ...prev, [projectId]: !expanded }));
    if (!expanded && !sessionsByProject[projectId]) {
      try {
        const res = await fetch(`/api/sessions/project/active/${projectId}`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        if (!res.ok) {
          console.error('Failed to fetch sessions');
          return;
        }
        const data = await res.json();
        setSessionsByProject((prev) => ({ ...prev, [projectId]: data }));
      } catch (error) {
        console.error(error);
      }
    }
  };

  useEffect(() => {
    let mounted = true;
    const fetchActiveProjects = async () => {
      try {
        const res = await fetch('/api/projects/active', {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        if (!res.ok) {
          console.error('Failed to fetch projects');
          return;
        }
        const data = await res.json();
        if (mounted) {
          setActiveProjects(data);
        }
      } catch (error) {
        console.error(error);
      }
    };
    fetchActiveProjects();
    return () => {
      mounted = false;
    };
  }, [location.pathname]);

  const isAdmin = user && user.role === 'administrator';
  const adminMenu = isAdmin ? (
    <List
      component="div"
      subheader={
        <ListSubheader component="div" disableSticky>
          Administration
        </ListSubheader>
      }
    >
      <SubMenuWrapper>
        <List component="div">
          <ListItem component="div">
            <Button
              disableRipple
              component={RouterLink}
              onClick={closeSidebar}
              to="/admin/users"
              startIcon={<BrightnessLowTwoToneIcon />}
            >
              Manage Users
            </Button>
          </ListItem>
        </List>
      </SubMenuWrapper>
    </List>
  ) : null;

  return (
    <>
      <MenuWrapper>
        <List component="div">
          <SubMenuWrapper>
            <List component="div">
              <ListItem component="div">
                <Button
                  disableRipple
                  component={RouterLink}
                  onClick={closeSidebar}
                  to="/home"
                  startIcon={<HomeIcon />}
                >
                  Getting Started
                </Button>
              </ListItem>
            </List>
          </SubMenuWrapper>
        </List>

        {adminMenu}

        <List
          component="div"
          subheader={
            <ListSubheader component="div" disableSticky>
              Projects
            </ListSubheader>
          }
        >
          <SubMenuWrapper>
            <List component="div">
              <ListItem component="div">
                <Button
                  disableRipple
                  component={RouterLink}
                  onClick={closeSidebar}
                  to="/projects/overview"
                  startIcon={<DesignServicesTwoToneIcon />}
                >
                  All Projects
                </Button>
              </ListItem>
              {activeProjects.map((project) => {
                const expanded = !!expandedProjectIds[project.projectId];
                const sessions = sessionsByProject[project.projectId] || [];
                return (
                  <ListItem
                    key={project.projectId}
                    component="div"
                    className="Mui-children"
                  >
                    <Button
                      disableRipple
                      onClick={() => handleToggleProject(project.projectId)}
                      startIcon={
                        <ChevronRightIcon
                          sx={{
                            transform: expanded ? 'rotate(90deg)' : 'none',
                            transition: 'transform 0.2s',
                          }}
                        />
                      }
                      endIcon={
                        <Link
                          component={RouterLink}
                          to={`/projects/detail/${project.projectId}`}
                          sx={{ display: 'flex' }}
                          onClick={(event) => {
                            event.stopPropagation();
                            closeSidebar();
                          }}
                        >
                          <ChevronRightIcon fontSize="small" />
                        </Link>
                      }
                    >
                      {project.name}
                    </Button>
                    <Collapse in={expanded}>
                      <List component="div">
                        {sessions.map((session) => (
                          <ListItem key={session.sessionId} component="div">
                            <Button
                              disableRipple
                              component={RouterLink}
                              onClick={closeSidebar}
                              to={`/sessions/detail/${session.sessionId}`}
                            >
                              {session.name}
                            </Button>
                          </ListItem>
                        ))}
                      </List>
                    </Collapse>
                  </ListItem>
                );
              })}
            </List>
          </SubMenuWrapper>
        </List>

        {/* <List
          component="div"
          subheader={
            <ListSubheader component="div" disableSticky>
              Devices
            </ListSubheader>
          }
        >
          <SubMenuWrapper>
            <List component="div">
              <ListItem component="div">
                <Button
                  disableRipple
                  component={RouterLink}
                  onClick={closeSidebar}
                  to="/devices/overview"
                  startIcon={<FormatListBulletedIcon />}
                >
                  All Devices
                </Button>
              </ListItem>
              {isAdmin && (
              <ListItem component="div">
                <Button
                  disableRipple
                  component={RouterLink}
                  onClick={closeSidebar}
                  to="/devices/detail"
                  startIcon={<FormatListBulletedIcon />}
                >
                  Device Detail Page
                </Button>
              </ListItem>
              )}
            </List>
          </SubMenuWrapper>
        </List> */}
      </MenuWrapper>
    </>
  );
}

export default SidebarMenu;

import { Suspense, lazy } from 'react';
import { Navigate } from 'react-router-dom';
import { RouteObject } from 'react-router';

import SidebarLayout from 'src/layouts/SidebarLayout';
import BaseLayout from 'src/layouts/BaseLayout';

import SuspenseLoader from './Components/SuspenseLoader';
import { ProtectedRoute } from './Helpers/ProtectedRoute';

const Loader = (Component) => (props) =>
  (
    <Suspense fallback={<SuspenseLoader />}>
      <Component {...props} />
    </Suspense>
  );

// Base

const Login = Loader(lazy(() => import('src/content/pages/login/Login')));
const Home = Loader(lazy(() => import('src/content/pages/home/')));

// Pages

const Overview = Loader(lazy(() => import('src/content/overview')));

// Admin

const ManageUsers = Loader(
  lazy(() => import('src/content/pages/admin/users/'))
);

// Projects

const Projects = Loader(lazy(() => import('src/content/pages/projects/')));
const ProjectDetail = Loader(lazy(() => import('src/content/pages/projectDetail/')));

// Devices

const Devices = Loader(lazy(() => import('src/content/pages/devices/')));
const DeviceDetail = Loader(lazy(() => import('src/content/pages/deviceDetail/')));

// Sessions

const SessionDetail = Loader(lazy(() => import('src/content/pages/sessionDetail/')));

// Account

const UserSettings = Loader(
  lazy(() => import('src/content/pages/account/settings'))
);


// Status

const Status404 = Loader(
  lazy(() => import('src/content/pages/status/Status404'))
);
const Status500 = Loader(
  lazy(() => import('src/content/pages/status/Status500'))
);
const StatusMaintenance = Loader(
  lazy(() => import('src/content/pages/status/Maintenance'))
);

const routes: RouteObject[] = [
  {
    path: '',
    element: <BaseLayout />,
    children: [
      {
        path: '/',
        element: <Overview />
      },
      {
        path: 'login',
        element: <Login />
      },
      {
        // Protected route: Account settings
        path: 'account',
        element: (
          <ProtectedRoute>
            <SidebarLayout />
          </ProtectedRoute>
        ),
        children: [
          {
            path: '',
            element: <UserSettings />
          }
        ]
      },
      {
        // Protected route: Admin settings
        path: 'admin',
        element: (
          <ProtectedRoute>
            <SidebarLayout />
          </ProtectedRoute>
        ),
        children: [
          {
            path: 'users',
            element: <ManageUsers />
          }
        ]
      },

      {
        path: 'home',
        element: <SidebarLayout />,
        children: [
          {
            path: '',
            element: (
              <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        )
      }
    ]
  },
  {
    path: 'projects',
    element: <SidebarLayout />,
    children: [
      {
        path: '',
        element: <Navigate to="overview" replace />
      },
      {
        path: 'overview',
        element: (
          <ProtectedRoute>
            <Projects />
          </ProtectedRoute>
        )
      },
      {
        path: 'detail/:projectId',
        element: (
          <ProtectedRoute>
            <ProjectDetail />
          </ProtectedRoute>
        )
      }
    ]
  },
  {
    path: 'devices',
    element: <SidebarLayout />,
    children: [
      {
        path: '',
        element: <Navigate to="overview" replace />
      },
      {
        path: 'overview',
        element: (
          <ProtectedRoute>
            <Devices />
          </ProtectedRoute>
        )
      },
      {
        path: 'detail/:deviceId',
        element: (
          <ProtectedRoute>
            <DeviceDetail />
          </ProtectedRoute>
        )
      }
    ]
  },
  {
    path: 'sessions',
    element: <SidebarLayout />,
    children: [
      {
        path: 'detail/:sessionId',
        element: (
          <ProtectedRoute>
            <SessionDetail />
          </ProtectedRoute>
        )
      }
    ]
  },
  {
    path: '*',
    element: <Status404 />
  }
    ]
  }
];

export default routes;

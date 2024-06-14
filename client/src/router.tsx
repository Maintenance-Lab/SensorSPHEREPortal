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

// Template – Dashboards & Apps

const Crypto = Loader(lazy(() => import('src/content/dashboards/Crypto')));
const Messenger = Loader(
  lazy(() => import('src/content/applications/Messenger'))
);
const Transactions = Loader(
  lazy(() => import('src/content/applications/Transactions'))
);
const UserProfile = Loader(
  lazy(() => import('src/content/applications/Users/profile'))
);

// Template – Components

const Buttons = Loader(
  lazy(() => import('src/content/pages/Components/Buttons'))
);
const Modals = Loader(
  lazy(() => import('src/content/pages/Components/Modals'))
);
const Accordions = Loader(
  lazy(() => import('src/content/pages/Components/Accordions'))
);
const Tabs = Loader(lazy(() => import('src/content/pages/Components/Tabs')));
const Badges = Loader(
  lazy(() => import('src/content/pages/Components/Badges'))
);
const Tooltips = Loader(
  lazy(() => import('src/content/pages/Components/Tooltips'))
);
const Avatars = Loader(
  lazy(() => import('src/content/pages/Components/Avatars'))
);
const Cards = Loader(lazy(() => import('src/content/pages/Components/Cards')));
const Forms = Loader(lazy(() => import('src/content/pages/Components/Forms')));

// Status

const Status404 = Loader(
  lazy(() => import('src/content/pages/Status/Status404'))
);
const Status500 = Loader(
  lazy(() => import('src/content/pages/Status/Status500'))
);
const StatusComingSoon = Loader(
  lazy(() => import('src/content/pages/Status/ComingSoon'))
);
const StatusMaintenance = Loader(
  lazy(() => import('src/content/pages/Status/Maintenance'))
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
        path: 'detail',
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
  // Template Pages
  {
    path: 'status',
    children: [
      {
        path: '',
        element: <Navigate to="404" replace />
      },
      {
        path: '404',
        element: <Status404 />
      },
      {
        path: '500',
        element: <Status500 />
      },
      {
        path: 'maintenance',
        element: <StatusMaintenance />
      },
      {
        path: 'coming-soon',
        element: <StatusComingSoon />
      }
    ]
  },
  {
    path: '*',
    element: <Status404 />
  }
]
},
  {
    path: 'dashboards',
    element: <SidebarLayout />,
    children: [
      {
        path: '',
        element: <Navigate to="crypto" replace />
      },
      {
        path: 'crypto',
        element: <Crypto />
      },
      {
        path: 'messenger',
        element: <Messenger />
      }
    ]
  },
  {
    path: 'management',
    element: <SidebarLayout />,
    children: [
      {
        path: '',
        element: <Navigate to="transactions" replace />
      },
      {
        path: 'transactions',
        element: <Transactions />
      },
      {
        path: 'profile',
        children: [
          {
            path: '',
            element: <Navigate to="details" replace />
          },
          {
            path: 'details',
            element: <UserProfile />
          },
          {
            path: 'settings',
            element: <UserSettings />
          }
        ]
      }
    ]
  },
  {
    path: '/components',
    element: <SidebarLayout />,
    children: [
      {
        path: '',
        element: <Navigate to="buttons" replace />
      },
      {
        path: 'buttons',
        element: <Buttons />
      },
      {
        path: 'modals',
        element: <Modals />
      },
      {
        path: 'accordions',
        element: (
          <ProtectedRoute>
            <Accordions />
          </ProtectedRoute>
        )
      },
      {
        path: 'tabs',
        element: <Tabs />
      },
      {
        path: 'badges',
        element: <Badges />
      },
      {
        path: 'tooltips',
        element: <Tooltips />
      },
      {
        path: 'avatars',
        element: <Avatars />
      },
      {
        path: 'cards',
        element: <Cards />
      },
      {
        path: 'forms',
        element: <Forms />
      }
    ]
  }
];

export default routes;

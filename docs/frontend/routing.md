# SensorSphere Portal Frontend routing

Routing in the frontend is handled by the react router in [router.tsx](../../client/src/router.tsx)
It loads all initial route components and with the helper function [<ProtectedRoute>](../../client/src/Helpers/ProtectedRoute.tsx) you can easily make sure a route is only access by logged in users.

In the Routes array, you can easily add a route by adding something like this

```ts
{
path: 'login',
element: <Login />
}
```

To protect a route, or have it be inside the SideBarLayout, you can use a structure like this

```ts
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
```
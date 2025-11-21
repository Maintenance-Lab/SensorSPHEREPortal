# SensorSPHERE Portal API configuration

All api routes for the SensorSPHERE Portal are defined in [the routes folder](../../src/routes/api/)
We tried to keep give most files a folder following their path, to split files up.

## User authentication
Routes that should be secured use the [getSession()](../../src/utils.ts) function to get all information about a session.
[getSession()](../../src/utils.ts) will return null, and handle the request if no session has been found in the request. An appropriate 401 response will be returned.
If a session is found, the function will respond with the active sessions for that user and the user information stored in the cookies.
This includes \_id, name, role, hasAvatar, email, hasChangedPassword, but more information can be added in [The login API call](../../src/routes/api/login.ts) where the cookie is created.

## Admin authentication
To make sure that a user is an administrator, the [isAdmin()](../../src/utils.ts) can be used. It functions identical to the [getSession()](../../src/utils.ts) function, but will only return a user if the user is an administrator.
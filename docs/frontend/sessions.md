# SensorSphere Portal Frontend sessions

To get session info in the frontend code, you can use the [getUser function](../../client/src/Helpers/cookies.ts) to get all user information stored in the cookie.
This includes \_id, name, role, hasAvatar, email, hasChangedPassword, but more information can be added in [The login API call](../../src/routes/api/login.ts) where the cookie is created.
This information can then be used or displayed on the page.

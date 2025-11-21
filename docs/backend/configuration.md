# SensorSPHERE Portal configuration

Configuration for the SensorSPHERE portal is done in the .env file and the [config file](../../src/config.ts)
The configuration file currently parses all enviroment variables required and exports them as variables to other parts of the project.

The .env file should look something like this:
```env
ENV=development
PORT=3000
JWT_ACCESS_SECRET=
JWT_EXPIRESIN=
MONGODB_URI=
MQTT_URI=
```
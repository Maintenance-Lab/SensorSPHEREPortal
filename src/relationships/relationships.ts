// Import the models
import Account from '../models/Account.js';
import Project from '../models/Project.js';
import Session from '../models/Session.js';
import Device from '../models/Device.js';
import Sensor from '../models/Sensor.js';
import Manufacturer from '../models/Manufacturer.js';
import SensorProperty from '../models/SensorProperty.js';
import SensorCategory from '../models/SensorCategory.js';
import DeviceSensorConfiguration from '../models/DeviceSensorConfiguration.js';
import AccountProjectMapping from '../models/mappings/AccountProjectMapping.js';
import SessionDeviceMapping from '../models/mappings/SessionDeviceMapping.js';
import SensorDeviceMapping from '../models/mappings/SessionDeviceMapping.js';

export const setupRelations = () => {
    console.log("Setting up relations");
    // Set up the many-to-many relationships
    // Account Project Mapping
    Account.belongsToMany(Project, { through: AccountProjectMapping, foreignKey: 'accountId' });
    Project.belongsToMany(Account, { through: AccountProjectMapping, foreignKey: 'projectId' });

    Account.hasMany(AccountProjectMapping, { foreignKey: 'accountId' });
    AccountProjectMapping.belongsTo(Account, { foreignKey: 'accountId' });
    Project.hasMany(AccountProjectMapping, { foreignKey: 'projectId' });
    AccountProjectMapping.belongsTo(Project, { foreignKey: 'projectId' });

    // Session Device Mapping
    Session.belongsToMany(Device, { through: SessionDeviceMapping, foreignKey: 'sessionId' });
    Device.belongsToMany(Session, { through: SessionDeviceMapping, foreignKey: 'deviceId' });

    Session.hasMany(SessionDeviceMapping, { foreignKey: 'sessionId' });
    SessionDeviceMapping.belongsTo(Session, { foreignKey: 'sessionId' });
    Device.hasMany(SessionDeviceMapping, { foreignKey: 'deviceId' });
    SessionDeviceMapping.belongsTo(Device, { foreignKey: 'deviceId' });

    // Device Sensor Mapping
    Device.belongsToMany(Sensor, {through: SensorDeviceMapping, foreignKey: 'deviceId'});
    Sensor.belongsToMany(Device, {through: SensorDeviceMapping, foreignKey: 'model'});
    Sensor.belongsToMany(Device, {through: SensorDeviceMapping, foreignKey: 'manufacturerName'});

    Device.hasMany(SensorDeviceMapping, { foreignKey: 'deviceId' });
    SensorDeviceMapping.belongsTo(Device, { foreignKey: 'deviceId' });
    Sensor.hasMany(SensorDeviceMapping, { foreignKey: 'model' });
    SensorDeviceMapping.belongsTo(Sensor, { foreignKey: 'model' });
    Sensor.hasMany(SensorDeviceMapping, { foreignKey: 'manufacturerName' });
    SensorDeviceMapping.belongsTo(Sensor, { foreignKey: 'manufacturerName' });

    // Sensor.belongsToMany(Device, {through: SensorDeviceMapping, foreignKey: 'Model'});

    // Set up the one-to-many relationships
    Sensor.belongsTo(Manufacturer, {
        foreignKey: 'manufacturerName'
    });

    Manufacturer.hasMany(Sensor)


    Device.hasOne(Manufacturer, {
        foreignKey: 'manufacturerName'
    });

    // Manufacturer.hasMany(Device)


    Sensor.belongsTo(SensorCategory, {
        foreignKey: 'categoryName'
    });

    // SensorCategory.hasMany(Sensor);


    SensorProperty.belongsTo(Sensor, {
        foreignKey: 'model',
        as: 'sensorModel'
    })

    SensorProperty.belongsTo(Sensor, {
        foreignKey: 'manufacturerName'
    })

    Sensor.hasMany(SensorProperty)

    Session.belongsTo(Project, {
        foreignKey: 'projectId'
    });


    DeviceSensorConfiguration.hasMany(SensorProperty, {
        foreignKey: 'propertyName'
    });

    SensorProperty.belongsTo(DeviceSensorConfiguration);


    DeviceSensorConfiguration.hasMany(SessionDeviceMapping, {
        foreignKey: 'sessionId'
    });

    DeviceSensorConfiguration.hasMany(SessionDeviceMapping, {
        foreignKey: 'deviceId'
    });

    SessionDeviceMapping.belongsTo(DeviceSensorConfiguration);


    // Device.hasMany(Sensor, {
    //     foreignKey: 'DeviceId',
    //     // as: 'Sensors'
    //     // sourceKey: 'DeviceId'
    // });


    // SensorProperty.hasOne(DeviceSensorConfiguration, {
    //     foreignKey: ''
    // })

    // Set up the one-to-one relationships
};

export default setupRelations;
// module.exports = setupRelations;

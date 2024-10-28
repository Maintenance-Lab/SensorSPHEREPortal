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
    Account.belongsToMany(Project, { through: AccountProjectMapping, foreignKey: 'AccountId' });
    Project.belongsToMany(Account, { through: AccountProjectMapping, foreignKey: 'ProjectId' });

    Account.hasMany(AccountProjectMapping, { foreignKey: 'accountId' });
    AccountProjectMapping.belongsTo(Account, { foreignKey: 'accountId' });
    Project.hasMany(AccountProjectMapping, { foreignKey: 'projectId' });
    AccountProjectMapping.belongsTo(Project, { foreignKey: 'projectId' });

    // Session Device Mapping
    Session.belongsToMany(Device, { through: SessionDeviceMapping, foreignKey: 'SessionId' });
    Device.belongsToMany(Session, { through: SessionDeviceMapping, foreignKey: 'DeviceId' });

    Session.hasMany(SessionDeviceMapping, { foreignKey: 'SessionId' });
    SessionDeviceMapping.belongsTo(Session, { foreignKey: 'SessionId' });
    Device.hasMany(SessionDeviceMapping, { foreignKey: 'DeviceId' });
    SessionDeviceMapping.belongsTo(Device, { foreignKey: 'DeviceId' });

    // Device Sensor Mapping
    Device.belongsToMany(Sensor, {through: SensorDeviceMapping, foreignKey: 'DeviceId'});
    Sensor.belongsToMany(Device, {through: SensorDeviceMapping, foreignKey: 'Model'});
    Sensor.belongsToMany(Device, {through: SensorDeviceMapping, foreignKey: 'ManufacturerName'});

    Device.hasMany(SensorDeviceMapping, { foreignKey: 'DeviceId' });
    SensorDeviceMapping.belongsTo(Device, { foreignKey: 'DeviceId' });
    Sensor.hasMany(SensorDeviceMapping, { foreignKey: 'Model' });
    SensorDeviceMapping.belongsTo(Sensor, { foreignKey: 'Model' });
    Sensor.hasMany(SensorDeviceMapping, { foreignKey: 'ManufacturerName' });
    SensorDeviceMapping.belongsTo(Sensor, { foreignKey: 'ManufacturerName' });

    // Sensor.belongsToMany(Device, {through: SensorDeviceMapping, foreignKey: 'Model'});

    // Set up the one-to-many relationships
    Sensor.belongsTo(Manufacturer, {
        foreignKey: 'Name',
        as: 'ManufacturerName'
    });

    Manufacturer.hasMany(Sensor)


    Sensor.belongsTo(SensorCategory, {
        foreignKey: 'Name',
        as: 'CategoryName'
    });

    SensorCategory.hasMany(Sensor);


    SensorProperty.belongsTo(Sensor, {
        foreignKey: 'Model',
        as: 'SensorModel'
    })

    SensorProperty.belongsTo(Sensor, {
        foreignKey: 'Name',
        as: 'ManufacturerName'
    })

    Sensor.hasMany(SensorProperty)


    Device.hasOne(Manufacturer, {
        foreignKey: 'Name'
    });


    Session.belongsTo(Project, {
        foreignKey: 'ProjectId'
    });


    DeviceSensorConfiguration.hasMany(SensorProperty, {
        foreignKey: 'Name',
        as: 'PropertyName'
    });

    SensorProperty.belongsTo(DeviceSensorConfiguration);


    DeviceSensorConfiguration.hasMany(SessionDeviceMapping, {
        foreignKey: 'SessionId',
        as: 'SessionId'
    });

    DeviceSensorConfiguration.hasMany(SessionDeviceMapping, {
        foreignKey: 'DeviceId',
        as: 'DeviceId'
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

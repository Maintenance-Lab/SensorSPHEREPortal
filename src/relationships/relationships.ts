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
import DeviceSensorMapping from '../models/mappings/DeviceSensorMapping.js';

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
    // SessionDeviceMapping.belongsTo(Session, { foreignKey: 'sessionId' });
    Device.hasMany(SessionDeviceMapping, { foreignKey: 'deviceId' });
    // SessionDeviceMapping.belongsTo(Device, { foreignKey: 'deviceId' });

    // Device Sensor Mapping
    Device.belongsToMany(Sensor, { through: DeviceSensorMapping, foreignKey: 'deviceId' });
    Sensor.belongsToMany(Device, { through: DeviceSensorMapping, foreignKey: 'model', otherKey: 'manufacturerName' });

    Device.hasMany(DeviceSensorMapping, { foreignKey: 'deviceId' });
    // DeviceSensorMapping.belongsTo(Device, { foreignKey: 'deviceId' });
    Sensor.hasMany(DeviceSensorMapping, { foreignKey: 'model' });
    // DeviceSensorMapping.belongsTo(Sensor, { foreignKey: 'model' });
    Sensor.hasMany(DeviceSensorMapping, { foreignKey: 'manufacturerName' });
    // DeviceSensorMapping.belongsTo(Sensor, { foreignKey: 'manufacturerName' });

    // Set up the one-to-many relationships
    Device.hasMany(Manufacturer, { foreignKey: 'manufacturerName' });
    Sensor.hasMany(Manufacturer, { foreignKey: 'manufacturerName' });

    Manufacturer.belongsTo(Device, { foreignKey: 'manufacturerName' });
    Manufacturer.belongsTo(Sensor, { foreignKey: 'manufacturerName' });

    Sensor.hasMany(SensorProperty, { foreignKey: 'model' });
    SensorProperty.belongsTo(Sensor, { foreignKey: 'model' });
    Sensor.hasMany(SensorProperty, { foreignKey: 'manufacturerName' });
    SensorProperty.belongsTo(Sensor, { foreignKey: 'manufacturerName' });

    SensorCategory.hasMany(Sensor, { foreignKey: 'categoryName' });
    Sensor.belongsTo(SensorCategory, { foreignKey: 'categoryName' });

    // Set up the one-to-one relationships
    DeviceSensorConfiguration.belongsTo(SessionDeviceMapping, { foreignKey: 'sessionId' });
    SessionDeviceMapping.hasOne(DeviceSensorConfiguration, { foreignKey: 'sessionId' });
    DeviceSensorConfiguration.belongsTo(SessionDeviceMapping, { foreignKey: 'deviceId' });
    SessionDeviceMapping.hasOne(DeviceSensorConfiguration, { foreignKey: 'deviceId' });

    DeviceSensorConfiguration.belongsTo(SensorProperty, { foreignKey: 'propertyName' });
    SensorProperty.hasOne(DeviceSensorConfiguration, { foreignKey: 'propertyName' });
    DeviceSensorConfiguration.belongsTo(SensorProperty, { foreignKey: 'model' });
    SensorProperty.hasOne(DeviceSensorConfiguration, { foreignKey: 'model' });
    DeviceSensorConfiguration.belongsTo(SensorProperty, { foreignKey: 'manufacturerName' });
    SensorProperty.hasOne(DeviceSensorConfiguration, { foreignKey: 'manufacturerName' });


// -------------------------------------- ^ dit werkt ^ --------------------------

    // Weet niet of dit iets doet
    Session.belongsTo(Project, { foreignKey: 'projectId' });

    // komt van one to many
    // DeviceSensorConfiguration.hasMany(SessionDeviceMapping, { foreignKey: 'sessionId'});
    // SessionDeviceMapping.belongsTo(DeviceSensorConfiguration, { foreignKey: 'sessionId' });
    // DeviceSensorConfiguration.hasMany(SessionDeviceMapping, { foreignKey: 'deviceId'});
    // SessionDeviceMapping.belongsTo(DeviceSensorConfiguration, { foreignKey: 'deviceId' });

};

export default setupRelations;

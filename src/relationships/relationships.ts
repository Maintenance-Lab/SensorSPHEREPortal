// Import the models
import Account from '../models/Account.js';
import Project from '../models/Project.js';
import Session from '../models/Session.js';
import Device from '../models/Device.js';
import Sensor from '../models/Sensor.js';
import Manufacturer from '../models/Manufacturer.js';
import Property from '../models/Property.js';
import DeviceSensorConfiguration from '../models/DeviceSensorConfiguration.js';
import AccountProjectMapping from '../models/mappings/AccountProjectMapping.js';
import SessionDeviceMapping from '../models/mappings/SessionDeviceMapping.js';
import DeviceModuleMapping from '../models/mappings/DeviceModuleMapping.js';
import DeviceModel from '../models/DeviceModel.js';
import Module from '../models/Module.js'

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
    // Session.belongsToMany(Device, { through: SessionDeviceMapping, foreignKey: 'sessionId' });
    // Device.belongsToMany(Session, { through: SessionDeviceMapping, foreignKey: 'deviceId' });

    Session.hasMany(SessionDeviceMapping, { foreignKey: 'sessionId' });
    Device.hasMany(SessionDeviceMapping, { foreignKey: 'deviceId' });

    // Device Module Mapping
    Device.hasMany(DeviceModuleMapping, { foreignKey: 'deviceId' });
    DeviceModuleMapping.belongsTo(Device, { foreignKey: 'deviceId' });

    DeviceModuleMapping.belongsTo(Module, { foreignKey: { name: 'moduleName', field: 'moduleName'}, targetKey: 'name' });
    DeviceModuleMapping.belongsTo(Module, { foreignKey: { name: 'moduleManufacturer', field: 'moduleManufacturer' }, targetKey: 'manufacturer'});
    DeviceModuleMapping.belongsTo(Module, { foreignKey: { name: 'sensorType', field: 'sensorType' }, targetKey: 'sensorType' });

    Device.hasMany(Manufacturer, { foreignKey: 'manufacturer' });
    Manufacturer.belongsTo(Device, { foreignKey: 'manufacturer' });

    Module.hasMany(Manufacturer, { foreignKey: 'manufacturer' });
    Manufacturer.belongsTo(Module, { foreignKey: 'manufacturer' });

    Device.hasMany(DeviceModel, { foreignKey: 'model' });
    DeviceModel.belongsTo(Device, { foreignKey: 'model' });

    Property.belongsTo(Sensor, { foreignKey: 'sensorType', targetKey: 'type' });
    Sensor.hasMany(Property, { foreignKey: 'sensorType', sourceKey: 'type' });

    Module.belongsTo(Sensor, { foreignKey: 'sensorType', targetKey: 'type' });
    Sensor.hasMany(Module, { foreignKey: 'sensorType', sourceKey: 'type' });


    // Set up the one-to-one relationships
    DeviceSensorConfiguration.belongsTo(SessionDeviceMapping, { foreignKey: 'sessionId', targetKey: 'sessionId' });
    DeviceSensorConfiguration.belongsTo(SessionDeviceMapping, { foreignKey: 'deviceId', targetKey: 'deviceId' });

    DeviceSensorConfiguration.belongsTo(Property, { foreignKey: 'sensorType', targetKey: 'sensorType', as: 'type' });
    DeviceSensorConfiguration.belongsTo(Property, { foreignKey: 'sensorProperty', targetKey: 'name', as: 'property' });

    Session.belongsTo(Project, { foreignKey: 'projectId' });
};

export default setupRelations;

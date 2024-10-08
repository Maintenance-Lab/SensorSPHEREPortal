// Import the models
import Account from '../models/Account';
import Project from '../models/Project';
import Session from '../models/Session';
import Device from '../models/Device';
import Sensor from '../models/Sensor';
import Manufacturer from '../models/Manufacturer';
import SensorProperty from '../models/SensorProperty';
import SensorCategory from '../models/SensorCategory';
import DeviceSensorConfiguration from '../models/DeviceSensorConfiguration';
import AccountProjectMapping from '../models/mappings/AccountProjectMapping';
import SessionDeviceMapping from '../models/mappings/SessionDeviceMapping';
import SensorDeviceMapping from '../models/mappings/SessionDeviceMapping';

export const setupRelations = () => {
    // Set up the many-to-many relationships
    // Account Project Mapping
    Account.belongsToMany(Project, { through: AccountProjectMapping });
    Project.belongsToMany(Account, { through: AccountProjectMapping });

    // Session Device Mapping
    Session.belongsToMany(Device, { through: SessionDeviceMapping });
    Device.belongsToMany(Session, { through: SessionDeviceMapping });

    // Device Sensor Mapping
    Device.belongsToMany(Sensor, {through: SensorDeviceMapping});
    Sensor.belongsToMany(Device, {through: SensorDeviceMapping});

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

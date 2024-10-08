// Import the models
import Account from '../models/Account';
import Project from '../models/Project';
import AccountProjectMapping from '../models/AccountProjectMapping';
import Session from '../models/Session';
import Device from '../models/Device';
import SessionDeviceMapping from '../models/SessionDeviceMapping';
import Sensor from 'src/models/Sensor';

export const setupRelations = () => {
    // Set up the many-to-many relationships
    // Account Project Mapping
    Account.belongsToMany(Project, { through: AccountProjectMapping });
    Project.belongsToMany(Account, { through: AccountProjectMapping });

    // Session Device Mapping
    Session.belongsToMany(Device, { through: SessionDeviceMapping });
    Device.belongsToMany(Session, { through: SessionDeviceMapping });

    // Device Sensor Mapping

    // Set up the one-to-many relationships
    Device.hasMany(Sensor, {
            foreignKey: 'DeviceId',
            as: 'Sensors'
            // sourceKey: 'DeviceId'
        }
    );
    Sensor.belongsTo(Device, {
            foreignKey: 'DeviceId',
            as: 'Device'
            // targetKey: 'DeviceId'
        }
    );



    // Set up the one-to-one relationships
};

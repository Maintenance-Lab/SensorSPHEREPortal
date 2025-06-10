import { DataTypes, Model } from 'sequelize';
import sequelize from '../../sequelize.js';

import Device from '../Device.js';
import Session from '../Session.js';

class SessionDeviceMapping extends Model {
    sessionId: number;
    deviceId: string;
    sampleRate: number;
}

SessionDeviceMapping.init({
    sessionId: { type: DataTypes.INTEGER, primaryKey: true,  references: { model: Session, key: 'sessionId' }, allowNull: false },
    deviceId: { type: DataTypes.STRING, primaryKey: true, references: { model: Device, key: 'deviceId' },  allowNull: false, validate: { is: /^([0-9A-F][0-9A-F]:){5}([0-9A-F][0-9A-F])$/i } },
    sampleRate: { type: DataTypes.INTEGER, defaultValue: null },
    // TODO: default value sampleRate aanpassen
}, {
    sequelize,
    modelName: 'SessionDeviceMapping',
    tableName: 'SessionDeviceMapping',
    timestamps: false,
});

export default SessionDeviceMapping;

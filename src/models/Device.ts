import { SensorModel } from './Sensor';

export interface DeviceModel {
    DeviceId: number;
    ManufacturerName: string | SensorModel;
    Model: string | SensorModel;
    ConnectStatus: boolean;
    MaxHz: number;
}
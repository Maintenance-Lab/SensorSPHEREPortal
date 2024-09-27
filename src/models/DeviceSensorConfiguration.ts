import { SessionModel } from "./Session";
import { DeviceModel } from "./Device";
import { SensorPropertyModel } from "./SensorProperty";

export interface DeviceSensorConfigurationModel {
    SessionId: number | SessionModel;
    DeviceId: number | DeviceModel;
    PropertyName: string | SensorPropertyModel;
    Active: boolean;
}
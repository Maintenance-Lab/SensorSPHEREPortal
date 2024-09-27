import { SensorModel } from "./Sensor";

export interface SensorPropertyModel {
    PropertyName: string;
    Model: string | SensorModel;
    ManufacturerName: string | SensorModel;
}
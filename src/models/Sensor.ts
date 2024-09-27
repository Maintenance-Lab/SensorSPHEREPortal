import { SensorCategoryModel } from "./SensorCategory";
import { SensorManufacturerModel } from "./SensorManufacturer";
import { SensorPropertyModel } from "./SensorProperty";

export interface SensorModel {
    Model: string;
    ManufacturerName: string | SensorManufacturerModel;
    CategoryName: string | SensorCategoryModel;
    PropertyName: string | SensorPropertyModel;
}


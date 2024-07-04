import { config } from "dotenv-safe";
config();

export const ENV = process.env.ENV;
export const IS_PROD = ENV === "production";
export const PORT: number = +(process.env.PORT ?? 7080);
export const JWT_ACCESS_SECRET: string = process.env.JWT_ACCESS_SECRET || "";
export const JWT_EXPIRESIN: number = parseInt(process.env.JWT_EXPIRESIN || "7200")
export const MONGODB_URI: string = process.env.MONGODB_URI || "";
export const MQTT_URI: string = process.env.MQTT_URI || "";

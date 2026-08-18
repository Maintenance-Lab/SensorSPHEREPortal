import { config } from 'dotenv-safe';
config();

export const ENV = process.env.ENV;
export const IS_PROD = ENV === "production";
export const PORT: number = +(process.env.PORT ?? 7080);
export const JWT_ACCESS_SECRET: string = process.env.JWT_ACCESS_SECRET || "";
export const JWT_EXPIRESIN: number = parseInt(process.env.JWT_EXPIRESIN || "7200")
export const MQTT_URI: string = process.env.MQTT_URI || "";
export const MONGODB_URI: string = process.env.MONGODB_URI || "";
export const BACKEND_LOCATION: string = process.env.BACKEND_LOCATION || (IS_PROD ? "cloud" : "local");
export const SQLITE_PATH: string = process.env.SQLITE_PATH || "database/db.sqlite3";
export const FIRMWARE: string = process.env.FIRMWARE || "";

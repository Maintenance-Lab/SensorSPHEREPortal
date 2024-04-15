import { config } from "dotenv-safe";
config();

export const ENV = process.env.ENV;
export const IS_PROD = ENV === "production";
export const PORT: number = +(process.env.PORT ?? 7080);
export const MONGODB_URI = process.env.MONGODB_URI || "";
export const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
export const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

import { config } from "dotenv-safe";
config();

export const ENV = process.env.ENV;
export const IS_PROD = ENV === "production";
export const PORT: number = +(process.env.PORT ?? 7080);
export const MONGODB_URI = process.env.MONGODB_URI;
export const AUTH_TOKEN = process.env.AUTH_TOKEN;
export const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
export const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;

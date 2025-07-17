// Application constants
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3903";
export const API_ADMIN_KEY = process.env.NEXT_PUBLIC_API_ADMIN_KEY || "";
export const S3_ENDPOINT_URL = process.env.NEXT_PUBLIC_S3_ENDPOINT_URL || "http://localhost:3900";
export const S3_REGION = process.env.NEXT_PUBLIC_S3_REGION || "garage";

// Application metadata
export const APP_NAME = "Garage Web UI";
export const APP_VERSION = "2.0.0";
export const APP_DESCRIPTION = "Admin interface for Garage Object Storage Service";

// Storage keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: "garage_auth_token",
  THEME: "garage_theme",
  USER_PREFERENCES: "garage_user_preferences",
} as const;

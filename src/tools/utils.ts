import { IS_PROD } from "../config.js";

export const sleep = (val = 1000): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(function () {
      resolve();
    }, val);
  });
};

// min and max included
export const getRandomInt = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1) + min);
};

// The maximum is exclusive and the minimum is inclusive
export const getRandomInteger = (min: number, max: number) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min);
};

export const toQueryString = (data: undefined | { [index: string]: any }) => {
  if (!data) return "";
  const params = new URLSearchParams();
  for (const key in data) {
    params.set(key, data[key].toString());
  }
  const qs = params.toString();
  return qs ? `?${qs}` : "";
};

export const handleMongoError = (error: any) => {
  if (error.code === 11000) {
    const fieldName = Object.keys(error.keyPattern)[0]; // Extracting the field name from the error object
    return `The '${fieldName}' is already in use. Please choose another one.`;
  } else {
    if (!IS_PROD) console.error("An unexpected error occurred", error);
    return "An unexpected error occurred";
  }
};

export const isPasswordStrong = (password: string) => {
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasLength = password.length >= 8;
  return hasSpecialChar && hasNumber && hasUpperCase && hasLowerCase && hasLength;
};

export const isEmail = (email: string) => {
  const re = /\S+@\S+\.\S+/;
  return re.test(email);
};
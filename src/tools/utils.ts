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
  
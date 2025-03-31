import axios from "axios";
import EnvConfig from "./envConfig";

let AppStore = undefined,
  ClearAppData = undefined;
export function injectStoreDependencies(store, clearAppData) {
  AppStore = store;
  ClearAppData = clearAppData;
}

const httpClient = axios.create({
  baseURL: EnvConfig.ApiBase,
  headers: {
    "Content-type": "application/json",
  },
});

httpClient.interceptors.request.use(
  function (config) {
    const token = AppStore.getState().authState.token;
    if (token) config.headers["token"] = token;
    const clientTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (clientTimeZone) config.headers["x-timezone"] = clientTimeZone;
    return config;
  },
  function (error) {
    console.error("axios.interceptors.request error => ", error);
    return Promise.reject(error);
  }
);

httpClient.interceptors.response.use(
  function (response) {
    return response;
  },
  function (error) {
    if (error?.response?.status === 401 && ClearAppData) ClearAppData();
    return Promise.reject(error);
  }
);

export default httpClient;

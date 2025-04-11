const ServerBase = import.meta.env.DEV
  ? "http://192.168.1.14:8000"
  : "http://192.168.1.14:8000";
// : "http://13.234.32.219:3030";

const EnvConfig = {
  ApiBase: `${ServerBase}/api/v1`,
  MediaBase: `${ServerBase}/media`,
};

export default EnvConfig;

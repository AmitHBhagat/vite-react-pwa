const ServerBase = import.meta.env.DEV
  ? "http://localhost:8000"
  : "https://a5ad-2401-4900-1c94-7e03-c59-a076-65f6-26a6.ngrok-free.app";
// : "http://13.234.32.219:3030";

const EnvConfig = {
  ApiBase: `${ServerBase}/api/v1`,
  MediaBase: `${ServerBase}/media`,
};

export default EnvConfig;

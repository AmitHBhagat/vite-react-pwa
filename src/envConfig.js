const ServerBase = import.meta.env.DEV
  ? "https://1d7e-2401-4900-1c21-1f7f-9c12-8ed7-dc78-a3e.ngrok-free.app"
  : "https://1d7e-2401-4900-1c21-1f7f-9c12-8ed7-dc78-a3e.ngrok-free.app";
// : "http://13.234.32.219:3030";

const EnvConfig = {
  ApiBase: `${ServerBase}/api/v1`,
  MediaBase: `${ServerBase}/media`,
};

export default EnvConfig;

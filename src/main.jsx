import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { registerSW } from "virtual:pwa-register";
import store, { clearAppData } from "./stores/store";
import { injectStoreDependencies } from "./httpClient";
import "rsuite/dist/rsuite.min.css";
import "./index.css";
import "./styles.css";
import App from "./App";

registerSW({ immediate: true });

injectStoreDependencies(store, clearAppData);
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  // <React.StrictMode>
  <Provider store={store}>
    <App />
  </Provider>
  // </React.StrictMode>
);

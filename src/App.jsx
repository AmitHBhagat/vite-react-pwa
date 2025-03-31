import React, { useEffect, useState } from "react";
import {
  createBrowserRouter,
  createHashRouter,
  RouterProvider,
} from "react-router-dom";
import { useSelector } from "react-redux";
import { usePromiseTracker } from "react-promise-tracker";
import { ToastContainer } from "react-toastify";
import { GetRoutes } from "./AppRoutes";
import PageLoader from "./components/Loaders/Loaders";
import "react-toastify/dist/ReactToastify.css";

function App() {
  const { promiseInProgress } = usePromiseTracker();
  const authState = useSelector((state) => state.authState);
  console.log("authState => ", authState);
  const [routerKey, setRouterKey] = useState(0);

  useEffect(() => setRouterKey((prev) => prev + 1), [authState?.user?.role]);

  const routerObject = createHashRouter(
    GetRoutes(authState?.isAuthenticated, authState?.user)
  );

  return authState.isAuthenticated === undefined &&
    authState?.user?.role === undefined ? (
    <PageLoader isLoading={true} />
  ) : (
    <>
      <PageLoader isLoading={promiseInProgress} />
      <ToastContainer autoClose={2000} position="bottom-right" />
      <RouterProvider key={routerKey} router={routerObject} />
    </>
  );
}

export default App;

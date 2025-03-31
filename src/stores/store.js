import { configureStore } from "@reduxjs/toolkit";
import { trackPromise } from "react-promise-tracker";
import { toast } from "react-toastify";
import authReducer, {
  initAuthState,
  setAuth,
  setFlatList,
  setSelectedFlat,
  setToken,
  setUser,
} from "./authSlice";
import appReducer from "./appSlice";
import AuthService from "../services/auth.service";
import UserService from "../services/user.service";
import AdminService from "../services/admin.service";
import FlatService from "../services/flat.service";
import notificationReducer, {
  initNotification,
  setNotification,
} from "./notificationSlice";
import notificationService from "../services/notification.service";
import { USER_ROLES } from "../AppRoutes";

export const LOCAL_KEY = "SOCIETY_CARE_DATA";

const store = configureStore({
  reducer: {
    authState: authReducer,
    appState: appReducer,
    notificationState: notificationReducer,
  },
});

(function initLoad() {
  let localData = getLocalData();
  localData = localData.authToken
    ? localData
    : { authToken: undefined, user: {}, flat: {} };

  if (localData.authToken) {
    store.dispatch(setToken({ token: localData.authToken }));
    if (localData.user._id) {
      getUserProfile(localData.user);
    }
  } else {
    store.dispatch(setAuth({ isAuthenticated: false }));
  }
})();

export async function getUserProfile(userObj) {
  const isMember = userObj.role === USER_ROLES.user;
  try {
    const resp = await trackPromise(
      isMember
        ? UserService.getProfile(userObj._id)
        : AdminService.getProfile(userObj._id)
    );
    if (resp?.data?.success) {
      const { token, user } = resp.data;
      store.dispatch(setAuth({ isAuthenticated: true }));
      store.dispatch(setUser({ user }));
      setLocalData({
        authToken: token,
        user,
      });
      fetchUserNotifications(user);
      fetchUserFlats(user);
    } else {
      clearAppData();
    }
  } catch (err) {
    toast.error(err?.response?.data?.message);
    console.error("Get user profile catch => ", err);
    clearAppData();
  }
}

export async function fetchUserFlats(userObj) {
  if (userObj.role === USER_ROLES.user) {
    try {
      const resp = await trackPromise(FlatService.getUserFlats(userObj._id));
      const { data } = resp;
      if (data.success) {
        const flatlist = data.flat.map((flt) => ({
          value: flt?._id,
          label: `${flt?.societyId?.societyName} - ${flt?.flatNo}`,
          societyId: flt?.societyId?._id,
          societyName: flt?.societyId?.societyName,
          flatNo: flt?.flatNo,
          ownerName: flt?.ownerName,
        }));
        store.dispatch(setFlatList({ flatList: flatlist }));
        const localStgFlat = getLocalData()?.flat;
        if (localStgFlat) {
          const selectedflat = flatlist.find(
            (flt) => flt.value === localStgFlat
          );
          store.dispatch(setSelectedFlat({ selectedFlat: selectedflat }));
        }
      }
    } catch (err) {
      toast.error(err?.response?.data?.message);
      console.error("Get user flats catch => ", err);
    }
  }
}

export const fetchUserNotifications = async (userObj) => {
  try {
    const resp = await trackPromise(
      notificationService.getUserNotifications(userObj._id)
    );
    const { data } = resp;
    if (data.success) {
      store.dispatch(setNotification({ notes: data.notifications || [] }));
    }
  } catch (error) {
    toast.error(error?.response?.data?.message);
    console.error("Get user notifications catch", error);
  }
};

export async function updateUserProfile(updateObj) {
  try {
    const resp = await trackPromise(AuthService.updateProfile(updateObj));
    if (resp?.data?.success) {
      toast.success("Profile updated successfully!");
      const { token, user } = resp.data;
      store.dispatch(setUser({ user }));
      setLocalData({
        authToken: token,
        user,
      });
    } else {
      clearAppData();
    }
  } catch (err) {
    toast.error(err?.response?.data?.message);
    console.error("Update user profile catch => ", err);
    clearAppData();
  }
}

export function getLocalData() {
  const localDtStrg = localStorage.getItem(LOCAL_KEY);
  return localDtStrg ? JSON.parse(localDtStrg) : {};
}

export function setLocalData(data) {
  const existDt = getLocalData();
  const updatedData = {
    ...existDt,
    ...data,
  };
  localStorage.setItem(LOCAL_KEY, JSON.stringify(updatedData));
}

export function removeLocalData() {
  if (localStorage.getItem(LOCAL_KEY)) localStorage.removeItem(LOCAL_KEY);
}

export async function clearAppData() {
  store.dispatch(initAuthState());
  store.dispatch(initNotification());
  removeLocalData();
}

export default store;

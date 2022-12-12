import { configureStore } from "@reduxjs/toolkit";
import roleSlice from "./user/roleSlice";
import userReducer from "./user/userSlice";

export const store = configureStore({
  reducer: {
    user: userReducer,
    currentRole: roleSlice,
  },
});

import { createSlice } from "@reduxjs/toolkit";

const initialState = null;

export const currentRoleSlice = createSlice({
  name: "currentRole",
  initialState,
  reducers: {
    setCurrentRole: (state, action) => {
      console.log("action.payload", action.payload);
      state = action.payload;
      return state;
    },
  },
});

// Action creators are generated for each case reducer function
export const { setCurrentRole } = currentRoleSlice.actions;

export default currentRoleSlice.reducer;

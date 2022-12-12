import { createSlice } from "@reduxjs/toolkit";

const initialState = null;

export const userSlice = createSlice({
  name: "userData",
  initialState,
  reducers: {
    updateUserData: (state, action) => {
      console.log("action.payload", action.payload);
      state = action.payload;
      return state;
    },
  },
});

// Action creators are generated for each case reducer function
export const { updateUserData } = userSlice.actions;

export default userSlice.reducer;

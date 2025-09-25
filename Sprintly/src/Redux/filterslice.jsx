import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  filters: {}, // Object to store selected filters
};

const filterSlice = createSlice({
  name: "filters",
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = action.payload;
    },
    clearFilter: (state) => {
      state.filters = {};
    },
  },
});

export const { setFilters, clearFilter } = filterSlice.actions;
export default filterSlice.reducer;

import { createSlice } from "@reduxjs/toolkit";

const initialState ={
    groupByField: null,
};

const groupBySlice = createSlice({
    name: "groupBy",
    initialState,
    reducers:{
        setGroupBy:  (state, action) => {
            state.groupByField = action.payload;
        }
    }
})

export const {setGroupBy} =groupBySlice.actions;
export default groupBySlice.reducer;
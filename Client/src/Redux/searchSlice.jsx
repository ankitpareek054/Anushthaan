import { createSlice } from "@reduxjs/toolkit";

const searchSlice = createSlice({
    name:"search",
    initialState:{searchQuery:""},
    reducers:{
        setQuery:(state,action)=>{
            state.searchQuery=action.payload;
        }
    }
})

export const {setQuery} = searchSlice.actions;
export default searchSlice.reducer;
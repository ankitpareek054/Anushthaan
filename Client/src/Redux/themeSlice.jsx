import { createSlice } from "@reduxjs/toolkit";
import React from 'react'

const initialState = {
    isDarkMode: localStorage.getItem("theme") === "dark", // Initialize from localStorage
    filters: {}
  }; 

const themeSlice = createSlice({
    name:"theme",
    // initialState:{isDarkMode:false},
    initialState,
    reducers:{
        toggleTheme:(state)=>{
            state.isDarkMode=!state.isDarkMode;
            localStorage.setItem("theme", state.isDarkMode ? "dark" : "light"); 
        },       
       
},

});
export const {toggleTheme}=themeSlice.actions;

export default themeSlice.reducer;

import { configureStore } from '@reduxjs/toolkit'
import themeReducer from "./themeSlice"
import groupByReducer from "./groupBy"
import searchReducer from "./searchSlice"
import filterReducer from "./filterslice"

export default configureStore({
  reducer: {
    theme:themeReducer,
    groupBy:groupByReducer,
    search:searchReducer,
    filters: filterReducer,

  },
})
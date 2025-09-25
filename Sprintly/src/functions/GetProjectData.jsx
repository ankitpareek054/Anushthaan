import axios from 'axios';
import React, { useState } from 'react'

export const GetProjectData = async (projectName) => {
  console.log("hello",projectName)
    try {
      const res = await axios.post(`http://localhost:5000/api/getProject/${projectName}`);
      return res.data.projectCreatedBy;
    } catch (err) {
      console.log("Error in GetProjectData", err);
      return null;
    }
  };


